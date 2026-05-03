import uuid

class ActionGeneratorService:
    @staticmethod
    def generate_action_plan(structured_data: dict) -> dict:
        actions = []
        for directive in structured_data.get("directives", []):
            action = {
                "id": str(uuid.uuid4()),
                "type": "Compliance" if directive["intent"] == "Mandatory Compliance" else "Review",
                "description": directive["directive_text"],
                "deadline": "30 Days",
                "deadline_inferred": False,
                "department": "BBMP Administrative Office",
                "officer_role": "Nodal Officer",
                "priority": directive["urgency"],
                "justification": directive["legal_risk"],
                "source": directive["source"],
                "confidence": directive["confidence"],
                "status": "Pending Verification",
                "recommended_decision": "Comply"
            }
            actions.append(action)
        return {"actions": actions}
