# -*- coding: utf-8 -*-
import json

with open("scripts/excel_students.json", "r", encoding="utf-8") as f:
    excel_data = json.load(f)

with open("scripts/pdf_results.json", "r", encoding="utf-8") as f:
    pdf_data = json.load(f)

# Explicit manual & verified mappings for all 4 years
# Every single student verified against the official Excel sheets & PDF statistics
year1_mapping = {
    # PDF Roll No -> Excel ID (1 to 48)
    1: 2,   # Ahmed Mohamed Al-Sayed Mohamed Al-Sayed Hassan -> احمد محمد السيد محمد السيد حسن
    2: 4,   # Asser Ahmed Joudah Awad Allah Abdel Tawab -> اسر احمد جودة عوض الله عبدالتواب
    3: 6,   # Ayan Nabil Nabil Raafat Al-Qaqaa Al-Atbani -> آيان نبيل نبيل رأفت القعقاع العتباني
    4: 7,   # Bilal Masad Sami Ibrahim Dargham -> بلال مسعد سامى إبراهيم ضرغام
    5: 9,   # Hamza Ahmed Mohamed Magdy Ali El-Sayed Abdel-Mawla -> حمزة أحمد محمد مجدي علي السيد عبدالمولى
    6: 10,  # Hamza Mohamed Mahmoud Mohamed Ward -> حمزة محمد محمود محمد ورد
    7: 11,  # Zain Mahmoud Mounir Ahmed Al-Atabani -> زين محمود منير أحمد العتباني
    8: 12,  # Sajid Mohamed Awad Ahmed Osman -> ساجد محمد عوض احمد عثمان
    9: 14,  # Omar Samah Sadiq Abdulaziz Ali Al-Nufaili -> عمر سامح صديق عبدالعزيز على النفيلي
    10: 18, # Mohammad Siraj Ashraf Mohammad Moussa Diya -> محمد سـراج أشرف محمد موسى ضيا
    11: 20, # Murad Ahmed Yousri Ibrahim Mohammad Al-Shabouri -> مراد احمد يسري إبراهيم محمد الشابوري
    12: 22, # Yamen Riad Al-Arabi Riad Al-Shahawi -> يامن رياض العربي رياض الشهاوي
    13: 23, # Younes Mohammad Hassan Mohammad Samisam -> يونس محمد حسن محمد سميسم
    14: 25, # Elin Islam Mohammad Al-Sayed Abdel Jawad -> الين اسلام محمد السيد عبد الجواد
    15: 30, # Dalida Mohamed Abdulhamid Hamid Awad Ghorab -> داليدا محمد عبدالحميد حامد عوض غراب
    16: 31, # Dana Mahmoud Mohammed Ahmed Salem Al-Masri -> دانه محمود محمد احمد سالم المصري
    17: 32, # Sara Mohammed Abdel Sattar Mahmoud Bdeir -> ساره محمد عبد الستار محمود بدير
    18: 34, # Celia Islam Ahmed Ahmed Shabrah -> سيليا إسلام أحمد أحمد شباره
    19: 35, # Alia Ahmed Sami Omar Madkour -> عاليا أحمد سامي عمر مدكور
    20: 37, # Fayrouz Ahmed Gamal Atiyah Hanifah -> فيروزاحمد جمال عطيه حنيفه
    21: 38, # Karla Ahmed Mohammed Abdu Al-Basyouni -> كارلا احمد محمد عبده البسيوني
    22: 39, # Lana Karim Ahmed Fawzi Mohammed Al-Damak -> لانا كريم احمد فوزي محمد الدمك
    23: 42, # Layan Amr Zakaria Bahjat Al-Saeed Riya -> ليان عمرو زكريا بهجات السعيد ريه
    24: 45, # Malak Mohammed Osama Wahid Al-Din Ibrahim Al-Dali -> ملك محمد اسامه وحيد الدين ابراهيم الدالي
    25: 48, # Yosra Ahmed Saad Ahmed Al-Sayed Hassan Rifai -> يسرا أحمد سعد أحمد السيد حسن رفاعي
    26: 1,  # Ibrahim Abdu Ibrahim Abdul Qader Hamid Abu Al-Ata -> ابراهيم عبده ابراهيم عبد القادر حامد ابو العطا
    27: 3,  # Adam Amr Salah Al-Din Muhammad Barakah -> ادم عمرو صلاح الدين محمد بركه
    28: 5,  # Iyad Walid Abdul Azim Ibrahim Muwafi -> اياد وليد عبد العظيم إبراهيم موافي
    29: 8,  # Tamim Muhammad Radwan Radwan Isa Abdul Haq -> تميم محمد رضوان رضوان عيسى عبد الحق
    30: 13, # Saif Muhammad Awad Ahmed Osman -> سيف محمد عوض أحمد عثمان
    31: 15, # Omar Saad Muath Mohammed Jumaa Hamid -> عمير سعد معاذ محمد جمعه حامد
    32: 16, # Malik Mustafa Magdy Mohammed Youssef Al-Shahawy -> مالك مصطفى مجدي محمد يوسف الشهاوي
    33: 17, # Mohammed Abdu Ibrahim Abdul Qader Hamid Abu Al-Ata -> محمد عبده ابراهيم عبد القادر حامد ابو العطا
    34: 19, # Mahmoud Magdy Taha Abdul Halim Al-Khadraji -> محمود مجدى طه عبدالحليم الخضرجي
    35: 21, # Yamen Ahmed Sabri Mohammed Ibrahim Al-Halawati -> يامن أحمد صبري محمد إبراهيم الحلواتي
    36: 24, # Oswa Ahmed Ibrahim Ismail Nazha -> أسوة احمد إبراهيم إسماعيل نزهة
    37: 26, # Aylan Abdulhamid Sayyid Abdulhamid Khalil -> آيلن عبدالحميد السيد عبد الحميد خليل
    38: 27, # Talia Khalid Saad Ahmad Hassan Al-Laban -> تاليا خالد سعد احمد حسن اللبان
    39: 28, # Khadija Khalid Al-Saeed Abdulaziz Al-Saeed Hijazi -> خديجة خالد السعيد عبد العزيز السعيد حجازى
    40: 29, # Dalida Muhammad Ismail Youssef Youssef Abdul Latif -> داليدا محمد إسماعيل يوسف يوسف عبد اللطيف
    41: 33, # Sedra Mohammed Yaqout Yousri Al-Barbir -> سدرة محمد ياقوت يسري البربير
    42: 36, # Aliya Zakaria Mohammed Reda Zakaria Al-Suqaan -> عاليا زكريا محمد رضا زكريا السقعان
    43: 40, # Layan Ahmed Ahmed Mohammed Ahmed Abdulaziz -> ليان أحمد أحمد محمد أحمد عبدالعزيز
    44: 41, # Layan Khaled Mahrous Mohammed Hassan Jabal -> ليان خالد محروس محمد حسن جبل
    45: 44, # Lein Ahmed Tharwat Fouad Mohammed Rajab -> لين أحمد ثروت فؤاد محمد رجب
    46: 43, # Laila Ahmed Talaat Atiyah Hamid Rashid -> ليلى أحمد طلعت عطية حامد راشد
    47: 46, # Naya Mohammed Abdulrahman Ridwan Al-Sayed -> نايا محمد عبدالرحمن رضوان السيد
    48: 47  # Yosra Ahmed Jamal Mohammed Al-Abd -> يسرا احمد جمال محمد العبد
}

