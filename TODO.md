# Zerdeli — Project Completion Checklist

> Generated from full repo analysis (2026-09-05).  
> Mark items `[x]` as completed. Work in execution-order sections; verify build after each feature.

**Legend:** ✅ Done in MVP · 🟡 Partial · ❌ Missing

---

## Snapshot (current state)

| Layer | Reality |
|-------|---------|
| Frontend | Marketing landing + demo dashboards; **no live API calls**; mock/localStorage auth |
| Backend | 19 API endpoints; JWT access+refresh issued; **no `/refresh`**, no Alembic, no tests |
| Design | Light tokens started (`juz.dark` → `#F8FAFC`); dashboards still dark (`surface-950`) |
| Infra | Docker Compose (postgres, redis, backend, frontend, nginx); Redis unused in app code |

---

## Step 1 — Analysis & tracking

- [x] Inventory frontend routes, components, lib, design tokens
- [x] Inventory backend models, APIs, services, gaps
- [x] Create this `TODO.md` checklist

---

## Step 2 — Design system (light theme)

### 2.1 Tokens & config
- [ ] Complete light palette in `tailwind.config.js` (bg gradient `#FFF → #F8FAFC → #F1F5F9`)
- [ ] Remap / deprecate dark `surface-800–950` usage (or keep only for optional dark mode)
- [ ] Fix `juz-card` backgroundImage (still dark gradient)
- [ ] Add 8pt spacing + type scale in Tailwind
- [ ] Load `Inter` + `Manrope`/`Sora` via `next/font` (remove raw `@import` in CSS)
- [ ] Update `globals.css`: light glass-card, focus-visible, scrollbar, CSS variables

### 2.2 UI primitives (`components/ui/`)
- [ ] Button (primary / secondary / ghost) + CVA + `tailwind-merge`
- [ ] Input, Textarea, Label
- [ ] Card (white, border-slate-200/60, soft shadow, hover lift)
- [ ] Badge, Modal, Skeleton, EmptyState, ErrorState
- [ ] Toast provider (`sonner`)

### 2.3 Migrate existing components to light theme
- [ ] `Navbar`, `Hero`, `Directions`, `WhyZerdeli`, `Footer`
- [ ] `GrantCalculator`, `CourseCatalog`, `TariffPlans`, `ConsultationModal`
- [ ] `TestEngineComponent`, `LeaderboardComponent`, `AnalyticsCharts`
- [ ] Auth pages (`login`, `register`) — remove indigo leftovers
- [ ] Student / teacher / admin dashboards — replace `bg-surface-950` / `text-white`
- [ ] Landing `page.tsx` — fix light-bg + light-text contrast bug (`bg-juz-dark text-slate-100`)

### 2.4 Motion & a11y
- [ ] Scroll-reveal + staggered grids (Framer Motion)
- [ ] `whileHover` / `whileTap` on interactive controls
- [ ] Focus-visible + form labels / aria on all forms
- [ ] Empty / loading / error states on data screens

---

## Step 3 — Backend foundation

### 3.1 Alembic
- [ ] `alembic init` + env wired to async SQLAlchemy
- [ ] Initial migration for all models in `models.py`
- [ ] Stop relying solely on `create_all` in production path

### 3.2 Auth (extend existing)
- [ ] `POST /auth/refresh` — rotate/use refresh token; httpOnly cookie option
- [ ] Email verification (6-digit code or magic link) + `email_verified` on User
- [ ] Forgot / reset password endpoints
- [ ] Google OAuth (config + callback)
- [ ] Rate limiting on login/register
- [ ] Centralized exceptions (`app/core/exceptions.py`) + unified error JSON

### 3.3 Missing / incomplete domain APIs
- [ ] Reviews CRUD (`Review` model exists, no API)
- [ ] Notifications: mark-read, unread count
- [ ] Payments / checkout + webhook (Kaspi / Freedom Pay / CloudPayments) + idempotency
- [ ] Promo codes / discounts
- [ ] Subscriptions: list/status/cancel
- [ ] Wishlist (model + endpoints)
- [ ] File upload (avatars, materials) — multipart → local/S3
- [ ] Certificate generation (PDF) on course completion
- [ ] Course search: filters (level, price, rating) + Postgres `tsvector` or equivalent
- [ ] Teacher: full module/lesson/material CRUD (beyond create course)
- [ ] Teacher: student progress list for their courses
- [ ] Teacher: test builder APIs (create/update questions)
- [ ] Admin: ban user, course publish/unpublish, review moderation
- [ ] Admin: audit log model + write on privileged actions
- [ ] Profile update (phone, direction, avatar, password change, delete request)

### 3.4 Infra hooks in backend
- [ ] Use Redis (cache catalog/leaderboard; rate limit store)
- [ ] Background tasks (email, certificates) — Celery or `BackgroundTasks`
- [ ] Config: S3, OAuth, payment, SMTP, Celery vars in `config.py`
- [ ] pytest + httpx: happy + error path per critical endpoint

---

## Step 4 — Frontend architecture & pages

### 4.1 App structure
- [ ] Route groups: `(marketing)`, `(auth)`, `(dashboard)/student|teacher|admin`
- [ ] Per-role `layout.tsx` + shared Sidebar
- [ ] `middleware.ts` — JWT/cookie + role guards
- [ ] Prefer Server Components on marketing; keep `'use client'` only where needed
- [ ] Wire TanStack Query (`QueryClientProvider`)
- [ ] Expand `lib/api.ts` with real endpoint helpers + refresh interceptor
- [ ] Real auth in `lib/auth.tsx` (remove demo auto-login / fake tokens)
- [ ] Add `zustand` for UI state; `react-hook-form` + `zod` for forms
- [ ] Optional: `types/` from OpenAPI (`openapi-typescript`)

