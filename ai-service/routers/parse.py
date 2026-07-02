import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.parser import extract_text, extract_email, extract_phone, extract_name
from services.llm import get_llm_response, PARSE_SYSTEM_PROMPT

router = APIRouter()


class ParseRequest(BaseModel):
    file_path: str
    job_id: int
    upload_id: int


@router.post("/parse-resume")
async def parse_resume(req: ParseRequest):
    """Extract structured data from a resume file using text extraction + LLM."""
    try:
        # 1. Extract raw text from PDF/DOCX
        raw_text = extract_text(req.file_path)

        if not raw_text or len(raw_text) < 50:
            raise HTTPException(status_code=400, detail="Could not extract text from file")

        # 2. Quick regex extraction for basic fields
        regex_email = extract_email(raw_text)
        regex_phone = extract_phone(raw_text)
        regex_name = extract_name(raw_text)

        # 3. Call LLM for structured parsing
        llm_response = get_llm_response(
            PARSE_SYSTEM_PROMPT,
            f"Parse this resume:\n\n{raw_text[:6000]}"
        )

        # 4. Parse JSON from LLM response
        # Strip markdown fences if present
        cleaned = llm_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        parsed = json.loads(cleaned)

        # 5. Use regex results as fallback
        if not parsed.get("email"):
            parsed["email"] = regex_email
        if not parsed.get("phone"):
            parsed["phone"] = regex_phone
        if not parsed.get("name"):
            parsed["name"] = regex_name

        return parsed

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="LLM returned invalid JSON")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
