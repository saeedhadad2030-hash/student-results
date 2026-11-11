# -*- coding: utf-8 -*-
import json
import re

# Raw PDF OCR text lines
pdf_text_year1 = """
1 Ahmed Mohamed Al-Sayed Mohamed Al-Sayed Hassan 29 97% A* 50 100% A* 25 100% A* 15 100% A* 119 99% A*
2 Asser Ahmed Joudah Awad Allah Abdel Tawab 26.5 88% A 44 88% A 22 88% A 15 100% A* 107.5 90% A
3 Ayan Nabil Nabil Raafat Al-Qaqaa Al-Atbani 29 97% A* 49 98% A* 23 92% A 15 100% A* 116 97% A*
4 Bilal Masad Sami Ibrahim Dargham 28 93% A 45 90% A 24.5 98% A* 15 100% A* 112.5 94% A
5 Hamza Ahmed Mohamed Magdy Ali El-Sayed Abdel-Mawla 23 77% B 26 52% E 22 88% A 7.5 50% E 78.5 65% C
6 Hamza Mohamed Mahmoud Mohamed Ward 23.5 78% B 42.5 85% A 21.5 86% A 12.5 83% B 100 83% B
7 Zain Mahmoud Mounir Ahmed Al-Atabani 26 87% A 48 96% A* 25 100% A* 15 100% A* 114 95% A*
8 Sajid Mohamed Awad Ahmed Osman 29 97% A* 47 94% A 25 100% A* 13.5 90% A 114.5 95% A*
9 Omar Samah Sadiq Abdulaziz Ali Al-Nufaili 29 97% A* 48 96% A* 25 100% A* 15 100% A* 117 98% A*
10 Mohammad Siraj Ashraf Mohammad Moussa Diya 29 97% A* 45 90% A 25 100% A* 15 100% A* 114 95% A*
11 Murad Ahmed Yousri Ibrahim Mohammad Al-Shabouri 29 97% A* 47 94% A 22 88% A 15 100% A* 113 94% A
12 Yamen Riad Al-Arabi Riad Al-Shahawi 29.5 98% A* 44 88% A 17 68% C 15 100% A* 105.5 88% A
13 Younes Mohammad Hassan Mohammad Samisam 30 100% A* 50 100% A* 24 96% A* 15 100% A* 119 99% A*
14 Elin Islam Mohammad Al-Sayed Abdel Jawad 26 87% A 47 94% A 18 72% C 10 67% C 101 84% B
15 Dalida Mohamed Abdulhamid Hamid Awad Ghorab 28 93% A 44 88% A 24 96% A* 15 100% A* 111 93% A
16 Dana Mahmoud Mohammed Ahmed Salem Al-Masri 27 90% A 48 96% A* 25 100% A* 15 100% A* 115 96% A*
17 Sara Mohammed Abdel Sattar Mahmoud Bdeir 24 80% B 46.5 93% A 17 68% C 7.5 50% E 95 79% B
18 Celia Islam Ahmed Ahmed Shabrah 25.5 85% A 48 96% A* 21.5 86% A 15 100% A* 110 92% A
19 Alia Ahmed Sami Omar Madkour Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! 12.5 83% B 12.5 10% F
20 Fayrouz Ahmed Gamal Atiyah Hanifah 29 97% A* 46 92% A 20 80% B 15 100% A* 110 92% A
21 Karla Ahmed Mohammed Abdu Al-Basyouni 28.5 95% A* 47 94% A 22 88% A 15 100% A* 112.5 94% A
22 Lana Karim Ahmed Fawzi Mohammed Al-Damak 27.5 92% A 50 100% A* 25 100% A* 15 100% A* 117.5 98% A*
23 Layan Amr Zakaria Bahjat Al-Saeed Riya 27.5 92% A 47 94% A 23 92% A 15 100% A* 112.5 94% A
24 Malak Mohammed Osama Wahid Al-Din Ibrahim Al-Dali 28.5 95% A* 45 90% A 24 96% A* 15 100% A* 112.5 94% A
25 Yosra Ahmed Saad Ahmed Al-Sayed Hassan Rifai 29.5 98% A* 49 98% A* 25 100% A* 15 100% A* 118.5 99% A*
26 Ibrahim Abdu Ibrahim Abdul Qader Hamid Abu Al-Ata 29.5 98% A* 49 98% A* 25 100% A* 15 100% A* 118.5 99% A*
27 Adam Amr Salah Al-Din Muhammad Barakah 21.5 72% C 45 90% A 25 100% A* 15 100% A* 106.5 89% A
28 Iyad Walid Abdul Azim Ibrahim Muwafi 26.5 88% A 48 96% A* 19 76% B 15 100% A* 108.5 90% A
29 Tamim Muhammad Radwan Radwan Isa Abdul Haq 23 77% B 41 82% B 22 88% A 15 100% A* 101 84% B
30 Saif Muhammad Awad Ahmed Osman 28 93% A 46 92% A 25 100% A* 14.5 97% A* 113.5 95% A
31 Omar Saad Muath Mohammed Jumaa Hamid 28 93% A 50 100% A* 25 100% A* 15 100% A* 118 98% A*
32 Malik Mustafa Magdy Mohammed Youssef Al-Shahawy 25.5 85% A 48 96% A* 21 84% B 15 100% A* 109.5 91% A
33 Mohammed Abdu Ibrahim Abdul Qader Hamid Abu Al-Ata 29 97% A* 48 96% A* 22 88% A 15 100% A* 114 95% A*
34 Mahmoud Magdy Taha Abdul Halim Al-Khadraji 23 77% B 48 96% A* 21 84% B 13.5 90% A 105.5 88% A
35 Yamen Ahmed Sabri Mohammed Ibrahim Al-Halawati 25 83% B 49 98% A* 24 96% A* 15 100% A* 113 94% A
36 Oswa Ahmed Ibrahim Ismail Nazha 28 93% A 43 86% A 25 100% A* 15 100% A* 111 93% A
37 Aylan Abdulhamid Sayyid Abdulhamid Khalil 29 97% A* 50 100% A* 23 92% A 15 100% A* 117 98% A*
38 Talia Khalid Saad Ahmad Hassan Al-Laban 14 47% E 24 48% E 22 88% A 12 80% B 72 60% D
39 Khadija Khalid Al-Saeed Abdulaziz Al-Saeed Hijazi Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE!
40 Dalida Muhammad Ismail Youssef Youssef Abdul Latif 28 93% A 45 90% A 25 100% A* 15 100% A* 113 94% A
41 Sedra Mohammed Yaqout Yousri Al-Barbir 25 83% B 42 84% B 23 92% A 15 100% A* 105 88% A
42 Aliya Zakaria Mohammed Reda Zakaria Al-Suqaan Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE!
43 Layan Ahmed Ahmed Mohammed Ahmed Abdulaziz 23 77% B 50 100% A* 21 84% B 15 100% A* 109 91% A
44 Layan Khaled Mahrous Mohammed Hassan Jabal 27 90% A 46 92% A 25 100% A* 15 100% A* 113 94% A
45 Lein Ahmed Tharwat Fouad Mohammed Rajab 27.5 92% A 50 100% A* 25 100% A* 15 100% A* 117.5 98% A*
46 Laila Ahmed Talaat Atiyah Hamid Rashid 28 93% A 46 92% A 25 100% A* 15 100% A* 114 95% A*
47 Naya Mohammed Abdulrahman Ridwan Al-Sayed 16.5 55% D 39 78% B 23 92% A 15 100% A* 93.5 78% B
48 Yosra Ahmed Jamal Mohammed Al-Abd 27 90% A 45 90% A 23 92% A 15 100% A* 110 92% A
"""