### 4.2 New / completed pages
- [ ] `/courses` — live catalog (replace mock) + filters/search
- [ ] `/courses/[id]` — detail, syllabus, instructor, reviews, enroll CTA
- [ ] Lesson player — HLS/YouTube + progress → `LessonProgress` API
- [ ] Materials download UI (`LessonMaterial`)
- [ ] Course/module/lesson progress bars
- [ ] `/checkout` — plan → pay → receipt → enroll
- [ ] `/profile` — avatar, phone, direction, password, delete request
- [ ] Notification center + unread badge
- [ ] Payment history / invoices
- [ ] Wishlist UI
- [ ] Certificate download page/flow
- [ ] Test results page (correct/incorrect + topic breakdown → charts)
- [ ] Full exam simulation mode (UNT/NIS timing)
- [ ] Teacher: course/module/lesson CRUD UI
- [ ] Teacher: test builder (DnD)
- [ ] Teacher: students + progress
- [ ] Admin: users (role, ban), metrics, moderation, audit log

### 4.3 Wire existing demo components to API
- [ ] `CourseCatalog` → `GET /courses`
- [ ] `TestEngineComponent` → `GET/POST /tests/...`
- [ ] `LeaderboardComponent` → `GET /students/leaderboard`
- [ ] `AnalyticsCharts` → `GET /students/me/analytics`
- [ ] Achievements / streak calendar → real data
- [ ] `TariffPlans` → checkout flow

---

## Step 5 — Gamification & realtime

- [ ] Weekly / monthly / all-time leaderboard UI (API exists)
- [ ] Streak calendar (Duolingo-style)
- [ ] Badge gallery (API exists)
- [ ] Notification delivery: polling or WebSocket
- [ ] Email/push for lesson, results, streak reminders (backend jobs)

---

## Step 6 — SEO, a11y, performance

- [ ] Blog / articles (`next-mdx-remote` or CMS)
- [ ] `metadata` API per route; OG images; `schema.org/Course`
- [ ] `sitemap.xml`, `robots.txt`
- [ ] GA4 / Yandex Metrica
- [ ] Cookie consent banner (KZ personal data law)
- [ ] Lighthouse ≥ 90 (perf, a11y, best practices, SEO)
- [ ] Marketing pages as Server Components where possible

---

## Step 7 — Quality, CI, monitoring

- [ ] Backend `tests/` (pytest-asyncio + httpx)
- [ ] Frontend Vitest unit + Playwright E2E (register, enroll, take test)
- [ ] `.github/workflows/ci.yml` — lint, test, build
- [ ] Sentry FE + BE
- [ ] Rate limit + CSRF + input sanitization review
- [ ] `docker-compose`: Celery worker + Flower + MinIO (optional)
- [ ] `docker-compose.prod.yml` (SSL, gzip, static cache)

---

## Step 8 — Docs & polish

- [ ] Update `README.md` (stack versions, env vars, scripts, deploy)
- [ ] Sync `.env.example` with all new settings
- [ ] Brand consistency (JUZ40 vs Zerdeli naming in UI)

---

## Priority backlog (suggested next slices)

After Step 1 confirmation, execute in this order:

1. **Design tokens + UI kit + light-theme migration** (Step 2)
2. **Alembic + auth refresh/reset + wire frontend auth to real API**
3. **Course detail + catalog live data + lesson progress**
4. **Test engine + results page wired to backend**
5. **Payments checkout (stub provider → real Kaspi later)**
6. **Teacher/admin CRUD UIs**
7. **SEO / CI / tests / README**

---

## File/route gap matrix (quick reference)

### Frontend routes

| Route | Status |
|-------|--------|
| `/` landing | 🟡 Present, needs light-theme fix + SC optimization |
| `/login`, `/register` | 🟡 Demo only |
| `/student`, `/player`, `/analytics` | 🟡 Mock UI |
| `/teacher`, `/admin` | 🟡 Stub UI |
| `/courses`, `/courses/[id]` | ❌ |
| `/checkout`, `/profile` | ❌ |
| `/forgot-password`, `/reset-password` | ❌ |
| `/verify-email` | ❌ |
| Blog | ❌ |
| `middleware.ts` | ❌ |

### Backend endpoints (gaps vs models)

| Domain | Models | API |
|--------|--------|-----|
| Auth register/login/me | ✅ | 🟡 (no refresh/verify/reset/OAuth) |
| Courses list/detail/enroll/progress | ✅ | 🟡 (weak filters; no wishlist) |
| Tests list/get/submit | ✅ | 🟡 (no builder CRUD, no autosave) |
| Analytics / leaderboard / achievements | ✅ | 🟡 (some hardcoded analytics) |
| Notifications | ✅ | 🟡 (list only) |
| Reviews | ✅ | ❌ |
| Payments / subscriptions | ✅ | ❌ |
| Certificates | ❌ | ❌ |
| Uploads | URL fields only | ❌ |
| Admin audit | ❌ | ❌ |

---

*Confirm Step 1, then proceed to Step 2 (design system).*
