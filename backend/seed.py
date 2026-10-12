import asyncio
import json
import random
from datetime import datetime, timedelta, timezone

from app.core.database import AsyncSessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.models import (
    Achievement, AnswerOption, Course, CourseModule, Enrollment, Lead, Lesson,
    LessonMaterial, LessonProgress, LeaderboardPoint, LiveSession, Notification,
    Package, Payment, Question, StudentAchievement, Subscription, Test,
    TestAnswer, TestAttempt, TrialLesson, User,
)

UNSPLASH = "https://images.unsplash.com/photo-{}?auto=format&fit=crop&w=800&q=80"
AVA = "https://images.unsplash.com/photo-{}?auto=format&fit=crop&w=400&q=80"


def now():
    return datetime.now(timezone.utc)


async def seed_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        print("🌱 Seeding Zerdeli...")

        # ---------------- USERS ----------------
        pw = get_password_hash("password123")
        admin_pw = get_password_hash("adminpass123")

        admin = User(email="admin@zerdeli.kz", full_name="Zerdeli Бас Әкімшісі",
                     phone="+7 700 000 00 00", hashed_password=admin_pw, role="ADMIN",
                     preparation_direction="UNT")
        manager = User(email="manager@zerdeli.kz", full_name="Сая Ержанова",
                       phone="+7 777 999 88 77", hashed_password=pw, role="MANAGER",
                       preparation_direction="UNT")
        curator = User(email="curator@zerdeli.kz", full_name="Дана Ахметова",
                       phone="+7 777 555 33 22", hashed_password=pw, role="CURATOR",
                       preparation_direction="UNT",
                       last_login_at=now() - timedelta(hours=1))
        curator2 = User(email="curator2@zerdeli.kz", full_name="Нұрлан Есімов",
                        phone="+7 777 555 33 33", hashed_password=pw, role="CURATOR",
                        preparation_direction="NIS")

        teachers = [
            User(email="aset@zerdeli.kz", full_name="Асет Нұрғалиев", phone="+7 701 111 22 33",
                 hashed_password=pw, role="TEACHER", preparation_direction="UNT",
                 avatar_url=AVA.format("1560250097-0b93528c311a")),
            User(email="gulnar@zerdeli.kz", full_name="Гүлнар Смағұлова", phone="+7 701 222 33 44",
                 hashed_password=pw, role="TEACHER", preparation_direction="RFMSH",
                 avatar_url=AVA.format("1573496359142-b8d87734a5a2")),
            User(email="erzhan@zerdeli.kz", full_name="Ержан Қайратұлы", phone="+7 701 333 44 55",
                 hashed_password=pw, role="TEACHER", preparation_direction="UNT",
                 avatar_url=AVA.format("1568602471122-7832951cc4c5")),
            User(email="aigerim@zerdeli.kz", full_name="Айгерім Бекболатова", phone="+7 701 444 55 66",
                 hashed_password=pw, role="TEACHER", preparation_direction="UNT",
                 avatar_url=AVA.format("1594744803329-e58b31de8bf5")),
            User(email="daniyar@zerdeli.kz", full_name="Данияр Оспанов", phone="+7 701 555 66 77",
                 hashed_password=pw, role="TEACHER", preparation_direction="UNT",
                 avatar_url=AVA.format("1531891437562-4301cf35b7e4")),
            User(email="teacher@zerdeli.kz", full_name="Д-р Азамат Данияров", phone="+7 701 987 65 43",
                 hashed_password=pw, role="TEACHER", preparation_direction="NIS",
                 avatar_url=AVA.format("1507003211169-0a1dd7228f2d")),
        ]

        demo_student = User(email="student@zerdeli.kz", full_name="Айбек",
                            phone="+7 777 123 45 67", hashed_password=pw, role="STUDENT",
                            preparation_direction="UNT",
                            last_login_at=now() - timedelta(hours=3),
                            avatar_url=AVA.format("1534528741775-53994a69daeb"))
        _login_offsets = [  # hours ago — varied so curator dashboard has signal
            2, 26, 74, 5, 170, 30, 120,
        ]
        extra_students = [
            User(email=f"student{i}@zerdeli.kz", full_name=name, phone=f"+7 70{i} 000 00 0{i}",
                 hashed_password=pw, role="STUDENT",
                 preparation_direction=random.choice(["UNT", "NIS", "BIL"]),
                 last_login_at=now() - timedelta(hours=_login_offsets[i - 1]))
            for i, name in enumerate([
                "Аружан Қасымова", "Ерасыл Мұратов", "Мадина Серік", "Санжар Тлеу",
                "Аида Нұрлан", "Дамир Ким", "Молдир Асан",
            ], start=1)
        ]

        db.add_all([admin, manager, curator, curator2, *teachers, demo_student, *extra_students])
        await db.flush()

        # assign students to curators
        demo_student.curator_id = curator.id
        for i, s in enumerate(extra_students):
            s.curator_id = curator.id if i < 4 else curator2.id

        t_aset, t_gulnar, t_erzhan, t_aigerim, t_daniyar, t_azamat = teachers

        # ---------------- PACKAGES ----------------
        packages = [
            Package(code="standard", name="ҰБТ Стандарт", subtitle="Өздігінен сапалы дайындық",
                    tier="standard", price=19900, kaspi_month=1658, duration_days=30, order_index=1,
                    features=[
                        "Барлық бейнесабақтарға шексіз қолжетімділік",
                        "10–30 минуттық сабақ конспектілері",
                        "Әр тақырып бойынша бекіту тесттері",
                        "Апталық ҰТО форматындағы байқау сынағы",
                        "Zerdeli мобильді қосымшасы",
                    ],
                    not_included=[
                        "Жеке кураторлық бақылау 24/7",
                        "Қатемен жеке бейне-жұмыс",
                    ]),
            Package(code="pro", name="ҰБТ PRO", subtitle="140 баллға жетудің ең танымал пакеті",
                    tier="pro", price=29900, kaspi_month=2490, duration_days=30, is_popular=True,
                    badge="ЕҢ ТАҢДАУЛЫ", order_index=2,
                    features=[
                        "Стандарт пакетінің барлық мүмкіндігі",
                        "140 балл алған жеке куратор (24/7)",
                        "Қатемен жұмыс: әр қатеге бейне-талдау",
                        "Күнделікті үй жұмысын қадағалау",
                        "Ата-анамен апталық байланыс",
                    ],
                    not_included=["Бас оқытушымен 1-on-1 Zoom сессиялар"]),
            Package(code="vip", name="ҰБТ VIP", subtitle="Грантқа 100% заңды кепілдікпен",
                    tier="vip", price=49900, kaspi_month=4158, duration_days=30,
                    badge="ГРАНТ КЕПІЛІ", order_index=3,
                    features=[
                        "PRO пакетінің барлық мүмкіндігі",
                        "Бас сарапшы ұстазбен апталық 1-on-1",
                        "Мемлекеттік грантқа 100% заңды кепілдік",
                        "Жеке оқу траекториясын құру",
                        "ЖОО-ға құжат тапсыруда сүйемелдеу",
                    ],
                    not_included=[]),
        ]
        db.add_all(packages)

        # ---------------- ACHIEVEMENTS ----------------
        achievements = [
            Achievement(code="FIRST_TEST", title="Бұлақ басы 🏆", description="Алғашқы тестіңізді тапсырдыңыз", icon="🏆", points_reward=50),
            Achievement(code="STREAK_7", title="7 күндік лездеме 🔥", description="Қатарынан 7 күн сабақ оқыдыңыз", icon="🔥", points_reward=100),
            Achievement(code="LESSONS_10", title="Талапкер сұңқар 📚", description="10 сабақты толық аяқтадыңыз", icon="📚", points_reward=75),
            Achievement(code="SCORE_90", title="Дарынды зерттеуші 🎯", description="Тесттен 90%-дан жоғары жинадыңыз", icon="🎯", points_reward=150),
            Achievement(code="TOP_10", title="Элита көшбасшы 💎", description="Үздік 10 оқушы қатарына ендіңіз", icon="💎", points_reward=250),
        ]
        db.add_all(achievements)
        await db.flush()

        # ---------------- COURSES ----------------
        def course(title, desc, photo, direction, subject, level, price, disc, rating, students, teacher):
            return Course(title=title, description=desc, cover_image=UNSPLASH.format(photo),
                          direction=direction, subject=subject, level=level, price=price,
                          discount_price=disc, rating=rating, total_students=students,
                          teacher_id=teacher.id, is_published=True)

        c_matlit = course(
            "Zerdeli: Математикалық сауаттылық (20/20 балл)",
            "140 баллға жетудің басты фундаменті. Логика, жылдам шығару лайфхактары, мәтіндік және диаграммалық есептер.",
            "1635070041078-e363dbe005cb", "UNT", "Мат.сауаттылық", "140 балл деңгейі", 24900, 16900, 4.98, 4820, t_aset)
        c_history = course(
            "Zerdeli: Қазақстан тарихы (Жаңа 2026 базасы)",
            "ҰТО-ның ең соңғы нақты тест базасы бойынша толық курс. Хронология, саяси реформалар және картамен жұмыс.",
            "1461360370896-922624d12aa1", "UNT", "Қазақстан тарихы", "Барлық деңгейге", 24900, 15900, 4.96, 3910, t_erzhan)
        c_mathphys = course(
            "Zerdeli: Математика + Физика (IT & Инженерия Грант)",
            "50+50 баллдық бейіндік курс. KBTU, SDU, ҚБТУ, Satbayev және NU-ға түсушілерге арналған толық кешен.",
            "1509228468518-180dd4864904", "UNT", "Мат + Физ", "Тереңдетілген", 39900, 28900, 4.99, 5620, t_gulnar)
        c_chembio = course(
            "Zerdeli: Химия + Биология (Медициналық Грант)",
            "ҚазҰМУ, AMU және Назарбаев Университетіне медициналық грантқа түсуге арналған авторлық бағдарлама.",
            "1532094349884-543bc11b234d", "UNT", "Хим + Био", "Тереңдетілген", 39900, 28900, 4.97, 4210, t_aigerim)
        c_nis = course(
            "NIS (Назарбаев Мектептеріне) Толық Дайындық",
            "5-6 сыныптар үшін: Математика, сандық сипаттамалар, кеңістіктік ойлау және тілдік қабілеттер.",
            "1523240795612-9a054b0db644", "NIS", "NIS Арнайы", "5-6 сынып", 32900, 22900, 4.95, 2150, t_azamat)
        c_bil = course(
            "BIL (Білім-Инновация) Олимпиадалық Математика",
            "6-сынып оқушылары үшін БИЛ емтиханынан сүрінбей өтуге арналған олимпиадалық логика.",
            "1434030216411-0b793f4b4173", "BIL", "BIL Олимпиада", "6-сынып", 29900, 19900, 4.94, 1840, t_daniyar)

        courses = [c_matlit, c_history, c_mathphys, c_chembio, c_nis, c_bil]
        db.add_all(courses)
        await db.flush()

        # ---------------- MODULES + LESSONS ----------------
        LESSON_TITLES = {
            c_matlit.id: [
                ("1-Модуль: Сандық сипаттамалар мен логика", [
                    "Арифметикалық орта, медиана және мода лайфхактары",
                    "Салыстырмалы жиілік және ықтималдық негіздері",
                    "Пропорция мен пайыздық есептерді 30 секундта шешу",
                ]),
                ("2-Модуль: Геометрия мен кеңістік", [
                    "Боялған фигуралардың ауданын табу тәсілдері",
                    "Көлемдер мен беттер: типтік ҰБТ есептері",
                ]),
                ("3-Модуль: Мәтіндік және диаграммалық есептер", [
                    "Кестелер мен диаграммаларды жылдам оқу",
                    "Логикалық жұмбақтар: элиминация әдісі",
                ]),
            ],
            c_history.id: [
                ("1-Модуль: Ежелгі және ортағасырлық Қазақстан", [
                    "Сақ, үйсін, қаңлы дәуірінің карталары",
                    "Түркі қағанаттарының саяси жүйесі",
                    "Моңғол шапқыншылығы және Алтын Орда",
                ]),
                ("2-Модуль: Жаңа және қазіргі заман", [
                    "Ұлт-азаттық көтерілістер хронологиясы",
                    "Тәуелсіздік жылдарындағы реформалар",
                ]),
            ],
            c_mathphys.id: [
                ("1-Модуль: Тригонометрия және анализ бастамалары", [
                    "Күрделі тригонометриялық теңдеулер",
                    "Туындының физикалық мағынасы",
                    "Интеграл: аудан есептеу қолданысы",
                ]),
                ("2-Модуль: Механика және электр", [
                    "Кинематика мен динамика есептері",
                    "Тұрақты ток тізбектері",
                ]),
            ],
            c_chembio.id: [
                ("1-Модуль: Органикалық химия", [
                    "Көмірсутектердің номенклатурасы мен қасиеттері",
                    "Функционал топтар мен реакциялар",
                ]),
                ("2-Модуль: Генетика және цитология", [
                    "Генетикалық есептерді шығару тәсілдері",
                    "Жасуша бөлінуі: митоз бен мейоз",
                ]),
            ],
            c_nis.id: [
                ("1-Модуль: Сандар сипаты мен логикалық қатарлар", [
                    "Жылдам есептеу тәсілдері",
                    "Логикалық қатарды жалғастыру",
                    "Кеңістіктік фигураларды айналдыру",
                ]),
                ("2-Модуль: Тілдік қабілеттер", [
                    "Аналогия мен антоним есептері",
                ]),
            ],
            c_bil.id: [
                ("1-Модуль: Комбинаторика мен логика", [
                    "Дирихле принципі",
                    "Инварианттар мен түстеу әдісі",
                ]),
                ("2-Модуль: Геометриялық олимпиада", [
                    "Ұқсастық пен көмекші сызықтар",
                ]),
            ],
        }

        first_lesson_by_course = {}
        modules_by_course: dict = {}
        for c in courses:
            for mi, (mtitle, lessons) in enumerate(LESSON_TITLES[c.id], start=1):
                mod = CourseModule(course_id=c.id, title=mtitle, order_index=mi)
                db.add(mod)
                await db.flush()
                modules_by_course.setdefault(c.id, []).append(mod)
                for li, ltitle in enumerate(lessons, start=1):
                    les = Lesson(
                        module_id=mod.id, title=f"{mi}.{li} {ltitle}",
                        description="ҰБТ-да жиі кездесетін тәсілдерге негізделген қысқа әрі нақты сабақ.",
                        video_url="https://www.youtube.com/embed/dQw4w9WgXcQ",
                        theory=(
                            f"## {ltitle}\n\n"
                            "Бұл тақырыпта негізгі ұғымдар, формулалар және шешу алгоритмі берілген.\n\n"
                            "- Анықтама мен негізгі формула\n"
                            "- Типтік есептің қадамдық шешімі\n"
                            "- Жиі жіберілетін қателер\n\n"
                            "**Есте сақта:** есепті бастамас бұрын шартты сызбамен белгіле."
                        ),
                        practice=(
                            "Төмендегі 5 есепті дәптерге шығар, содан кейін «Практика» тестін тапсыр.\n\n"
                            "1. Негізгі формуланы қолданатын жаттығу\n"
                            "2. Кері есеп\n"
                            "3. Мәтіндік есеп\n"
                            "4. Күрделендірілген нұсқа\n"
                            "5. ҰБТ форматындағы есеп"
                        ),
                        homework=(
                            "**Үй жұмысы.** Дедлайн — келесі сабаққа дейін.\n\n"
                            "- Оқулықтан №12–18 есептер\n"
                            "- «Үй жұмысы» тестін 80%+ нәтижемен тапсыру\n"
                            "- Түсінбеген жерді куратордан сұра"
                        ),
                        duration_minutes=random.choice([12, 15, 18, 22, 25]),
                        order_index=li, is_free_preview=(mi == 1 and li == 1),
                    )
                    db.add(les)
                    await db.flush()
                    if mi == 1 and li == 1:
                        first_lesson_by_course[c.id] = les.id
                        db.add(LessonMaterial(lesson_id=les.id, title=f"{c.subject}_конспект.pdf",
                                              file_url="/materials/notes.pdf", file_type="PDF"))
                        db.add(LessonMaterial(lesson_id=les.id, title="Формулалар_жинағы.pdf",
                                              file_url="/materials/formulas.pdf", file_type="PDF"))
                        db.add(LessonMaterial(lesson_id=les.id, title="Практика_есептер.pdf",
                                              file_url="/materials/practice.pdf", file_type="PDF"))

        # ---------------- TESTS ----------------
        def add_test(title, desc, direction, kind, course_id, is_free, passing, minutes,
                     due_days=None, module_id=None, lesson_id=None):
            t = Test(title=title, description=desc, direction=direction, kind=kind,
                     course_id=course_id, module_id=module_id, lesson_id=lesson_id,
                     is_free=is_free, passing_score=passing,
                     duration_minutes=minutes, is_published=True,
                     due_at=(now() + timedelta(days=due_days)) if due_days is not None else None)
            db.add(t)
            return t

        async def add_q(test, text, qtype, points, options, explanation):
            """options: list of (text, is_correct)."""
            q = Question(test_id=test.id, question_text=text, question_type=qtype,
                         points=points, explanation=explanation, order_index=1)
            db.add(q)
            await db.flush()
            for otext, correct in options:
                db.add(AnswerOption(question_id=q.id, option_text=otext, is_correct=correct))

        MATH_Q = [
            ("Сандық қатар: 12, 18, X, 32, 41. Арифметикалық орта 26 болса, X-ті табыңыз.",
             "single_choice", 5, [("25", False), ("27", True), ("29", False), ("31", False)],
             "Қосынды 26×5=130. 12+18+32+41=103. X=27."),
            ("Тіктөртбұрыштың ұзындығы 20%-ға артып, ені 10%-ға кемісе, аудан қалай өзгереді?",
             "single_choice", 5, [("8%-ға артты", True), ("10%-ға артты", False), ("өзгермеді", False), ("5%-ға кеміді", False)],
             "S₁ = 1.2·0.9·S = 1.08·S, яғни 8%-ға артты."),
            ("Поезд 180 км жолды 3 сағатта жүрді. Дәл сол жылдамдықпен 300 км-ді қанша сағатта жүреді?",
             "numerical", 5, [("5", True)], "v=60 км/сағ, t=300/60=5 сағат."),
            ("3-ке де, 5-ке де бөлінетін сандарды таңдаңыз (бірнеше жауап):",
             "multiple_choice", 5, [("15", True), ("20", False), ("45", True), ("50", False)],
             "15 пен 45 екі шартты да қанағаттандырады."),
            ("15 оқушының 9-ы қыз. Қыздардың пайызы қанша?",
             "numerical", 5, [("60", True)], "9/15·100 = 60%."),
        ]
        HIST_Q = [
            ("1993 жылы 15 қарашада қандай оқиға болды?",
             "single_choice", 5, [("Теңге айналымға енгізілді", True), ("Тұңғыш Конституция", False),
                                  ("БҰҰ-ға мүшелік", False), ("Семей полигоны жабылды", False)],
             "1993 жылы ұлттық валюта — теңге енгізілді."),
            ("Алтын Орда мемлекеті қай ғасырда құрылды?",
             "single_choice", 5, [("XIII ғ.", True), ("XI ғ.", False), ("XV ғ.", False), ("IX ғ.", False)],
             "Алтын Орда — XIII ғасырдың ортасы (Бату хан)."),
            ("Қазақ хандығы қай жылы құрылды?",
             "numerical", 5, [("1465", True)], "Керей мен Жәнібек — 1465 жыл (кейбір деректе 1466)."),
        ]

        async def fill(test, qbank, n):
            for (text, qtype, pts, opts, expl) in qbank[:n]:
                await add_q(test, text, qtype, pts, opts, expl)

        await db.flush()

        # per-course topic tests + per-module section tests + per-lesson practice/homework
        topic_tests = {}
        for c in courses:
            qbank = MATH_Q if "тарих" not in c.subject.lower() else HIST_Q
            tt = add_test(f"{c.subject}: тақырыптық бекіту сынағы",
                          "Курс модульдері бойынша білімді бекітуге арналған тест.",
                          c.direction, "topic", c.id, False, 70, 20, due_days=random.choice([2, 4, 7]))
            await db.flush()
            await fill(tt, qbank, 4)
            topic_tests[c.id] = tt

            # section test after every module
            for mi, mod in enumerate(modules_by_course.get(c.id, []), start=1):
                st = add_test(f"{mi}-бөлім бойынша тест", "Бөлім тақырыптарын бекіту.",
                              c.direction, "section", c.id, False, 70, 15,
                              module_id=mod.id, due_days=random.choice([3, 5, 9]))
                await db.flush()
                await fill(st, qbank, 3)

            # practice + homework quiz for the first lesson
            fl = first_lesson_by_course.get(c.id)
            if fl:
                pr = add_test("Практика: 1.1", "Сабақтан кейінгі жаттығу тесті.",
                              c.direction, "practice", c.id, False, 60, 10, lesson_id=fl)
                await db.flush()
                await fill(pr, qbank, 3)
                hw = add_test("Үй жұмысы: 1.1", "1.1 бойынша үй тапсырмасы.",
                              c.direction, "homework", c.id, False, 80, 15, lesson_id=fl,
                              due_days=2)
                await db.flush()
                await fill(hw, qbank, 4)

        # general ҰБТ mock exams (no course)
        mock1 = add_test("ҰБТ байқау сынағы №1 — Математикалық сауаттылық",
                         "ҰТО-ның 2026 форматы бойынша толық байқау сынағы.", "UNT", "mock", None, False, 70, 40, due_days=1)
        mock2 = add_test("ҰБТ байқау сынағы №2 — Аралас пәндер",
                         "Математика + тарих аралас блок.", "UNT", "mock", None, False, 65, 45, due_days=8)
        await db.flush()
        await fill(mock1, MATH_Q, 5)
        await fill(mock2, HIST_Q, 3)

        # free preview test
        free_test = add_test("Тегін ҰБТ дайындық деңгейін тексеру",
                             "Тіркелместен тапсыруға болатын қысқа диагностика.", "UNT", "mock", None, True, 60, 15)
        await db.flush()
        await fill(free_test, MATH_Q, 3)

        # monthly + final assessments (require an active subscription)
        monthly = add_test("Қыркүйек айлық сынағы", "Ай бойы өтілген тақырыптар бойынша.",
                           "UNT", "monthly", None, False, 70, 30, due_days=5)
        await db.flush()
        await fill(monthly, MATH_Q, 5)
        final_t = add_test("Қорытынды емтихан (жыл соңы)", "Курстың толық бағдарламасы бойынша.",
                           "UNT", "final", None, False, 75, 60, due_days=25)
        await db.flush()
        await fill(final_t, MATH_Q + HIST_Q, 6)
        trial_t = add_test("Сынақ тест: ҰБТ форматы", "ҰТО интерфейсінде дайындалу.",
                           "UNT", "trial", None, False, 65, 40, due_days=3)
        await db.flush()
        await fill(trial_t, MATH_Q, 4)

        # ---------------- LIVE SESSIONS ----------------
        db.add_all([
            LiveSession(course_id=c_matlit.id, teacher_id=t_aset.id, title="Эфир: диаграммалық есептер маратоны",
                        starts_at=now() + timedelta(days=1, hours=3), platform="Zoom", url="https://zoom.us/j/000"),
            LiveSession(course_id=c_mathphys.id, teacher_id=t_gulnar.id, title="Физика: кинематика сұрақ-жауап",
                        starts_at=now() + timedelta(days=2, hours=5), platform="Zoom", url="https://zoom.us/j/001"),
            LiveSession(course_id=c_history.id, teacher_id=t_erzhan.id, title="Тарих: XX ғасыр хронология қайталау",
                        starts_at=now() + timedelta(days=3), platform="YouTube Live", url="https://youtube.com/live/x"),
        ])

        # ---------------- DEMO STUDENT STATE ----------------
        db.add(LeaderboardPoint(student_id=demo_student.id, total_points=850, weekly_points=320,
                                monthly_points=640, streak_days=12))
        db.add(Subscription(student_id=demo_student.id, plan_name="ҰБТ PRO · Куратормен",
                            start_date=now() - timedelta(days=8),
                            end_date=now() + timedelta(days=22), is_active=True))
        db.add_all([
            Enrollment(student_id=demo_student.id, course_id=c_matlit.id,
                       enrolled_at=now() - timedelta(days=20)),
            Enrollment(student_id=demo_student.id, course_id=c_history.id,
                       enrolled_at=now() - timedelta(days=12)),
        ])
        db.add_all([
            Payment(student_id=demo_student.id, amount=29900, status="completed",
                    payment_method="Kaspi Pay", item_type="package", item_id=packages[1].id,
                    item_title="ҰБТ PRO · Куратормен", created_at=now() - timedelta(days=8)),
            Payment(student_id=demo_student.id, amount=16900, status="completed",
                    payment_method="Kaspi 0-0-12", item_type="course", item_id=c_matlit.id,
                    item_title=c_matlit.title, created_at=now() - timedelta(days=20)),
            Payment(student_id=demo_student.id, amount=15900, status="completed",
                    payment_method="Банк картасы", item_type="course", item_id=c_history.id,
                    item_title=c_history.title, created_at=now() - timedelta(days=12)),
        ])

        # lesson progress: complete first 6 lessons of matlit course
        matlit_lessons = (await db.execute(
            _select_lessons_for_course(c_matlit.id)
        )).scalars().all()
        for i, les in enumerate(matlit_lessons):
            if i < 5:
                db.add(LessonProgress(student_id=demo_student.id, lesson_id=les.id,
                                      is_completed=True, last_watched_second=600))

        # test attempts for demo student — with per-question answers so
        # "Менің қателерім" has real data. `wrong_idx` = which questions were missed.
        await db.flush()

        async def make_attempt(test, wrong_qnums, days_ago):
            qs = (await db.execute(
                _sel(_Q).where(_Q.test_id == test.id).order_by(_Q.order_index)
            )).scalars().all()
            if not qs:
                return
            total_pts = sum(q.points for q in qs)
            earned = 0.0
            att = TestAttempt(
                student_id=demo_student.id, test_id=test.id, score=0, max_score=float(total_pts),
                percentage=0, passed=False,
                started_at=now() - timedelta(days=days_ago, minutes=30),
                completed_at=now() - timedelta(days=days_ago),
            )
            db.add(att)
            await db.flush()
            for i, q in enumerate(qs, start=1):
                opts = (await db.execute(
                    _sel(_AO).where(_AO.question_id == q.id)
                )).scalars().all()
                correct = [o for o in opts if o.is_correct]
                is_wrong = i in wrong_qnums
                if is_wrong:
                    picked = [o for o in opts if not o.is_correct][:1] or correct[:0]
                    sel_ids = [o.id for o in picked]
                    num = "0" if q.question_type == "numerical" else None
                    ok = False
                else:
                    sel_ids = [o.id for o in correct]
                    num = correct[0].option_text if (q.question_type == "numerical" and correct) else None
                    ok = True
                    earned += q.points
                db.add(TestAnswer(
                    attempt_id=att.id, question_id=q.id,
                    selected_option_ids=json.dumps(sel_ids),
                    numerical_answer=num, is_correct=ok, points_earned=float(q.points if ok else 0),
                ))
            att.score = earned
            att.percentage = round(earned / total_pts * 100, 1) if total_pts else 0.0
            att.passed = att.percentage >= test.passing_score

        await make_attempt(topic_tests[c_matlit.id], wrong_qnums={2}, days_ago=12)
        await make_attempt(topic_tests[c_matlit.id], wrong_qnums={2, 4}, days_ago=6)  # q2 repeated
        await make_attempt(mock1, wrong_qnums={3}, days_ago=4)
        await make_attempt(topic_tests[c_history.id], wrong_qnums={1, 3}, days_ago=8)

        # unlock some achievements
        ach_first = (await db.execute(_select_ach("FIRST_TEST"))).scalars().first()
        ach_streak = (await db.execute(_select_ach("STREAK_7"))).scalars().first()
        db.add_all([
            StudentAchievement(student_id=demo_student.id, achievement_id=ach_first.id),
            StudentAchievement(student_id=demo_student.id, achievement_id=ach_streak.id),
        ])

        db.add_all([
            Notification(user_id=demo_student.id, title="Куратордан хабарлама",
                         message="Аружан, 1.2 үй жұмысының дедлайны бүгін 21:00. Үлгересің бе?",
                         type="curator", is_read=False, created_at=now() - timedelta(hours=2)),
            Notification(user_id=demo_student.id, title="Жаңа эфир жоспарланды",
                         message="Ертең 19:00 — «диаграммалық есептер маратоны». Қатысуды ұмытпаңыз!",
                         type="info", is_read=False, created_at=now() - timedelta(hours=5)),
            Notification(user_id=demo_student.id, title="Жаңа сабақ ашылды",
                         message="«2.1 Боялған фигуралардың ауданын табу» сабағы қолжетімді.",
                         type="lesson", is_read=False, created_at=now() - timedelta(days=1)),
            Notification(user_id=demo_student.id, title="Тест нәтижесі: ҰБТ байқау сынағы №1",
                         message="Нәтижеңіз: 82%. Құттықтаймыз, өттіңіз! 🎉", type="test_result",
                         is_read=True, created_at=now() - timedelta(days=3)),
            Notification(user_id=demo_student.id, title="Жетістік ашылды 🔥",
                         message="«7 күндік лездеме» — қатарынан 7 күн оқыдың! +100 балл.",
                         type="achievement", is_read=True, created_at=now() - timedelta(days=4)),
            Notification(user_id=demo_student.id, title="Төлем сәтті өтті",
                         message="«ҰБТ PRO · Куратормен» — 29 900 ₸. Қолжетімділік ашылды.",
                         type="payment", is_read=True, created_at=now() - timedelta(days=8)),
        ])

        # ---------------- OTHER STUDENTS ----------------
        all_lessons = (await db.execute(_sel(_Lesson).order_by(_Lesson.order_index))).scalars().all()
        for i, s in enumerate(extra_students):
            db.add(LeaderboardPoint(student_id=s.id, total_points=random.randint(120, 780),
                                    weekly_points=random.randint(40, 300),
                                    monthly_points=random.randint(80, 600),
                                    streak_days=random.randint(1, 15)))
            enrolled_courses = random.sample(courses, k=random.randint(1, 2))
            for c in enrolled_courses:
                db.add(Enrollment(student_id=s.id, course_id=c.id))
                db.add(Payment(student_id=s.id, amount=float(c.discount_price or c.price),
                               status="completed", payment_method=random.choice(["Kaspi Pay", "Kaspi 0-0-12", "Банк картасы"]),
                               item_type="course", item_id=c.id, item_title=c.title,
                               created_at=now() - timedelta(days=random.randint(1, 60))))
            if i % 3 == 0:
                db.add(Subscription(student_id=s.id, plan_name="ҰБТ Стандарт",
                                    start_date=now() - timedelta(days=5),
                                    end_date=now() + timedelta(days=25), is_active=True))
            # some lesson progress (varied recency) so curator sees real activity
            cids = {c.id for c in enrolled_courses}
            mod_ids = {m.id for cid in cids for m in modules_by_course.get(cid, [])}
            course_lessons = [l for l in all_lessons if l.module_id in mod_ids]
            n_done = random.randint(0, min(6, len(course_lessons)))
            days_back = _login_offsets[i] / 24
            for l in course_lessons[:n_done]:
                db.add(LessonProgress(student_id=s.id, lesson_id=l.id, is_completed=True,
                                      last_watched_second=random.randint(200, 900),
                                      updated_at=now() - timedelta(days=days_back + random.uniform(0, 3))))
            # a couple of test attempts for some
            if i % 2 == 0:
                tt = topic_tests[enrolled_courses[0].id]
                db.add(TestAttempt(student_id=s.id, test_id=tt.id, score=random.randint(6, 18),
                                   max_score=20, percentage=float(random.randint(45, 92)),
                                   passed=random.random() > 0.4,
                                   started_at=now() - timedelta(days=days_back + 1),
                                   completed_at=now() - timedelta(days=days_back)))

        # ---------------- LEADS + TRIALS ----------------
        db.add_all([
            Lead(name="Айдана Қуаныш", phone="+7 777 100 20 30", email="aidana.q@gmail.com",
                 grade="11", city="Алматы", source="Instagram", interest="ҰБТ PRO",
                 stage="new", assigned_manager_id=manager.id,
                 note=" Химия-биология бағыты, медицинаға түскісі келеді."),
            Lead(name="Ерлан Сапар", phone="+7 700 111 22 33", email="erlan.s@mail.ru",
                 grade="6", city="Шымкент", source="Сайт", interest="NIS Математика",
                 stage="new", assigned_manager_id=manager.id),
            Lead(name="Молдир Асан", phone="+7 705 222 33 44", grade="10", city="Астана",
                 source="Достар ұсынысы", interest="РФМШ Физика", stage="contact",
                 assigned_manager_id=manager.id, note="Әкесі қоңырауды кешке күтеді."),
            Lead(name="Санжар Тлеу", phone="+7 747 333 44 55", email="sanzhar@gmail.com",
                 grade="11", city="Алматы", source="Instagram", interest="ҰБТ VIP",
                 stage="contact", assigned_manager_id=manager.id),
            Lead(name="Аружан Бек", phone="+7 778 444 55 66", grade="11", city="Қарағанды",
                 source="Сайт", interest="Химия + Биология", stage="trial",
                 assigned_manager_id=manager.id, note="Сынақ сабаққа жазылды, 02.09."),
            Lead(name="Дамир Ким", phone="+7 776 555 66 77", email="damir.kim@gmail.com",
                 grade="6", city="Алматы", source="TikTok", interest="NIS Математика",
                 stage="won", assigned_manager_id=manager.id),
        ])
        db.add_all([
            TrialLesson(student_name="Айдана Қуаныш", phone="+7 777 100 20 30", subject="ҰБТ Математика",
                        teacher_id=t_aset.id, scheduled_at=now() + timedelta(hours=6), status="planned", confirmed=True),
            TrialLesson(student_name="Ерлан Сапар", phone="+7 700 111 22 33", subject="NIS Математика",
                        teacher_id=t_azamat.id, scheduled_at=now() + timedelta(days=1), status="planned"),
            TrialLesson(student_name="Дамир Ким", phone="+7 776 555 66 77", subject="NIS Математика",
                        teacher_id=t_azamat.id, scheduled_at=now() - timedelta(days=3), status="done", result="enrolled"),
        ])

        await db.commit()
        print("✅ Zerdeli database seeded.")


# --- tiny query helpers (kept below to keep seed body readable) ---
from sqlalchemy import select as _sel  # noqa: E402
from app.models.models import (  # noqa: E402
    Lesson as _Lesson, CourseModule as _CM, Achievement as _Ach,
    Question as _Q, AnswerOption as _AO,
)


def _select_lessons_for_course(course_id: str):
    return (
        _sel(_Lesson)
        .join(_CM, _Lesson.module_id == _CM.id)
        .where(_CM.course_id == course_id)
        .order_by(_CM.order_index, _Lesson.order_index)
    )


def _select_ach(code: str):
    return _sel(_Ach).where(_Ach.code == code)


if __name__ == "__main__":
    asyncio.run(seed_database())