pdf_text_year2 = """
1 Ahmed Mohammed Ahmed Ahmed Mohammed Al-Ghandour 21 60% D 29 83% B 32 91% A 14 93% A 96 80% B
2 Baraa Mohammed Rizq Rizq Abduljawad Najm 34 97% A* 35 100% A* 34 97% A* 15 100% A* 118 98% A*
3 Hamza Mohamed Ibrahim Tawfiq 35 100% A* 35 100% A* 31 89% A 15 100% A* 116 97% A*
4 Hamza Mohamed Hosni Ibrahim Younes Hijazi 30 86% A 33 94% A 34 97% A* 15 100% A* 112 93% A
5 Salim Samah Emad Ibrahim Ibrahim Samra Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE!
6 Mazen Mohamed Abdulrazak Mohamed Mohamed Kanani 29 83% B 33 94% A 32 91% A 15 100% A* 109 91% A
7 Yahya Ahmed Jamal Mohamed Al-Abd 30 86% A 26 74% C 33 94% A 15 100% A* 104 87% A
8 Yusuf Mohammed Abdel Halim Saad 27 77% B 20 57% D 29 83% B 15 100% A* 91 76% B
9 Yusuf Mohammed Fikri Mohammed Mustafa Al-Amir 23 66% C 28 80% B 33 94% A 15 100% A* 99 83% B
10 Elena Mohammed Jamal Al-Din Amin Mohammed Abdel Qader Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE!
11 Ayla Shadi Ahmed Ahmed Zaghloul 27 77% B 31 89% A 26 74% C 11 73% C 95 79% B
12 Tulin Ahmed Hussein Mohammed Al-Ashmawi 24 69% C 30 86% A 32 91% A 15 100% A* 101 84% B
13 Jamila Ahmed Magdy Mohamed Al-Saeed Mohamed 17 49% E 27 77% B 30 86% A 13 87% A 87 73% C
14 Jana Abdulqader Ahmed Abdulqader Al-Sayed Zayed 29 83% B 34 97% A* 32 91% A 15 100% A* 110 92% A
15 Tia Nabil Mohamed Mohamed Khattab 30 86% A 32 91% A 32 91% A 15 100% A* 109 91% A
16 Rose Hisham Mohamed Mansour Al-Maghlawi 24 69% C 28 80% B 32 91% A 14 93% A 98 82% B
17 Sara Mohamed Ahmed Abdul-Monim Moneim 31 89% A 34 97% A* 34 97% A* 15 100% A* 114 95% A*
18 Abir Abdulaziz Mahmoud Mohammed 17 49% E 29 83% B 28 80% B 15 100% A* 89 74% C
19 Farida Mohamed Rabi' Al-Dasouqi Al-Morsi 28 80% B 34 97% A* 32 91% A 15 100% A* 109 91% A
20 Layan Mohamed Sabri Fawzi Al-Sayed 31 89% A 32 91% A 33 94% A 15 100% A* 111 93% A
21 Lilia Mohamed Hamdi Ahmed Al-Sayed Al-Halwani 24 69% C 30 86% A 32 91% A 15 100% A* 101 84% B
22 Maria Mohannad Mounib Mohamed Tamim Ali 35 100% A* 35 100% A* 33 94% A 15 100% A* 118 98% A*
23 Yasmina Mohamed Mahmoud Nasr Saqr 35 100% A* 35 100% A* 33 94% A 15 100% A* 118 98% A*
24 Ahmed Khaled Ahmed Ahmed Al-Tabi 19.5 56% D 35.5 89% A 30.25 86% A Abs #VALUE! #VALUE! Abs #VALUE! #VALUE!
25 Tamer Ahmed Mahmoud Amer Ezzat Amer 23 66% C 37.5 94% A 29 83% B 14 93% A 103.5 83% B
26 Tamim Yusri Abdul Qadir Wahba Majd 23 66% C 37 93% A 23.5 67% C 15 100% A* 98.5 79% B
27 Hamza Ahmed Mahmoud Amer Ezzat Amer 33 94% A 38 95% A* 30.5 87% A 15 100% A* 116.5 93% A
28 Ryan Mohammed Jalal Mohammed Taher Al-Eisawi 32 91% A 38 95% A* 28 80% B 15 100% A* 113 90% A
29 Zain Islam Izzat Abdel Fattah Hassan Amara 21.5 61% D 30.5 76% B 20.5 59% D 14 93% A 86.5 69% C
30 Zain Mohamed Ahmed Ahmed Zaghloul 7 20% F 15.5 39% F 13.5 39% F 8 53% E 44 35% F
31 Omar Walid Mohamed Ahmed Mohamed Abdullah 19 54% E 27 68% C 19 54% E 14 93% A 79 63% D
32 Yassin Ibrahim Magdy Ibrahim Younis 17 49% E 32 80% B 33 94% A 15 100% A* 97 78% B
33 Younis Mahmoud Ali Abdel Nabi Mabrouk 31 89% A 33 83% B 33 94% A 15 100% A* 112 90% A
34 Arwa Ibrahim Ashraf Ibrahim Abdu Al-Halaf 25.5 73% C 30.5 76% B 29 83% B 14 93% A 99 79% B
35 Ayla Amr Mustafa Mustafa Kamel 24 69% C 20 50% E 23 66% C 12 80% B 79 63% D
36 Pirla Ahmed Mohamed Abdu Al-Basyouni 21.5 61% D 22.5 56% D 14 40% E 14 93% A 72 58% D
37 Talia Yahya Bashir Awad Kasber 33 94% A 34 85% A 25 71% C 15 100% A* 107 86% A
38 Tia Ahmed Al-Saeed Ibrahim Mohamed Mohamed Al-Ayouti 30.5 87% A 40 100% A* 28.5 81% B 15 100% A* 114 91% A
39 Jouri Ahmed Samir Kamel Al-Hassanain 34 97% A* 34.5 86% A 30 86% A 15 100% A* 113.5 91% A
40 Hala Mohammed Fathi Al-Awadi Ahmed 34.5 99% A* 40 100% A* 33.5 96% A* 15 100% A* 123 98% A*
41 Saja Ahmed Reda Hassan Al-Abd 31 89% A 33.5 84% B 30 86% A 14 93% A 108.5 87% A
42 Alia Mohammed Ahmed Abdulrazak Hawza 28.5 81% B 36 90% A 29 83% B 14 93% A 107.5 86% A
43 Fayrouz Mahab Ahmed Kamel Ahmed Abdel-Moaty 22 63% D 28 70% C 26.5 76% B 15 100% A* 91.5 73% C
44 Karla Ahmed Yasser Samida 32 91% A 36.5 91% A 31 89% A 14 93% A 113.5 91% A
45 Misk Amr Mohamed Asal 28 80% B 39 98% A* 31 89% A 15 100% A* 113 90% A
"""