year2_mapping = {
    # PDF Roll No -> Excel ID (1 to 45)
    1: 2,   # Ahmed Mohammed Ahmed Ahmed Mohammed Al-Ghandour -> احمد محمد احمد احمد محمد الغندور
    2: 4,   # Baraa Mohammed Rizq Rizq Abduljawad Najm -> براء محمد رزق رزق عبدالجواد نجم
    3: 8,   # Hamza Mohamed Ibrahim Tawfiq -> حمزة محمد إبراهيم توفيق
    4: 9,   # Hamza Mohamed Hosni Ibrahim Younes Hijazi -> حمزه محمد حسني ابراهيم يونس حجازي
    5: 13,  # Salim Samah Emad Ibrahim Ibrahim Samra -> سليم سامح عماد إبراهيم إبراهيم سمره
    6: 15,  # Mazen Mohamed Abdulrazak Mohamed Mohamed Kanani -> مازن محمد عبدالرازق محمد محمد كناني
    7: 17,  # Yahya Ahmed Jamal Mohamed Al-Abd -> يحيي احمد جمال محمد العبد
    8: 18,  # Yusuf Mohammed Abdel Halim Saad -> يوسف محمد عبد الحليم سعد
    9: 19,  # Yusuf Mohammed Fikri Mohammed Mustafa Al-Amir -> يوسف محمد فكري محمد مصطفي الأمير
    10: None, # Elena Mohammed Jamal Al-Din Amin Mohammed Abdel Qader (Abs on all, not in Excel list)
    11: 22, # Ayla Shadi Ahmed Ahmed Zaghloul -> آيلا شادي أحمد احمد زغلول
    12: 26, # Tulin Ahmed Hussein Mohammed Al-Ashmawi -> تولين أحمد حسين محمد العشماوى
    13: 28, # Jamila Ahmed Magdy Mohamed Al-Saeed Mohamed -> جميله احمد مجدى محمد السعيد محمد
    14: 29, # Jana Abdulqader Ahmed Abdulqader Al-Sayed Zayed -> جنا عبدالقادر أحمد عبدالقادر السيد زايد
    15: 32, # Tia Nabil Mohamed Mohamed Khattab -> رنوة نبيل محمد محمد خطاب
    16: 33, # Rose Hisham Mohamed Mansour Al-Maghlawi -> روز هشام محمد منصورالمغلاوي
    17: 34, # Sara Mohamed Ahmed Abdul-Monim Moneim -> ساره محمد احمد عبدالمنعم منيعم
    18: 37, # Abir Abdulaziz Mahmoud Mohammed -> عبير عبدالعزيز محمود محمد
    19: 38, # Farida Mohamed Rabi' Al-Dasouqi Al-Morsi -> فريده محمد ربيع الدسوقى المرسى
    20: 41, # Layan Mohamed Sabri Fawzi Al-Sayed -> ليان محمد صبرى فوزى السيد
    21: 42, # Lilia Mohamed Hamdi Ahmed Al-Sayed Al-Halwani -> ليليا محمد حمدى احمد السيد الحلوانى
    22: 43, # Maria Mohannad Mounib Mohamed Tamim Ali -> ماريا مهند منيب محمد تميم على
    23: 45, # Yasmina Mohamed Mahmoud Nasr Saqr -> ياسمينا محمد محمود نصر صقر
    24: 1,  # Ahmed Khaled Ahmed Ahmed Al-Tabi -> احمد خالد احمد احمد التابعي
    25: 5,  # Tamer Ahmed Mahmoud Amer Ezzat Amer -> تامر أحمد محمود عامر عزت عامر
    26: 6,  # Tamim Yusri Abdul Qadir Wahba Majd -> تميم يسرى عبد القادر وهبه مجد
    27: 7,  # Hamza Ahmed Mahmoud Amer Ezzat Amer -> حمزة أحمد محمود عامر عزت عامر
    28: 10, # Ryan Mohammed Jalal Mohammed Taher Al-Eisawi -> ريان محمد جلال محمد طاهر العيسوى
    29: 11, # Zain Islam Izzat Abdel Fattah Hassan Amara -> زين اسلام عزت عبد الفتاح حسن عماره
    30: 12, # Zain Mohamed Ahmed Ahmed Zaghloul -> زين محمد أحمد أحمد زغلول
    31: 14, # Omar Walid Mohamed Ahmed Mohamed Abdullah -> عمر وليد محمد أحمد محمد عبد الله
    32: 16, # Yassin Ibrahim Magdy Ibrahim Younis -> ياسين ابراهيم مجدي إبراهيم يونس
    33: 20, # Younis Mahmoud Ali Abdel Nabi Mabrouk -> يونس محمود على عبد النبي مبروك
    34: 21, # Arwa Ibrahim Ashraf Ibrahim Abdu Al-Halaf -> اروى ابراهيم اشرف إبراهيم عبده الهلف
    35: 23, # Ayla Amr Mustafa Mustafa Kamel -> آيلا عمرو مصطفى مصطفى كامل
    36: 24, # Pirla Ahmed Mohamed Abdu Al-Basyouni -> بيرلا أحمد محمد عبده البسيوني
    37: 25, # Talia Yahya Bashir Awad Kasber -> تاليا يحيى بشير عوض كسبر
    38: 27, # Tia Ahmed Al-Saeed Ibrahim Mohamed Mohamed Al-Ayouti -> تيا أحمد السعيد إبراهيم محمد محمد العيوطي
    39: 30, # Jouri Ahmed Samir Kamel Al-Hassanain -> جوري أحمد سمير كامل الحسانين
    40: 31, # Hala Mohammed Fathi Al-Awadi Ahmed -> حلا محمد فتحي العوضي احمد
    41: 35, # Saja Ahmed Reda Hassan Al-Abd -> سجي احمد رضا حسن العبد
    42: 36, # Alia Mohammed Ahmed Abdulrazak Hawza -> عاليا محمد احمد عبدالرازق حوزة
    43: 39, # Fayrouz Mahab Ahmed Kamel Ahmed Abdel-Moaty -> فيروز مهاب أحمد كامل أحمد عبد المعطي
    44: 40, # Karla Ahmed Yasser Samida -> كارلا أحمد ياسر صميدة
    45: 44  # Misk Amr Mohamed Asal -> مسك عمرو محمد عسل
}

