import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from extract import (  # noqa: E402
    normalize,
    extract_price,
    extract_district,
    extract_developer,
    extract_segment,
    extract_amenities,
    run_rules,
)

SAMPLE = """
Masteri Thảo Điền là dự án căn hộ cao cấp do Masterise Homes phát triển tại
Quận 2, TP.HCM. Giá bán từ 95 triệu/m². Tiện ích gồm hồ bơi, gym, công viên
ven sông và an ninh 24/7.
"""


def test_normalize_collapses_spaces():
    assert normalize("a    b\t\tc") == "a b c"


def test_extract_price():
    e = extract_price("Giá bán từ 95 triệu/m² cho căn 2PN")
    assert e is not None
    assert e.value == "95"
    assert e.field == "price_per_sqm"
    assert "95" in e.source_span
    assert e.rule_id == "price_regex_trieu_per_m2"


def test_extract_price_variants():
    assert extract_price("110tr/m2").value == "110"
    assert extract_price("giá 88,5 triệu / m2").value == "88.5"
    assert extract_price("liên hệ để biết giá") is None


def test_extract_district():
    e = extract_district(SAMPLE)
    assert e is not None and e.value == "Quận 2"


def test_extract_developer_accent_insensitive():
    e = extract_developer("du an cua Masterise Homes")
    assert e is not None and e.value == "Masterise Homes"


def test_extract_segment_maps_to_canonical():
    assert extract_segment("căn hộ cao cấp").value == "high-end"
    assert extract_segment("dự án hạng sang").value == "luxury"
    assert extract_segment("không có từ khoá") is None


def test_extract_amenities_dedupes_and_canonicalizes():
    es = extract_amenities("có hồ bơi, bể bơi, gym và view ven sông")
    values = {e.value for e in es}
    assert "hồ bơi" in values  # both "hồ bơi" and "bể bơi" collapse to one
    assert "gym" in values
    assert len([e for e in es if e.value == "hồ bơi"]) == 1


def test_run_rules_end_to_end():
    out = run_rules(SAMPLE)
    by_field = {}
    for e in out:
        by_field.setdefault(e.field, []).append(e.value)
    assert by_field["price_per_sqm"] == ["95"]
    assert by_field["district"] == ["Quận 2"]
    assert by_field["developer"] == ["Masterise Homes"]
    assert by_field["segment"] == ["high-end"]
    assert "hồ bơi" in by_field["amenities"]
    # every extraction carries provenance
    assert all(e.source_span and e.rule_id for e in out)
