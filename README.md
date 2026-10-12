# ZERDELI — Premium Kazakhstan EdTech Platform 🚀

**"Болашағыңды бүгіннен баста."**

ZERDELI is a state-of-the-art EdTech platform designed for Kazakh students preparing for:
* **NIS** (Назарбаев Зияткерлік мектептері)
* **BIL** (Білім-инновация лицейлері)
* **RFMSH** (Республикалық физика-математика мектебі)
* **UNT / ҰБТ** (Unified National Testing)

---

## 🛠 Tech Stack

### Frontend
- **Next.js 15+** (App Router)
- **TypeScript**
- **Tailwind CSS** (Custom glassmorphism design system & indigo/violet palette)
- **Framer Motion** (Smooth transitions, glowing cards & counter micro-interactions)
- **Recharts** (Subject mastery radar chart & weekly activity bar charts)
- **Lucide Icons**

### Backend
- **Python 3.12**
- **FastAPI** (Async REST API framework)
- **SQLAlchemy 2.0 Async** + **Asyncpg** / **Aiosqlite**
- **PostgreSQL** + **Redis**
- **Pydantic v2** & **PyJWT** & **Passlib/Argon2**

### Infrastructure
- **Docker** & **Docker Compose**
- **Nginx** Reverse Proxy

---

## 🔐 Default Demo Accounts

You can test the Role-Based Access Control (RBAC) instantly using the preset credentials:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **STUDENT** | `student@zerdeli.kz` | `password123` | Course player, practice test engine, progress analytics, leaderboard |
| **TEACHER** | `teacher@zerdeli.kz` | `password123` | Course creator, module builder, student statistics monitoring |
| **ADMIN** | `admin@zerdeli.kz` | `adminpass123` | User & role management, platform metrics, revenue stats |

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate

pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload --port 8000
```
API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Web App: [http://localhost:3000](http://localhost:3000)

---

## 🐳 Docker Deployment

To launch the complete production environment (PostgreSQL, Redis, FastAPI Backend, Next.js Frontend, Nginx Proxy):

```bash
docker-compose up --build -d
```

Access the application at [http://localhost](http://localhost).

---

## 📄 License
© 2026 Zerdeli. Барлық құқықтар қорғалған.
