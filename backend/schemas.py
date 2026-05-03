"""
schemas.py - Pydantic schemas for request/response validation
"""

from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime


# ─── Response Envelope ────────────────────────────────────────────────────────

class APIResponse(BaseModel):
    status: str  # "success" | "error"
    message: str
    data: Optional[Any] = None


# ─── Document Schemas ─────────────────────────────────────────────────────────

class DocumentOut(BaseModel):
    id: str
    filename: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Action Schemas ───────────────────────────────────────────────────────────

class ActionOut(BaseModel):
    id: str
    document_id: str
    action_type: Optional[str]
    description: Optional[str]
    deadline: Optional[str]
    department: Optional[str]
    priority: Optional[str]
    confidence: float
    reasoning: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class VerifyActionRequest(BaseModel):
    decision: str  # "approved" | "rejected"


# ─── Result Schemas ───────────────────────────────────────────────────────────

class ResultOut(BaseModel):
    document: DocumentOut
    raw_text: Optional[str]
    structured_json: Optional[str]
    actions: List[ActionOut]


# ─── LLM Output Schemas ───────────────────────────────────────────────────────

class CaseDetails(BaseModel):
    case_number: Optional[str] = None
    court_name: Optional[str] = None
    date_of_judgment: Optional[str] = None
    petitioner: Optional[str] = None
    respondent: Optional[str] = None
    bench: Optional[str] = None


class ActionItem(BaseModel):
    action: str
    deadline: str
    department: str
    priority: str
    confidence: float
    reasoning: str


class LLMOutput(BaseModel):
    case_details: CaseDetails
    actions: List[ActionItem]
