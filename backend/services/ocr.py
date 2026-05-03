"""
services/ocr.py - PDF text extraction
Tries direct parsing first (pdfplumber), then falls back to Tesseract OCR.
"""

import io
import os
import logging

logger = logging.getLogger(__name__)


def extract_text_from_pdf(filepath: str) -> str:
    """
    Extract text from a PDF file.
    Strategy:
        1. Try pdfplumber (digital PDFs)
        2. Fallback: pdf2image + pytesseract (scanned PDFs)
    Returns plain text string.
    """
    try:
        import pdfplumber
        text_parts = []
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text.strip())

        full_text = "\n\n".join(text_parts)

        # If we got meaningful text, return it
        if len(full_text.strip()) > 100:
            logger.info(f"Extracted {len(full_text)} chars via pdfplumber from {filepath}")
            return full_text

        # Otherwise fall through to OCR
        logger.warning("pdfplumber returned minimal text, attempting OCR fallback.")
    except Exception as e:
        logger.warning(f"pdfplumber failed: {e}. Attempting OCR fallback.")

    # ── OCR Fallback ──────────────────────────────────────────────────────────
    try:
        from pdf2image import convert_from_path
        import pytesseract

        images = convert_from_path(filepath, dpi=200)
        ocr_parts = []
        for i, img in enumerate(images):
            page_text = pytesseract.image_to_string(img, lang="eng")
            if page_text.strip():
                ocr_parts.append(f"[Page {i+1}]\n{page_text.strip()}")

        full_text = "\n\n".join(ocr_parts)
        logger.info(f"Extracted {len(full_text)} chars via OCR from {filepath}")
        return full_text
    except Exception as e:
        logger.error(f"OCR fallback also failed: {e}")
        raise RuntimeError(f"Text extraction failed: {e}")
