import json

# The 45 students from Year 2 updated PDF table
y2_data = [
    {
        "row": 1,
        "name": "Ahmed Mohammed Ahmed Ahmed Mohammed Al-Ghandour",
        "english": {"marks": 21, "percentage": "60%", "grade": "D"},
        "maths": {"marks": 34, "percentage": "85%", "grade": "A"},
        "science": {"marks": 32, "percentage": "91%", "grade": "A"},
        "arabic": {"marks": 14, "percentage": "93%", "grade": "A"},
        "overall": {"total": 101, "percentage": "81%", "grade": "B", "isAbsent": False}
    },
    {
        "row": 2,
        "name": "Baraa Mohammed Rizq Rizq Abduljawad Najm",
        "english": {"marks": 34, "percentage": "97%", "grade": "A*"},
        "maths": {"marks": 40, "percentage": "100%", "grade": "A*"},
        "science": {"marks": 34, "percentage": "97%", "grade": "A*"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 123, "percentage": "98%", "grade": "A*", "isAbsent": False}
    },
    {
        "row": 3,
        "name": "Hamza Mohamed Ibrahim Tawfiq",
        "english": {"marks": 35, "percentage": "100%", "grade": "A*"},
        "maths": {"marks": 40, "percentage": "100%", "grade": "A*"},
        "science": {"marks": 31, "percentage": "89%", "grade": "A"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 121, "percentage": "97%", "grade": "A*", "isAbsent": False}
    },
    {
        "row": 4,
        "name": "Hamza Mohamed Hosni Ibrahim Younes Hijazi",
        "english": {"marks": 30, "percentage": "86%", "grade": "A"},
        "maths": {"marks": 38, "percentage": "95%", "grade": "A*"},
        "science": {"marks": 34, "percentage": "97%", "grade": "A*"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 117, "percentage": "94%", "grade": "A", "isAbsent": False}
    },
    {
        "row": 5,
        "name": "Salim Samah Emad Ibrahim Ibrahim Samra",
        "english": {"marks": "Absent", "percentage": "-", "grade": "-", "isAbsent": True},
        "maths": {"marks": "Absent", "percentage": "-", "grade": "-", "isAbsent": True},
        "science": {"marks": "Absent", "percentage": "-", "grade": "-", "isAbsent": True},
        "arabic": {"marks": "Absent", "percentage": "-", "grade": "-", "isAbsent": True},
        "overall": {"total": "Not Available", "percentage": "-", "grade": "-", "isAbsent": True}
    },
    {
        "row": 6,
        "name": "Mazen Mohamed Abdulrazak Mohamed Mohamed Kanani",
        "english": {"marks": 29, "percentage": "83%", "grade": "B"},
        "maths": {"marks": 38, "percentage": "95%", "grade": "A*"},
        "science": {"marks": 32, "percentage": "91%", "grade": "A"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 114, "percentage": "91%", "grade": "A", "isAbsent": False}
    },
    {
        "row": 7,
        "name": "Yahya Ahmed Jamal Mohamed Al-Abd",
        "english": {"marks": 30, "percentage": "86%", "grade": "A"},
        "maths": {"marks": 31, "percentage": "78%", "grade": "B"},
        "science": {"marks": 33, "percentage": "94%", "grade": "A"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 109, "percentage": "87%", "grade": "A", "isAbsent": False}
    },
    {
        "row": 8,
        "name": "Yusuf Mohammed Abdel Halim Saad",
        "english": {"marks": 27, "percentage": "77%", "grade": "B"},
        "maths": {"marks": 25, "percentage": "63%", "grade": "D"},
        "science": {"marks": 29, "percentage": "83%", "grade": "B"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 96, "percentage": "77%", "grade": "B", "isAbsent": False}
    },
    {
        "row": 9,
        "name": "Yusuf Mohammed Fikri Mohammed Mustafa Al-Amir",
        "english": {"marks": 23, "percentage": "66%", "grade": "C"},
        "maths": {"marks": 33, "percentage": "83%", "grade": "B"},
        "science": {"marks": 33, "percentage": "94%", "grade": "A"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 104, "percentage": "83%", "grade": "B", "isAbsent": False}
    },
    {
        "row": 10,
        "name": "Elena Mohammed Jamal Al-Din Amin Mohammed Abdel Qader",
        "english": {"marks": "Absent", "percentage": "-", "grade": "-", "isAbsent": True},
        "maths": {"marks": "Absent", "percentage": "-", "grade": "-", "isAbsent": True},
        "science": {"marks": "Absent", "percentage": "-", "grade": "-", "isAbsent": True},
        "arabic": {"marks": "Absent", "percentage": "-", "grade": "-", "isAbsent": True},
        "overall": {"total": "Not Available", "percentage": "-", "grade": "-", "isAbsent": True}
    },
    {
        "row": 11,
        "name": "Ayla Shadi Ahmed Ahmed Zaghloul",
        "english": {"marks": 27, "percentage": "77%", "grade": "B"},
        "maths": {"marks": 36, "percentage": "90%", "grade": "A"},
        "science": {"marks": 26, "percentage": "74%", "grade": "C"},
        "arabic": {"marks": 11, "percentage": "73%", "grade": "C"},
        "overall": {"total": 100, "percentage": "80%", "grade": "B", "isAbsent": False}
    },
    {
        "row": 12,
        "name": "Tulin Ahmed Hussein Mohammed Al-Ashmawi",
        "english": {"marks": 24, "percentage": "69%", "grade": "C"},
        "maths": {"marks": 35, "percentage": "88%", "grade": "A"},
        "science": {"marks": 32, "percentage": "91%", "grade": "A"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 106, "percentage": "85%", "grade": "B", "isAbsent": False}
    },
    {
        "row": 13,
        "name": "Jamila Ahmed Magdy Mohamed Al-Saeed Mohamed",
        "english": {"marks": 17, "percentage": "49%", "grade": "E"},
        "maths": {"marks": 32, "percentage": "80%", "grade": "B"},
        "science": {"marks": 30, "percentage": "86%", "grade": "A"},
        "arabic": {"marks": 13, "percentage": "87%", "grade": "A"},
        "overall": {"total": 92, "percentage": "74%", "grade": "C", "isAbsent": False}
    },
    {
        "row": 14,
        "name": "Jana Abdulqader Ahmed Abdulqader Al-Sayed Zayed",
        "english": {"marks": 29, "percentage": "83%", "grade": "B"},
        "maths": {"marks": 39, "percentage": "98%", "grade": "A*"},
        "science": {"marks": 32, "percentage": "91%", "grade": "A"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 115, "percentage": "92%", "grade": "A", "isAbsent": False}
    },
    {
        "row": 15,
        "name": "Tia Nabil Mohamed Mohamed Khattab",
        "english": {"marks": 30, "percentage": "86%", "grade": "A"},
        "maths": {"marks": 37, "percentage": "93%", "grade": "A"},
        "science": {"marks": 32, "percentage": "91%", "grade": "A"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 114, "percentage": "91%", "grade": "A", "isAbsent": False}
    },
    {
        "row": 16,
        "name": "Rose Hisham Mohamed Mansour Al-Maghlowi",
        "english": {"marks": 24, "percentage": "69%", "grade": "C"},
        "maths": {"marks": 33, "percentage": "83%", "grade": "B"},
        "science": {"marks": 32, "percentage": "91%", "grade": "A"},
        "arabic": {"marks": 14, "percentage": "93%", "grade": "A"},
        "overall": {"total": 103, "percentage": "82%", "grade": "B", "isAbsent": False}
    },
    {
        "row": 17,
        "name": "Sara Mohamed Ahmed Abdul-Monim Moneim",
        "english": {"marks": 31, "percentage": "89%", "grade": "A"},
        "maths": {"marks": 39, "percentage": "98%", "grade": "A*"},
        "science": {"marks": 34, "percentage": "97%", "grade": "A*"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 119, "percentage": "95%", "grade": "A*", "isAbsent": False}
    },
    {
        "row": 18,
        "name": "Abir Abdulaziz Mahmoud Mohammed",
        "english": {"marks": 17, "percentage": "49%", "grade": "E"},
        "maths": {"marks": 34, "percentage": "85%", "grade": "A"},
        "science": {"marks": 28, "percentage": "80%", "grade": "B"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 94, "percentage": "75%", "grade": "B", "isAbsent": False}
    },
    {
        "row": 19,
        "name": "Farida Mohamed Rabi' Al-Dasouqi Al-Morsi",
        "english": {"marks": 28, "percentage": "80%", "grade": "B"},
        "maths": {"marks": 39, "percentage": "98%", "grade": "A*"},
        "science": {"marks": 32, "percentage": "91%", "grade": "A"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 114, "percentage": "91%", "grade": "A", "isAbsent": False}
    },
    {
        "row": 20,
        "name": "Layan Mohamed Sabri Fawzi Al-Sayed",
        "english": {"marks": 31, "percentage": "89%", "grade": "A"},
        "maths": {"marks": 37, "percentage": "93%", "grade": "A"},
        "science": {"marks": 33, "percentage": "94%", "grade": "A"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 116, "percentage": "93%", "grade": "A", "isAbsent": False}
    },
    {
        "row": 21,
        "name": "Lilia Mohamed Hamdi Ahmed Al-Sayed Al-Halwani",
        "english": {"marks": 24, "percentage": "69%", "grade": "C"},
        "maths": {"marks": 35, "percentage": "88%", "grade": "A"},
        "science": {"marks": 32, "percentage": "91%", "grade": "A"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 106, "percentage": "85%", "grade": "B", "isAbsent": False}
    },
    {
        "row": 22,
        "name": "Maria Mohannad Mounib Mohamed Tamim Ali",
        "english": {"marks": 35, "percentage": "100%", "grade": "A*"},
        "maths": {"marks": 40, "percentage": "100%", "grade": "A*"},
        "science": {"marks": 33, "percentage": "94%", "grade": "A"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 123, "percentage": "98%", "grade": "A*", "isAbsent": False}
    },
    {
        "row": 23,
        "name": "Yasmina Mohamed Mahmoud Nasr Saqr",
        "english": {"marks": 35, "percentage": "100%", "grade": "A*"},
        "maths": {"marks": 40, "percentage": "100%", "grade": "A*"},
        "science": {"marks": 33, "percentage": "94%", "grade": "A"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 123, "percentage": "98%", "grade": "A*", "isAbsent": False}
    },
    {
        "row": 24,
        "name": "Ahmed Khaled Ahmed Ahmed Al-Tabi",
        "english": {"marks": 19.5, "percentage": "56%", "grade": "D"},
        "maths": {"marks": 35.5, "percentage": "89%", "grade": "A"},
        "science": {"marks": 30.25, "percentage": "86%", "grade": "A"},
        "arabic": {"marks": "Absent", "percentage": "-", "grade": "-", "isAbsent": True},
        "overall": {"total": "Not Available", "percentage": "-", "grade": "-", "isAbsent": True}
    },
    {
        "row": 25,
        "name": "Tamer Ahmed Mahmoud Amer Ezzat Amer",
        "english": {"marks": 23, "percentage": "66%", "grade": "C"},
        "maths": {"marks": 37.5, "percentage": "94%", "grade": "A"},
        "science": {"marks": 29, "percentage": "83%", "grade": "B"},
        "arabic": {"marks": 14, "percentage": "93%", "grade": "A"},
        "overall": {"total": 103.5, "percentage": "83%", "grade": "B", "isAbsent": False}
    },
    {
        "row": 26,
        "name": "Tamim Yusri Abdul Qadir Wahba Majd",
        "english": {"marks": 23, "percentage": "66%", "grade": "C"},
        "maths": {"marks": 37, "percentage": "93%", "grade": "A"},
        "science": {"marks": 23.5, "percentage": "67%", "grade": "C"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 98.5, "percentage": "79%", "grade": "B", "isAbsent": False}
    },
    {
        "row": 27,
        "name": "Hamza Ahmed Mahmoud Amer Ezzat Amer",
        "english": {"marks": 33, "percentage": "94%", "grade": "A"},
        "maths": {"marks": 38, "percentage": "95%", "grade": "A*"},
        "science": {"marks": 30.5, "percentage": "87%", "grade": "A"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 116.5, "percentage": "93%", "grade": "A", "isAbsent": False}
    },
    {
        "row": 28,
        "name": "Ryan Mohammed Jalal Mohammed Taher Al-Eisawi",
        "english": {"marks": 32, "percentage": "91%", "grade": "A"},
        "maths": {"marks": 38, "percentage": "95%", "grade": "A*"},
        "science": {"marks": 28, "percentage": "80%", "grade": "B"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 113, "percentage": "90%", "grade": "A", "isAbsent": False}
    },
    {
        "row": 29,
        "name": "Zain Islam Izzat Abdel Fattah Hassan Amara",
        "english": {"marks": 21.5, "percentage": "61%", "grade": "D"},
        "maths": {"marks": 30.5, "percentage": "76%", "grade": "B"},
        "science": {"marks": 20.5, "percentage": "59%", "grade": "D"},
        "arabic": {"marks": 14, "percentage": "93%", "grade": "A"},
        "overall": {"total": 86.5, "percentage": "69%", "grade": "C", "isAbsent": False}
    },
    {
        "row": 30,
        "name": "Zain Mohamed Ahmed Ahmed Zaghloul",
        "english": {"marks": 7, "percentage": "20%", "grade": "F"},
        "maths": {"marks": 15.5, "percentage": "39%", "grade": "F"},
        "science": {"marks": 13.5, "percentage": "39%", "grade": "F"},
        "arabic": {"marks": 8, "percentage": "53%", "grade": "E"},
        "overall": {"total": 44, "percentage": "35%", "grade": "F", "isAbsent": False}
    },
    {
        "row": 31,
        "name": "Omar Walid Mohamed Ahmed Mohamed Abdullah",
        "english": {"marks": 19, "percentage": "54%", "grade": "E"},
        "maths": {"marks": 27, "percentage": "68%", "grade": "C"},
        "science": {"marks": 19, "percentage": "54%", "grade": "E"},
        "arabic": {"marks": 14, "percentage": "93%", "grade": "A"},
        "overall": {"total": 79, "percentage": "63%", "grade": "D", "isAbsent": False}
    },
    {
        "row": 32,
        "name": "Yassin Ibrahim Magdy Ibrahim Younis",
        "english": {"marks": 17, "percentage": "49%", "grade": "E"},
        "maths": {"marks": 32, "percentage": "80%", "grade": "B"},
        "science": {"marks": 33, "percentage": "94%", "grade": "A"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 97, "percentage": "78%", "grade": "B", "isAbsent": False}
    },
    {
        "row": 33,
        "name": "Younis Mahmoud Ali Abdel Nabi Mabrouk",
        "english": {"marks": 31, "percentage": "89%", "grade": "A"},
        "maths": {"marks": 33, "percentage": "83%", "grade": "B"},
        "science": {"marks": 33, "percentage": "94%", "grade": "A"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 112, "percentage": "90%", "grade": "A", "isAbsent": False}
    },
    {
        "row": 34,
        "name": "Arwa Ibrahim Ashraf Ibrahim Abdu Al-Halaf",
        "english": {"marks": 25.5, "percentage": "73%", "grade": "C"},
        "maths": {"marks": 30.5, "percentage": "76%", "grade": "B"},
        "science": {"marks": 29, "percentage": "83%", "grade": "B"},
        "arabic": {"marks": 14, "percentage": "93%", "grade": "A"},
        "overall": {"total": 99, "percentage": "79%", "grade": "B", "isAbsent": False}
    },
    {
        "row": 35,
        "name": "Ayla Amr Mustafa Mustafa Kamel",
        "english": {"marks": 24, "percentage": "69%", "grade": "C"},
        "maths": {"marks": 20, "percentage": "50%", "grade": "E"},
        "science": {"marks": 23, "percentage": "66%", "grade": "C"},
        "arabic": {"marks": 12, "percentage": "80%", "grade": "B"},
        "overall": {"total": 79, "percentage": "63%", "grade": "D", "isAbsent": False}
    },
    {
        "row": 36,
        "name": "Pirla Ahmed Mohamed Abdu Al-Basyouni",
        "english": {"marks": 21.5, "percentage": "61%", "grade": "D"},
        "maths": {"marks": 22.5, "percentage": "56%", "grade": "D"},
        "science": {"marks": 14, "percentage": "40%", "grade": "E"},
        "arabic": {"marks": 14, "percentage": "93%", "grade": "A"},
        "overall": {"total": 72, "percentage": "58%", "grade": "D", "isAbsent": False}
    },
    {
        "row": 37,
        "name": "Talia Yahya Bashir Awad Kasber",
        "english": {"marks": 33, "percentage": "94%", "grade": "A"},
        "maths": {"marks": 34, "percentage": "85%", "grade": "A"},
        "science": {"marks": 25, "percentage": "71%", "grade": "C"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 107, "percentage": "86%", "grade": "A", "isAbsent": False}
    },
    {
        "row": 38,
        "name": "Tia Ahmed Al-Saeed Ibrahim Mohamed Mohamed Al-Ayouti",
        "english": {"marks": 30.5, "percentage": "87%", "grade": "A"},
        "maths": {"marks": 40, "percentage": "100%", "grade": "A*"},
        "science": {"marks": 28.5, "percentage": "81%", "grade": "B"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 114, "percentage": "91%", "grade": "A", "isAbsent": False}
    },
    {
        "row": 39,
        "name": "Jouri Ahmed Samir Kamel Al-Hassanain",
        "english": {"marks": 34, "percentage": "97%", "grade": "A*"},
        "maths": {"marks": 34.5, "percentage": "86%", "grade": "A"},
        "science": {"marks": 30, "percentage": "86%", "grade": "A"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 113.5, "percentage": "91%", "grade": "A", "isAbsent": False}
    },
    {
        "row": 40,
        "name": "Hala Mohammed Fathi Al-Awadi Ahmed",
        "english": {"marks": 34.5, "percentage": "99%", "grade": "A*"},
        "maths": {"marks": 40, "percentage": "100%", "grade": "A*"},
        "science": {"marks": 33.5, "percentage": "96%", "grade": "A*"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 123, "percentage": "98%", "grade": "A*", "isAbsent": False}
    },
    {
        "row": 41,
        "name": "Saja Ahmed Reda Hassan Al-Abd",
        "english": {"marks": 31, "percentage": "89%", "grade": "A"},
        "maths": {"marks": 33.5, "percentage": "84%", "grade": "B"},
        "science": {"marks": 30, "percentage": "86%", "grade": "A"},
        "arabic": {"marks": 14, "percentage": "93%", "grade": "A"},
        "overall": {"total": 108.5, "percentage": "87%", "grade": "A", "isAbsent": False}
    },
    {
        "row": 42,
        "name": "Alia Mohammed Ahmed Abdulrazak Hawza",
        "english": {"marks": 28.5, "percentage": "81%", "grade": "B"},
        "maths": {"marks": 36, "percentage": "90%", "grade": "A"},
        "science": {"marks": 29, "percentage": "83%", "grade": "B"},
        "arabic": {"marks": 14, "percentage": "93%", "grade": "A"},
        "overall": {"total": 107.5, "percentage": "86%", "grade": "A", "isAbsent": False}
    },
    {
        "row": 43,
        "name": "Fayrouz Mahab Ahmed Kamel Ahmed Abdel-Moaty",
        "english": {"marks": 22, "percentage": "63%", "grade": "D"},
        "maths": {"marks": 28, "percentage": "70%", "grade": "C"},
        "science": {"marks": 26.5, "percentage": "76%", "grade": "B"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 91.5, "percentage": "73%", "grade": "C", "isAbsent": False}
    },
    {
        "row": 44,
        "name": "Karla Ahmed Yasser Samida",
        "english": {"marks": 32, "percentage": "91%", "grade": "A"},
        "maths": {"marks": 36.5, "percentage": "91%", "grade": "A"},
        "science": {"marks": 31, "percentage": "89%", "grade": "A"},
        "arabic": {"marks": 14, "percentage": "93%", "grade": "A"},
        "overall": {"total": 113.5, "percentage": "91%", "grade": "A", "isAbsent": False}
    },
    {
        "row": 45,
        "name": "Misk Amr Mohamed Asal",
        "english": {"marks": 28, "percentage": "80%", "grade": "B"},
        "maths": {"marks": 39, "percentage": "98%", "grade": "A*"},
        "science": {"marks": 31, "percentage": "89%", "grade": "A"},
        "arabic": {"marks": 15, "percentage": "100%", "grade": "A*"},
        "overall": {"total": 113, "percentage": "90%", "grade": "A", "isAbsent": False}
    }
]

