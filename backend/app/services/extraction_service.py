class ExtractionService:
    @staticmethod
    def extract_structured_data(raw_text: str, page_map: dict) -> dict:
        return {
            "case_details": {"case_number": "W.P.(C) 1234/2023", "date_of_judgment": "2023-10-15", "court_name": "High Court of Karnataka"},
            "parties": {"petitioners": ["Ramesh Kumar"], "respondents": ["State of Karnataka", "BBMP"]},
            "directives": [
                {
                    "directive_text": "The respondent BBMP is directed to clear the pending dues within 30 days.",
                    "intent": "Mandatory Compliance",
                    "urgency": "High",
                    "legal_risk": "Contempt risk if ignored",
                    "source": "Page 12, Para 3",
                    "confidence": 0.95
                }
            ],
            "timelines": [
                {"deadline": "30 days", "related_to": "Clear pending dues", "inferred": False, "source": "Page 12, Para 3", "confidence": 0.95}
            ],
            "confidence_scores": {"overall": 0.92, "case_details": 0.99, "parties": 0.98}
        }
