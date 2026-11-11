# -*- coding: utf-8 -*-
import json
import hashlib
import os

with open("scripts/master_dataset.json", "r", encoding="utf-8") as f:
    master = json.load(f)

students = master["students"]
unmatched = master["unmatched"]

os.makedirs("src/data", exist_ok=True)

processed_students = []
for s in students:
    nat_id = s["national_id"]
    # Create secure SHA256 hash of national ID
    nat_hash = hashlib.sha256(nat_id.encode('utf-8')).hexdigest()
    
    # Clean up overall values
    overall = s["overall"]
    if overall["is_absent"] or overall["is_error"]:
        # If total is absent or error
        if overall["total_marks"] == "Absent":
            overall["percentage"] = "Absent"
            overall["grade"] = "Absent"
        elif overall["total_marks"] is None:
            overall["total_marks"] = "Not Available"
            overall["percentage"] = "Not Available"
            overall["grade"] = "Not Available"
    
    # Clean up subject values
    for subj in s["subjects"]:
        if subj["is_absent"]:
            subj["mark"] = "Absent"
            subj["percentage"] = "Absent"
            subj["grade"] = "Absent"
        elif subj["mark"] is None:
            subj["mark"] = "Not Available"
            subj["percentage"] = "Not Available"
            subj["grade"] = "Not Available"

    processed = {
        "id": s["id"],
        "roll_no": s["roll_no"],
        "year": s["year"],
        "name_en": s["name_en"],
        "name_ar": s["name_ar"],
        "gender": s["gender"],
        "national_id_hash": nat_hash,
        "last5": s["last5"],
        "last4": s["last4"],
        "birth_date": s["birth_date"],
        "login_code": s["login_code"],
        "status": s["status"],
        "has_duplicate_code": s["has_duplicate_code"],
        "duplicate_count": s.get("duplicate_count", 1),
        "collision_ids": s.get("collision_ids", []),
        "subjects": s["subjects"],
        "overall": overall,
        "is_published": True,
        "updated_at": "2025-02-15T12:00:00Z"
    }
    processed_students.append(processed)

with open("src/data/students.json", "w", encoding="utf-8") as f:
    json.dump(processed_students, f, ensure_ascii=False, indent=2)

with open("src/data/unmatched.json", "w", encoding="utf-8") as f:
    json.dump(unmatched, f, ensure_ascii=False, indent=2)

print(f"Exported {len(processed_students)} students to src/data/students.json")
print(f"Exported {len(unmatched)} unmatched records to src/data/unmatched.json")

