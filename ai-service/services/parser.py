import fitz           # PyMuPDF
import pdfplumber
import docx
import re
import os
from pathlib import Path


def extract_text_from_pdf(file_path: str) -> str:
    """Extract all text from a PDF using PyMuPDF with pdfplumber fallback."""
    text = ""
    try:
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text()
        doc.close()
    except Exception:
        pass

    # Fallback to pdfplumber if PyMuPDF gives poor results
    if len(text.strip()) < 100:
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
        except Exception:
            pass

    return text.strip()


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from a DOCX file."""
    doc = docx.Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])


def extract_text(file_path: str) -> str:
    """Auto-detect and extract text from PDF or DOCX."""
    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext in (".docx", ".doc"):
        return extract_text_from_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


# ─── Regex extractors ─────────────────────────────────────────────────────────

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_RE = re.compile(
    r"(?:\+?\d{1,3}[\s\-]?)?"
    r"(?:\(?\d{2,4}\)?[\s\-]?)?"
    r"\d{3,4}[\s\-]?\d{3,4}"
)


def extract_email(text: str) -> str | None:
    match = EMAIL_RE.search(text)
    return match.group(0) if match else None


def extract_phone(text: str) -> str | None:
    match = PHONE_RE.search(text)
    return match.group(0).strip() if match else None


def extract_name(text: str) -> str | None:
    """Heuristic: first non-empty, non-email, non-phone line is likely the name."""
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for line in lines[:5]:
        if EMAIL_RE.search(line) or PHONE_RE.search(line):
            continue
        if len(line.split()) <= 5 and len(line) < 60:
            return line
    return None