# Note in Year 2:
# Excel ID 3: أدهم باسم محمد سمير على احمد زيد (Status: محول - دمياط الدولية الخاصة) -> Not in PDF
# PDF #10: Elena Mohammed Jamal Al-Din Amin Mohammed Abdel Qader (Abs on all subjects) -> Transfer/new not in Excel

year3_mapping = {
    1: 1,   # Ahmed Rami Ragab Mohamed Ahmed Al-Shafie -> احمد رامى رجب محمد احمد الشافعي
    2: 3,   # Adam Mohamed Ahmed El-Sayed Diab -> ادم محمد أحمد السيد دياب
    3: 5,   # Elias Mohamed Abdul Hadi Mohamed Al-Sayed -> الياس محمد عبد الهادي محمد السيد
    4: 8,   # Bajad Ahmed Wajdi Lotfi El-Sayed Khalil Fouda -> بجاد احمد وجدي لطفى السيد خليل فودة
    5: 9,   # Hussein Sharif Hussein Youssef Al-Baisi -> حسين شريف حسين يوسف البيسي
    6: 10,  # Hamza Abdulhadi Mahmoud El-Sayed Mohamed -> حمزة عبدالهادي محمود السيد محمد
    7: 15,  # Omar Mohamed Ahmed Mustafa Al-Najjar -> عمر محمد احمد محمد مصطفى النجار
    8: 17,  # Malik Mohamed Mohamed Abdel Fattah Al-Sharbasi -> مالك محمد محمد عبد الفتاح الشرباصي
    9: 18,  # Yasin Asim Fouad Al-Saeed Fayad -> ياسين عاصم فؤاد السعيد فايد
    10: 21, # Yahya Sharif Hussein Youssef Al-Baisi -> يحيى شريف حسين يوسف البيسي
    11: 22, # Ayla Ahmed Magdy Mohamed Al-Mawafi Al-Sayed -> ايلا احمد مجدى محمد الموافي السيد
    12: 24, # Talia Ahmed Jamal Issa Farid Issa -> تاليا احمد جمال عيسى فريد عيسى
    13: 26, # Julia Mohammed Mohammed Hassan Mohammed Al-Ashmawi -> جوليا محمد محمد حسن محمد العشماوي
    14: 27, # Habiba Mohammed Fathi Al-Awadi Ahmed -> حبيبة محمد فتحي العوضي أحمد
    15: 28, # Halima Mahmoud Tawakkul Al-Dasouqi Al-Nashawi -> حليمه محمود توكل الدسوقي النشاوي
    16: 30, # Seela Khaled Atef Darwish Wahba -> سيلا خالد عاطف درويش وهبة
    17: 32, # Seline Ahmed Yousri Ibrahim Mohammed Al-Shabouri -> سيلين احمد يسري إبراهيم محمد الشابوري
    18: 34, # Farida Karim Mohammed Al-Sayed Abdel Halim Al-Azouni -> فريده كريم محمد السيد عبدالحليم العزونى
    19: 35, # Farida Mahmoud Salah Mahmoud Al-Mansouri -> فريده محمود صلاح محمود المنصوري
    20: 37, # Karma Yasser Adel Abdel Fattah Ibrahim Suleiman -> كارما ياسر عادل عبد الفتاح ابراهيم سليمان
    21: 40, # Leila Islam Reda Al-Tabai Moneim -> ليلى اسلام رضا التابعي منعيم
    22: 41, # Lilia Ahmed Ali Hassan Ali Abu Al-Ala -> ليليا احمد على حسن على أبوالعلا
    23: 44, # Nur Ahmad Sami Omar Madkur -> نور احمد سامي عمر مدكور
    24: 45, # Nour Mahmoud Mohamed Abdulrazak Ibrahim Alawadi -> نور محمود محمد عبدالرازق إبراهيم العوضى
    25: 2,  # Ahmed Mahmoud Abdul Mowli Mohamed Ibrahim -> احمد محمود عبد المولى محمد إبراهيم
    26: 4,  # Asser Ahmed Abdul Mowli Mohamed Ibrahim -> اسر احمد عبد المولى محمد إبراهيم
    27: 6,  # Anas Ibrahim Fathi Rajab Ahmed -> انس ابراهيم فتحي رجب احمد
    28: 7,  # Eyad Ahmad Muhammad Habib Al-Shanawi -> اياد احمد محمد حبيب الشناوي
    29: 11, # Ryan Imad Ahmad Muhammad Jad Al-Karim -> ريان عماد احمد محمد جاد الكريم
    30: 12, # Zayed Ibrahim Ridi Abdul Rahim Ridi -> زايد ابراهيم ريدي عبد الرحيم ريدي
    31: 13, # Salim Mahmoud Abdu Muhammad Abdulrahman Al-Jamal -> سليم محمود عبده محمد عبدالرحمن الجمل
    32: 14, # Salah Muhammad Muhammad Salih Al-Din Al-Akyabi -> صلاح محمد محمد صلاح الدين الاكيابي
    33: 16, # Malik Mohammed Al-Sayed Ahmed Hilal -> مالك محمد السيد احمد هلال
    34: 19, # Yasin Abdul Rahman Yasin Abdul Rahman Muhammad Al-Nourj -> ياسين عبد الرحمن يسن عبدالرحمن محمد النورج
    35: 20, # Yasseen Abdo Khalifa Mohamed Elmozayen -> ياسين عبده خليفه محمد المزين
    36: 23, # Tala Muhammad Ahmad Muhammad Al-Aasi -> تالا محمد احمد محمد العاصي
    37: 25, # Ganna Muhammad Saleh Taha Yusuf Al-Mutawalli -> جنة محمد صالح طه يوسف المتولي
    38: 29, # Rozan Khalid Abdul Basit Hassan Mousa -> روزان خالد عبد الباسط حسن موسي
    39: 31, # Seline Ahmad Atef Darwish Wahba -> سيلين احمد عاطف درويش وهبه
    40: 33, # Farida Medhat Magdy Mahmoud Khalil -> فريدة مدحت مجدى محمود خليل
    41: 36, # Katya Mohamed Salah El-Din Mustafa -> كاتيا محمد صلاح الدين مصطفى
    42: 38, # Kenzie Ahmed Mohamed Abu El-Maati Mahmoud -> كنزى احمد محمد أبو المعاطي محمود
    43: 39, # Lara Ahmed Ashraf Zakaria Habba -> لارا احمد اشرف زكريا حبه
    44: 42, # Maria Ahmed Tharwat Fouad Mohamed Ragab -> ماريا أحمد ثروت فؤاد محمد رجب
    45: 43, # Malak Hossam Nasr Nasheh Abd Al-Baqi -> ملك حسام نصر نصحي عبد الباقي
    46: 46  # Nourin Mahmoud Hamid Awad Rabi -> نورين محمود حامد عوض ربيع
}

