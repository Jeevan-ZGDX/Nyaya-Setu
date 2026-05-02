"""
services/processor.py - Core pipeline orchestrator
Coordinates: load file → OCR → LLM → parse → save results → create actions
"""

import json
import logging
from sqlalchemy.orm import Session

from models import Document, Result, Action
from services.ocr import extract_text_from_pdf
from services.llm import generate_action_plan

logger = logging.getLogger(__name__)


def process_document(doc_id: str, db: Session) -> dict:
    """
    Full processing pipeline for a document.

    Steps:
        1. Load document from DB
        2. Extract text via OCR/pdfplumber
        3. Send text to LLM
        4. Parse structured JSON
        5. Store Result in DB
        6. Create Action rows in DB
        7. Update document status

    Returns the structured output dict.
    """

    # ── Step 1: Load Document ──────────────────────────────────────────────────
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise ValueError(f"Document {doc_id} not found in DB")

    # Prevent re-processing
    if doc.status == "DONE":
        logger.info(f"Document {doc_id} already processed. Returning existing result.")
        result = db.query(Result).filter(Result.document_id == doc_id).first()
        return json.loads(result.structured_json) if result else {}

    # Mark as processing
    doc.status = "PROCESSING"
    db.commit()

    try:
        # ── Step 2: Extract Text ───────────────────────────────────────────────
        logger.info(f"Extracting text from {doc.filepath}")
        raw_text = extract_text_from_pdf(doc.filepath)

        if not raw_text or len(raw_text.strip()) < 50:
            raise ValueError("Extracted text too short or empty. Check the PDF file.")

        # ── Step 3: Call LLM ───────────────────────────────────────────────────
        logger.info("Sending text to LLM for analysis...")
        llm_output = generate_action_plan(raw_text)

        # ── Step 4: Validate LLM Output ───────────────────────────────────────
        if "actions" not in llm_output or "case_details" not in llm_output:
            raise ValueError("LLM returned unexpected structure")

        # ── Step 5: Store Result ───────────────────────────────────────────────
        # Delete any old result first (in case of retry)
        old_result = db.query(Result).filter(Result.document_id == doc_id).first()
        if old_result:
            db.delete(old_result)
            db.commit()

        result = Result(
            document_id=doc_id,
            raw_text=raw_text,
            structured_json=json.dumps(llm_output, ensure_ascii=False)
        )
        db.add(result)

        # ── Step 6: Create Action Rows ────────────────────────────────────────
        # Delete any stale actions
        db.query(Action).filter(Action.document_id == doc_id).delete()

        for item in llm_output.get("actions", []):
            action = Action(
                document_id=doc_id,
                action_type="Compliance" if "comply" in item.get("action", "").lower()
                             else "Appeal" if "appeal" in item.get("action", "").lower()
                             else "Directive",
                description=item.get("action", ""),
                deadline=item.get("deadline", "Not specified"),
                department=item.get("department", "Not specified"),
                priority=item.get("priority", "Medium"),
                confidence=float(item.get("confidence", 0.0)),
                reasoning=item.get("reasoning", ""),
                status="PENDING"
            )
            db.add(action)

        # ── Step 7: Update Status ─────────────────────────────────────────────
        doc.status = "DONE"
        db.commit()

        logger.info(f"Document {doc_id} processed successfully. {len(llm_output['actions'])} actions created.")
        return llm_output

    except Exception as e:
        # Rollback and mark as failed
        db.rollback()
        doc.status = "FAILED"
        db.commit()
        logger.error(f"Processing failed for {doc_id}: {e}")
        raise
