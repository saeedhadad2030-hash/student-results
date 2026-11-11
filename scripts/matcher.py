# -*- coding: utf-8 -*-
import json
import unicodedata
from difflib import SequenceMatcher

with open("scripts/excel_students.json", "r", encoding="utf-8") as f:
    excel_data = json.load(f)

with open("scripts/pdf_results.json", "r", encoding="utf-8") as f:
    pdf_data = json.load(f)

def normalize_ar(text):
    if not text:
        return ""
    text = unicodedata.normalize('NFKD', text)
    # Remove diacritics
    text = "".join([c for c in text if not unicodedata.combining(c)])
    # Normalize common letters
    text = text.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا").replace("ٱ", "ا")
    text = text.replace("ة", "ه").replace("ى", "ي")
    text = text.replace("ـ", "") # remove tatweel
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def normalize_en(text):
    if not text:
        return ""
    text = text.lower()
    text = text.replace("-", " ")
    text = text.replace("'", "").replace("’", "")
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# Mapping common Arabic names to English equivalents for cross-matching
AR_TO_EN_NAME_MAP = {
    "محمد": ["mohamed", "mohammed", "muhammad"],
    "احمد": ["ahmed", "ahmad"],
    "محمود": ["mahmoud", "mahmood"],
    "علي": ["ali"],
    "يوسف": ["yusuf", "youssef"],
    "ابراهيم": ["ibrahim"],
    "عمر": ["omar", "amr"],
    "عمرو": ["amr", "omar"],
    "حمزة": ["hamza", "hamzah"],
    "حمزه": ["hamza", "hamzah"],
    "ياسين": ["yasin", "yassin"],
    "يحيي": ["yahya", "yehia"],
    "يحيى": ["yahya", "yehia"],
    "سليم": ["salim", "saleem"],
    "زين": ["zain", "zein"],
    "خالد": ["khaled", "khalid"],
    "كريم": ["karim", "kareem"],
    "مصطفي": ["mustafa", "mostafa"],
    "مصطفى": ["mustafa", "mostafa"],
    "عبدالرحمن": ["abdulrahman", "abdelrahman", "abdul rahman"],
    "عبد": ["abdul", "abdel", "abdu"],
    "الله": ["allah"],
    "السيد": ["al-sayed", "el-sayed", "sayed", "alsayed"],
    "حسن": ["hassan", "hasan"],
    "حسين": ["hussein", "husayn"],
    "حامد": ["hamed", "hamid"],
    "سامي": ["sami"],
    "طه": ["taha"],
    "فؤاد": ["fouad", "foad"],
    "رضا": ["reda"],
    "مروان": ["marwan"],
    "عصام": ["essam", "isam"],
    "جمال": ["gamal", "jamal"],
    "رجب": ["ragab", "rajab"],
    "شريف": ["sharif", "sherif"],
    "فوزي": ["fawzi", "fawzy"],
    "اشرف": ["ashraf"],
    "اسماعيل": ["ismail"],
    "تامر": ["tamer"],
    "تميم": ["tamim"],
    "براء": ["baraa"],
    "مازن": ["mazen"],
    "يونس": ["younis", "younes"],
    "ريان": ["ryan", "rayan"],
    "زايد": ["zayed"],
    "صلاح": ["salah"],
    "الدين": ["el-din", "al-din"],
    "بلال": ["bilal"],
    "اسر": ["asser", "aser"],
    "اياد": ["iyad", "eyad"],
    "ايان": ["ayan"],
    "ساجد": ["sajid"],
    "سيف": ["seif", "saif"],
    "عمير": ["omair", "omar"],
    "مالك": ["malek", "malik"],
    "مراد": ["mourad", "murad"],
    "يامن": ["yamen"],
    "الياس": ["elias", "ilyas"],
    "بجاد": ["bajad"],
    "عمار": ["amar", "ammar"],
    "انس": ["anas"],
    "سراج": ["serag", "siraj"],
    "فريده": ["farida"],
    "فريدة": ["farida"],
    "ساره": ["sara", "sarah"],
    "حبيبه": ["habiba"],
    "حبيبة": ["habiba"],
    "جنا": ["jana"],
    "تاليا": ["talia"],
    "تالا": ["tala"],
    "تولين": ["tulin", "toulin"],
    "ليلي": ["laila", "layla", "leila"],
    "ليلى": ["laila", "layla", "leila"],
    "مريم": ["mariam", "maryam"],
    "نور": ["nour", "nur"],
    "ملك": ["malak"],
    "حلا": ["hala"],
    "سلمي": ["salma"],
    "سلمى": ["salma"],
    "خديجه": ["khadija"],
    "خديجة": ["khadija"],
    "كارما": ["karma"],
    "لانا": ["lana"],
    "ليان": ["layan"],
    "لين": ["lein", "leen"],
    "آيلا": ["ayla"],
    "ايلا": ["ayla"],
    "روز": ["rose"],
    "كنزي": ["kenzie", "kanzi"],
    "كنزى": ["kenzie", "kanzi"],
    "داليدا": ["dalida"],
    "نادين": ["nadine"],
    "ندى": ["nada"],
    "هيا": ["haya"],
    "جودي": ["joudi", "judi"],
    "جودى": ["joudi", "judi"],
    "سيلين": ["celine", "seline"],
    "سيلا": ["seela", "sila"],
    "دارين": ["darin", "dareen"],
    "روزان": ["rozan"],
    "مسك": ["misk"],
    "عبير": ["abir"],
    "عاليا": ["alia"],
    "بيرلا": ["perla", "pirla"],
    "جوري": ["jouri"],
    "كاتيا": ["katya"],
    "لار": ["lara"],
    "لارا": ["lara"],
    "ماريا": ["maria"],
    "تيا": ["tia"],
    "رنوه": ["ranwa", "tia"],
    "سجي": ["saja"],
    "يسرا": ["yosra"],
    "اسيل": ["asil", "aseel"],
    "ايسل": ["aysel"],
    "حليمه": ["halima"],
    "حليمة": ["halima"],
    "جوليا": ["julia"],
    "جميله": ["jamila"],
    "جميلة": ["jamila"],
    "ياسمينا": ["yasmina"],
    "نورين": ["nourin"],
    "نايا": ["naya"],
    "دانه": ["dana"],
    "سدره": ["sedra"],
    "سدرة": ["sedra"],
    "سيليا": ["celia"],
    "اسوه": ["oswa"],
    "أسوة": ["oswa"],
    "الين": ["elin"],
    "آيلن": ["aylan"],
    "فيروز": ["fayrouz"]
}