pdf_text_year3 = """
1 Ahmed Rami Ragab Mohamed Ahmed Al-Shafie 30 60% D 40 80% B 50 100% A* 14 93% A 134 81% B
2 Adam Mohamed Ahmed El-Sayed Diab 46 92% A 47 94% A 50 100% A* 15 100% A* 158 96% A*
3 Elias Mohamed Abdul Hadi Mohamed Al-Sayed 49 98% A* 47 94% A 50 100% A* 15 100% A* 161 98% A*
4 Bajad Ahmed Wajdi Lotfi El-Sayed Khalil Fouda 48 96% A* 50 100% A* 50 100% A* 15 100% A* 163 99% A*
5 Hussein Sharif Hussein Youssef Al-Baisi 23 46% E 30 60% D 44 88% A 10.5 70% C 107.5 65% C
6 Hamza Abdulhadi Mahmoud El-Sayed Mohamed 49 98% A* 49 98% A* 48 96% A* 14.5 97% A* 160.5 97% A*
7 Omar Mohamed Ahmed Mustafa Al-Najjar 34 68% C 43 86% A 48 96% A* 15 100% A* 140 85% B
8 Malik Mohamed Mohamed Abdel Fattah Al-Sharbasi 46 92% A 45 90% A 50 100% A* 15 100% A* 156 95% A
9 Yasin Asim Fouad Al-Saeed Fayad 48 96% A* 45 90% A 50 100% A* 15 100% A* 158 96% A*
10 Yahya Sharif Hussein Youssef Al-Baisi 19 38% F 19 38% F 44 88% A 11.5 77% B 93.5 57% D
11 Ayla Ahmed Magdy Mohamed Al-Mawafi Al-Sayed 46 92% A 49 98% A* 50 100% A* 14.5 97% A* 159.5 97% A*
12 Talia Ahmed Jamal Issa Farid Issa Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE!
13 Julia Mohammed Mohammed Hassan Mohammed Al-Ashmawi 22 44% E 33 66% C 48 96% A* 14.5 97% A* 117.5 71% C
14 Habiba Mohammed Fathi Al-Awadi Ahmed 50 100% A* 47 94% A 50 100% A* 14.5 97% A* 161.5 98% A*
15 Halima Mahmoud Tawakkul Al-Dasouqi Al-Nashawi 47 94% A 46 92% A 50 100% A* 15 100% A* 158 96% A*
16 Seela Khaled Atef Darwish Wahba 39 78% B 43 86% A 50 100% A* 14 93% A 146 88% A
17 Seline Ahmed Yousri Ibrahim Mohammed Al-Shabouri 46 92% A 47 94% A 48 96% A* 15 100% A* 156 95% A
18 Farida Karim Mohammed Al-Sayed Abdel Halim Al-Azouni 35 70% C 32 64% D 50 100% A* 7.5 50% E 124.5 75% B
19 Farida Mahmoud Salah Mahmoud Al-Mansouri 39 78% B 43 86% A 50 100% A* 14.5 97% A* 146.5 89% A
20 Karma Yasser Adel Abdel Fattah Ibrahim Suleiman 24 48% E 40 80% B 46 92% A 14.5 97% A* 124.5 75% B
21 Leila Islam Reda Al-Tabai Moneim 31 62% D 31 62% D 50 100% A* 14.5 97% A* 126.5 77% B
22 Lilia Ahmed Ali Hassan Ali Abu Al-Ala 38 76% B Abs #VALUE! #VALUE! 50 100% A* 13 87% A 101 61% D
23 Nur Ahmad Sami Omar Madkur Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! 8 53% E 8 5% F
24 Nour Mahmoud Mohamed Abdulrazak Ibrahim Alawadi 38 76% B 41 82% B 50 100% A* 15 100% A* 144 87% A
25 Ahmed Mahmoud Abdul Mowli Mohamed Ibrahim 30 60% D 36.5 73% C 50 100% A* 11.5 77% B 128 78% B
26 Asser Ahmed Abdul Mowli Mohamed Ibrahim 43 86% A 48.5 97% A* 50 100% A* 14.5 97% A* 156 95% A
27 Anas Ibrahim Fathi Rajab Ahmed 50 100% A* 50 100% A* 50 100% A* 15 100% A* 165 100% A*
28 Eyad Ahmad Muhammad Habib Al-Shanawi 23 46% E 23 46% E 50 100% A* 13 87% A 109 66% C
29 Ryan Imad Ahmad Muhammad Jad Al-Karim 34 68% C 43.5 87% A 50 100% A* 15 100% A* 142.5 86% A
30 Zayed Ibrahim Ridi Abdul Rahim Ridi 26 52% E 47 94% A 44 88% A 15 100% A* 132 80% B
31 Salim Mahmoud Abdu Muhammad Abdulrahman Al-Jamal 42 84% B 49.5 99% A* 44 88% A 14 93% A 149.5 91% A
32 Salah Muhammad Muhammad Salih Al-Din Al-Akyabi 42 84% B 41.5 83% B 50 100% A* 14.5 97% A* 148 90% A
33 Malik Mohammed Al-Sayed Ahmed Hilal Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! 15 100% A* 15 9% F
34 Yasin Abdul Rahman Yasin Abdul Rahman Muhammad Al-Nourj 48 96% A* 49.5 99% A* 50 100% A* 15 100% A* 162.5 98% A*
35 Yasseen Abdo Khalifa Mohamed Elmozayen Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE!
36 Tala Muhammad Ahmad Muhammad Al-Aasi 48 96% A* 39.5 79% B 50 100% A* 15 100% A* 152.5 92% A
37 Ganna Muhammad Saleh Taha Yusuf Al-Mutawalli 49 98% A* 48 96% A* 50 100% A* 15 100% A* 162 98% A*
38 Rozan Khalid Abdul Basit Hassan Mousa 40 80% B 45.5 91% A 50 100% A* 15 100% A* 150.5 91% A
39 Seline Ahmad Atef Darwish Wahba 33 66% C 41 82% B 50 100% A* 15 100% A* 139 84% B
40 Farida Medhat Magdy Mahmoud Khalil 43 86% A 49 98% A* 50 100% A* 15 100% A* 157 95% A*
41 Katya Mohamed Salah El-Din Mustafa 48 96% A* 36.5 73% C 50 100% A* 9.5 63% D 144 87% A
42 Kenzie Ahmed Mohamed Abu El-Maati Mahmoud 50 100% A* 50 100% A* 50 100% A* 15 100% A* 165 100% A*
43 Lara Ahmed Ashraf Zakaria Habba 24 48% E 17.5 35% F 20 40% E 12.5 83% B 74 45% E
44 Maria Ahmed Tharwat Fouad Mohamed Ragab 39 78% B 36 72% C 21 42% E 15 100% A* 111 67% C
45 Malak Hossam Nasr Nasheh Abd Al-Baqi 18 36% F 27.5 55% D 50 100% A* 13 87% A 108.5 66% C
46 Nourin Mahmoud Hamid Awad Rabi 19 38% F 34.5 69% C 50 100% A* 14.5 97% A* 118 72% C
"""

