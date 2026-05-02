"""
routes/process.py - Document processing and retrieval endpoints
POST /process/{doc_id}
GET  /document/{doc_id}
"""

import json
import logging

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Document, Result, Action
from schemas import APIResponse
from services.processor import process_document

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/process/{doc_id}", response_model=APIResponse)
async def trigger_processing(doc_id: str, db: Session = Depends(get_db)):
    """
    Trigger the full AI processing pipeline for an uploaded document.

    Pipeline: Load file → OCR/pdfplumber → LLM → Store results → Create actions
    """
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document '{doc_id}' not found")

    if doc.status == "PROCESSING":
        raise HTTPException(status_code=409, detail="Document is currently being processed")

    try:
        result = process_document(doc_id, db)

        action_count = db.query(Action).filter(Action.document_id == doc_id).count()

        return APIResponse(
            status="success",
            message="Document processed successfully",
            data={
                "doc_id": doc_id,
                "status": "DONE",
                "actions_created": action_count,
                "case_details": result.get("case_details", {})
            }
        )

    except Exception as e:
        logger.error(f"Processing pipeline failed: {e}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@router.get("/document/{doc_id}", response_model=APIResponse)
def get_document(doc_id: str, db: Session = Depends(get_db)):
    """
    Retrieve the full extraction result for a processed document.
    Returns: document metadata, raw text, structured JSON, and all actions.
    """
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document '{doc_id}' not found")

    result = db.query(Result).filter(Result.document_id == doc_id).first()
    actions = db.query(Action).filter(Action.document_id == doc_id).all()

    structured = json.loads(result.structured_json) if result and result.structured_json else {}

    return APIResponse(
        status="success",
        message="Document retrieved",
        data={
            "document": {
                "id": doc.id,
                "filename": doc.filename,
                "status": doc.status,
                "created_at": doc.created_at.isoformat()
            },
            "raw_text": result.raw_text if result else None,
            "structured_json": structured,
            "actions": [
                {
                    "id": a.id,
                    "action_type": a.action_type,
                    "description": a.description,
                    "deadline": a.deadline,
                    "department": a.department,
                    "priority": a.priority,
                    "confidence": a.confidence,
                    "reasoning": a.reasoning,
                    "status": a.status
                }
                for a in actions
            ]
        }
    )
