# 📚 DOCUMENTATION COMPLÈTE - PROJET ESL

## Table des Matières
1. [Architecture Globale](#1-architecture-globale)
2. [Base de Données](#2-base-de-données)
3. [Enregistrement des Données](#3-enregistrement-des-données)
4. [Authentification & Sécurité](#4-authentification--sécurité)
5. [API & Routes](#5-api--routes)
6. [Flow Complet des Données](#6-flow-complet-des-données)
7. [Gestion des Erreurs](#7-gestion-des-erreurs)
8. [Schéma Final](#8-schéma-final)

---

Administrateur

username: admin
email: admin@esl.local
mot de passe: admin123
Finance

username: finance1
email: finance1@esl.local
mot de passe: password123
Registrar

username: registrar1
email: registrar1@esl.local
mot de passe: password123
Enseignant (exemple)

username: teacher1
email: teacher1@esl.local
mot de passe: password123
Étudiant (exemple)

username: student1
email: student1@esl.local
mot de passe: password123

## 1. ARCHITECTURE GLOBALE

### Vue d'ensemble
```
┌────────────────────────────────────────────────────────────────────┐
│                    APPLICATION ESL - ARCHITECTURE                   │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐      ┌──────────────────┐      ┌──────────┐ │
│  │   FRONTEND       │      │    BACKEND       │      │  BASE    │ │
│  │   (React.js)     │◄────►│   (Laravel)      │◄────►│ DONNÉES  │ │
│  │                  │ HTTP │                  │ SQL  │ (MySQL)  │ │
│  │  Port: 5173      │ API  │  Port: 8000      │      │          │ │
│  │  Vite Dev Server │      │  PHP Artisan     │      │ MariaDB  │ │
│  └──────────────────┘      └──────────────────┘      └──────────┘ │
│         ↓                           ↓                      ↓       │
│    [Interface]              [Logique Métier]        [Stockage]    │
│    - Pages React            - Controllers           - 30 Tables   │
│    - Composants             - Models (Eloquent)     - Relations   │
│    - Axios HTTP             - Validation            - Migrations  │
│    - React Router           - Sanctum Auth          - Indexation  │
│    - Context API            - Middleware            - Contraintes │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### Technologies Utilisées

#### Frontend
- **React 18** : Bibliothèque UI
- **Vite 4** : Build tool ultra-rapide
- **Tailwind CSS** : Framework CSS utility-first
- **Framer Motion** : Animations fluides
- **Axios** : Client HTTP
- **React Router** : Navigation entre pages
- **React Hot Toast** : Notifications

#### Backend
- **PHP 7.4+** : Langage serveur
- **Laravel 10** : Framework PHP
- **Laravel Sanctum** : Authentification API
- **Eloquent ORM** : Mapping objet-relationnel
- **MySQL/MariaDB** : Base de données

---

## 2. BASE DE DONNÉES - STRUCTURE COMPLÈTE

### 📋 Liste des 30 Tables

#### **GROUPE 1 : AUTHENTIFICATION & UTILISATEURS**
1. **`users`** - Table principale des utilisateurs
2. **`personal_access_tokens`** - Tokens Sanctum pour authentification

#### **GROUPE 2 : STRUCTURE ACADÉMIQUE**
3. **`faculties`** - Facultés (ex: Faculté de Médecine)
4. **`departments`** - Départements par faculté
5. **`courses`** - Cours/Matières (ex: Biologie, Chimie)
6. **`classes`** - Classes/Groupes de cours (ex: BIO-L1-2024)

#### **GROUPE 3 : PERSONNES**
7. **`students`** - Profils étudiants
8. **`teachers`** - Profils enseignants

#### **GROUPE 4 : INSCRIPTIONS & SUIVI**
9. **`enrollments`** - Inscriptions des étudiants aux classes
10. **`grades`** - Notes des étudiants
11. **`attendance`** - Présences/Absences

#### **GROUPE 5 : FINANCES**
12. **`fee_types`** - Types de frais (Scolarité, Inscription, etc.)
13. **`student_fees`** - Frais assignés aux étudiants
14. **`payments`** - Paiements effectués (ancien système)
15. **`transactions`** - Paiements en ligne (nouveau système)

#### **GROUPE 6 : PLANNING**
16. **`schedules`** - Emplois du temps

#### **GROUPE 7 : COMMUNICATION**
17. **`announcements`** - Annonces/Communications
18. **`chatbot_logs`** - Historique chatbot (ancien)
19. **`chatbot_conversations`** - Conversations chatbot AI (nouveau)

#### **GROUPE 8 : SUIVI SYSTÈME**
20. **`activity_logs`** - Journaux d'activité système
21. **`user_settings`** - Paramètres utilisateurs

#### **GROUPE 9 : E-LEARNING**
22. **`online_courses`** - Cours en ligne (vidéos live)
23. **`course_materials`** - Documents PDF/PPT
24. **`quizzes`** - Quiz en ligne
25. **`quiz_questions`** - Questions des quiz
26. **`quiz_attempts`** - Tentatives étudiants
27. **`assignments`** - Devoirs à rendre
28. **`assignment_submissions`** - Soumissions des devoirs
29. **`online_course_attendance`** - Présence cours vidéo

#### **GROUPE 10 : GESTION AVANCÉE**
30. **`grade_modifications`** - Historique modifications notes
31. **`course_equivalences`** - Équivalences de cours (étudiants transferts)

---

### 🔍 DÉTAIL DES TABLES PRINCIPALES

#### TABLE `users` - UTILISATEURS SYSTÈME
```sql
┌──────────────────────────────────────────────────────────────┐
│ Table: users                                                  │
├──────────────────────────────────────────────────────────────┤
│ Rôle: Stocke TOUS les utilisateurs du système                │
│ Clé Primaire: id                                             │
│ Index Uniques: username, email                               │
├──────────────────────────────────────────────────────────────┤
│ COLONNES:                                                     │
│ - id (PK)               : Identifiant unique                 │
│ - username              : Nom d'utilisateur (login)          │
│ - email                 : Email                              │
│ - password              : Mot de passe hashé (bcrypt)        │
│ - first_name            : Prénom                             │
│ - last_name             : Nom de famille                     │
│ - role                  : admin|student|teacher|finance|     │
│                           registrar                          │
│ - phone                 : Téléphone                          │
│ - address               : Adresse                            │
│ - date_of_birth         : Date de naissance                  │
│ - gender                : male|female|other                  │
│ - profile_image         : Photo de profil                    │
│ - is_active             : Compte actif ?                     │
│ - last_login_at         : Dernière connexion                 │
│ - created_at, updated_at: Timestamps                         │
└──────────────────────────────────────────────────────────────┘

Exemple de données:
{
    "id": 15,
    "username": "student1",
    "email": "student1@esl.ga",
    "first_name": "Jean",
    "last_name": "Dupont",
    "role": "student",
    "is_active": true
}
```

#### TABLE `students` - PROFILS ÉTUDIANTS
```sql
┌──────────────────────────────────────────────────────────────┐
│ Table: students                                               │
├──────────────────────────────────────────────────────────────┤
│ Rôle: Informations académiques des étudiants                 │
│ Clé Primaire: id                                             │
│ Clé Étrangère: user_id → users(id)                          │
│ Clé Étrangère: department_id → departments(id)              │
├──────────────────────────────────────────────────────────────┤
│ COLONNES:                                                     │
│ - id (PK)               : Identifiant unique                 │
│ - user_id (FK)          : Lien vers table users              │
│ - department_id (FK)    : Département de l'étudiant          │
│ - student_id            : Matricule (ex: ESL2024001)         │
│ - level                 : L1|L2|L3|M1|M2|D1|D2|D3            │
│ - enrollment_date       : Date d'inscription                 │
│ - guardian_name         : Nom du tuteur                      │
│ - guardian_phone        : Téléphone tuteur                   │
│ - status                : active|inactive|graduated|         │
│                           suspended                          │
│ - created_at, updated_at: Timestamps                         │
└──────────────────────────────────────────────────────────────┘

Exemple de données:
{
    "id": 8,
    "user_id": 15,
    "department_id": 3,
    "student_id": "ESL2024008",
    "level": "L2",
    "enrollment_date": "2024-09-01",
    "status": "active"
}
```

#### TABLE `enrollments` - INSCRIPTIONS AUX COURS
```sql
┌──────────────────────────────────────────────────────────────┐
│ Table: enrollments                                            │
├──────────────────────────────────────────────────────────────┤
│ Rôle: Lie un étudiant à une classe (cours)                   │
│ Clé Primaire: id                                             │
│ Clés Étrangères: student_id, class_id                        │
│ Contrainte Unique: (student_id, class_id)                    │
├──────────────────────────────────────────────────────────────┤
│ COLONNES:                                                     │
│ - id (PK)               : Identifiant unique                 │
│ - student_id (FK)       : Étudiant inscrit                   │
│ - class_id (FK)         : Classe/Cours                       │
│ - enrollment_date       : Date d'inscription                 │
│ - status                : enrolled|dropped|completed         │
│ - created_at, updated_at: Timestamps                         │
└──────────────────────────────────────────────────────────────┘

Exemple:
{
    "id": 45,
    "student_id": 8,
    "class_id": 12,
    "enrollment_date": "2024-09-15",
    "status": "enrolled"
}
```

#### TABLE `payments` - ANCIEN SYSTÈME DE PAIEMENT
```sql
┌──────────────────────────────────────────────────────────────┐
│ Table: payments                                               │
├──────────────────────────────────────────────────────────────┤
│ Rôle: Paiements manuels (caisse, banque)                    │
│ Clé Primaire: id                                             │
│ Clé Étrangère: student_fee_id → student_fees(id)            │
├──────────────────────────────────────────────────────────────┤
│ COLONNES:                                                     │
│ - id (PK)               : Identifiant unique                 │
│ - student_fee_id (FK)   : Frais payé                         │
│ - amount                : Montant payé                       │
│ - payment_method        : cash|bank_transfer|mobile_money|   │
│                           check                              │
│ - reference_number      : Numéro de référence unique         │
│ - payment_date          : Date du paiement                   │
│ - notes                 : Observations                       │
│ - received_by (FK)      : User qui a reçu le paiement        │
│ - created_at, updated_at: Timestamps                         │
└──────────────────────────────────────────────────────────────┘
```

#### TABLE `transactions` - NOUVEAU SYSTÈME PAIEMENT EN LIGNE
```sql
┌──────────────────────────────────────────────────────────────┐
│ Table: transactions                                           │
├──────────────────────────────────────────────────────────────┤
│ Rôle: Paiements en ligne (Airtel Money, Moov, Carte)        │
│ Clé Primaire: id                                             │
│ Clé Étrangère: student_id → students(id)                     │
├──────────────────────────────────────────────────────────────┤
│ COLONNES:                                                     │
│ - id (PK)               : Identifiant unique                 │
│ - student_id (FK)       : Étudiant                           │
│ - reference             : Référence transaction (UUID)       │
│ - amount                : Montant                            │
│ - payment_method        : card|airtel_money|moov_money|      │
│                           bank_transfer                      │
│ - phone_number          : Numéro Mobile Money                │
│ - status                : pending|completed|failed           │
│ - provider_reference    : Référence fournisseur paiement     │
│ - failure_reason        : Raison d'échec                     │
│ - metadata              : Données JSON supplémentaires       │
│ - completed_at          : Date de complétion                 │
│ - created_at, updated_at: Timestamps                         │
└──────────────────────────────────────────────────────────────┘

Exemple:
{
    "id": 23,
    "student_id": 8,
    "reference": "TRX-20240101-ABC123",
    "amount": 150000.00,
    "payment_method": "airtel_money",
    "phone_number": "+24177123456",
    "status": "completed",
    "provider_reference": "AM-202401-XYZ",
    "completed_at": "2024-01-01 14:30:00"
}
```

#### TABLE `quizzes` - QUIZ E-LEARNING
```sql
┌──────────────────────────────────────────────────────────────┐
│ Table: quizzes                                                │
├──────────────────────────────────────────────────────────────┤
│ Rôle: Quiz créés par les enseignants                         │
│ Clé Primaire: id                                             │
│ Clés Étrangères: course_id, teacher_id                       │
├──────────────────────────────────────────────────────────────┤
│ COLONNES:                                                     │
│ - id (PK)               : Identifiant unique                 │
│ - course_id (FK)        : Cours associé                      │
│ - teacher_id (FK)       : Enseignant créateur               │
│ - title                 : Titre du quiz                      │
│ - description           : Description                        │
│ - duration_minutes      : Durée en minutes                   │
│ - total_points          : Points totaux                      │
│ - passing_score         : Score minimum pour réussir         │
│ - max_attempts          : Nombre de tentatives maximum       │
│ - shuffle_questions     : Mélanger les questions ?           │
│ - show_answers_after    : Montrer les réponses après ?       │
│ - available_from        : Date de début                      │
│ - available_until       : Date de fin                        │
│ - status                : draft|published                    │
│ - created_at, updated_at: Timestamps                         │
└──────────────────────────────────────────────────────────────┘
```

---

### 🔗 RELATIONS ENTRE LES TABLES

```
users (1) ──────► (1) students
  │                     │
  │                     ├──► (N) enrollments ◄──── (1) classes
  │                     │           │
  │                     │           ├──► (N) grades
  │                     │           └──► (N) attendance
  │                     │
  │                     ├──► (N) student_fees ◄──── (1) fee_types
  │                     │           │
  │                     │           └──► (N) payments
  │                     │
  │                     └──► (N) transactions
  │
users (1) ──────► (1) teachers
                        │
                        ├──► (N) classes
                        ├──► (N) online_courses
                        ├──► (N) quizzes
                        └──► (N) assignments

courses (1) ──────► (N) classes
  │                     │
  │                     └──► (N) online_courses
  │
faculties (1) ──────► (N) departments
                            │
                            ├──► (N) students
                            └──► (N) teachers
```

---

## 3. ENREGISTREMENT DES DONNÉES - FLOW COMPLET

### Exemple 1 : Consultation de l'Historique de Paiement

#### Étape par Étape

**1. ACTION UTILISATEUR (Frontend)**
```javascript
// Fichier: /frontend/src/pages/student/Payment.jsx
// L'étudiant clique sur "Historique de paiement"

useEffect(() => {
  fetchData()
}, [])

const fetchData = async () => {
  try {
    const historyRes = await api.get('/payment/history')
    setPaymentHistory(historyRes.data.data)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

**2. REQUÊTE HTTP ENVOYÉE**
```http
GET /api/payment/history HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json
Accept: application/json
```

**3. INTERCEPTION PAR AXIOS**
```javascript
// Fichier: /frontend/src/services/api.js
// Axios ajoute automatiquement le token d'authentification

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**4. RÉCEPTION PAR LARAVEL**
```php
// Fichier: /backend/routes/api.php
// Laravel route le requête vers le bon contrôleur

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('payment')->group(function () {
        Route::get('/history', [PaymentController::class, 'getPaymentHistory']);
    });
});
```

**5. MIDDLEWARE SANCTUM (Authentification)**
```php
// Laravel vérifie le token
// Fichier: Sanctum Middleware (auto)

1. Extrait le token du header Authorization
2. Cherche dans la table 'personal_access_tokens'
3. Vérifie que le token est valide et non expiré
4. Charge l'utilisateur associé → $request->user()
5. Continue vers le contrôleur si OK
6. Retourne 401 Unauthorized si NON OK
```

**6. CONTRÔLEUR (Logique Métier)**
```php
// Fichier: /backend/app/Http/Controllers/Api/PaymentController.php

public function getPaymentHistory(Request $request)
{
    // 1. Récupère l'étudiant connecté
    $student = $this->getStudent($request);
    
    // Si pas de profil étudiant → erreur 404
    if (!$student) {
        return response()->json(['error' => 'Student profile not found'], 404);
    }

    // 2. Requête à la base de données via Eloquent
    $payments = Payment::with('transactions')
        ->where('student_id', $student->id)
        ->orderBy('payment_date', 'desc')
        ->paginate(20);

    // 3. Retourne les données en JSON
    return response()->json($payments);
}
```

**7. REQUÊTE SQL GÉNÉRÉE PAR ELOQUENT**
```sql
-- Laravel Eloquent génère automatiquement cette requête SQL

SELECT 
    payments.*,
    transactions.*
FROM payments
LEFT JOIN transactions ON transactions.payment_id = payments.id
WHERE payments.student_id = 8
ORDER BY payments.payment_date DESC
LIMIT 20 OFFSET 0;
```

**8. BASE DE DONNÉES EXÉCUTE LA REQUÊTE**
```
┌─────────────────────────────────────────────────┐
│ MySQL/MariaDB                                    │
├─────────────────────────────────────────────────┤
│ 1. Parse la requête SQL                         │
│ 2. Utilise l'index sur student_id pour rapidité │
│ 3. Fait le JOIN avec transactions               │
│ 4. Trie par date DESC                           │
│ 5. Limite à 20 résultats                        │
│ 6. Retourne les données à Laravel               │
└─────────────────────────────────────────────────┘
```

**9. RÉPONSE JSON RETOURNÉE**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "current_page": 1,
  "data": [
    {
      "id": 23,
      "student_fee_id": 45,
      "amount": "150000.00",
      "payment_method": "mobile_money",
      "reference_number": "PAY-2024-001",
      "payment_date": "2024-01-15",
      "created_at": "2024-01-15T10:30:00Z",
      "transactions": [
        {
          "id": 12,
          "reference": "TRX-ABC123",
          "status": "completed",
          "provider_reference": "AM-XYZ789"
        }
      ]
    },
    // ... plus de paiements
  ],
  "total": 5,
  "per_page": 20
}
```

**10. FRONTEND AFFICHE LES DONNÉES**
```javascript
// React met à jour l'état et re-render le composant

setPaymentHistory(historyRes.data.data)

// React affiche dans le DOM:
<div className="payment-card">
  <p>Montant: 150,000 FCFA</p>
  <p>Date: 15 janvier 2024</p>
  <p>Méthode: Mobile Money</p>
  <p>Statut: ✓ Complété</p>
</div>
```

---

### Exemple 2 : Soumission d'un Devoir (Assignment)

#### Flow Complet

**1. ÉTUDIANT REMPLIT LE FORMULAIRE**
```javascript
// Fichier: /frontend/src/pages/student/ELearning.jsx

const [content, setContent] = useState('')
const [file, setFile] = useState(null)

const handleSubmit = async () => {
  const formData = new FormData()
  formData.append('content', content)
  if (file) formData.append('file', file)
  
  await api.post(`/elearning/assignments/${assignmentId}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
```

**2. REQUÊTE HTTP AVEC FICHIER**
```http
POST /api/elearning/assignments/12/submit HTTP/1.1
Authorization: Bearer {token}
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="content"

Voici mon devoir sur la biologie cellulaire...
------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="devoir.pdf"
Content-Type: application/pdf

[Binary PDF data]
------WebKitFormBoundary--
```

**3. CONTRÔLEUR LARAVEL TRAITE LA SOUMISSION**
```php
// Fichier: /backend/app/Http/Controllers/Api/ELearningController.php

public function submitAssignment(Request $request, $id)
{
    // 1. Validation des données
    $request->validate([
        'content' => 'nullable|string',
        'file' => 'nullable|file|max:10240', // Max 10MB
    ]);
    
    $student = $this->getStudent($request);
    $assignment = Assignment::findOrFail($id);
    
    // 2. Vérifier que l'étudiant est inscrit
    $isEnrolled = Enrollment::where('student_id', $student->id)
        ->where('course_id', $assignment->course_id)
        ->exists();
    
    if (!$isEnrolled) {
        return response()->json(['error' => 'Not enrolled'], 403);
    }
    
    // 3. Upload du fichier si présent
    $filePath = null;
    if ($request->hasFile('file')) {
        $filePath = $request->file('file')->store(
            'assignments/' . $assignment->id,
            'public'
        );
    }
    
    // 4. Créer la soumission dans la BDD
    $submission = AssignmentSubmission::create([
        'assignment_id' => $assignment->id,
        'student_id' => $student->id,
        'content' => $request->content,
        'file_path' => $filePath,
        'file_name' => $request->file('file')->getClientOriginalName(),
        'file_size' => $request->file('file')->getSize(),
        'submitted_at' => now(),
        'is_late' => now()->isAfter($assignment->due_date),
    ]);
    
    return response()->json([
        'message' => 'Devoir soumis avec succès',
        'submission' => $submission
    ], 201);
}
```

**4. REQUÊTE SQL D'INSERTION**
```sql
INSERT INTO assignment_submissions (
    assignment_id,
    student_id,
    content,
    file_path,
    file_name,
    file_size,
    submitted_at,
    is_late,
    created_at,
    updated_at
) VALUES (
    12,
    8,
    'Voici mon devoir...',
    'assignments/12/abc123.pdf',
    'devoir.pdf',
    245678,
    '2024-01-20 14:30:00',
    0,
    '2024-01-20 14:30:00',
    '2024-01-20 14:30:00'
);
```

**5. FICHIER STOCKÉ SUR LE SERVEUR**
```
/backend/storage/app/public/assignments/12/
└── abc123-devoir.pdf  (fichier physique)
```

**6. RÉPONSE AU FRONTEND**
```json
{
  "message": "Devoir soumis avec succès",
  "submission": {
    "id": 67,
    "assignment_id": 12,
    "student_id": 8,
    "content": "Voici mon devoir...",
    "file_name": "devoir.pdf",
    "submitted_at": "2024-01-20T14:30:00Z",
    "is_late": false,
    "grade": null
  }
}
```

---

## 4. AUTHENTIFICATION & SÉCURITÉ

### Comment l'Authentification Fonctionne

#### 1. LOGIN - PREMIÈRE CONNEXION

**Frontend envoie les identifiants:**
```javascript
// /frontend/src/context/AuthContext.jsx

const login = async (username, password) => {
  const response = await api.post('/login', { username, password })
  const { user, token } = response.data.data
  
  // Token stocké dans localStorage du navigateur
  localStorage.setItem('token', token)
  setUser(user)
  
  return user
}
```

**Backend vérifie et génère un token:**
```php
// /backend/app/Http/Controllers/Api/AuthController.php

public function login(Request $request)
{
    $request->validate([
        'username' => 'required|string',
        'password' => 'required|string',
    ]);

    // 1. Chercher l'utilisateur
    $user = User::where('username', $request->username)->first();

    // 2. Vérifier le mot de passe (bcrypt)
    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json([
            'message' => 'Invalid credentials'
        ], 401);
    }

    // 3. Vérifier que le compte est actif
    if (!$user->is_active) {
        return response()->json([
            'message' => 'Account is inactive'
        ], 403);
    }

    // 4. Générer un token Sanctum
    $token = $user->createToken('auth-token')->plainTextToken;

    // 5. Mettre à jour la dernière connexion
    $user->update(['last_login_at' => now()]);

    // 6. Retourner user + token
    return response()->json([
        'data' => [
            'user' => $user->load('student', 'teacher'),
            'token' => $token
        ]
    ]);
}
```

**Token stocké dans la table:**
```sql
-- Table: personal_access_tokens
INSERT INTO personal_access_tokens (
    tokenable_type,
    tokenable_id,
    name,
    token,
    created_at
) VALUES (
    'App\Models\User',
    15,  -- user_id
    'auth-token',
    'a1b2c3d4e5f6g7h8i9j0...', -- token hashé
    '2024-01-20 10:00:00'
);
```

#### 2. REQUÊTES AUTHENTIFIÉES

**Chaque requête inclut le token:**
```http
GET /api/dashboard/student HTTP/1.1
Authorization: Bearer a1b2c3d4e5f6g7h8i9j0...
```

**Sanctum middleware vérifie:**
```php
// Auto-appliqué par Laravel Sanctum

1. Extrait "a1b2c3d4e5f6g7h8i9j0..." du header
2. Hashe le token
3. Cherche dans personal_access_tokens
4. Si trouvé → charge le user associé
5. Si pas trouvé → retourne 401 Unauthorized
6. $request->user() devient disponible
```

#### 3. PROTECTION DES ROUTES

**Middleware `auth:sanctum`:**
```php
// /backend/routes/api.php

// Route NON protégée (publique)
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées (authentification requise)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/dashboard/student', [...]);
});

// Protection par rôle
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/admin/kpis', [AdminController::class, 'getKPIs']);
});
```

### Sécurité des Mots de Passe

**Stockage dans la BDD:**
```php
// Jamais en clair ! Toujours hashé avec bcrypt

// Avant stockage:
$user->password = Hash::make('password123');

// Résultat dans la BDD:
$2y$10$abcdefghijklmnopqrstuvwxyz123456789...
// ↑ Impossible à déchiffrer (one-way hash)
```

**Vérification:**
```php
Hash::check('password123', $user->password) // true
Hash::check('wrongpassword', $user->password) // false
```

### Identification de l'Utilisateur

```php
// Dans n'importe quel contrôleur protégé:

$user = $request->user();          // Utilisateur connecté
$userId = $user->id;               // ID du user
$role = $user->role;               // Rôle (admin, student, etc.)

// Si c'est un étudiant:
$student = $user->student;         // Profil étudiant
$studentId = $student->id;         // ID du student
$studentNumber = $student->student_id; // Matricule

// Si c'est un enseignant:
$teacher = $user->teacher;         // Profil enseignant
$teacherId = $teacher->id;         // ID du teacher
```

### Risques de Sécurité & Améliorations

#### RISQUES ACTUELS:

1. **Token dans localStorage** (vulnérable aux attaques XSS)
   - Si un script malveillant accède au localStorage, il peut voler le token

2. **Pas d'expiration de token visible**
   - Les tokens ne semblent pas avoir de durée de vie limitée

3. **Pas de refresh token**
   - Si le token expire, l'utilisateur doit se reconnecter

4. **Pas de rate limiting** sur le login
   - Un attaquant peut tenter plusieurs mots de passe (brute force)

#### AMÉLIORATIONS RECOMMANDÉES:

```php
// 1. Ajouter une expiration aux tokens (config/sanctum.php)
'expiration' => 60, // 60 minutes

// 2. Rate limiting sur le login (routes/api.php)
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1'); // 5 tentatives par minute

// 3. Forcer HTTPS en production (.env)
APP_ENV=production
SANCTUM_STATEFUL_DOMAINS=yourdomain.com

// 4. Ajouter 2FA (Two-Factor Authentication)
// Utiliser un package comme: laravel/fortify

// 5. Loguer les tentatives de connexion échouées
Log::warning('Failed login attempt', [
    'username' => $request->username,
    'ip' => $request->ip()
]);
```

---

## 5. API & ROUTES - LISTE COMPLÈTE

### Routes Publiques (Sans Authentification)

```php
POST /api/login
  → AuthController@login
  → Authentifie un utilisateur et retourne un token
  → Données requises: { username, password }
  → Retourne: { user, token }

POST /api/payment/webhook
  → PaymentController@confirmPayment
  → Webhook pour confirmer les paiements externes
  → Appelé par les fournisseurs de paiement (Airtel, Moov)
```

### Routes Protégées (Authentification Requise)

#### AUTHENTIFICATION
```php
POST   /api/logout              → Déconnexion
GET    /api/me                  → Infos utilisateur connecté
PUT    /api/profile             → Modifier profil
PUT    /api/change-password     → Changer mot de passe
```

#### DASHBOARD (Statistiques)
```php
GET /api/dashboard/admin        → Stats admin (lecture BDD)
GET /api/dashboard/student      → Stats étudiant (lecture BDD)
GET /api/dashboard/teacher      → Stats enseignant (lecture BDD)
GET /api/dashboard/finance      → Stats finance (lecture BDD)
GET /api/dashboard/registrar    → Stats registrar (lecture BDD)
```

#### ÉTUDIANTS (CRUD + Actions)
```php
GET    /api/students                → Liste étudiants (lecture)
POST   /api/students                → Créer étudiant (écriture)
GET    /api/students/{id}           → Détails étudiant (lecture)
PUT    /api/students/{id}           → Modifier étudiant (écriture)
DELETE /api/students/{id}           → Supprimer étudiant (écriture)

POST   /api/students/{id}/auto-enroll        → Auto-inscription (écriture)
POST   /api/students/auto-enroll-all         → Auto-inscription tous (écriture)
GET    /api/students/{id}/courses            → Cours de l'étudiant (lecture)
GET    /api/students/{id}/grades             → Notes de l'étudiant (lecture)
GET    /api/students/{id}/attendance         → Présences (lecture)
GET    /api/students/{id}/fees               → Frais (lecture)
```

#### PAIEMENTS (Nouveau Système)
```php
GET  /api/payment/summary                → Résumé des frais (lecture)
GET  /api/payment/history                → Historique paiements (lecture)
POST /api/payment/initialize             → Initier un paiement (écriture)
GET  /api/payment/status/{reference}     → Statut paiement (lecture)
GET  /api/payment/receipt/{id}           → Reçu paiement (lecture)
```

#### E-LEARNING
```php
# Cours en ligne
GET  /api/elearning/courses/teacher      → Cours du prof (lecture)
GET  /api/elearning/courses/student      → Cours de l'étudiant (lecture)
POST /api/elearning/courses              → Créer cours vidéo (écriture)
POST /api/elearning/courses/{id}/join    → Rejoindre cours (écriture)

# Documents
POST   /api/elearning/materials           → Upload document (écriture)
GET    /api/elearning/materials/course/{id} → Docs d'un cours (lecture)
GET    /api/elearning/materials/{id}/download → Télécharger (lecture)
DELETE /api/elearning/materials/{id}      → Supprimer doc (écriture)

# Quiz
POST   /api/elearning/quizzes             → Créer quiz (écriture)
GET    /api/elearning/quizzes/course/{id} → Quiz d'un cours (lecture)
POST   /api/elearning/quizzes/{id}/start  → Démarrer quiz (écriture)
POST   /api/elearning/quizzes/attempt/{id}/submit → Soumettre (écriture)
GET    /api/elearning/quizzes/{id}/results → Résultats (lecture)
DELETE /api/elearning/quizzes/{id}        → Supprimer quiz (écriture)

# Devoirs
POST   /api/elearning/assignments         → Créer devoir (écriture)
GET    /api/elearning/assignments/course/{id} → Devoirs cours (lecture)
POST   /api/elearning/assignments/{id}/submit → Soumettre (écriture)
GET    /api/elearning/assignments/{id}/submissions → Soumissions (lecture)
POST   /api/elearning/assignments/submission/{id}/grade → Noter (écriture)
```

#### ADMIN AVANCÉ (Réservé Admin)
```php
GET    /api/admin/students/search         → Recherche avancée (lecture)
GET    /api/admin/students/{id}/details   → Détails complets (lecture)
PUT    /api/admin/grades/{id}             → Modifier note (écriture)
GET    /api/admin/grades/{id}/history     → Historique modif (lecture)
POST   /api/admin/students/{id}/courses   → Ajouter cours (écriture)
DELETE /api/admin/students/{id}/courses/{courseId} → Retirer cours (écriture)
GET    /api/admin/kpis                    → Indicateurs (lecture)
GET    /api/admin/alerts                  → Alertes (lecture)
```

### Lien Route → Contrôleur → Modèle → BDD

**Exemple: GET /api/payment/history**

```
1. ROUTE
   /backend/routes/api.php
   Route::get('/payment/history', [PaymentController::class, 'getPaymentHistory']);

2. CONTRÔLEUR
   /backend/app/Http/Controllers/Api/PaymentController.php
   public function getPaymentHistory(Request $request) {
       $student = $this->getStudent($request);
       $payments = Payment::where('student_id', $student->id)->get();
       return response()->json($payments);
   }

3. MODÈLE
   /backend/app/Models/Payment.php
   class Payment extends Model {
       protected $fillable = ['student_fee_id', 'amount', ...];
       public function studentFee() {
           return $this->belongsTo(StudentFee::class);
       }
   }

4. BASE DE DONNÉES
   Table: payments
   SELECT * FROM payments 
   WHERE student_id = 8 
   ORDER BY payment_date DESC;
```

---

## 6. FLOW COMPLET DES DONNÉES

### Schéma Général

```
┌─────────────────────────────────────────────────────────────────┐
│                   FLOW COMPLET DES DONNÉES                       │
└─────────────────────────────────────────────────────────────────┘

1. UTILISATEUR
   ↓ (Clic, Formulaire, Action)
   
2. INTERFACE REACT
   /frontend/src/pages/student/Payment.jsx
   ↓ (api.get('/payment/history'))
   
3. AXIOS HTTP CLIENT
   /frontend/src/services/api.js
   ↓ (Ajoute token: Bearer {token})
   
4. REQUÊTE HTTP
   GET /api/payment/history
   Authorization: Bearer abc123...
   ↓ (HTTP via réseau local ou internet)
   
5. SERVEUR LARAVEL
   Backend reçoit la requête sur port 8000
   ↓
   
6. MIDDLEWARE SANCTUM
   Vérifie le token dans personal_access_tokens
   Charge $request->user()
   ↓ (Si OK, continue. Si NON, retourne 401)
   
7. ROUTER LARAVEL
   /backend/routes/api.php
   Match la route et appelle le contrôleur
   ↓
   
8. CONTRÔLEUR
   /backend/app/Http/Controllers/Api/PaymentController.php
   public function getPaymentHistory(Request $request)
   ↓
   
9. VALIDATION (si nécessaire)
   $request->validate([...])
   ↓
   
10. MODÈLE ELOQUENT
    Payment::where('student_id', $student->id)
    ↓ (Génère la requête SQL)
    
11. BASE DE DONNÉES
    MySQL exécute:
    SELECT * FROM payments WHERE student_id = 8
    ↓ (Retourne les résultats)
    
12. ELOQUENT TRANSFORME
    Convertit les résultats SQL en objets Payment
    ↓
    
13. CONTRÔLEUR RETOURNE JSON
    return response()->json($payments);
    ↓
    
14. RÉPONSE HTTP
    HTTP/1.1 200 OK
    Content-Type: application/json
    { "data": [...] }
    ↓ (Via réseau)
    
15. AXIOS REÇOIT
    Interceptor vérifie si 401 → redirect login
    ↓
    
16. REACT MET À JOUR
    setPaymentHistory(response.data.data)
    ↓
    
17. RE-RENDER
    React met à jour le DOM avec les nouvelles données
    ↓
    
18. AFFICHAGE À L'UTILISATEUR
    L'utilisateur voit ses paiements à l'écran
```

### Exemple Concret 1: Historique de Paiement

```javascript
// ========== FRONTEND ==========
// Fichier: /frontend/src/pages/student/Payment.jsx

// 1. Composant React monte
useEffect(() => {
  fetchPaymentHistory()
}, [])

// 2. Fonction appelée
const fetchPaymentHistory = async () => {
  setIsLoading(true)
  try {
    // 3. Appel API
    const response = await api.get('/payment/history')
    
    // 16. Réception réponse
    setPaymentHistory(response.data.data)
    setIsLoading(false)
  } catch (error) {
    console.error('Error:', error)
    setIsLoading(false)
  }
}

// 17-18. Affichage
return (
  <div className="payment-history">
    {paymentHistory.map(payment => (
      <PaymentCard key={payment.id} payment={payment} />
    ))}
  </div>
)
```

```php
// ========== BACKEND ==========
// Fichier: /backend/app/Http/Controllers/Api/PaymentController.php

// 8. Contrôleur appelé
public function getPaymentHistory(Request $request)
{
    // 9. Pas de validation nécessaire ici
    
    // 10. Récupère l'étudiant
    $student = $this->getStudent($request);
    
    if (!$student) {
        return response()->json(['error' => 'Student profile not found'], 404);
    }

    // 11. Eloquent construit la requête
    $payments = Payment::with('transactions')  // Charge aussi les transactions
        ->where('student_id', $student->id)    // Filtre par étudiant
        ->orderBy('payment_date', 'desc')      // Tri par date
        ->paginate(20);                        // 20 par page

    // 13. Retourne JSON
    return response()->json($payments);
}
```

```sql
-- ========== BASE DE DONNÉES ==========
-- 12. SQL généré par Eloquent

SELECT 
    payments.*,
    transactions.id as transaction_id,
    transactions.reference,
    transactions.status,
    transactions.provider_reference
FROM payments
LEFT JOIN transactions ON transactions.payment_id = payments.id
WHERE payments.student_id = 8
ORDER BY payments.payment_date DESC
LIMIT 20 OFFSET 0;

-- Résultat:
-- | id | student_fee_id | amount   | payment_date | reference_number | transaction_id | ...
-- |----|----------------|----------|--------------|------------------|----------------|-----
-- | 23 | 45             | 150000.00| 2024-01-15   | PAY-2024-001     | 12             | ...
-- | 22 | 44             | 75000.00 | 2024-01-10   | PAY-2024-002     | 11             | ...
```

### Exemple Concret 2: Consultation Cours E-Learning

```javascript
// ========== FRONTEND ==========
// /frontend/src/pages/student/ELearning.jsx

// 1. Chargement initial
useEffect(() => {
  fetchOnlineCourses()
}, [])

// 2-3. Appel API
const fetchOnlineCourses = async () => {
  try {
    const response = await api.get('/elearning/courses/student')
    setOnlineCourses(response.data.courses)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

```php
// ========== BACKEND ==========
// /backend/app/Http/Controllers/Api/ELearningController.php

public function getStudentCourses(Request $request)
{
    // Récupère l'étudiant
    $student = $this->getStudent($request);
    
    // Trouve les cours où l'étudiant est inscrit
    $enrolledCourseIds = Enrollment::where('student_id', $student->id)
        ->pluck('course_id');  // [3, 5, 7, 12]
    
    // Récupère les cours en ligne de ces cours
    $courses = OnlineCourse::with(['course', 'teacher.user'])
        ->whereIn('course_id', $enrolledCourseIds)
        ->where('status', '!=', 'cancelled')
        ->orderBy('scheduled_at', 'desc')
        ->get();
    
    return response()->json(['courses' => $courses]);
}
```

```sql
-- ========== BASE DE DONNÉES ==========

-- Requête 1: Trouver les cours de l'étudiant
SELECT course_id 
FROM enrollments 
WHERE student_id = 8 
AND status = 'enrolled';
-- Résultat: [3, 5, 7, 12]

-- Requête 2: Trouver les cours en ligne
SELECT 
    online_courses.*,
    courses.name as course_name,
    users.first_name,
    users.last_name
FROM online_courses
INNER JOIN courses ON courses.id = online_courses.course_id
INNER JOIN teachers ON teachers.id = online_courses.teacher_id
INNER JOIN users ON users.id = teachers.user_id
WHERE online_courses.course_id IN (3, 5, 7, 12)
AND online_courses.status != 'cancelled'
ORDER BY online_courses.scheduled_at DESC;
```

---

## 7. GESTION DES ERREURS

### Où Apparaissent les Erreurs 500 ?

```
┌──────────────────────────────────────────────────────────────┐
│ POINTS DE DÉFAILLANCE POSSIBLES (Erreurs 500)                │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ 1. BACKEND - CONTRÔLEUR                                      │
│    ├─ Accès à une propriété null                             │
│    │  Exemple: $request->user()->student->id                 │
│    │  Si ->student est null → Erreur 500                     │
│    │                                                          │
│    ├─ Division par zéro                                      │
│    │  Exemple: $average = $total / $count (si $count = 0)    │
│    │                                                          │
│    └─ Typo dans le code                                      │
│       Exemple: $studnet->id au lieu de $student->id          │
│                                                               │
│ 2. BASE DE DONNÉES                                           │
│    ├─ Connexion échouée (.env mal configuré)                 │
│    ├─ Table inexistante (migration non exécutée)             │
│    ├─ Colonne manquante (migration modifiée)                 │
│    └─ Contrainte de clé étrangère violée                     │
│                                                               │
│ 3. FICHIERS MANQUANTS                                        │
│    ├─ Classe controller introuvable                          │
│    ├─ Model manquant                                         │
│    └─ Fichier uploadé non accessible                         │
│                                                               │
│ 4. PERMISSIONS FICHIERS                                      │
│    ├─ /storage non writable                                  │
│    └─ /bootstrap/cache non writable                          │
│                                                               │
│ 5. MÉMOIRE/RESSOURCES                                        │
│    ├─ Mémoire PHP dépassée                                   │
│    ├─ Timeout d'exécution                                    │
│    └─ Trop de requêtes SQL (N+1 problem)                     │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Exemple d'Erreur 500 Réelle (Celle qu'on a corrigée)

```php
// AVANT (Code qui causait l'erreur 500)
public function getPaymentHistory(Request $request)
{
    // Si user()->student retourne null, PHP crash ici
    $student = $request->user()->student;
    
    $payments = Payment::where('student_id', $student->id)  // ← ERREUR si $student = null
        ->get();
    
    return response()->json($payments);
}

// Erreur générée:
// "Trying to get property 'id' of non-object"
// Code: 500 Internal Server Error
```

```php
// APRÈS (Code corrigé)
public function getPaymentHistory(Request $request)
{
    // Vérification avec gestion d'erreur explicite
    $student = $this->getStudent($request);
    
    if (!$student) {
        // Retourne 404 avec message clair
        return response()->json(['error' => 'Student profile not found'], 404);
    }
    
    $payments = Payment::where('student_id', $student->id)
        ->get();
    
    return response()->json($payments);
}

// Maintenant: Erreur 404 propre au lieu de 500
```

### Comment Diagnostiquer les Erreurs

#### 1. LOGS LARAVEL
```bash
# Fichier principal des logs
/backend/storage/logs/laravel.log

# Contenu typique d'une erreur:
[2024-01-20 14:30:00] local.ERROR: 
Trying to get property 'id' of non-object 
{
    "exception": "ErrorException",
    "file": "/backend/app/Http/Controllers/Api/PaymentController.php",
    "line": 58,
    "trace": [...]
}
```

#### 2. CONSOLE NAVIGATEUR (Frontend)
```javascript
// Console du navigateur (F12)

// Erreur Axios typique:
Error: Request failed with status code 500
    at createError (axios.js:123)
    at settle (axios.js:456)

// Inspecter la réponse:
console.log(error.response.data)    // Message d'erreur
console.log(error.response.status)  // 500
```

#### 3. DEBUG MODE LARAVEL
```php
// /backend/.env

// En développement:
APP_ENV=local
APP_DEBUG=true  // Affiche les erreurs détaillées

// En production:
APP_ENV=production
APP_DEBUG=false  // Cache les erreurs pour la sécurité
```

#### 4. OUTILS DE DEBUG

**Laravel Telescope** (Recommandé)
```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate

# Accès: http://localhost:8000/telescope
# Voit toutes les requêtes, erreurs, queries SQL
```

**Laravel Debugbar**
```bash
composer require barryvdh/laravel-debugbar --dev

# Barre de debug en bas de l'écran
# Affiche: queries SQL, temps d'exécution, mémoire
```

### Améliorer la Gestion des Erreurs

#### BACKEND - Gestionnaire d'Exceptions
```php
// /backend/app/Exceptions/Handler.php

public function register()
{
    $this->renderable(function (Exception $e, Request $request) {
        // Si c'est une requête API
        if ($request->is('api/*')) {
            
            // Erreur de validation
            if ($e instanceof ValidationException) {
                return response()->json([
                    'error' => 'Validation failed',
                    'messages' => $e->errors()
                ], 422);
            }
            
            // Modèle introuvable
            if ($e instanceof ModelNotFoundException) {
                return response()->json([
                    'error' => 'Resource not found'
                ], 404);
            }
            
            // Erreur SQL
            if ($e instanceof QueryException) {
                Log::error('Database error', [
                    'message' => $e->getMessage(),
                    'sql' => $e->getSql()
                ]);
                
                return response()->json([
                    'error' => 'Database error occurred'
                ], 500);
            }
            
            // Toute autre erreur
            Log::error('Unexpected error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'An unexpected error occurred'
            ], 500);
        }
    });
}
```

#### FRONTEND - Intercepteur Axios Global
```javascript
// /frontend/src/services/api.js

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Erreur réseau (serveur inaccessible)
    if (!error.response) {
      toast.error('Serveur inaccessible. Vérifiez votre connexion.')
      return Promise.reject(error)
    }
    
    // Erreur 401: Token invalide
    if (error.response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      toast.error('Session expirée. Reconnectez-vous.')
    }
    
    // Erreur 403: Accès refusé
    if (error.response.status === 403) {
      toast.error('Accès refusé.')
    }
    
    // Erreur 404: Ressource introuvable
    if (error.response.status === 404) {
      toast.error('Ressource introuvable.')
    }
    
    // Erreur 422: Validation échouée
    if (error.response.status === 422) {
      const errors = error.response.data.errors
      Object.values(errors).flat().forEach(msg => toast.error(msg))
    }
    
    // Erreur 500: Erreur serveur
    if (error.response.status === 500) {
      toast.error('Erreur serveur. Contactez l\'administrateur.')
      console.error('Server error:', error.response.data)
    }
    
    return Promise.reject(error)
  }
)
```

---

## 8. SCHÉMA FINAL

### Architecture Complète ASCII

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                     APPLICATION ESL - ARCHITECTURE FINALE                      ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                                ║
║  ┌─────────────────────────────┐                                              ║
║  │      UTILISATEUR            │                                              ║
║  │  (Navigateur Web)           │                                              ║
║  └──────────────┬──────────────┘                                              ║
║                 │                                                              ║
║                 │ HTTP/HTTPS                                                   ║
║                 ↓                                                              ║
║  ╔══════════════════════════════════════════════════════════════════════════╗ ║
║  ║              FRONTEND (React.js) - Port 5173                             ║ ║
║  ╠══════════════════════════════════════════════════════════════════════════╣ ║
║  ║                                                                           ║ ║
║  ║  ┌───────────────┐  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐ ║ ║
║  ║  │    Pages      │  │  Components  │  │   Context   │  │   Services   │ ║ ║
║  ║  │               │  │              │  │             │  │              │ ║ ║
║  ║  │ - Login       │  │ - Sidebar    │  │ - Auth      │  │ - api.js     │ ║ ║
║  ║  │ - Dashboard   │  │ - Header     │  │ - Theme     │  │ - Axios      │ ║ ║
║  ║  │ - Payment     │  │ - Table      │  │             │  │              │ ║ ║
║  ║  │ - ELearning   │  │ - Modal      │  │             │  │              │ ║ ║
║  ║  │ - Fees        │  │ - Chatbot    │  │             │  │              │ ║ ║
║  ║  └───────────────┘  └──────────────┘  └─────────────┘  └──────────────┘ ║ ║
║  ║                                                                           ║ ║
║  ║  Technologies: React 18, Vite 4, Tailwind CSS, Framer Motion             ║ ║
║  ║  Storage: localStorage (token)                                           ║ ║
║  ║                                                                           ║ ║
║  ╚════════════════════════════════════════╤══════════════════════════════════╝ ║
║                                           │                                    ║
║                                           │ HTTP REST API                      ║
║                                           │ JSON                               ║
║                                           │ Headers: Authorization Bearer      ║
║                                           ↓                                    ║
║  ╔══════════════════════════════════════════════════════════════════════════╗ ║
║  ║              BACKEND (Laravel) - Port 8000                               ║ ║
║  ╠══════════════════════════════════════════════════════════════════════════╣ ║
║  ║                                                                           ║ ║
║  ║  ┌────────────────────────────────────────────────────────────────────┐  ║ ║
║  ║  │                         ROUTES (api.php)                            │  ║ ║
║  ║  │  /api/login, /api/payment/history, /api/elearning/courses/student  │  ║ ║
║  ║  └─────────────────────────────┬───────────────────────────────────────  ║ ║
║  ║                                │                                         ║ ║
║  ║  ┌────────────────────────────↓────────────────────────────────────┐   ║ ║
║  ║  │                      MIDDLEWARE                                  │   ║ ║
║  ║  │  - auth:sanctum (vérifie token)                                 │   ║ ║
║  ║  │  - role:admin (vérifie rôle)                                    │   ║ ║
║  ║  └─────────────────────────────┬──────────────────────────────────┘   ║ ║
║  ║                                │                                         ║ ║
║  ║  ┌────────────────────────────↓────────────────────────────────────┐   ║ ║
║  ║  │                      CONTROLLERS                                 │   ║ ║
║  ║  │  - AuthController                                                │   ║ ║
║  ║  │  - PaymentController      → getPaymentHistory()                 │   ║ ║
║  ║  │  - ELearningController    → getStudentCourses()                 │   ║ ║
║  ║  │  - StudentController                                             │   ║ ║
║  ║  │  - AdminController                                               │   ║ ║
║  ║  └─────────────────────────────┬──────────────────────────────────┘   ║ ║
║  ║                                │                                         ║ ║
║  ║  ┌────────────────────────────↓────────────────────────────────────┐   ║ ║
║  ║  │                      MODELS (Eloquent ORM)                       │   ║ ║
║  ║  │  - User, Student, Teacher                                        │   ║ ║
║  ║  │  - Payment, Transaction                                          │   ║ ║
║  ║  │  - OnlineCourse, Quiz, Assignment                                │   ║ ║
║  ║  │  - Enrollment, Grade, Attendance                                 │   ║ ║
║  ║  └─────────────────────────────┬──────────────────────────────────┘   ║ ║
║  ║                                │                                         ║ ║
║  ║  Technologies: PHP 7.4+, Laravel 10, Sanctum                            ║ ║
║  ║                                                                           ║ ║
║  ╚════════════════════════════════════════╤══════════════════════════════════╝ ║
║                                           │                                    ║
║                                           │ SQL Queries                        ║
║                                           │ SELECT, INSERT, UPDATE, DELETE     ║
║                                           ↓                                    ║
║  ╔══════════════════════════════════════════════════════════════════════════╗ ║
║  ║              BASE DE DONNÉES (MySQL/MariaDB)                             ║ ║
║  ╠══════════════════════════════════════════════════════════════════════════╣ ║
║  ║                                                                           ║ ║
║  ║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  ║ ║
║  ║  │   USERS      │  │  STUDENTS    │  │  TEACHERS    │  │  COURSES    │  ║ ║
║  ║  │              │  │              │  │              │  │             │  ║ ║
║  ║  │ - id (PK)    │  │ - id (PK)    │  │ - id (PK)    │  │ - id (PK)   │  ║ ║
║  ║  │ - username   │  │ - user_id FK │  │ - user_id FK │  │ - name      │  ║ ║
║  ║  │ - password   │  │ - student_id │  │ - dept_id FK │  │ - code      │  ║ ║
║  ║  │ - role       │  │ - level      │  │ - specialty  │  │ - credits   │  ║ ║
║  ║  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘  ║ ║
║  ║                                                                           ║ ║
║  ║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  ║ ║
║  ║  │ ENROLLMENTS  │  │   PAYMENTS   │  │ TRANSACTIONS │  │   GRADES    │  ║ ║
║  ║  │              │  │              │  │              │  │             │  ║ ║
║  ║  │ - id (PK)    │  │ - id (PK)    │  │ - id (PK)    │  │ - id (PK)   │  ║ ║
║  ║  │ - student FK │  │ - st_fee FK  │  │ - student FK │  │ - enroll FK │  ║ ║
║  ║  │ - class FK   │  │ - amount     │  │ - reference  │  │ - value     │  ║ ║
║  ║  │ - status     │  │ - method     │  │ - status     │  │ - grade     │  ║ ║
║  ║  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘  ║ ║
║  ║                                                                           ║ ║
║  ║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  ║ ║
║  ║  │ONLINE_COURSES│  │   QUIZZES    │  │ ASSIGNMENTS  │  │ MATERIALS   │  ║ ║
║  ║  │              │  │              │  │              │  │             │  ║ ║
║  ║  │ - id (PK)    │  │ - id (PK)    │  │ - id (PK)    │  │ - id (PK)   │  ║ ║
║  ║  │ - course FK  │  │ - course FK  │  │ - course FK  │  │ - course FK │  ║ ║
║  ║  │ - teacher FK │  │ - teacher FK │  │ - title      │  │ - file_path │  ║ ║
║  ║  │ - status     │  │ - duration   │  │ - due_date   │  │ - type      │  ║ ║
║  ║  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘  ║ ║
║  ║                                                                           ║ ║
║  ║  TOTAL: 30 Tables avec Relations (Foreign Keys, Indexes)                 ║ ║
║  ║  Stockage: XAMPP/MAMP - MariaDB 10.x                                     ║ ║
║  ║                                                                           ║ ║
║  ╚═══════════════════════════════════════════════════════════════════════════╝ ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
```

### Résumé Simple: "Qui Fait Quoi, Quand et Comment"

#### QUI FAIT QUOI ?

| **Acteur** | **Rôle** | **Responsabilités** |
|------------|----------|---------------------|
| **Frontend (React)** | Interface utilisateur | • Affiche les pages<br>• Capture les actions<br>• Envoie requêtes HTTP<br>• Stocke le token |
| **Backend (Laravel)** | Logique métier | • Reçoit les requêtes<br>• Authentifie<br>• Valide les données<br>• Traite la logique<br>• Retourne JSON |
| **BDD (MySQL)** | Stockage | • Stocke les données<br>• Exécute les requêtes SQL<br>• Maintient l'intégrité |
| **Sanctum** | Authentification | • Génère les tokens<br>• Vérifie les tokens<br>• Charge l'utilisateur |
| **Eloquent ORM** | Mapping | • Convertit objets ↔ SQL<br>• Gère les relations<br>• Simplifie les requêtes |

#### QUAND ?

| **Moment** | **Action** | **Flow** |
|------------|------------|----------|
| **Login** | Utilisateur se connecte | Frontend → Backend → BDD (vérifie user) → Génère token → Retourne au frontend |
| **Page charge** | Données affichées | Frontend → API → Backend (vérifie token) → BDD (lit données) → Retourne JSON → Frontend affiche |
| **Soumission** | Utilisateur soumet formulaire | Frontend (valide) → API → Backend (valide + auth) → BDD (insert) → Confirme → Frontend affiche succès |
| **Erreur** | Quelque chose échoue | Backend log → Retourne erreur HTTP → Frontend intercepte → Affiche toast notification |

#### COMMENT ?

**Communication Frontend ↔ Backend:**
- **Protocole:** HTTP/HTTPS
- **Format:** JSON
- **Authentification:** Bearer Token (Sanctum)
- **Bibliothèque:** Axios

**Communication Backend ↔ Base de Données:**
- **Protocole:** MySQL Protocol (TCP/IP)
- **ORM:** Eloquent (Laravel)
- **Requêtes:** SQL (automatique via Eloquent)
- **Configuration:** `.env` (DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD)

**Stockage du Token:**
- **Où:** `localStorage` du navigateur
- **Clé:** `'token'`
- **Format:** String (JWT token)
- **Utilisation:** Ajouté dans header `Authorization: Bearer {token}` à chaque requête

---

## CONCLUSION

### Points Clés de TON Architecture

1. **Architecture 3-Tiers Classique**
   - Frontend (Présentation) - React
   - Backend (Logique) - Laravel
   - Base de Données (Stockage) - MySQL

2. **Communication REST API**
   - Requêtes HTTP avec JSON
   - Authentification par token Sanctum
   - Routes protégées par middleware

3. **30 Tables Interconnectées**
   - Relations claires (Foreign Keys)
   - Intégrité référentielle
   - Index pour performance

4. **Sécurité Multicouche**
   - Mots de passe hashés (bcrypt)
   - Tokens d'authentification
   - Validation des données
   - Protection CSRF

5. **Flow de Données Unidirectionnel**
   - User → React → Axios → Laravel → Eloquent → MySQL
   - MySQL → Eloquent → Laravel → JSON → React → DOM

### Prochaines Améliorations Recommandées

1. **Sécurité**
   - Ajouter expiration de tokens
   - Implémenter refresh tokens
   - Rate limiting sur login
   - 2FA (Two-Factor Authentication)

2. **Performance**
   - Cache (Redis)
   - Lazy loading images
   - Pagination côté serveur
   - Optimisation requêtes SQL (éviter N+1)

3. **Monitoring**
   - Laravel Telescope (développement)
   - Sentry (erreurs production)
   - Logs structurés
   - Métriques performance

4. **Testing**
   - Tests unitaires (PHPUnit)
   - Tests d'intégration
   - Tests E2E (Cypress)

---

**FIN DE LA DOCUMENTATION COMPLÈTE**

*Document créé le: 2024-01-20*  
*Projet: ESL - École de Santé de Libreville*  
*Version: 1.0*
