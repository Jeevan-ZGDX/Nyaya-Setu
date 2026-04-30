import pdfplumber
import io

class OCRService:
    @staticmethod
    def process_pdf(file_bytes: bytes) -> dict:
        raw_text = "Sample judgment text extraction."
        page_map = {"page_1": raw_text}
        return {"raw_text": raw_text, "page_map": page_map}
