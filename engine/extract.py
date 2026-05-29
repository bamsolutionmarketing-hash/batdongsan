"""Rule-based extraction of the 5 core project fields from document text.

Each extractor returns Extraction objects carrying the value, the source span it
came from, a confidence, and the rule_id that produced it — so an admin can audit
every suggestion before publishing. No generative model: misses are expected and
corrected by the admin; the goal is to cut data-entry time, not be perfect.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, asdict
from typing import Optional

from gazetteers import ADMIN_DISTRICTS, AREAS, DEVELOPERS, AMENITIES, SEGMENT_KEYWORDS


@dataclass
class Extraction:
    field: str          # price_per_sqm | district | developer | segment | amenities
    value: str
    source_span: str
    confidence: float
    rule_id: str

    def to_dict(self) -> dict:
        return asdict(self)


def normalize(text: str) -> str:
    """Collapse whitespace; keep original casing/diacritics for spans."""
    return re.sub(r"[ \t]+", " ", text.replace("\r", "\n")).strip()


def _fold(text: str) -> str:
    """Accent-insensitive lowercase for matching."""
    folded = unicodedata.normalize("NFD", text)
    folded = "".join(c for c in folded if unicodedata.category(c) != "Mn")
    return folded.replace("đ", "d").replace("Đ", "d").lower()


def _window(text: str, idx: int, length: int, pad: int = 40) -> str:
    start = max(0, idx - pad)
    end = min(len(text), idx + length + pad)
    return text[start:end].strip()


# --- price per sqm (million VND / m²) -------------------------------------
# Matches "95 triệu/m²", "95tr/m2", "từ 95 - 110 triệu/m2" (takes first number).
_PRICE_RE = re.compile(
    r"(\d{2,4}(?:[.,]\d+)?)\s*(?:triệu|tr)\s*/\s*m\s*2?",
    re.IGNORECASE,
)


def extract_price(text: str) -> Optional[Extraction]:
    m = _PRICE_RE.search(text)
    if not m:
        return None
    value = m.group(1).replace(",", ".")
    return Extraction(
        field="price_per_sqm",
        value=value,
        source_span=_window(text, m.start(), len(m.group(0))),
        confidence=0.8,
        rule_id="price_regex_trieu_per_m2",
    )


# --- gazetteer match helper ------------------------------------------------
def _gazetteer_first(text: str, terms, field: str, rule_id: str, conf: float) -> Optional[Extraction]:
    folded = _fold(text)
    best = None  # (index, term)
    for term in terms:
        idx = folded.find(_fold(term))
        if idx != -1 and (best is None or idx < best[0]):
            best = (idx, term)
    if best is None:
        return None
    idx, term = best
    return Extraction(
        field=field,
        value=term,
        source_span=_window(text, idx, len(term)),
        confidence=conf,
        rule_id=rule_id,
    )


def extract_district(text: str) -> Optional[Extraction]:
    # Prefer an administrative district; fall back to a neighborhood name.
    admin = _gazetteer_first(text, ADMIN_DISTRICTS, "district", "district_gazetteer_admin", 0.8)
    if admin:
        return admin
    return _gazetteer_first(text, AREAS, "district", "district_gazetteer_area", 0.6)


def extract_developer(text: str) -> Optional[Extraction]:
    return _gazetteer_first(text, DEVELOPERS, "developer", "developer_gazetteer", 0.75)


def extract_segment(text: str) -> Optional[Extraction]:
    folded = _fold(text)
    best = None  # (index, canonical, keyword)
    for keyword, canonical in SEGMENT_KEYWORDS.items():
        idx = folded.find(_fold(keyword))
        if idx != -1 and (best is None or idx < best[0]):
            best = (idx, canonical, keyword)
    if best is None:
        return None
    idx, canonical, keyword = best
    return Extraction(
        field="segment",
        value=canonical,
        source_span=_window(text, idx, len(keyword)),
        confidence=0.7,
        rule_id="segment_keyword",
    )


def extract_amenities(text: str) -> list[Extraction]:
    folded = _fold(text)
    seen: set[str] = set()
    out: list[Extraction] = []
    for keyword, canonical in AMENITIES.items():
        idx = folded.find(_fold(keyword))
        if idx != -1 and canonical not in seen:
            seen.add(canonical)
            out.append(
                Extraction(
                    field="amenities",
                    value=canonical,
                    source_span=_window(text, idx, len(keyword)),
                    confidence=0.7,
                    rule_id="amenity_gazetteer",
                )
            )
    return out


def run_rules(text: str) -> list[Extraction]:
    """Run every extractor; return all suggestions (admin confirms later)."""
    text = normalize(text)
    out: list[Extraction] = []
    for fn in (extract_price, extract_district, extract_developer, extract_segment):
        e = fn(text)
        if e:
            out.append(e)
    out.extend(extract_amenities(text))
    return out
