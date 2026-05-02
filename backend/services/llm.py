"""
services/llm.py - LLM integration for legal text analysis
Calls OpenAI GPT-4o to extract structured compliance data from judgment text.
"""

import os
import json
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ── System Prompt ──────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are a senior legal analyst AI specialized in Indian judiciary compliance.
Your task is to analyze court judgment text and extract actionable compliance directives.

Always respond with ONLY valid JSON. No explanations, no markdown, no code blocks.
"""

EXTRACTION_PROMPT = """Analyze the following court judgment text and extract structured data.

Return ONLY this JSON structure (no markdown, no extra text):

{{
  "case_details": {{
    "case_number": "...",
    "court_name": "...",
    "date_of_judgment": "...",
    "petitioner": "...",
    "respondent": "...",
    "bench": "..."
  }},
  "actions": [
    {{
      "action": "Clear description of what must be done",
      "deadline": "Specific days/date or 'Inferred: 30 days (appeal period)'",
      "department": "Responsible government department or body",
      "priority": "High | Medium | Low",
      "confidence": 0.0 to 1.0,
      "reasoning": "Why this action is needed and the legal basis"
    }}
  ]
}}

Rules:
- Extract ALL directives, orders, and mandates
- If no explicit deadline, infer from legal context (appeal=90 days, compliance=30 days)
- Mark inferred deadlines with prefix "Inferred: "
- Confidence should reflect clarity of the directive in the text
- Department should map to real government departments

COURT JUDGMENT TEXT:
{text}
"""

# ── Mock Output (used when no API key is configured) ──────────────────────────

MOCK_OUTPUT = {
    "case_details": {
        "case_number": "W.P.(C) 1234/2023",
        "court_name": "High Court of Karnataka",
        "date_of_judgment": "2023-10-15",
        "petitioner": "Ramesh Kumar",
        "respondent": "State of Karnataka & BBMP",
        "bench": "Hon'ble Justice A. Sharma"
    },
    "actions": [
        {
            "action": "BBMP must clear all pending dues to the petitioner",
            "deadline": "30 days",
            "department": "BBMP Finance Department",
            "priority": "High",
            "confidence": 0.95,
            "reasoning": "Court explicitly ordered payment of dues within 30 days under contempt threat"
        },
        {
            "action": "State must file a compliance affidavit confirming action taken",
            "deadline": "45 days",
            "department": "Government Pleader Office",
            "priority": "High",
            "confidence": 0.91,
            "reasoning": "Standard compliance reporting mandate issued by the bench"
        },
        {
            "action": "Form a committee to review pending citizen grievance cases",
            "deadline": "Inferred: 60 days (standard committee formation period)",
            "department": "Revenue Department",
            "priority": "Medium",
            "confidence": 0.78,
            "reasoning": "Advisory direction from the court for systemic improvement"
        }
    ]
}


def generate_action_plan(text: str) -> dict:
    """
    Send judgment text to LLM and return structured action plan.
    Falls back to mock output if OPENAI_API_KEY is not set.
    """
    api_key = os.getenv("OPENAI_API_KEY", "").strip()

    if not api_key or api_key == "your_key":
        logger.warning("OPENAI_API_KEY not set. Using mock LLM output.")
        return MOCK_OUTPUT

    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key)

        # Truncate text to stay within token limits (~12k chars ~ 3000 tokens)
        truncated_text = text[:12000] if len(text) > 12000 else text

        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": EXTRACTION_PROMPT.format(text=truncated_text)}
            ],
            temperature=0.1,  # Low temperature for consistent structured output
            max_tokens=2000
        )

        raw_content = response.choices[0].message.content.strip()

        # Strip markdown code blocks if present
        if raw_content.startswith("```"):
            raw_content = raw_content.split("```")[1]
            if raw_content.startswith("json"):
                raw_content = raw_content[4:]

        result = json.loads(raw_content)
        logger.info("LLM extraction successful.")
        return result

    except json.JSONDecodeError as e:
        logger.error(f"LLM returned invalid JSON: {e}")
        raise ValueError(f"LLM returned invalid JSON: {e}")
    except Exception as e:
        logger.error(f"LLM call failed: {e}")
        raise RuntimeError(f"LLM call failed: {e}")