# Load existing students
with open('src/data/students.json', 'r', encoding='utf-8') as f:
    all_students = json.load(f)

y2_students = [s for s in all_students if s.get("year") == "Year 2"]
print(f"Total existing Year 2 students: {len(y2_students)}")
existing_roll_nos = {s.get("roll_no"): s for s in y2_students}
print("Existing roll nos:", sorted(existing_roll_nos.keys()))

# Check which rows from 1 to 45 exist
for new_row in y2_data:
    r = new_row["row"]
    if r in existing_roll_nos:
        s = existing_roll_nos[r]
        # Update subjects
        s["subjects"] = [
            {
                "subject": "English",
                "max_marks": 35,
                "mark": str(new_row["english"]["marks"]),
                "percentage": new_row["english"]["percentage"],
                "grade": new_row["english"]["grade"],
                "is_absent": new_row["english"].get("isAbsent", False)
            },
            {
                "subject": "Maths",
                "max_marks": 40,
                "mark": str(new_row["maths"]["marks"]),
                "percentage": new_row["maths"]["percentage"],
                "grade": new_row["maths"]["grade"],
                "is_absent": new_row["maths"].get("isAbsent", False)
            },
            {
                "subject": "Science",
                "max_marks": 35,
                "mark": str(new_row["science"]["marks"]),
                "percentage": new_row["science"]["percentage"],
                "grade": new_row["science"]["grade"],
                "is_absent": new_row["science"].get("isAbsent", False)
            },
            {
                "subject": "Arabic",
                "max_marks": 15,
                "mark": str(new_row["arabic"]["marks"]),
                "percentage": new_row["arabic"]["percentage"],
                "grade": new_row["arabic"]["grade"],
                "is_absent": new_row["arabic"].get("isAbsent", False)
            }
        ]
        s["overall"] = {
            "total_marks": str(new_row["overall"]["total"]),
            "max_total": 125,
            "percentage": new_row["overall"]["percentage"],
            "grade": new_row["overall"]["grade"],
            "is_absent": new_row["overall"].get("isAbsent", False),
            "is_error": False
        }
        s["name_en"] = new_row["name"]
    else:
        print(f"Row {r} not in existing roll numbers! Name: {new_row['name']}")

with open('src/data/students.json', 'w', encoding='utf-8') as f:
    json.dump(all_students, f, ensure_ascii=False, indent=2)

print("Saved updated src/data/students.json")