import re

# Check duplicate codes across all students in Excel
all_excel_students = []
for year, students in excel_data.items():
    for s in students:
        s["year"] = year
        nat_id = str(s["national_id"]).strip()
        last5 = nat_id[-5:]
        last4 = nat_id[-4:]
        s["last5"] = last5
        s["last4"] = last4
        s["login_code"] = f"ips@{last5}"
        all_excel_students.append(s)

print(f"Total excel students across all years: {len(all_excel_students)}")

# Find duplicate login codes (last 5 digits)
code_counts = {}
for s in all_excel_students:
    c = s["login_code"]
    code_counts[c] = code_counts.get(c, 0) + 1

duplicate_codes = {c: count for c, count in code_counts.items() if count > 1}
print(f"Duplicate login codes (last 5 digits): {len(duplicate_codes)}")
for c, count in duplicate_codes.items():
    matches = [s for s in all_excel_students if s["login_code"] == c]
    print(f"  Code {c} is shared by {count} students:")
    for m in matches:
        print(f"    - {m['name_ar']} ({m['year']}, NatID: {m['national_id']})")

# Find duplicate last 4 digits
last4_counts = {}
for s in all_excel_students:
    l4 = s["last4"]
    last4_counts[l4] = last4_counts.get(l4, 0) + 1

duplicate_last4 = {l4: count for l4, count in last4_counts.items() if count > 1}
print(f"\nDuplicate last 4 digits count: {len(duplicate_last4)}")
for l4, count in duplicate_last4.items():
    matches = [s for s in all_excel_students if s["last4"] == l4]
    print(f"  Last 4 digits '{l4}' shared by {count} students:")
    for m in matches:
        print(f"    - {m['name_ar']} ({m['year']}, Code: {m['login_code']})")

# Now let's perform year-by-year matching
matching_report = {}

for year in ["Year 1", "Year 2", "Year 3", "Year 4"]:
    ex_list = excel_data[year]
    pdf_list = pdf_data[year]
    
    year_report = {
        "excel_count": len(ex_list),
        "pdf_count": len(pdf_list),
        "matches": [],
        "unmatched_excel": [],
        "unmatched_pdf": []
    }
    
    # We will match each PDF student to an Excel student
    matched_excel_ids = set()
    
    for pdf_s in pdf_list:
        p_name = pdf_s["name_en"]
        p_norm = normalize_en(p_name)
        p_parts = p_norm.split()
        
        best_match = None
        best_score = 0.0
        match_type = "manual"
        
        for ex_s in ex_list:
            if ex_s["id"] in matched_excel_ids:
                continue
            
            ar_norm = normalize_ar(ex_s["name_ar"])
            ar_words = ar_norm.split()
            
            # Check name tokens alignment
            hits = 0
            for w in ar_words:
                en_options = AR_TO_EN_NAME_MAP.get(w, [])
                for opt in en_options:
                    if opt in p_parts or any(opt in part for part in p_parts):
                        hits += 1
                        break
            
            score = hits / max(len(ar_words), len(p_parts)) if (ar_words and p_parts) else 0
            
            # String similarity on transliteration if possible
            if score > best_score:
                best_score = score
                best_match = ex_s
        
        # High confidence match
        if best_match and best_score >= 0.4:
            matched_excel_ids.add(best_match["id"])
            year_report["matches"].append({
                "roll_no": pdf_s["roll_no"],
                "name_en": pdf_s["name_en"],
                "name_ar": best_match["name_ar"],
                "national_id": best_match["national_id"],
                "login_code": f"ips@{str(best_match['national_id'])[-5:]}",
                "confidence": round(best_score, 2),
                "excel_id": best_match["id"],
                "status": "matched"
            })
        else:
            year_report["unmatched_pdf"].append(pdf_s)
            
    for ex_s in ex_list:
        if ex_s["id"] not in matched_excel_ids:
            year_report["unmatched_excel"].append(ex_s)
            
    matching_report[year] = year_report

with open("scripts/matching_report.json", "w", encoding="utf-8") as f:
    json.dump(matching_report, f, ensure_ascii=False, indent=2)

print("\nMatching Summary:")
for year, rep in matching_report.items():
    print(f"{year}: Excel {rep['excel_count']}, PDF {rep['pdf_count']}, Matched {len(rep['matches'])}, Unmatched Excel {len(rep['unmatched_excel'])}, Unmatched PDF {len(rep['unmatched_pdf'])}")
    if rep['unmatched_pdf']:
        print(f"  Unmatched PDF in {year}:")
        for u in rep['unmatched_pdf']:
            print(f"    - #{u['roll_no']}: {u['name_en']}")
    if rep['unmatched_excel']:
        print(f"  Unmatched Excel in {year}:")
        for u in rep['unmatched_excel']:
            print(f"    - #{u['id']}: {u['name_ar']} (Status: {u.get('status', 'active')})")