pdf_text_year4 = """
1 Adham Mohamed Ahmed Ahmed Ahmed Al-Tabi Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE!
2 Anas Islam Rashad Abdul Razak Muhammad Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE!
3 Saif Zakaria Muhammad Reda Zakaria Al-Suqaan Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE!
4 Amar Muhammad Taha Abdul Salam Abdu Sharif 39 78% B 41 82% B 41 82% B 33 66% C 14 93% A 14 93% A 182 79% B
5 Omar Muhammad Muhammad Fahmy Yahya Khalil 34 68% C 25 50% E 43 86% A 34 68% C 15 100% A* 13 87% A 164 71% C
6 Yahya Muhammad Khattab Ahmed Ahmed Issa 47 94% A 46 92% A 48 96% A* 42 84% B 15 100% A* 15 100% A* 213 93% A
7 Yahya Maysara Mohib Hussein Salim 24.5 49% E 25 50% E 32 64% D 24.5 49% E 13.5 90% A 10 67% C 129.5 56% D
8 Yusuf Mohamed Sadiq Hassanien Abdul Muttalib 25 50% E 34 68% C 40 80% B 24.5 49% E 15 100% A* 10 67% C 148.5 65% D
9 Aysel Ahmed Mohamed Ahmed Shoman 34 68% C 26 52% E 39 78% B 38 76% B 15 100% A* 12 80% B 164 71% C
10 Hala Mohamed Al-Imam Abdul Moneim Al-Imam Ahmed 37.5 75% B 27 54% E 47 94% A 38.5 77% B 14 93% A 11 73% C 175 76% B
11 Darin Wijdan Bashir Mohamed Al-Hawal 38 76% B 26 52% E 48 96% A* 45 90% A 14.5 97% A* 13 87% A 184.5 80% B
12 Selin Mohamed Rizq Rizq Abduljawad Najm 43 86% A 39 78% B 42 84% B 35.5 71% C 15 100% A* 14 93% A 188.5 82% B
13 Nour Mohamed Saleh Taha Youssef Elmetwally 34.5 69% C 39 78% B 38 76% B 47.5 95% A* 15 100% A* 14 93% A 188 82% B
14 Nada Islam Mohammed Ali Khairallah 43 86% A 25 50% E 47 94% A 47.5 95% A* 15 100% A* 15 100% A* 192.5 84% B
15 Haya Mahmoud Mohammed Ahmed Salem Al-Masri 44 88% A 31 62% D 42 84% B 41.5 83% B 13 87% A 14 93% A 185.5 81% B
16 Adam Mahmoud Hosni Al-Sayed Ahmed 47 94% A 42 84% B 50 100% A* 39.5 79% B 13 87% A 15 100% A* 206.5 90% A
17 Anas Abdullah Shukri Mustajir Al-Jamal 31 62% D 40 80% B 31 62% D 22 44% E 13 87% A 13 87% A 150 65% C
18 Salim Khaled Mahmoud Ahmed Amin Abdu 26 52% E 33 66% C 32 64% D Abs #VALUE! #VALUE! 3.5 23% F 8 53% E 102.5 45% E
19 Ali Ahmed Al-Saeed Ibrahim Muhammad Muhammad Al-Ayouti 38 76% B 30 60% D 43 86% A 38.5 77% B 11 73% C 15 100% A* 175.5 76% B
20 Ali Muhammad Rabi' Al-Desouqi Al-Mursi 41 82% B 45 90% A 46 92% A 43 86% A 13 87% A 11 73% C 199 87% A
21 Amr Muhammad Ahmed Essam Muhammad Al-Dweik 33 66% C 34 68% C 40 80% B 26.5 53% E 11 73% C 14 93% A 158.5 69% C
22 Younes Mahmoud Magdy Mahmoud Khalil 31 62% D 29 58% D 41 82% B 40 80% B 4 27% F 11 73% C 156 68% C
23 Asil Abdullah Shukri Mustajir Al-Jamal 32.5 65% C 25 50% E 34 68% C 31 62% D 8 53% E 11 73% C 141.5 62% D
24 Joudi Mohamed Zakaria Bahjat Al-Saeed Riya Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! #VALUE! #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE! Abs #VALUE! #VALUE!
25 Dalida Mahab Ahmed Kamel Ahmed Abdel-Moaty 40 80% B 25 50% E 42 84% B 41 82% B 15 100% A* 14 93% A 177 77% B
26 Rimas Al-Sayed Sobhi Hamid Abdel-Monem 35 70% C 33 66% C 37 74% C Abs #VALUE! #VALUE! 15 100% A* 13 87% A 133 58% D
27 Aliya Ibrahim Ashraf Ibrahim Abdu Al-Half 42 84% B 25 50% E 40 80% B 43 86% A 14 93% A 15 100% A* 179 78% B
28 Karma Mohamed Abdelalim Mohamed Ahmed 43 86% A 32 64% D 46 92% A 32 64% D 11 73% C 14 93% A 178 77% B
29 Laila Alaa Magdy Taha Qaseer Al-Dail 42 84% B 30 60% D 33.5 67% C 42.5 85% A 14 93% A 14 93% A 176 77% B
"""