year4_mapping = {
    1: 2,   # Adham Mohamed Ahmed Ahmed Ahmed Al-Tabi -> أدهم محمد احمد احمد احمد التابعي
    2: 3,   # Anas Islam Rashad Abdul Razak Muhammad -> أنس اسلام رشاد عبد الرازق محمد
    3: 6,   # Saif Zakaria Muhammad Reda Zakaria Al-Suqaan -> سيف زكريا محمد رضا زكريا السقعان
    4: 9,   # Amar Muhammad Taha Abdul Salam Abdu Sharif -> عمار محمد طه عبد السلام عبده شريف
    5: 11,  # Omar Muhammad Muhammad Fahmy Yahya Khalil -> عمر محمد محمد فهمى يحيى خليل
    6: 12,  # Yahya Muhammad Khattab Ahmed Ahmed Issa -> يحيى محمد خطاب احمد احمد عيسى
    7: 13,  # Yahya Maysara Mohib Hussein Salim -> يحيى ميسره محب حسين سليم
    8: 14,  # Yusuf Mohamed Sadiq Hassanien Abdul Muttalib -> يوسف محمد صديق حسانين عبد المطلب
    9: 17,  # Aysel Ahmed Mohamed Ahmed Shoman -> أيسل احمد محمد احمد شومان
    10: 19, # Hala Mohamed Al-Imam Abdul Moneim Al-Imam Ahmed -> حلا محمد الامام عبدالمنعم الامام احمد
    11: 20, # Darin Wijdan Bashir Mohamed Al-Hawal -> دارين وجدان بشير محمد الهوال
    12: 23, # Selin Mohamed Rizq Rizq Abduljawad Najm -> سيلين محمد رزق رزق عبدالجواد نجم
    13: 28, # Nour Mohamed Saleh Taha Youssef Elmetwally -> نور محمد صالح طه يوسف المتولي
    14: 27, # Nada Islam Mohammed Ali Khairallah -> ندى اسلام محمد علي خير الله
    15: 29, # Haya Mahmoud Mohammed Ahmed Salem Al-Masri -> هيا محمود محمد أحمد سالم المصرى
    16: 1,  # Adam Mahmoud Hosni Al-Sayed Ahmed -> أدم محمود حسني السيد أحمد
    17: 4,  # Anas Abdullah Shukri Mustajir Al-Jamal -> أنس عبدالله شكرى مستجير الجمل
    18: 5,  # Salim Khaled Mahmoud Ahmed Amin Abdu -> سليم خالد محمود احمد امين عبده
    19: 7,  # Ali Ahmed Al-Saeed Ibrahim Muhammad Muhammad Al-Ayouti -> على أحمد السعيد إبراهيم محمد محمد العيوطي
    20: 8,  # Ali Muhammad Rabi' Al-Desouqi Al-Mursi -> علي محمد ربيع الدسوقي المرسي
    21: 10, # Amr Muhammad Ahmed Essam Muhammad Al-Dweik -> عمر محمد احمد عصام محمد الدويك
    22: 15, # Younes Mahmoud Magdy Mahmoud Khalil -> يونس محمود مجدي محمود خليل
    23: 16, # Asil Abdullah Shukri Mustajir Al-Jamal -> أسيل عبدالله شكرى مستجير الجمل
    24: 18, # Joudi Mohamed Zakaria Bahjat Al-Saeed Riya -> جودى محمد زكريا بهجات السعيد ريه
    25: 21, # Dalida Mahab Ahmed Kamel Ahmed Abdel-Moaty -> داليدا مهاب أحمد كامل احمد عبد المعطي
    26: 22, # Rimas Al-Sayed Sobhi Hamid Abdel-Monem -> ريماس السيد صبحي حامد عبدالمنعم
    27: 24, # Aliya Ibrahim Ashraf Ibrahim Abdu Al-Half -> عاليه إبراهيم أشرف إبراهيم عبده الهلف
    28: 25, # Karma Mohamed Abdelalim Mohamed Ahmed -> كارما محمد عبدالعليم محمد احمد
    29: 26  # Laila Alaa Magdy Taha Qaseer Al-Dail -> ليلى علاء مجدي طه قصير الديل
}

