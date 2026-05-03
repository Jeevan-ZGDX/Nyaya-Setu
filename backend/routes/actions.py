"""
routes/actions.py - Action management endpoints for HITL and Dashboard
GET  /actions
POST /verify/{action_id}
"""

import logging

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models import Action, Document
from schemas import APIResponse, VerifyActionRequest

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/actions", response_model=APIResponse)
def get_all_actions(
    status: Optional[str] = Query(None, description="Filter by status: PENDING | APPROVED | REJECTED"),
    department: Optional[str] = Query(None, description="Filter by department name"),
    priority: Optional[str] = Query(None, description="Filter by priority: High | Medium | Low"),
    db: Session = Depends(get_db)
):
    """
    Retrieve all actions for the decision dashboard.
    Supports optional filtering by status, department, and priority.
    """
    query = db.query(Action)

    if status:
        query = query.filter(Action.status == status.upper())
    if department:
        query = query.filter(Action.department.ilike(f"%{department}%"))
    if priority:
        query = query.filter(Action.priority.ilike(f"%{priority}%"))

    actions = query.order_by(Action.created_at.desc()).all()

    return APIResponse(
        status="success",
        message=f"{len(actions)} action(s) retrieved",
        data={
            "total": len(actions),
            "filters_applied": {
                "status": status,
                "department": department,
                "priority": priority
            },
            "actions": [
                {
                    "id": a.id,
                    "document_id": a.document_id,
                    "action_type": a.action_type,
                    "description": a.description,
                    "deadline": a.deadline,
                    "department": a.department,
                    "priority": a.priority,
                    "confidence": round(a.confidence, 2),
                    "reasoning": a.reasoning,
                    "status": a.status,
                    "created_at": a.created_at.isoformat()
                }
                for a in actions
            ]
        }
    )


@router.post("/verify/{action_id}", response_model=APIResponse)
def verify_action(
    action_id: str,
    body: VerifyActionRequest,
    db: Session = Depends(get_db)
):
    """
    Human-in-the-Loop: Approve or reject an extracted action.
    Only approved actions are considered verified records.

    Input: { "decision": "approved" | "rejected" }
    """
    # Validate decision value
    valid_decisions = {"approved", "rejected"}
    decision = body.decision.strip().lower()

    if decision not in valid_decisions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid decision '{body.decision}'. Must be 'approved' or 'rejected'."
        )

    # Fetch action
    action = db.query(Action).filter(Action.id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail=f"Action '{action_id}' not found")

    # Update status
    action.status = decision.upper()
    db.commit()
    db.refresh(action)

    logger.info(f"Action {action_id} → {action.status}")

    return APIResponse(
        status="success",
        message=f"Action {action.status.lower()} successfully",
        data={
            "action_id": action_id,
            "description": action.description,
            "decision": action.status,
            "department": action.department,
            "deadline": action.deadline
        }
    )
