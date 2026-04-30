from fastapi import APIRouter, UploadFile, File, HTTPException
import uuid

router = APIRouter()

# In-memory storage for demonstration purposes
DOCUMENTS_DB = {}
ACTIONS_DB = {}

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    doc_id = str(uuid.uuid4())
    DOCUMENTS_DB[doc_id] = {
        "id": doc_id,
        "filename": file.filename,
        "status": "UPLOADED"
    }
    return {"doc_id": doc_id, "filename": file.filename, "status": "UPLOADED"}

@router.post("/process/{doc_id}")
async def process_document(doc_id: str):
    if doc_id not in DOCUMENTS_DB:
        raise HTTPException(status_code=404, detail="Document not found")
        
    from app.services.ocr_service import OCRService
    from app.services.extraction_service import ExtractionService
    from app.services.action_generator import ActionGeneratorService
    
    file_bytes = b"mock pdf content" 
    ocr_result = OCRService.process_pdf(file_bytes)
    structured_data = ExtractionService.extract_structured_data(
        ocr_result["raw_text"], 
        ocr_result["page_map"]
    )
    action_plan = ActionGeneratorService.generate_action_plan(structured_data)
    
    DOCUMENTS_DB[doc_id]["status"] = "PROCESSED"
    extracted_data = {
        "case_details": structured_data["case_details"],
        "parties": structured_data["parties"],
        "timelines": structured_data["timelines"],
        "confidence_scores": structured_data["confidence_scores"],
        "actions": action_plan["actions"]
    }
    
    DOCUMENTS_DB[doc_id]["data"] = extracted_data
    for action in extracted_data["actions"]:
        ACTIONS_DB[action["id"]] = action
        
    return {"message": "Processing completed", "doc_id": doc_id}

@router.get("/document/{doc_id}")
async def get_document(doc_id: str):
    if doc_id not in DOCUMENTS_DB:
        raise HTTPException(status_code=404, detail="Document not found")
    return DOCUMENTS_DB[doc_id]

@router.post("/approve/{action_id}")
async def approve_action(action_id: str):
    if action_id not in ACTIONS_DB:
        raise HTTPException(status_code=404, detail="Action not found")
    ACTIONS_DB[action_id]["status"] = "Approved"
    return {"message": "Action approved", "action_id": action_id, "status": "Approved"}
