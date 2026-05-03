"""
models.py - SQLAlchemy ORM models for Nyaya-Setu
"""

from sqlalchemy import Column, String, Text, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import uuid
from datetime import datetime


class Document(Base):
    """Stores uploaded PDF documents."""
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    status = Column(String, default="UPLOADED")  # UPLOADED | PROCESSING | DONE | FAILED
    created_at = Column(DateTime, default=datetime.utcnow)

    result = relationship("Result", back_populates="document", uselist=False)
    actions = relationship("Action", back_populates="document")


class Result(Base):
    """Stores extracted text and structured JSON from the LLM."""
    __tablename__ = "results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, ForeignKey("documents.id"), unique=True)
    raw_text = Column(Text, nullable=True)
    structured_json = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="result")


class Action(Base):
    """Individual action items extracted from a judgment."""
    __tablename__ = "actions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, ForeignKey("documents.id"))
    action_type = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    deadline = Column(String, nullable=True)
    department = Column(String, nullable=True)
    priority = Column(String, nullable=True)
    confidence = Column(Float, default=0.0)
    reasoning = Column(Text, nullable=True)
    status = Column(String, default="PENDING")  # PENDING | APPROVED | REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="actions")
