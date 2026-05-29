"""Extract raw text from uploaded files (PDF / DOCX / plain text).

Kept dependency-light: importers are loaded lazily so the module imports even if
an optional parser is missing, and a clear error is raised only when that file
type is actually used.
"""

from __future__ import annotations

import io


def extract_text(data: bytes, mime: str, filename: str = "") -> str:
    kind = _classify(mime, filename)
    if kind == "pdf":
        return _from_pdf(data)
    if kind == "docx":
        return _from_docx(data)
    if kind == "text":
        return data.decode("utf-8", errors="replace")
    raise ValueError(f"Unsupported file type: mime={mime!r} filename={filename!r}")


def _classify(mime: str, filename: str) -> str:
    mime = (mime or "").lower()
    name = (filename or "").lower()
    if "pdf" in mime or name.endswith(".pdf"):
        return "pdf"
    if "word" in mime or "officedocument.wordprocessing" in mime or name.endswith(".docx"):
        return "docx"
    if mime.startswith("text/") or name.endswith((".txt", ".md")):
        return "text"
    return "unknown"


def _from_pdf(data: bytes) -> str:
    try:
        import pdfplumber  # type: ignore
    except ImportError as e:  # pragma: no cover - depends on deploy env
        raise RuntimeError("pdfplumber not installed") from e
    parts: list[str] = []
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        for page in pdf.pages:
            parts.append(page.extract_text() or "")
    return "\n".join(parts)


def _from_docx(data: bytes) -> str:
    try:
        import docx  # type: ignore  (python-docx)
    except ImportError as e:  # pragma: no cover
        raise RuntimeError("python-docx not installed") from e
    document = docx.Document(io.BytesIO(data))
    return "\n".join(p.text for p in document.paragraphs)
