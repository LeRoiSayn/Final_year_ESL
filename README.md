# ESL — École de Santé de Libreville
### University Management System

![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-10-FF2D20?style=flat-square&logo=laravel&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.1-646CFF?style=flat-square&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

A full-stack university management platform built for **ESL — École de Santé de Libreville**. It covers the entire academic lifecycle: student enrollment, grade management, scheduling, payments, and an integrated e-learning platform — all accessible through role-specific dashboards with bilingual support (French / English) and dark mode.

---

## Table of Contents

1. [Features Overview](#features-overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Installation](#installation)
5. [Login Credentials](#login-credentials)
6. [Role-Based Modules](#role-based-modules)
7. [Authentication & Security](#authentication--security)
8. [E-Learning Platform](#e-learning-platform)
9. [Finance & Payments](#finance--payments)
10. [Database Schema](#database-schema)
11. [API Reference](#api-reference)
12. [Internationalization](#internationalization)
13. [Project Structure](#project-structure)
14. [Useful Commands](#useful-commands)

---

## Features Overview

| Category | Highlights |
|----------|-----------|
| **Authentication** | Token-based (Sanctum), OTP 2FA via email, password reset with OTP |
| **Academic** | LMD cycle (L1→M2→D3), semester tracking, tronc commun / spécialisation courses, enrollment, grades (CA + exam), attendance |
| **Student Lifecycle** | Auto-enrollment, semester advancement, academic promotion (L3 → M), retake course tracking, transfer grades from other institutions |
| **E-Learning** | Online sessions, document upload (PDF/DOC/PPT), interactive quizzes with timer, assignment submission & grading |
| **Finance** | Fee types with level filters, installment plans, payment recording, student fee dashboard |
| **Roles** | 5 roles: Admin, Registrar, Finance, Teacher, Student — each with dedicated dashboard and permissions |
| **UI/UX** | Dark mode, French/English i18n, animated transitions (Framer Motion), responsive design |
| **Charts** | Interactive dashboards with Chart.js (revenue, enrollments, grade distributions) |
| **Chatbot** | AI assistant "Simon" accessible from all dashboards |
| **Notifications** | In-app notification system for all roles |

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React.js | 18.2 | UI library |
| React Router DOM | 6.22 | Client-side routing |
| Vite | 5.1 | Build tool & dev server |
| Tailwind CSS | 3.4 | Utility-first CSS |
| Framer Motion | 11 | Animations |
| Axios | 1.6 | HTTP client |
| Chart.js + react-chartjs-2 | 4.4 / 5.2 | Charts & analytics |
| @headlessui/react | 1.7 | Accessible UI primitives |
| @heroicons/react | 2.1 | SVG icon set |
| react-hot-toast | 2.4 | Toast notifications |
| date-fns | 3.3 | Date formatting |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| PHP | 8.1+ | Server language |
| Laravel Framework | 10 | MVC framework & REST API |
| Laravel Sanctum | 3.2 | API token authentication |
| Eloquent ORM | — | Database abstraction |
| Guzzle HTTP | 7.2 | External HTTP requests |
| PHPUnit | 10.1 | Unit testing |

### Database & Infrastructure

| Technology | Purpose |
|-----------|---------|
| MySQL 8.0 / MariaDB 10.3+ | Relational database (30+ tables) |
| Laravel Migrations | Schema versioning |
| Laravel Storage + Symlinks | File storage for e-learning content |
| SMTP (Gmail / MailHog) | Transactional email (OTP codes) |

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  ESL Application                     │
├──────────────────┬─────────────────┬────────────────┤
│   FRONTEND       │    BACKEND      │   DATABASE     │
│   React + Vite   │    Laravel 10   │   MySQL        │
│   Port 5173      │    Port 8000    │   Port 3306    │
│                  │                 │                │
│  Axios + Proxy ──►  Sanctum Auth  ──►  Eloquent ORM │
│  React Router    │  Role Middleware│  30+ Tables    │
│  i18n (FR/EN)    │  REST API       │  Migrations    │
│  Tailwind CSS    │  Mail (OTP)     │  Seeders       │
└──────────────────┴─────────────────┴────────────────┘
```

### Request Flow

```
User Action (click / form submit)
  ↓
React Component (JSX)
  ↓
Axios (adds Authorization: Bearer {token})
  ↓
Vite Proxy (localhost:5173 → localhost:8000)
  ↓
Laravel Router (routes/api.php)
  ↓
Sanctum Middleware (validates token)
  ↓
Role Middleware (checks user role)
  ↓
Controller (business logic)
  ↓
Eloquent Model (SQL query)
  ↓
JSON Response → React State → DOM Update
```

---

## Installation

### Prerequisites

- PHP 8.1+
- Composer
- Node.js 18+ and NPM
- MySQL 8.0+ or MariaDB 10.3+

### 1. Clone the repository

```bash
git clone <repository-url>
cd ESL2
```

### 2. Backend Setup

```bash
cd backend

# Install PHP dependencies
composer install

# Create environment file
cp .env.example .env   # or manually create .env from the template below

# Generate application key
php artisan key:generate
```

**Configure `.env`:**

```env
APP_NAME="ESL University"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=esl_university
DB_USERNAME=root
DB_PASSWORD=

# Email (OTP codes) — use Gmail App Password in production
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="ESL University"

# For local development without email, use MailHog:
# MAIL_MAILER=smtp
# MAIL_HOST=127.0.0.1
# MAIL_PORT=1025
```

```bash
# Create the database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS esl_university;"

# Run migrations and seed initial data
php artisan migrate:fresh --seed

# Create the symbolic link for file storage
php artisan storage:link

# Start the API server
php artisan serve
# → http://localhost:8000
```

### 3. Frontend Setup

```bash
# In a new terminal
cd frontend

# Install JS dependencies
npm install

# Start the development server
npm run dev
# → http://localhost:5173
```

### 4. Verify Installation

Open **http://localhost:5173** and log in with `admin` / `admin123`. Both servers must be running simultaneously.

---

## Login Credentials

### Administrative Accounts

| Role | Username | Password | Email |
|------|----------|----------|-------|
| Admin | `admin` | `admin123` | admin@esl.local |
| Finance | `finance1` | `password123` | finance1@esl.local |
| Registrar | `registrar1` | `password123` | registrar1@esl.local |

### Teacher Accounts

| Username | Password | Department |
|----------|----------|------------|
| `teacher_1` to `teacher_15` | `password` | Biology / Immunology |

### Student Accounts

| Username | Password | Department |
|----------|----------|------------|
| `student_1` to `student_40` | `password` | Biology / Immunology |

> **Note:** When OTP 2FA is enabled, users with a valid email address will receive a 6-digit code after entering their credentials. For demo accounts using local email addresses (`@esl.local`), OTP sending may fail — configure real SMTP credentials to fully test the 2FA flow.

---

## Role-Based Modules

### Admin

| Module | Description |
|--------|-------------|
| Dashboard | Global KPIs: students, teachers, courses, revenue, enrollment charts |
| Faculties | Create, edit, delete faculties |
| Departments | Manage departments per faculty |
| Courses | Create courses with code, name, level (L1–D3), semester, type (tronc commun / spécialisation), credits, weekly hours |
| Classes | Create class groups, assign teachers and rooms |
| Student Management | Full student profiles, course assignments, semester advancement, academic promotion, transfer grades |
| Teacher Management | Full teacher profiles, course assignments |
| Auto-Enrollment | Bulk enroll students into all courses matching their level and department |
| Reports | Academic and financial statistics |
| Activity Log | Full audit trail of all system actions |
| Settings | Theme, language, notifications, dashboard widgets |

### Registrar

| Module | Description |
|--------|-------------|
| Dashboard | Enrollment statistics |
| Students | Create, edit, view student profiles |
| Teachers | Create, edit, view teacher profiles |
| Users | Manage user accounts and status |
| Settings | Interface preferences |

### Finance

| Module | Description |
|--------|-------------|
| Dashboard | Revenue, daily payments, financial charts |
| Fee Types | Create fee categories (tuition, lab, library, etc.) with level and category filters |
| Student Fees | Assign fees to students, configure installment plans |
| Payments | Record cash/bank payments, edit records, view full history |
| Settings | Interface preferences |

### Teacher

| Module | Description |
|--------|-------------|
| Dashboard | Assigned classes, student count |
| My Classes | View enrolled students per class |
| E-Learning | Create online sessions, upload documents, create quizzes, manage assignments |
| Grades | Enter continuous assessment (CA) and exam scores; validate |
| Attendance | Mark students present / absent / late per session |
| Schedule | View personal timetable |
| Settings | Theme, language, notifications |

### Student

| Module | Description |
|--------|-------------|
| Dashboard | Enrolled courses, recent grades, attendance summary |
| E-Learning | Join live sessions, download documents, take quizzes, submit assignments |
| Grades | View grades per course (CA, exam, final, pass/fail) |
| Attendance | View attendance history per course |
| Schedule | Personal course timetable |
| Fees | View assigned fees, balance, installment plan (read-only) |
| Payment | Pay fees online (card / PayPal) |
| Settings | Theme, language, notifications |

---

## Authentication & Security

### Login Flow (with OTP 2FA)

```
1. User submits username + password on /login
2. Backend validates credentials (username OR email)
3. If valid → generates 6-digit OTP → sends to user email
4. Backend responds: { status: "otp_required", email: "a***@gmail.com" }
5. Frontend shows OTP entry form (step 2)
6. User enters the code → POST /api/verify-login-otp
7. Backend verifies: not expired (10 min), not already used
8. If valid → marks OTP as used → returns Sanctum token + user info
9. Frontend stores token in localStorage
10. All subsequent requests include: Authorization: Bearer {token}
11. Redirect to /{role} dashboard
```

### Password Reset Flow

```
1. User clicks "Forgot password?" on Login page
2. Enters email → POST /api/forgot-password
3. Backend generates OTP → sends to email
4. User enters OTP code → step 3
5. User enters new password + confirmation → POST /api/reset-password
6. Backend verifies OTP, updates password (bcrypt hashed)
7. User can log in with new credentials
```

### OTP Security Rules

- **Expiry**: 10 minutes from creation
- **Single use**: Marked as `used_at` after first successful verification
- **Invalidation**: Old OTPs of the same type are invalidated when a new one is requested
- **Resend**: Available via `POST /api/resend-otp`

### Route Protection

```php
// Public — no token required
Route::post('/login', ...);
Route::post('/verify-login-otp', ...);
Route::post('/forgot-password', ...);
Route::post('/reset-password', ...);

// Authenticated — token required (all roles)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', ...);
    Route::put('/profile', ...);
});

// Role-restricted — token + specific role required
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::resource('faculties', FacultyController::class);
});
```

### Password Security

- All passwords hashed with **bcrypt** (`Hash::make()`)
- Passwords never stored or returned in plaintext
- `Hash::check()` used for verification

---

## E-Learning Platform

### Modules

#### Online Courses (Live Sessions)

- Teachers create sessions with title, URL (Zoom/Meet link), scheduled date/time, duration
- Students join directly from their dashboard
- Attendance tracked automatically on join
- **Tables**: `online_courses`, `online_course_attendance`

#### Course Materials (Documents)

- Teachers upload PDF, DOC, DOCX, PPT, PPTX (max 10 MB per file)
- Files stored in `storage/app/public/materials/{course_id}/`
- Students download from their enrolled course page
- **Table**: `course_materials`

#### Interactive Quizzes

- Teachers create quizzes with: title, duration (minutes), max attempts, passing score, deadline
- Questions: multiple-choice with 4 options, points per question, correct answer
- Students take quizzes with a countdown timer; answers saved in localStorage as backup
- **Automatic grading**: backend compares answers and calculates the score instantly
- **Tables**: `quizzes`, `quiz_questions`, `quiz_attempts`

#### Assignments

- Teachers create assignments with instructions, due date, and total points
- Students upload their work (PDF, DOC) before the deadline
- Teachers download submissions, grade them, and add feedback
- **Tables**: `assignments`, `assignment_submissions`

### Access Control

- Teachers see only courses they are assigned to teach
- Students see only courses they are enrolled in
- All content access is verified against enrollment records before serving files

---

## Finance & Payments

### Fee Management (Finance role)

1. **Create Fee Types**: name, amount, category (tuition, lab, library…), academic level
2. **Assign Fees to Students**: link a fee type to a student; optionally configure an installment plan (monthly or quarterly, number of installments)
3. **Record Payments**: cash or bank transfer payments recorded manually by finance staff
4. **Track Balances**: each student fee shows total amount, amount paid, and remaining balance

### Student Payment (Student role)

- Students view their fee summary (total, paid, balance) and installment schedule
- Online payment via **credit card** (Visa/MasterCard) or **PayPal**
- Transactions stored in the `transactions` table with status tracking
- Payment history available with receipts

> If no external payment provider is configured, payments are **auto-confirmed** for demonstration purposes.

---

## Database Schema

### 30+ Tables organized by domain:

#### Users & Authentication
| Table | Description |
|-------|-------------|
| `users` | All users (admin, registrar, finance, teacher, student) with role, status |
| `personal_access_tokens` | Sanctum API tokens |
| `user_settings` | Per-user preferences (language, theme, widgets) |
| `otp_codes` | OTP codes for 2FA login and password reset |

#### Academic Structure
| Table | Description |
|-------|-------------|
| `faculties` | Top-level faculties |
| `departments` | Departments under faculties |
| `courses` | Courses with level (L1–D3), semester, type, credits, hours/week |
| `classes` | Class groups (course + teacher + room + academic year) |

#### People
| Table | Description |
|-------|-------------|
| `students` | Student profiles (linked to `users` and `departments`) |
| `teachers` | Teacher profiles (linked to `users` and `departments`) |

#### Academic Tracking
| Table | Description |
|-------|-------------|
| `enrollments` | Student–class registrations (status: active, completed, transfer, retake) |
| `grades` | CA score, exam score, final score, validated flag |
| `attendance` | Per-session attendance records (present / absent / late / excused) |
| `grade_modifications` | Audit log of grade changes |
| `course_equivalences` | Transfer grades from other institutions |

#### Finance
| Table | Description |
|-------|-------------|
| `fee_types` | Fee categories with amount, level, category |
| `student_fees` | Fees assigned to students with installment plan config |
| `payments` | Finance-recorded payments |
| `transactions` | Student online payment transactions |

#### E-Learning
| Table | Description |
|-------|-------------|
| `online_courses` | Live/recorded session metadata |
| `online_course_attendance` | Attendance for online sessions |
| `course_materials` | Uploaded documents |
| `quizzes` | Quiz definitions |
| `quiz_questions` | Questions with options and correct answers |
| `quiz_attempts` | Student attempts with scores |
| `assignments` | Assignment definitions |
| `assignment_submissions` | Student file submissions with grades |

#### System
| Table | Description |
|-------|-------------|
| `schedules` | Weekly timetable entries |
| `announcements` | System-wide or role-specific announcements |
| `activity_logs` | Full audit trail (who, what, when) |
| `notifications` | In-app notification records |
| `chatbot_conversations` | AI assistant conversation history |

### Key Relations

```
users ──► students ──► enrollments ──► classes ──► courses
                   ├──► grades (per enrollment)
                   ├──► attendance (per enrollment)
                   ├──► student_fees ──► fee_types
                   └──► transactions

users ──► teachers ──► classes
                   ├──► online_courses
                   ├──► quizzes
                   └──► assignments
```

---

## API Reference

### Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Authenticate with username + password |
| POST | `/api/verify-login-otp` | Verify OTP and receive token |
| POST | `/api/resend-otp` | Resend OTP code |
| POST | `/api/forgot-password` | Request password reset OTP |
| POST | `/api/reset-password` | Reset password with OTP |
| GET | `/api/settings/public` | Public app settings |

### Auth (all authenticated users)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/logout` | Invalidate token |
| GET | `/api/me` | Current user info |
| PUT | `/api/profile` | Update profile & photo |
| PUT | `/api/change-password` | Change password |

### Dashboards

| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/api/dashboard/admin` | Admin |
| GET | `/api/dashboard/student` | Student |
| GET | `/api/dashboard/teacher` | Teacher |
| GET | `/api/dashboard/finance` | Finance |
| GET | `/api/dashboard/registrar` | Registrar |

### Academic Resources

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/faculties` | List / create faculties |
| GET/POST | `/api/departments` | List / create departments |
| GET/POST | `/api/courses` | List / create courses |
| GET/POST | `/api/classes` | List / create classes |
| GET/POST | `/api/students` | List / create students |
| GET/POST | `/api/teachers` | List / create teachers |
| GET/POST | `/api/enrollments` | List / create enrollments |
| GET/POST | `/api/grades` | List / record grades |
| GET/POST | `/api/attendance` | List / record attendance |
| GET/POST | `/api/schedules` | List / create schedule entries |

### E-Learning

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/elearning/courses/teacher` | Teacher's online courses |
| GET | `/api/elearning/courses/student` | Student's online courses |
| POST | `/api/elearning/courses` | Create online session |
| POST | `/api/elearning/courses/{id}/join` | Student joins a session |
| POST | `/api/elearning/materials` | Upload document |
| GET | `/api/elearning/materials/course/{id}` | List documents for a course |
| GET | `/api/elearning/materials/{id}/download` | Download a document |
| POST | `/api/elearning/quizzes` | Create quiz |
| GET | `/api/elearning/quizzes/course/{id}` | List quizzes for a course |
| POST | `/api/elearning/quizzes/{id}/start` | Start quiz attempt |
| POST | `/api/elearning/quizzes/attempt/{id}/submit` | Submit quiz answers |
| POST | `/api/elearning/assignments` | Create assignment |
| GET | `/api/elearning/assignments/course/{id}` | List assignments for a course |
| POST | `/api/elearning/assignments/{id}/submit` | Submit assignment file |
| GET | `/api/elearning/assignments/{id}/submissions` | View all submissions (teacher) |
| POST | `/api/elearning/assignments/submission/{id}/grade` | Grade a submission |

### Finance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/fee-types` | List / create fee types |
| GET/POST | `/api/student-fees` | List / assign fees to students |
| GET/POST | `/api/payments` | List / record payments |
| GET | `/api/payment/summary` | Student fee summary |
| GET | `/api/payment/history` | Student payment history |
| POST | `/api/payment/initialize` | Initiate online payment |

---

## Internationalization

The app supports **French** (default) and **English** with instant switching — no page reload required.

### How it works

- Translation files: `frontend/src/locales/fr.json` and `en.json`
- `I18nProvider` (React Context) loads the active language on startup
- All components use the `useI18n()` hook: `const { t } = useI18n()`
- Every user-visible string is rendered as `t('key')` — no hardcoded text
- Language preference is saved to `localStorage` and synced with the server (`user_settings`)

### Where to switch language

- **Login page**: FR / EN toggle button (top-right)
- **Settings page**: Language section with flag icons

---

## Project Structure

```
ESL2/
├── backend/                          # Laravel REST API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/      # All API controllers
│   │   │   │   ├── AuthController.php          # Login, OTP, logout, profile
│   │   │   │   ├── StudentController.php       # Student CRUD + promotion
│   │   │   │   ├── TeacherController.php       # Teacher CRUD
│   │   │   │   ├── CourseController.php        # Course CRUD
│   │   │   │   ├── ClassController.php         # Class management
│   │   │   │   ├── GradeController.php         # Grade entry & validation
│   │   │   │   ├── AttendanceController.php    # Attendance tracking
│   │   │   │   ├── ELearningController.php     # Full e-learning module
│   │   │   │   ├── PaymentController.php       # Student online payments
│   │   │   │   ├── DashboardController.php     # Role-specific dashboards
│   │   │   │   ├── RegistrarController.php     # Registrar operations
│   │   │   │   ├── AdminController.php         # Admin operations
│   │   │   │   └── NotificationController.php
│   │   │   └── Middleware/
│   │   │       └── RoleMiddleware.php          # Role-based route guard
│   │   ├── Mail/
│   │   │   └── OtpMail.php                     # OTP email template
│   │   └── Models/                             # Eloquent models
│   │       ├── User.php, Student.php, Teacher.php
│   │       ├── Course.php, Class.php, Enrollment.php
│   │       ├── Grade.php, Attendance.php
│   │       ├── FeeType.php, StudentFee.php, Payment.php
│   │       ├── OtpCode.php                     # OTP model
│   │       └── ...
│   ├── database/
│   │   ├── migrations/               # 50+ versioned migrations
│   │   └── seeders/
│   │       └── DatabaseSeeder.php    # Initial data (users, students, courses…)
│   ├── routes/
│   │   └── api.php                   # All API route definitions
│   ├── storage/app/public/
│   │   ├── materials/                # E-learning documents
│   │   ├── assignments/              # Assignment submissions
│   │   └── profile-images/          # User avatars
│   └── .env                          # Environment configuration
│
└── frontend/                         # React + Vite SPA
    ├── public/
    │   └── esl-logo.png              # App favicon & logo
    └── src/
        ├── components/               # Reusable UI components
        │   ├── DataTable.jsx         # Sortable, searchable table
        │   ├── Modal.jsx             # Dialog component
        │   └── Chatbot.jsx           # AI assistant "Simon"
        ├── context/
        │   ├── AuthContext.jsx       # Global auth state + OTP flow
        │   └── ThemeContext.jsx      # Dark/light mode
        ├── i18n/
        │   └── index.jsx             # I18nProvider + useI18n hook
        ├── locales/
        │   ├── en.json               # English translations
        │   └── fr.json               # French translations
        ├── layouts/
        │   └── DashboardLayout.jsx   # Sidebar + header shell
        ├── pages/
        │   ├── Login.jsx             # Login + OTP step 2
        │   ├── ForgotPassword.jsx    # Password reset (email → OTP → new password)
        │   ├── Profile.jsx           # User profile page
        │   ├── Settings.jsx          # App settings (all roles)
        │   ├── admin/                # Admin pages
        │   ├── student/              # Student pages
        │   ├── teacher/              # Teacher pages
        │   ├── finance/              # Finance pages
        │   └── registrar/            # Registrar pages
        ├── services/
        │   └── api.js                # Axios instance + all API wrappers
        ├── App.jsx                   # Route definitions
        └── main.jsx                  # App entry point
```

---

## Useful Commands

```bash
# Reset database with fresh seed data
cd backend && php artisan migrate:fresh --seed

# Clear all Laravel caches
cd backend && php artisan config:clear && php artisan cache:clear && php artisan route:clear

# Regenerate storage symlink
cd backend && php artisan storage:link

# Build frontend for production
cd frontend && npm run build

# Preview production build locally
cd frontend && npm run preview

# Run backend tests
cd backend && php artisan test

# Format PHP code
cd backend && ./vendor/bin/pint
```

---

## Notes

- Both servers (`php artisan serve` and `npm run dev`) must run simultaneously during development
- Vite proxies all `/api` requests to `http://localhost:8000` (configured in `vite.config.js`)
- For OTP email in production, create a **Gmail App Password** (Google Account → Security → 2-Step Verification → App Passwords) and set it in `.env`
- For local development without real email, use **MailHog** (`MAIL_HOST=127.0.0.1`, `MAIL_PORT=1025`)
- If no payment provider keys are set in `.env`, online payments are auto-confirmed (suitable for demos)

---

© 2026 ESL — École de Santé de Libreville. All rights reserved.

**Version:** 1.1.0 | **Last updated:** March 2026