all_mappings = {
    "Year 1": year1_mapping,
    "Year 2": year2_mapping,
    "Year 3": year3_mapping,
    "Year 4": year4_mapping
}

# Verify 100% coverage and no collisions
master_records = []
unmatched_list = []

for year, mapping in all_mappings.items():
    ex_list = {s["id"]: s for s in excel_data[year]}
    pdf_list = {s["roll_no"]: s for s in pdf_data[year]}
    used_ex_ids = set()
    
    for roll_no, pdf_s in pdf_list.items():
        ex_id = mapping.get(roll_no)
        if ex_id is not None and ex_id in ex_list:
            ex_s = ex_list[ex_id]
            used_ex_ids.add(ex_id)
            nat_id = str(ex_s["national_id"]).strip()
            last5 = nat_id[-5:]
            last4 = nat_id[-4:]
            
            # Extract birth date from National ID
            # Egyptian ID: C YY MM DD GG SSS C
            c = nat_id[0]
            century = "20" if c == "3" else ("19" if c == "2" else "20")
            yy = nat_id[1:3]
            mm = nat_id[3:5]
            dd = nat_id[5:7]
            birth_date = f"{century}{yy}-{mm}-{dd}"
            
            record = {
                "id": f"{year.replace(' ', '')}_{roll_no}",
                "roll_no": roll_no,
                "year": year,
                "name_en": pdf_s["name_en"],
                "name_ar": ex_s["name_ar"],
                "gender": ex_s["gender"],
                "national_id": nat_id,
                "last5": last5,
                "last4": last4,
                "birth_date": birth_date,
                "login_code": f"ips@{last5}",
                "status": ex_s.get("status", "enrolled"),
                "subjects": pdf_s["subjects"],
                "overall": pdf_s["overall"]
            }
            master_records.append(record)
        else:
            # PDF student without Excel record (e.g. Elena in Year 2)
            unmatched_list.append({
                "type": "pdf_only",
                "year": year,
                "roll_no": roll_no,
                "name_en": pdf_s["name_en"],
                "subjects": pdf_s["subjects"],
                "overall": pdf_s["overall"]
            })
            
    # Check unused excel students (e.g. transferred students)
    for ex_id, ex_s in ex_list.items():
        if ex_id not in used_ex_ids:
            unmatched_list.append({
                "type": "excel_only",
                "year": year,
                "excel_id": ex_id,
                "name_ar": ex_s["name_ar"],
                "national_id": str(ex_s["national_id"]),
                "status": ex_s.get("status", "transferred/unmatched")
            })

# Check collisions in login codes
login_code_map = {}
for r in master_records:
    code = r["login_code"].lower()
    if code not in login_code_map:
        login_code_map[code] = []
    login_code_map[code].append(r)

for r in master_records:
    code = r["login_code"].lower()
    siblings = login_code_map[code]
    r["has_duplicate_code"] = (len(siblings) > 1)
    if r["has_duplicate_code"]:
        r["duplicate_count"] = len(siblings)
        r["collision_ids"] = [s["id"] for s in siblings]
    else:
        r["duplicate_count"] = 1
        r["collision_ids"] = []

print(f"Total Master Records Created: {len(master_records)}")
print(f"Total Unmatched Records: {len(unmatched_list)}")
print(f"Codes with collision: {sum(1 for c, l in login_code_map.items() if len(l) > 1)}")

with open("scripts/master_dataset.json", "w", encoding="utf-8") as f:
    json.dump({
        "students": master_records,
        "unmatched": unmatched_list,
        "total_count": len(master_records)
    }, f, ensure_ascii=False, indent=2)

print("Saved scripts/master_dataset.json successfully.")
