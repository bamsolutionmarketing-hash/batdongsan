"""Dictionaries the rule engine matches against.

Deterministic and auditable: extend these lists to improve coverage; no model
weights, no hidden state. Seeded for TP.HCM; grows as more areas are onboarded.
"""

# Administrative districts (HCMC). Preferred as the canonical "district" value.
ADMIN_DISTRICTS = [
    "Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7",
    "Quận 8", "Quận 9", "Quận 10", "Quận 11", "Quận 12",
    "Bình Thạnh", "Phú Nhuận", "Gò Vấp", "Tân Bình", "Tân Phú",
    "Bình Tân", "TP. Thủ Đức", "TP Thủ Đức", "Thủ Đức",
    "Nhà Bè", "Bình Chánh", "Hóc Môn", "Củ Chi",
]

# Neighborhoods / wards — used only if no administrative district is found.
AREAS = ["Thảo Điền", "An Phú", "An Khánh", "Thủ Thiêm"]

# Combined list (kept for callers that want any area match).
DISTRICTS = ADMIN_DISTRICTS + AREAS

# Major developers (extend as needed).
DEVELOPERS = [
    "Masterise Homes", "Masterise", "Vinhomes", "Vingroup", "Novaland",
    "Khang Điền", "Nam Long", "Phú Mỹ Hưng", "Hưng Thịnh", "Sun Group",
    "Gamuda Land", "Keppel Land", "CapitaLand", "Refico", "An Gia",
    "Đất Xanh", "DKRA", "Phát Đạt", "Bcons",
]

# Amenity keywords -> canonical amenity label.
AMENITIES = {
    "hồ bơi": "hồ bơi",
    "bể bơi": "hồ bơi",
    "gym": "gym",
    "phòng gym": "gym",
    "công viên": "công viên",
    "trường học": "trường học",
    "trường quốc tế": "trường quốc tế",
    "bệnh viện": "bệnh viện",
    "trung tâm thương mại": "trung tâm thương mại",
    "tttm": "trung tâm thương mại",
    "sông": "view sông",
    "ven sông": "view sông",
    "công viên ven sông": "công viên ven sông",
    "an ninh": "an ninh 24/7",
    "bảo vệ 24": "an ninh 24/7",
    "thang máy": "thang máy",
    "hầm để xe": "hầm để xe",
    "spa": "spa",
    "sân tennis": "sân tennis",
    "bbq": "khu BBQ",
}

# Segment keyword -> canonical segment (matches lib/data/types Segment).
SEGMENT_KEYWORDS = {
    "hạng sang": "luxury",
    "siêu sang": "luxury",
    "luxury": "luxury",
    "cao cấp": "high-end",
    "high-end": "high-end",
    "trung cấp": "mid-range",
    "tầm trung": "mid-range",
    "bình dân": "affordable",
    "giá rẻ": "affordable",
    "nhà ở xã hội": "affordable",
}