def parse_triplet(tokens, start_idx):
    # Expect: mark, percentage, grade OR Abs, #VALUE!, #VALUE! OR #VALUE!, #VALUE!, #VALUE!
    mark = tokens[start_idx]
    pct = tokens[start_idx+1]
    grd = tokens[start_idx+2]
    
    is_abs = (mark.lower() == 'abs' or mark == '#VALUE!')
    is_val_err = (mark == '#VALUE!' or pct == '#VALUE!' or grd == '#VALUE!')
    
    mark_clean = "Absent" if mark.lower() == 'abs' else (None if mark == '#VALUE!' else mark)
    pct_clean = None if is_val_err else pct
    grd_clean = None if is_val_err else grd
    
    return {
        "mark": mark_clean,
        "percentage": pct_clean,
        "grade": grd_clean,
        "is_absent": (mark.lower() == 'abs'),
        "is_error": is_val_err
    }, start_idx + 3

def parse_year_lines(raw_text, year_num):
    lines = [l.strip() for l in raw_text.strip().split('\n') if l.strip()]
    results = []
    
    # Define subjects config
    if year_num in [1, 2, 3]:
        if year_num == 1:
            subj_names = [("English", 30), ("Maths", 50), ("Science", 25), ("Arabic", 15)]
            max_total = 120
        elif year_num == 2:
            subj_names = [("English", 35), ("Maths", 35), ("Science", 35), ("Arabic", 15)]
            max_total = 120
        elif year_num == 3:
            subj_names = [("English", 50), ("Maths", 50), ("Science", 50), ("Arabic", 15)]
            max_total = 165
        expected_triplets = 4 + 1 # 4 subjects + 1 overall
    elif year_num == 4:
        subj_names = [("English", 50), ("Maths", 50), ("Science", 50), ("Second L", 50), ("Social", 15), ("Arabic", 15)]
        max_total = 230
        expected_triplets = 6 + 1 # 6 subjects + 1 overall

    for line in lines:
        tokens = line.split()
        roll_no = int(tokens[0])
        # Find where the scores start. Scores are at the end:
        # total tokens for triplets = expected_triplets * 3
        # Tokens from end:
        triplet_tokens_count = expected_triplets * 3
        name_tokens = tokens[1:-triplet_tokens_count]
        name = " ".join(name_tokens)
        score_tokens = tokens[-triplet_tokens_count:]
        
        idx = 0
        subjects = []
        for sname, smax in subj_names:
            trip, idx = parse_triplet(score_tokens, idx)
            subjects.append({
                "subject": sname,
                "max_marks": smax,
                "mark": trip["mark"],
                "percentage": trip["percentage"],
                "grade": trip["grade"],
                "is_absent": trip["is_absent"]
            })
            
        overall_trip, idx = parse_triplet(score_tokens, idx)
        overall = {
            "total_marks": overall_trip["mark"],
            "max_total": max_total,
            "percentage": overall_trip["percentage"],
            "grade": overall_trip["grade"],
            "is_absent": overall_trip["is_absent"],
            "is_error": overall_trip["is_error"]
        }
        
        results.append({
            "roll_no": roll_no,
            "name_en": name,
            "year": f"Year {year_num}",
            "subjects": subjects,
            "overall": overall
        })
    return results

parsed_results = {
    "Year 1": parse_year_lines(pdf_text_year1, 1),
    "Year 2": parse_year_lines(pdf_text_year2, 2),
    "Year 3": parse_year_lines(pdf_text_year3, 3),
    "Year 4": parse_year_lines(pdf_text_year4, 4)
}

with open("scripts/pdf_results.json", "w", encoding="utf-8") as f:
    json.dump(parsed_results, f, ensure_ascii=False, indent=2)

print(f"Year 1 parsed: {len(parsed_results['Year 1'])}")
print(f"Year 2 parsed: {len(parsed_results['Year 2'])}")
print(f"Year 3 parsed: {len(parsed_results['Year 3'])}")
print(f"Year 4 parsed: {len(parsed_results['Year 4'])}")
