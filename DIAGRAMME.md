# DIAGRAMME — ESL Système de Gestion Universitaire
# École de Santé de Libreville — v1.0.0

> Ce fichier contient la description complète du projet et tous ses diagrammes techniques.
> All diagrams use [Mermaid](https://mermaid.js.org/) syntax and ASCII art.

---

## Table des Matières

1. [Vue d'ensemble du système](#1-vue-densemble-du-système)
2. [Diagramme d'Architecture (C4)](#2-diagramme-darchitecture-c4)
3. [Diagramme de Cas d'Utilisation](#3-diagramme-de-cas-dutilisation)
4. [Diagramme de Séquence — Connexion](#4-diagramme-de-séquence--connexion)
5. [Diagramme de Séquence — Calcul des Notes](#5-diagramme-de-séquence--calcul-des-notes)
6. [Diagramme de Séquence — Paiement](#6-diagramme-de-séquence--paiement)
7. [Diagramme de Séquence — E-Learning Quiz](#7-diagramme-de-séquence--e-learning-quiz)
8. [Diagramme de Classes (Modèles)](#8-diagramme-de-classes-modèles)
9. [Diagramme Entité-Relation (ERD)](#9-diagramme-entité-relation-erd)
10. [Diagramme de Flux de Données (DFD)](#10-diagramme-de-flux-de-données-dfd)
11. [Diagramme d'États — Inscription](#11-diagramme-détats--inscription)
12. [Diagramme d'États — Notes](#12-diagramme-détats--notes)
13. [Diagramme d'États — Paiement](#13-diagramme-détats--paiement)
14. [Diagramme de Composants Frontend](#14-diagramme-de-composants-frontend)
15. [Diagramme de Déploiement](#15-diagramme-de-déploiement)
16. [Diagramme d'Activité — Workflow Enseignant](#16-diagramme-dactivité--workflow-enseignant)
17. [Diagramme d'Activité — Workflow Étudiant](#17-diagramme-dactivité--workflow-étudiant)
18. [Diagramme de Navigation (Routes)](#18-diagramme-de-navigation-routes)
19. [Formule de Calcul des Notes](#19-formule-de-calcul-des-notes)
20. [Matrice des Permissions par Rôle](#20-matrice-des-permissions-par-rôle)

---

## 1. Vue d'ensemble du système

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ESL — SYSTÈME DE GESTION UNIVERSITAIRE                   │
│                        École de Santé de Libreville                         │
├──────────────────┬──────────────────────┬───────────────────────────────────┤
│    FRONTEND      │       BACKEND        │          BASE DE DONNÉES          │
│   (React 18)     │    (Laravel 10)      │           (MySQL 8)               │
│   Port: 5173     │    Port: 8000        │          Port: 3306               │
├──────────────────┼──────────────────────┼───────────────────────────────────┤
│ • React Router   │ • REST API           │ • 30+ tables                      │
│ • Vite + HMR     │ • Sanctum Auth       │ • Foreign Keys                    │
│ • Tailwind CSS   │ • Eloquent ORM       │ • Migrations & Seeders            │
│ • Framer Motion  │ • Role Middleware    │ • Indexes optimisés               │
│ • Axios          │ • File Storage       │                                   │
│ • Chart.js       │ • CORS Config        │                                   │
│ • i18n (FR/EN)   │ • PHP 8.1+           │                                   │
└──────────────────┴──────────────────────┴───────────────────────────────────┘

5 RÔLES UTILISATEURS:
  👤 Admin       → Gestion globale du système
  📋 Registrar   → Gestion des inscriptions/étudiants
  💰 Finance     → Gestion des frais et paiements
  🎓 Teacher     → Cours, notes, présences
  📚 Student     → Consultation, e-learning, paiement
```

---

## 2. Diagramme d'Architecture (C4)

```mermaid
C4Context
    title Architecture Système ESL

    Person(admin, "Administrateur", "Gère l'université")
    Person(teacher, "Enseignant", "Gère cours et notes")
    Person(student, "Étudiant", "Accède aux cours et résultats")
    Person(finance, "Finance", "Gère les frais")
    Person(registrar, "Secrétariat", "Gère les inscriptions")

    System(esl, "ESL Platform", "Système de gestion universitaire")
    System_Ext(payment, "Paystack/PayPal", "Passerelle de paiement")
    System_Ext(storage, "File Storage", "Stockage documents e-learning")

    Rel(admin, esl, "Gère")
    Rel(teacher, esl, "Enseigne via")
    Rel(student, esl, "Apprend via")
    Rel(finance, esl, "Gère finances via")
    Rel(registrar, esl, "Inscrit étudiants via")
    Rel(esl, payment, "Traite paiements via", "HTTPS/API")
    Rel(esl, storage, "Stocke fichiers via", "Filesystem")
```

**Architecture en couches :**

```
┌──────────────────────────────────────────────────────────────┐
│                        PRÉSENTATION                          │
│   React.js • Tailwind CSS • Framer Motion • i18n FR/EN       │
├──────────────────────────────────────────────────────────────┤
│                          API REST                            │
│   Axios • Authorization Bearer Token • JSON Responses        │
├──────────────────────────────────────────────────────────────┤
│                       AUTHENTIFICATION                       │
│   Laravel Sanctum • Token Management • Role Middleware       │
├──────────────────────────────────────────────────────────────┤
│                      LOGIQUE MÉTIER                          │
│   Controllers • Services • Eloquent Models • Policies        │
├──────────────────────────────────────────────────────────────┤
│                    ACCÈS AUX DONNÉES                         │
│   Eloquent ORM • Query Builder • Migrations • Seeders        │
├──────────────────────────────────────────────────────────────┤
│                      BASE DE DONNÉES                         │
│             MySQL 8 • 30+ Tables • Foreign Keys              │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Diagramme de Cas d'Utilisation

```mermaid
graph TB
    subgraph Système ESL
        UC1[Connexion]
        UC2[Voir Dashboard]
        UC3[Gérer Étudiants]
        UC4[Gérer Enseignants]
        UC5[Gérer Cours/Classes]
        UC6[Saisir Notes]
        UC7[Marquer Présences]
        UC8[E-Learning]
        UC9[Gestion Financière]
        UC10[Générer Rapports]
        UC11[Paramètres]
        UC12[Chatbot Simon]
        UC13[Payer Frais]
        UC14[Consulter Notes]
        UC15[Valider/Refuser Notes]
        UC16[Gérer Inscriptions]
    end

    Admin([👤 Admin]) --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC15

    Registrar([📋 Registrar]) --> UC1
    Registrar --> UC3
    Registrar --> UC4
    Registrar --> UC16
    Registrar --> UC12

    Finance([💰 Finance]) --> UC1
    Finance --> UC9
    Finance --> UC10
    Finance --> UC12

    Teacher([🎓 Teacher]) --> UC1
    Teacher --> UC2
    Teacher --> UC6
    Teacher --> UC7
    Teacher --> UC8
    Teacher --> UC11
    Teacher --> UC12

    Student([📚 Student]) --> UC1
    Student --> UC2
    Student --> UC14
    Student --> UC8
    Student --> UC13
    Student --> UC11
    Student --> UC12
```

---

## 4. Diagramme de Séquence — Connexion

```mermaid
sequenceDiagram
    actor User as Utilisateur
    participant FE as Frontend (React)
    participant Proxy as Vite Proxy
    participant MW as Middleware Sanctum
    participant AC as AuthController
    participant DB as MySQL

    User->>FE: Saisit username + password
    FE->>Proxy: POST /api/login {username, password}
    Proxy->>MW: Forward request
    MW->>AC: login(Request)
    AC->>DB: SELECT * FROM users WHERE username=? OR email=?
    DB-->>AC: User record
    AC->>AC: Hash::check(password, hash)
    alt Mot de passe correct
        AC->>DB: INSERT personal_access_tokens
        DB-->>AC: Token créé
        AC-->>FE: {token, user, role}
        FE->>FE: localStorage.setItem('token', token)
        FE->>User: Redirect → /{role}/dashboard
    else Mot de passe incorrect
        AC-->>FE: 401 Unauthorized
        FE->>User: Affiche erreur
    end
```

---

## 5. Diagramme de Séquence — Calcul des Notes

```mermaid
sequenceDiagram
    actor Teacher as Enseignant
    participant FE as Frontend (Grades.jsx)
    participant GC as GradeController
    participant GM as Grade Model
    participant DB as MySQL

    Teacher->>FE: Saisit scores (Présence/Quiz/CC/Exam)
    FE->>FE: calcFinal() en temps réel
    Note over FE: total = présence(≤10) + quiz(≤20) + CC(≤30) + exam(≤40)
    FE->>FE: Affiche total /100 + mention automatiquement

    Teacher->>FE: Clique "Enregistrer"
    FE->>GC: POST /api/grades/bulk-update [{enrollment_id, scores...}]
    GC->>GC: Valide: attendance≤10, quiz≤20, CA≤30, exam≤40
    GC->>GM: calculateFinalGrade(ca, exam, quiz, attendance)
    Note over GM: final = attendance + quiz + ca + exam (max 100)
    GM->>GM: calculateLetterGrade(final)
    Note over GM: ≥50=passing, A+→F scale
    GC->>DB: INSERT/UPDATE grades
    DB-->>GC: OK
    GC-->>FE: {grades updated}
    FE->>Teacher: Toast "Notes enregistrées ✓"

    Teacher->>FE: Clique "Soumettre à l'admin"
    FE->>GC: POST /api/grades/submit-class/{classId}
    GC->>DB: INSERT notifications (pour tous les admins)
    DB-->>GC: OK
    GC-->>FE: Notification créée
    FE->>Teacher: Toast "Notes soumises à l'administration ✓"
```

### Formule détaillée :

```
┌─────────────────────────────────────────────────────┐
│              CALCUL DE LA NOTE FINALE                │
├──────────────────────┬──────────────┬───────────────┤
│ Composante           │ Maximum      │ Pourcentage   │
├──────────────────────┼──────────────┼───────────────┤
│ Présence (Attendance)│     /10      │     10%       │
│ Quiz                 │     /20      │     20%       │
│ Contrôle Continu (CC)│     /30      │     30%       │
│ Examen Final         │     /40      │     40%       │
├──────────────────────┼──────────────┼───────────────┤
│ TOTAL                │    /100      │    100%       │
└──────────────────────┴──────────────┴───────────────┘

Note Finale = Présence + Quiz + CC + Examen  (simple addition)
Seuil de passage : 50/100

Mentions:
  A+ : ≥ 90  |  A : ≥ 85  |  A- : ≥ 80
  B+ : ≥ 75  |  B : ≥ 70  |  B- : ≥ 65
  C+ : ≥ 60  |  C : ≥ 55  |  C- : ≥ 50
  D+ : ≥ 45  |  D : ≥ 40  |  F  : < 40
```

---

## 6. Diagramme de Séquence — Paiement

```mermaid
sequenceDiagram
    actor Student as Étudiant
    participant FE as Frontend (Payment.jsx)
    participant PC as PaymentController
    participant DB as MySQL
    participant EXT as Provider Externe (optionnel)

    Student->>FE: Choisit méthode (Carte/PayPal) + montant
    FE->>PC: POST /api/payment/initialize {amount, method, card_details}
    PC->>DB: INSERT transactions {status: 'pending'}
    DB-->>PC: Transaction ID

    alt Provider externe configuré
        PC->>EXT: Initiate payment
        EXT-->>PC: Payment URL / Reference
        PC-->>FE: {redirect_url}
        FE->>Student: Redirect vers provider
        EXT-->>PC: Webhook: payment confirmed
    else Mode démo (pas de provider)
        PC->>PC: Auto-confirm payment
        PC->>DB: UPDATE transactions {status: 'completed'}
        PC->>DB: UPDATE student_fees {paid_amount += amount}
        PC-->>FE: {transaction, status: 'completed'}
        FE->>Student: "Paiement confirmé! ✓"
    end

    Student->>FE: Consulte historique
    FE->>PC: GET /api/payment/history
    PC->>DB: SELECT transactions WHERE student_id=?
    DB-->>PC: Liste transactions
    PC-->>FE: Historique paiements
```

---

## 7. Diagramme de Séquence — E-Learning Quiz

```mermaid
sequenceDiagram
    actor Teacher as Enseignant
    actor Student as Étudiant
    participant FE as Frontend
    participant ELC as ELearningController
    participant DB as MySQL

    Teacher->>FE: Crée quiz (titre, durée, questions)
    FE->>ELC: POST /api/elearning/quizzes {course_id, title, duration, questions[]}
    ELC->>DB: INSERT quizzes
    ELC->>DB: INSERT quiz_questions (par question)
    DB-->>ELC: Quiz créé (status: draft)
    Teacher->>FE: Clique "Publier"
    FE->>ELC: POST /api/elearning/quizzes/{id}/publish
    ELC->>DB: UPDATE quizzes SET status='published'

    Student->>FE: Voit quiz disponibles
    FE->>ELC: GET /api/elearning/quizzes/course/{id}
    ELC-->>FE: Liste quiz publiés

    Student->>FE: Clique "Commencer"
    FE->>ELC: POST /api/elearning/quizzes/{id}/start
    ELC->>DB: INSERT quiz_attempts {start_time: now, status: 'in_progress'}
    ELC-->>FE: {attempt_id, questions (sans réponses)}
    FE->>Student: Affiche questions + chronomètre

    Student->>FE: Répond + soumet avant la fin
    FE->>ELC: POST /api/elearning/quizzes/attempt/{id}/submit {answers[]}
    ELC->>DB: SELECT quiz_questions (bonnes réponses)
    ELC->>ELC: Compare réponses → calcule score
    ELC->>DB: UPDATE quiz_attempts {score, status: 'completed', passed: bool}
    ELC-->>FE: {score, total, passed, correct_answers}
    FE->>Student: Affiche résultat immédiatement
```

---

## 8. Diagramme de Classes (Modèles)

```mermaid
classDiagram
    class User {
        +int id
        +string first_name
        +string last_name
        +string email
        +string username
        +string password_hash
        +enum role (admin|teacher|student|finance|registrar)
        +timestamps
        +student()
        +teacher()
        +settings()
    }

    class Student {
        +int id
        +int user_id
        +int department_id
        +string student_id
        +enum level (L1|L2|L3|M1|M2)
        +enum status (active|inactive|graduated)
        +enrollments()
        +grades()
        +fees()
        +attendance()
    }

    class Teacher {
        +int id
        +int user_id
        +int department_id
        +string employee_id
        +string specialization
        +classes()
        +courses()
    }

    class Course {
        +int id
        +int department_id
        +string code
        +string name
        +int credits
        +int hours
        +enum level
        +bool is_active
        +classes()
    }

    class ClassModel {
        +int id
        +int course_id
        +int teacher_id
        +string name
        +string section
        +string semester
        +string academic_year
        +string room
        +bool is_active
        +enrollments()
        +grades()
        +schedules()
    }

    class Enrollment {
        +int id
        +int student_id
        +int class_id
        +enum status (pending|enrolled|dropped|completed)
        +date enrolled_at
        +grades()
        +attendance()
    }

    class Grade {
        +int id
        +int enrollment_id
        +float attendance_score (max 10)
        +float quiz_score (max 20)
        +float continuous_assessment (max 30)
        +float exam_score (max 40)
        +float final_grade (max 100)
        +string letter_grade
        +enum status (pending|submitted|validated|rejected)
        +calculateFinalGrade()
        +calculateLetterGrade()
        +isPassing()
    }

    class Attendance {
        +int id
        +int enrollment_id
        +date date
        +enum status (present|absent|late|excused)
        +string notes
    }

    class Quiz {
        +int id
        +int course_id
        +string title
        +int duration_minutes
        +int max_attempts
        +float passing_score
        +enum status (draft|published|closed)
        +questions()
        +attempts()
    }

    class Assignment {
        +int id
        +int course_id
        +string title
        +text description
        +datetime due_date
        +int total_points
        +enum status
        +submissions()
    }

    class StudentFee {
        +int id
        +int student_id
        +int fee_type_id
        +float amount
        +float paid_amount
        +date due_date
        +enum status (pending|partial|paid|overdue)
    }

    User "1" --> "0..1" Student
    User "1" --> "0..1" Teacher
    Student "1" --> "N" Enrollment
    ClassModel "1" --> "N" Enrollment
    Enrollment "1" --> "0..1" Grade
    Enrollment "1" --> "N" Attendance
    Course "1" --> "N" ClassModel
    Teacher "1" --> "N" ClassModel
    Course "1" --> "N" Quiz
    Course "1" --> "N" Assignment
    Student "1" --> "N" StudentFee
```

---

## 9. Diagramme Entité-Relation (ERD)

```mermaid
erDiagram
    users {
        int id PK
        string first_name
        string last_name
        string email UK
        string username UK
        string password
        enum role
        timestamps created_at
    }

    students {
        int id PK
        int user_id FK
        int department_id FK
        string student_id UK
        enum level
        enum status
    }

    teachers {
        int id PK
        int user_id FK
        int department_id FK
        string employee_id UK
        string specialization
    }

    faculties {
        int id PK
        string name
        string code UK
        bool is_active
    }

    departments {
        int id PK
        int faculty_id FK
        string name
        string code UK
    }

    courses {
        int id PK
        int department_id FK
        string code UK
        string name
        int credits
        enum level
    }

    classes {
        int id PK
        int course_id FK
        int teacher_id FK
        string name
        string semester
        string academic_year
        bool is_active
    }

    enrollments {
        int id PK
        int student_id FK
        int class_id FK
        enum status
        date enrolled_at
    }

    grades {
        int id PK
        int enrollment_id FK
        float attendance_score
        float quiz_score
        float continuous_assessment
        float exam_score
        float final_grade
        string letter_grade
        enum status
    }

    attendance {
        int id PK
        int enrollment_id FK
        date date
        enum status
    }

    fee_types {
        int id PK
        string name
        float amount
        bool is_active
    }

    student_fees {
        int id PK
        int student_id FK
        int fee_type_id FK
        float amount
        float paid_amount
        enum status
    }

    payments {
        int id PK
        int student_id FK
        float amount
        string payment_method
        date payment_date
    }

    transactions {
        int id PK
        int user_id FK
        string reference UK
        float amount
        string payment_method
        enum status
    }

    quizzes {
        int id PK
        int course_id FK
        string title
        int duration_minutes
        float passing_score
        enum status
    }

    quiz_questions {
        int id PK
        int quiz_id FK
        string question
        string correct_answer
        json options
        int points
    }

    quiz_attempts {
        int id PK
        int quiz_id FK
        int student_id FK
        float score
        enum status
        datetime started_at
        datetime completed_at
    }

    assignments {
        int id PK
        int course_id FK
        string title
        datetime due_date
        int total_points
        enum status
    }

    assignment_submissions {
        int id PK
        int assignment_id FK
        int student_id FK
        string file_path
        float grade
        enum status
    }

    course_materials {
        int id PK
        int course_id FK
        string title
        string file_path
        string file_type
    }

    schedules {
        int id PK
        int class_id FK
        enum day_of_week
        time start_time
        time end_time
        string room
    }

    users ||--o| students : "est"
    users ||--o| teachers : "est"
    faculties ||--|{ departments : "contient"
    departments ||--|{ students : "appartient"
    departments ||--|{ teachers : "appartient"
    departments ||--|{ courses : "propose"
    courses ||--|{ classes : "instanciée en"
    teachers ||--|{ classes : "enseigne"
    students ||--|{ enrollments : "inscrit dans"
    classes ||--|{ enrollments : "accueille"
    enrollments ||--o| grades : "évalué par"
    enrollments ||--|{ attendance : "suivi par"
    students ||--|{ student_fees : "doit"
    fee_types ||--|{ student_fees : "catégorisé par"
    students ||--|{ payments : "effectue"
    courses ||--|{ quizzes : "contient"
    courses ||--|{ assignments : "contient"
    courses ||--|{ course_materials : "possède"
    quizzes ||--|{ quiz_questions : "composé de"
    quizzes ||--|{ quiz_attempts : "tenté par"
    assignments ||--|{ assignment_submissions : "soumis par"
    classes ||--|{ schedules : "planifié par"
```

---

## 10. Diagramme de Flux de Données (DFD)

```
NIVEAU 0 — Vue globale:

  ┌─────────────┐    Requête HTTP    ┌──────────────────────────────┐
  │ Utilisateur │ ─────────────────► │                              │
  │  (Browser)  │                    │     Système ESL              │
  │             │ ◄───────────────── │     (Laravel + React)        │
  └─────────────┘    Réponse HTML/   └──────────────────────────────┘
                     JSON


NIVEAU 1 — Décomposition:

  ┌───────────────┐                  ┌──────────────────────────────┐
  │   Navigateur  │ ──POST /login──► │ P1: Authentification         │
  │   React SPA   │ ◄──Token JSON─── │    (AuthController)          │
  └───────────────┘                  └───────────┬──────────────────┘
          │                                      │ Vérifie/Stocke Token
          │ API calls + Bearer Token             ▼
          │                          ┌──────────────────────────────┐
          │                          │ P2: Routage par Rôle         │
          │                          │    (RoleMiddleware)          │
          │                          └───────────┬──────────────────┘
          │                                      │
          │                    ┌─────────────────┼──────────────────┐
          │                    ▼                 ▼                  ▼
          │         ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
          │         │ P3: Admin    │  │ P4: Teacher  │  │ P5: Student/     │
          │         │    Module    │  │    Module    │  │    Finance/Reg   │
          │         └──────┬───────┘  └──────┬───────┘  └──────────┬───────┘
          │                │                 │                      │
          │                └─────────────────┼──────────────────────┘
          │                                  │
          │                                  ▼
          │                    ┌──────────────────────────────┐
          │                    │       P6: Base de Données    │
          │                    │         (MySQL / Eloquent)   │
          │                    └──────────────────────────────┘
          │                                  │
          └──────────────────────────────────┘
                     Données JSON retournées


NIVEAU 2 — Flux des Notes:

  Enseignant ──saisie notes──► GradeController
                                    │
                    ┌───────────────┼────────────────────┐
                    ▼               ▼                    ▼
              Valide scores   calculateFinal()    calculateLetter()
              (max 10/20/30/40) (sum all parts)   (A+→F scale)
                    │               │                    │
                    └───────────────┼────────────────────┘
                                    ▼
                              grades (table)
                                    │
                                    ▼
                         Notification → Admin
                                    │
                         Admin valide ou refuse
                                    │
                                    ▼
                       Étudiant voit ses notes
```

---

## 11. Diagramme d'États — Inscription

```mermaid
stateDiagram-v2
    [*] --> pending : Étudiant créé

    pending --> enrolled : Admin/Registrar inscrit
    pending --> cancelled : Inscription annulée

    enrolled --> dropped : Étudiant abandonne
    enrolled --> completed : Fin de semestre

    dropped --> [*]
    completed --> [*]
    cancelled --> [*]

    note right of enrolled
        Étudiant peut accéder:
        - Cours
        - Notes
        - Présences
        - E-Learning
    end note
```

---

## 12. Diagramme d'États — Notes

```mermaid
stateDiagram-v2
    [*] --> not_submitted : Classe créée

    not_submitted --> pending : Enseignant saisit des notes

    pending --> submitted : Enseignant soumet à l'admin
    Note over submitted : Admin notifié

    submitted --> validated : Admin valide ✓
    submitted --> rejected : Admin refuse ✗

    rejected --> pending : Enseignant corrige

    validated --> [*]
    Note over validated : Visible pour l'étudiant
```

---

## 13. Diagramme d'États — Paiement

```mermaid
stateDiagram-v2
    [*] --> pending : Frais attribué à l'étudiant

    pending --> partial : Paiement partiel
    pending --> paid : Paiement complet
    pending --> overdue : Date limite dépassée

    partial --> paid : Solde réglé
    partial --> overdue : Date limite dépassée

    overdue --> paid : Régularisation

    paid --> [*]
```

---

## 14. Diagramme de Composants Frontend

```mermaid
graph TB
    subgraph "Frontend React"
        Main[main.jsx]
        App[App.jsx Router]

        subgraph "Context Providers"
            AuthCtx[AuthContext]
            ThemeCtx[ThemeContext]
            I18nCtx[I18nProvider]
        end

        subgraph "Layouts"
            DashLayout[DashboardLayout]
        end

        subgraph "Pages Admin"
            AdminDash[Dashboard]
            AdminStudents[Students Mgmt]
            AdminTeachers[Teachers Mgmt]
            AdminGrades[Grades Validation]
            AdminReports[Reports]
        end

        subgraph "Pages Teacher"
            TchDash[Dashboard]
            TchGrades[Grade Book]
            TchAttend[Attendance]
            TchELearn[E-Learning]
        end

        subgraph "Pages Student"
            StuDash[Dashboard]
            StuGrades[My Grades]
            StuFees[My Fees]
            StuPayment[Payment]
            StuELearn[E-Learning]
        end

        subgraph "Pages Finance"
            FinDash[Dashboard]
            FinFees[Fee Types]
            FinPayments[Payments]
        end

        subgraph "Pages Registrar"
            RegDash[Dashboard]
            RegStudents[Students]
        end

        subgraph "Shared Components"
            Chatbot[Chatbot Simon]
            Settings[Settings]
            Sidebar[Sidebar]
            Header[Header]
        end

        subgraph "Services"
            AxiosApi[api.js Axios]
        end
    end

    Main --> App
    App --> AuthCtx
    App --> ThemeCtx
    App --> I18nCtx
    App --> DashLayout
    DashLayout --> Sidebar
    DashLayout --> Header
    DashLayout --> Chatbot
    App --> AdminDash
    App --> TchGrades
    App --> StuPayment
    AdminDash --> AxiosApi
    TchGrades --> AxiosApi
    StuPayment --> AxiosApi
    Chatbot --> AxiosApi
```

---

## 15. Diagramme de Déploiement

```mermaid
graph TB
    subgraph "Poste Développeur / Serveur Local"
        subgraph "XAMPP/MAMP"
            Apache[Apache HTTP Server :80]
            MySQL[(MySQL :3306\nesl_university)]
        end

        subgraph "Processus PHP"
            PHP[PHP 8.1 Artisan Serve :8000]
        end

        subgraph "Processus Node"
            Vite[Vite Dev Server :5173\nHot Module Reload]
        end
    end

    Browser[🌐 Navigateur\nlocalhost:5173]

    Browser -->|HTTP GET| Vite
    Vite -->|/api/... proxy| PHP
    PHP -->|SQL queries| MySQL
    PHP -->|Read/Write files| Storage[(Storage\n/app/public)]
    Apache -.->|optionnel| PHP
```

**Déploiement Production (recommandé) :**

```
Internet
    │
    ▼
┌──────────────┐
│   Nginx/Apache│  Reverse proxy + SSL (HTTPS)
│   Port 443   │
└──────┬───────┘
       │                    ┌─────────────────────┐
       ├──── /api/*  ──────►│  PHP-FPM 8.1        │
       │                    │  Laravel Backend     │
       │                    └──────────┬──────────┘
       │                               │
       │                    ┌──────────▼──────────┐
       ├──── /* ────────────►│  React Build (dist/)│
       │                    │  Static Files        │
       │                    └─────────────────────┘
       │                               │
       │                    ┌──────────▼──────────┐
       └────────────────────►│  MySQL 8            │
                             │  esl_university      │
                             └─────────────────────┘
```

---

## 16. Diagramme d'Activité — Workflow Enseignant

```mermaid
flowchart TD
    Start([Connexion Enseignant]) --> Dashboard[Voir Dashboard]
    Dashboard --> Choice{Que faire?}

    Choice -->|Cours| MyCourses[Voir Mes Classes]
    MyCourses --> SelectClass[Sélectionner une Classe]
    SelectClass --> ClassAction{Action?}

    ClassAction -->|Notes| GradeEntry[Ouvrir Carnet de Notes]
    GradeEntry --> EnterScores[Saisir Présence/Quiz/CC/Exam]
    EnterScores --> AutoCalc[Calcul Auto /100 + Mention]
    AutoCalc --> Save[Enregistrer]
    Save --> Submit{Soumettre à Admin?}
    Submit -->|Oui| SendToAdmin[POST /grades/submit-class/id]
    SendToAdmin --> AdminNotified[Admin Notifié]
    Submit -->|Non| Choice

    ClassAction -->|Présences| Attendance[Marquer Présences]
    Attendance --> MarkStudents[Cocher Présent/Absent/Retard]
    MarkStudents --> SaveAttend[Enregistrer Présences]
    SaveAttend --> Choice

    Choice -->|E-Learning| ELearn[Module E-Learning]
    ELearn --> EAction{Action?}
    EAction -->|Document| Upload[Uploader PDF/DOC/PPT]
    EAction -->|Quiz| CreateQuiz[Créer Quiz + Questions]
    EAction -->|Devoir| CreateAssign[Créer Devoir + Date limite]
    Upload --> Choice
    CreateQuiz --> PublishQuiz[Publier Quiz]
    PublishQuiz --> Choice
    CreateAssign --> PublishAssign[Publier Devoir]
    PublishAssign --> Choice

    AdminNotified --> AdminReview[Admin Examine les Notes]
    AdminReview --> AdminDecision{Décision Admin}
    AdminDecision -->|Valider ✓| Validated[Notes Validées]
    AdminDecision -->|Refuser ✗| Rejected[Notification Refus + Motif]
    Rejected --> GradeEntry
    Validated --> End([Fin])
```

---

## 17. Diagramme d'Activité — Workflow Étudiant

```mermaid
flowchart TD
    Start([Connexion Étudiant]) --> Dashboard[Voir Dashboard\nNotes récentes, Cours, Présences]
    Dashboard --> Choice{Que faire?}

    Choice -->|Consulter Notes| Notes[Page Notes]
    Notes --> SeeGrades[Voir Notes par Cours\nPrésence/Quiz/CC/Exam/Total]
    SeeGrades --> Choice

    Choice -->|E-Learning| ELearn[Page E-Learning]
    ELearn --> EAction{Action?}

    EAction -->|Quiz| SeeQuizzes[Voir Quiz Disponibles]
    SeeQuizzes --> StartQuiz[Démarrer Quiz]
    StartQuiz --> Timer[Chronomètre Activé]
    Timer --> Answer[Répondre aux Questions]
    Answer --> Submit[Soumettre Réponses]
    Submit --> Result[Voir Score + Correction Immédiate]
    Result --> Choice

    EAction -->|Document| Download[Télécharger PDF/DOC]
    Download --> Choice

    EAction -->|Devoir| SeeAssign[Voir Devoirs]
    SeeAssign --> UploadSubmit[Uploader Fichier + Soumettre]
    UploadSubmit --> WaitGrade[Attendre Note Enseignant]
    WaitGrade --> Choice

    Choice -->|Frais| Fees[Page Frais\nLecture seule]
    Fees --> SeeFees[Voir Scolarité/Montant/Solde/Statut]
    SeeFees --> Choice

    Choice -->|Paiement| Payment[Page Paiement]
    Payment --> ChooseMethod{Méthode?}
    ChooseMethod -->|Carte| CardDetails[Saisir Détails Carte Visa/Mastercard]
    ChooseMethod -->|PayPal| PayPal[Redirection PayPal]
    CardDetails --> ProcessPayment[POST /api/payment/initialize]
    PayPal --> ProcessPayment
    ProcessPayment --> Confirmed[Paiement Confirmé ✓\nHistorique + Solde mis à jour]
    Confirmed --> Choice

    Choice -->|Chatbot| Chat[Chatbot Simon]
    Chat --> AskQuestion[Poser Question EN/FR]
    AskQuestion --> GetAnswer[Réponse Contextuelle]
    GetAnswer --> Choice

    Choice -->|Logout| End([Déconnexion])
```

---

## 18. Diagramme de Navigation (Routes)

```mermaid
graph LR
    Root["/"] --> Login["/login"]
    Login -->|role=admin| Admin["/admin"]
    Login -->|role=teacher| Teacher["/teacher"]
    Login -->|role=student| Student["/student"]
    Login -->|role=finance| Finance["/finance"]
    Login -->|role=registrar| Registrar["/registrar"]

    Admin --> AdminDash["/admin/dashboard"]
    Admin --> AdminStudents["/admin/students"]
    Admin --> AdminTeachers["/admin/teachers"]
    Admin --> AdminCourses["/admin/courses"]
    Admin --> AdminClasses["/admin/classes"]
    Admin --> AdminGrades["/admin/grades"]
    Admin --> AdminFaculties["/admin/faculties"]
    Admin --> AdminDepts["/admin/departments"]
    Admin --> AdminReports["/admin/reports"]
    Admin --> AdminLogs["/admin/activity-logs"]

    Teacher --> TchDash["/teacher/dashboard"]
    Teacher --> TchClasses["/teacher/classes"]
    Teacher --> TchGrades["/teacher/grades"]
    Teacher --> TchAttend["/teacher/attendance"]
    Teacher --> TchSchedule["/teacher/schedule"]
    Teacher --> TchELearn["/teacher/elearning"]

    Student --> StuDash["/student/dashboard"]
    Student --> StuCourses["/student/courses"]
    Student --> StuGrades["/student/grades"]
    Student --> StuAttend["/student/attendance"]
    Student --> StuSchedule["/student/schedule"]
    Student --> StuELearn["/student/elearning"]
    Student --> StuFees["/student/fees"]
    Student --> StuPayment["/student/payment"]

    Finance --> FinDash["/finance/dashboard"]
    Finance --> FinFeeTypes["/finance/fee-types"]
    Finance --> FinStudentFees["/finance/student-fees"]
    Finance --> FinPayments["/finance/payments"]

    Registrar --> RegDash["/registrar/dashboard"]
    Registrar --> RegStudents["/registrar/students"]
    Registrar --> RegTeachers["/registrar/teachers"]

    Admin & Teacher & Student & Finance & Registrar --> Settings["/settings"]
```

---

## 19. Formule de Calcul des Notes

```
╔══════════════════════════════════════════════════════════════════════╗
║              SYSTÈME DE NOTATION ESL — DÉTAIL COMPLET               ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  Composante           │ Points max │  Signification                  ║
║  ─────────────────────┼────────────┼─────────────────────────────── ║
║  Présence / Attendance│    10 pts  │  Assiduité au cours             ║
║  Quiz                 │    20 pts  │  Tests courts en cours          ║
║  Contrôle Continu (CC)│    30 pts  │  Évaluations continues (CAT)    ║
║  Examen Final         │    40 pts  │  Examen de fin de semestre      ║
║  ─────────────────────┼────────────┼─────────────────────────────── ║
║  TOTAL                │   100 pts  │  Note finale sur 100            ║
║                                                                      ║
║  Formule PHP (Grade Model):                                          ║
║   final = $attendance + $quiz + $ca + $exam                         ║
║                                                                      ║
║  Formule JavaScript (teacher/Grades.jsx):                           ║
║   calcFinal = (a + quiz + ca + exam)                                ║
║   (calcul en temps réel pendant la saisie)                          ║
║                                                                      ║
║  Seuil de passage : 50 / 100                                        ║
║                                                                      ║
║  Mentions:                                                           ║
║   A+ : 90-100  │  A  : 85-89  │  A- : 80-84                        ║
║   B+ : 75-79   │  B  : 70-74  │  B- : 65-69                        ║
║   C+ : 60-64   │  C  : 55-59  │  C- : 50-54                        ║
║   D+ : 45-49   │  D  : 40-44  │  F  : < 40                         ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 20. Matrice des Permissions par Rôle

```
╔═══════════════════════════════════════════════════════════════════════════════════╗
║                         MATRICE DES PERMISSIONS                                   ║
╠═════════════════════════════╦═══════╦══════════╦═════════╦═════════╦═════════════╣
║ Fonctionnalité              ║ Admin ║ Registrar║ Finance ║ Teacher ║   Student   ║
╠═════════════════════════════╬═══════╬══════════╬═════════╬═════════╬═════════════╣
║ Dashboard dédié             ║   ✅   ║    ✅     ║    ✅    ║    ✅    ║      ✅      ║
║ Gestion Facultés/Depts      ║   ✅   ║    ❌     ║    ❌    ║    ❌    ║      ❌      ║
║ Gestion Cours               ║   ✅   ║    ❌     ║    ❌    ║    ❌    ║      ❌      ║
║ Gestion Classes             ║   ✅   ║    ❌     ║    ❌    ║    ❌    ║      ❌      ║
║ Créer Étudiants             ║   ✅   ║    ✅     ║    ❌    ║    ❌    ║      ❌      ║
║ Créer Enseignants           ║   ✅   ║    ✅     ║    ❌    ║    ❌    ║      ❌      ║
║ Inscrire Étudiants          ║   ✅   ║    ✅     ║    ❌    ║    ❌    ║      ❌      ║
║ Saisir Notes                ║ VIEW  ║    ❌     ║    ❌    ║    ✅    ║    VIEW     ║
║ Valider/Refuser Notes       ║   ✅   ║    ❌     ║    ❌    ║    ❌    ║      ❌      ║
║ Marquer Présences           ║   ❌   ║    ❌     ║    ❌    ║    ✅    ║      ❌      ║
║ Voir ses Présences          ║   ❌   ║    ❌     ║    ❌    ║    ❌    ║      ✅      ║
║ Créer Types de Frais        ║   ❌   ║    ❌     ║    ✅    ║    ❌    ║      ❌      ║
║ Attribuer Frais Étudiants   ║   ❌   ║    ❌     ║    ✅    ║    ❌    ║      ❌      ║
║ Enregistrer Paiements       ║   ❌   ║    ❌     ║    ✅    ║    ❌    ║      ❌      ║
║ Payer en ligne              ║   ❌   ║    ❌     ║    ❌    ║    ❌    ║      ✅      ║
║ Voir ses Frais              ║   ❌   ║    ❌     ║    ❌    ║    ❌    ║   VIEW      ║
║ E-Learning Créer Contenu    ║   ❌   ║    ❌     ║    ❌    ║    ✅    ║      ❌      ║
║ E-Learning Accéder Contenu  ║   ❌   ║    ❌     ║    ❌    ║    ❌    ║      ✅      ║
║ Créer Quiz                  ║   ❌   ║    ❌     ║    ❌    ║    ✅    ║      ❌      ║
║ Passer Quiz                 ║   ❌   ║    ❌     ║    ❌    ║    ❌    ║      ✅      ║
║ Créer Devoir                ║   ❌   ║    ❌     ║    ❌    ║    ✅    ║      ❌      ║
║ Soumettre Devoir            ║   ❌   ║    ❌     ║    ❌    ║    ❌    ║      ✅      ║
║ Voir Journal Activité       ║   ✅   ║    ❌     ║    ❌    ║    ❌    ║      ❌      ║
║ Rapports Statistiques       ║   ✅   ║    ❌     ║    ✅    ║    ❌    ║      ❌      ║
║ Emploi du Temps             ║   ✅   ║    ❌     ║    ❌    ║    ✅    ║      ✅      ║
║ Paramètres Interface        ║   ✅   ║    ✅     ║    ✅    ║    ✅    ║      ✅      ║
║ Chatbot Simon (FR/EN)       ║   ✅   ║    ✅     ║    ✅    ║    ✅    ║      ✅      ║
╚═════════════════════════════╩═══════╩══════════╩═════════╩═════════╩═════════════╝

✅ = Accès complet  │  VIEW = Lecture seule  │  ❌ = Pas d'accès
```

---

## Chatbot Simon — Questions par Rôle

```
╔══════════════════════════════════════════════════════════════════════════╗
║                CHATBOT SIMON — QUESTIONS EXEMPLES PAR RÔLE              ║
╠══════════════════════════════╦═══════════════════════════════════════════╣
║         ADMINISTRATEUR        ║              QUESTIONS / ACTIONS         ║
╠══════════════════════════════╬═══════════════════════════════════════════╣
║ FR: Recherche étudiant Dupont ║ → Fiche complète: notes, présences, frais║
║ EN: Search for student Smith  ║                                           ║
║ FR: Statistiques globales     ║ → Total étudiants, enseignants, cours     ║
║ FR: KPIs institutionnels      ║ → Taux réussite, revenus, présence moy.  ║
║ FR: Alertes étudiants         ║ → Impayés + étudiants en dessous de 50   ║
║ FR: Notes soumises            ║ → Liste classes soumises par enseignants  ║
╠══════════════════════════════╬═══════════════════════════════════════════╣
║         SECRÉTARIAT           ║                                           ║
╠══════════════════════════════╬═══════════════════════════════════════════╣
║ FR: Inscriptions en attente   ║ → Nombre d'inscriptions à traiter         ║
║ FR: Combien d'étudiants actifs║ → Total / actifs / inscrits ce mois       ║
║ FR: Statistiques d'inscriptions║ → Vue d'ensemble enrollements            ║
║ FR: Nouveaux inscrits ce mois ║ → Liste nouveaux étudiants                ║
║ FR: Recherche étudiant Dupont ║ → Fiche étudiant                          ║
╠══════════════════════════════╬═══════════════════════════════════════════╣
║           FINANCE             ║                                           ║
╠══════════════════════════════╬═══════════════════════════════════════════╣
║ FR: Paiements en retard       ║ → Nombre impayés + montant total dû       ║
║ EN: Overdue payments          ║                                           ║
║ FR: Statistiques du jour      ║ → Paiements aujourd'hui + total global    ║
║ FR: Rapport mensuel           ║ → Paiements + montant + frais en attente  ║
║ FR: Résumé financier global   ║ → Frais attribués / encaissés / en retard ║
╠══════════════════════════════╬═══════════════════════════════════════════╣
║          ENSEIGNANT           ║                                           ║
╠══════════════════════════════╬═══════════════════════════════════════════╣
║ FR: Montre-moi mes cours      ║ → Liste classes assignées                 ║
║ EN: Show me my courses        ║                                           ║
║ FR: Combien d'étudiants j'ai  ║ → Nombre étudiants inscrits               ║
║ FR: Quel est mon emploi du    ║ → Horaires par jour                       ║
║     temps?                    ║                                           ║
║ FR: Comment saisir les notes? ║ → Guide étape par étape                   ║
║ EN: How to enter grades?      ║ → Présence/Quiz/CC/Exam → /100 auto       ║
╠══════════════════════════════╬═══════════════════════════════════════════╣
║           ÉTUDIANT            ║                                           ║
╠══════════════════════════════╬═══════════════════════════════════════════╣
║ FR: Quelles sont mes notes?   ║ → Notes par cours + moyenne générale       ║
║ EN: What are my grades?       ║                                           ║
║ FR: Combien dois-je payer?    ║ → Total / payé / reste à payer            ║
║ EN: How much are my fees?     ║                                           ║
║ FR: Mon emploi du temps       ║ → Horaires de cours inscrits              ║
║ FR: Mes cours inscrits        ║ → Liste des cours de l'étudiant           ║
║ FR: Mon taux de présence      ║ → % de présence                           ║
╚══════════════════════════════╩═══════════════════════════════════════════╝

🌐 LANGUE: FR/EN sélectionnable via le bouton 🇫🇷/🇬🇧 dans l'en-tête du chatbot
🎙️ VOIX: Reconnaissance vocale disponible (fr-FR ou en-US selon la langue active)
```

---

## Résumé Technique

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      RÉSUMÉ TECHNIQUE DU PROJET                         │
├─────────────────┬───────────────────────────────────────────────────────┤
│ Frontend        │ React 18 + Vite 5 + Tailwind CSS 3 + Framer Motion   │
│ Backend         │ Laravel 10 + PHP 8.1 + Laravel Sanctum                │
│ Base de données │ MySQL 8 / MariaDB 10 — 30+ tables                     │
│ Authentification│ Token Sanctum + Middleware de rôle                    │
│ Internationalisa│ i18n FR/EN (frontend) + language param (chatbot API)  │
│ Stockage        │ Laravel Storage + Symlinks publics                    │
│ Paiement        │ Paystack / PayPal / Auto-confirm (démo)               │
│ Temps réel      │ Vote recognition (WebSpeech API)                      │
│ Rôles           │ admin / registrar / finance / teacher / student       │
│ Calcul Notes    │ Présence(/10) + Quiz(/20) + CC(/30) + Exam(/40) = 100 │
│ E-Learning      │ Cours en ligne, Documents, Quiz, Devoirs              │
│ Chatbot         │ Simon IA: contextuel par rôle, bilingue FR/EN         │
│ Build tool      │ Composer (PHP) + NPM (JS)                             │
│ Tests           │ PHPUnit (backend) + ESLint (frontend)                 │
└─────────────────┴───────────────────────────────────────────────────────┘

Démarrage rapide:
  cd backend  && php artisan migrate:fresh --seed && php artisan serve
  cd frontend && npm install && npm run dev
  → http://localhost:5173  (admin / admin123)
```

---

*© 2026 ESL — École de Santé de Libreville — Tous droits réservés*
