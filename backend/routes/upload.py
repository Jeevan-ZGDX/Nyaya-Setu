"""
routes/upload.py - PDF Upload endpoint
POST /upload
"""

import os
import shutil
import uuid
import logging

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Document
from schemas import APIResponse

router = APIRouter()
logger = logging.getLogger(__name__)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=APIResponse)
async def upload_pdf(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Accept a PDF file, save it to disk, and register it in the database.
    Returns a doc_id for subsequent processing.
    """
    # Validate file type
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    try:
        doc_id = str(uuid.uuid4())
        safe_filename = f"{doc_id}_{file.filename.replace(' ', '_')}"
        filepath = os.path.join(UPLOAD_DIR, safe_filename)

        # Save file to disk
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size = os.path.getsize(filepath)
        logger.info(f"Saved {file.filename} → {filepath} ({file_size} bytes)")

        # Create DB record
        doc = Document(
            id=doc_id,
            filename=file.filename,
            filepath=filepath,
            status="UPLOADED"
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        return APIResponse(
            status="success",
            message="File uploaded successfully",
            data={
                "doc_id": doc_id,
                "filename": file.filename,
                "size_bytes": file_size,
                "status": "UPLOADED"
            }
        )

    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
