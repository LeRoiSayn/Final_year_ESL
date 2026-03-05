# ESL - Système de Gestion Universitaire

## École de Santé de Libreville

> **Système de gestion universitaire complet** avec plateforme e-learning intégrée, construit avec React.js et Laravel.

![ESL University](https://img.shields.io/badge/ESL-University-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge&logo=react)
![Laravel](https://img.shields.io/badge/Laravel-10-red?style=for-the-badge&logo=laravel)
![MySQL](https://img.shields.io/badge/MySQL-8-orange?style=for-the-badge&logo=mysql)
![Vite](https://img.shields.io/badge/Vite-5.1-purple?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)

---

## Table des Matières / Table of Contents

1. [Identifiants de Connexion / Login Credentials](#-identifiants-de-connexion--login-credentials)
2. [Technologies Utilisées / Technologies Used](#-technologies-utilisées--technologies-used)
3. [Architecture du Système / System Architecture](#-architecture-du-système--system-architecture)
4. [Installation & Lancement / Installation & Startup](#-installation--lancement--installation--startup)
5. [Rôles & Fonctionnalités / Roles & Features](#-rôles--fonctionnalités--roles--features)
6. [Comment Chaque Action Fonctionne / How Every Action Works](#-comment-chaque-action-fonctionne--how-every-action-works)
7. [Plateforme E-Learning](#-plateforme-e-learning)
8. [Système de Paiement / Payment System](#-système-de-paiement--payment-system)
9. [API Endpoints](#-api-endpoints)
10. [Base de Données / Database](#-base-de-données--database)
11. [Authentification & Sécurité / Authentication & Security](#-authentification--sécurité--authentication--security)
12. [Multilingue / Multilingual](#-multilingue--multilingual)
13. [Structure du Projet / Project Structure](#-structure-du-projet--project-structure)

---

## 🔑 Identifiants de Connexion / Login Credentials

### Comptes Administratifs / Administrative Accounts

| Rôle / Role | Username | Password | Email |
|-------------|----------|----------|-------|
| **Administrateur / Admin** | `admin` | `admin123` | admin@esl.local |
| **Finance** | `finance1` | `password123` | finance1@esl.local |
| **Secrétariat / Registrar** | `registrar1` | `password123` | registrar1@esl.local |

### Comptes Enseignants / Teacher Accounts

| Username | Password | Email | Département |
|----------|----------|-------|-------------|
| `teacher_1` | `password` | teacher0@unilak.ac.ke | Biology |
| `teacher_2` | `password` | teacher1@unilak.ac.ke | Immunology |
| `teacher_3` | `password` | teacher2@unilak.ac.ke | Biology |
| ... | `password` | ... | ... |
| `teacher_15` | `password` | teacher14@unilak.ac.ke | Immunology |

> **Note :** 15 enseignants créés. Username = `teacher_1` à `teacher_15`. Mot de passe = `password` pour tous.

### Comptes Étudiants / Student Accounts`

| Username | Password | Email | Département |
|----------|----------|-------|-------------|
| `student_1` | `password` | student0@unilak.ac.ke | Biology |
| `student_2` | `password` | student1@unilak.ac.ke | Immunology |
| `student_3` | `password` | student2@unilak.ac.ke | Biology |
| ... | `password` | ... | ... |
| `student_40` | `password` | student39@unilak.ac.ke | Immunology |

> **Note :** 40 étudiants créés. Username = `student_1` à `student_40`. Mot de passe = `password` pour tous.

### Comment se connecter / How to login

1. Ouvrir `http://localhost:5173/login`
2. Entrer le **Username** (ou l'**Email**) et le **Password**
3. Cliquer sur **Sign In** / **Se Connecter**
4. Vous serez redirigé vers le dashboard correspondant à votre rôle

---

## 🛠 Technologies Utilisées / Technologies Used

### Frontend (Interface Utilisateur)

| Technologie | Version | Rôle / Purpose |
|------------|---------|----------------|
| **React.js** | 18.2.0 | Bibliothèque UI principale / Main UI library |
| **React DOM** | 18.2.0 | Rendu dans le navigateur / Browser rendering |
| **React Router DOM** | 6.22.1 | Navigation et routing / Page navigation |
| **Vite** | 5.1.4 | Build tool rapide / Fast build tool |
| **Tailwind CSS** | 3.4.1 | Framework CSS utility-first / CSS styling |
| **Framer Motion** | 11.0.5 | Animations fluides / Smooth animations |
| **Axios** | 1.6.7 | Client HTTP pour requêtes API / HTTP client |
| **Chart.js** | 4.4.1 | Graphiques et statistiques / Charts & stats |
| **React-Chartjs-2** | 5.2.0 | Wrapper React pour Chart.js |
| **@headlessui/react** | 1.7.18 | Composants UI accessibles / Accessible UI |
| **@heroicons/react** | 2.1.1 | Icônes SVG / SVG icons |
| **React Hot Toast** | 2.4.1 | Notifications toast / Toast notifications |
| **date-fns** | 3.3.1 | Manipulation de dates / Date formatting |
| **PostCSS** | 8.4.35 | Traitement CSS / CSS processing |
| **Autoprefixer** | 10.4.17 | Préfixes navigateurs / Browser prefixes |
| **ESLint** | 8.56.0 | Qualité du code / Code quality |

### Backend (API & Logique Métier)

| Technologie | Version | Rôle / Purpose |
|------------|---------|----------------|
| **PHP** | 8.1+ | Langage serveur / Server language |
| **Laravel Framework** | 10.0 | Framework MVC API REST |
| **Laravel Sanctum** | 3.2 | Authentification par tokens / Token auth |
| **Eloquent ORM** | (Laravel) | Mapping objet-relationnel / Object-relational mapping |
| **Guzzle HTTP** | 7.2 | Client HTTP pour requêtes externes / External HTTP |
| **Laravel Tinker** | 2.8 | REPL interactif / Interactive REPL |
| **Laravel Pint** | 1.0 | Formatage du code / Code formatting |
| **PHPUnit** | 10.1 | Tests unitaires / Unit testing |
| **Mockery** | 1.4.4 | Mocking pour tests / Test mocking |
| **FakerPHP** | 1.9.1 | Génération de données / Data generation |

### Base de Données / Database

| Technologie | Version | Rôle / Purpose |
|------------|---------|----------------|
| **MySQL / MariaDB** | 8.0+ | Base de données relationnelle / Relational database |
| **Migrations Laravel** | — | Gestion du schéma / Schema management |

### E-Learning

| Technologie | Rôle / Purpose |
|------------|----------------|
| **Laravel Storage** | Stockage fichiers (PDF, DOC, PPT) / File storage |
| **File System + Symlinks** | Accès public sécurisé / Secure public access |
| **JavaScript Timer** | Chronomètre quiz / Quiz timer |
| **LocalStorage** | Sauvegarde temporaire réponses / Temp answer save |
| **Multipart Form Data** | Upload fichiers multiples / Multi-file upload |
| **WebRTC** (prévu) | Visioconférence / Video conferencing |

### Sécurité / Security

| Technologie | Rôle / Purpose |
|------------|----------------|
| **Laravel Sanctum** | Tokens API / API token auth |
| **Bcrypt** | Hashage mots de passe / Password hashing |
| **CSRF Protection** | Protection CSRF (API exempted) |
| **CORS** | Cross-Origin Resource Sharing |
| **Role Middleware** | Protection routes par rôle / Role-based routing |

### Serveur & Outils / Server & Tools

| Technologie | Rôle / Purpose |
|------------|----------------|
| **XAMPP / MAMP** | Serveur local / Local server |
| **Composer** | Dépendances PHP / PHP dependencies |
| **NPM** | Dépendances JS / JS dependencies |
| **Apache / PHP-FPM** | Serveur HTTP / HTTP server |

---

## 🏗 Architecture du Système / System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                       APPLICATION ESL                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐       ┌─────────────────┐       ┌────────────┐ │
│  │    FRONTEND      │◄─────►│     BACKEND      │◄─────►│  DATABASE   │ │
│  │   (React.js)     │ HTTP  │    (Laravel)     │  SQL  │  (MySQL)   │ │
│  │                  │ API   │                  │      │            │ │
│  │  Port: 5173      │       │  Port: 8000      │      │  30+ Tables│ │
│  └─────────────────┘       └─────────────────┘       └────────────┘ │
│        │                           │                        │       │
│  [Vite + React]           [PHP + Laravel]           [MariaDB/MySQL] │
│  Tailwind CSS             Sanctum Auth              Relations FK    │
│  Axios HTTP               Controllers              Migrations      │
│  React Router             Eloquent ORM              Seeders         │
│  I18n (FR/EN)             Middleware                                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Flux de Données / Data Flow

```
UTILISATEUR / USER
    ↓ (Clic, formulaire / Click, form)
INTERFACE REACT (composant .jsx)
    ↓ (api.get('/api/...') ou api.post('/api/...'))
AXIOS HTTP CLIENT
    ↓ (Ajoute token / Adds token: Authorization: Bearer {token})
VITE DEV PROXY (localhost:5173 → localhost:8000)
    ↓
SERVEUR LARAVEL (localhost:8000)
    ↓
MIDDLEWARE SANCTUM (Vérifie token / Verifies token)
    ↓
MIDDLEWARE ROLE (Vérifie rôle / Verifies role: admin, student, teacher...)
    ↓
ROUTER LARAVEL (routes/api.php)
    ↓
CONTROLLER (Logique métier / Business logic)
    ↓
MODÈLE ELOQUENT (Query builder → SQL)
    ↓
BASE DE DONNÉES MySQL (SELECT, INSERT, UPDATE...)
    ↓ Résultats / Results
ELOQUENT (Convertit en objets PHP / Converts to PHP objects)
    ↓
CONTROLLER (return response()->json([...]))
    ↓
RÉPONSE HTTP JSON
    ↓
AXIOS (response.data)
    ↓
REACT (setState / useState)
    ↓
DOM (Affichage dans le navigateur / Browser display)
```

---

## 🚀 Installation & Lancement / Installation & Startup

### Prérequis / Prerequisites

- **PHP** 8.1+
- **Composer** (gestionnaire dépendances PHP)
- **Node.js** 18+ et **NPM**
- **MySQL** 8.0+ ou **MariaDB** 10.3+
- **XAMPP/MAMP** (optionnel)

### 1. Backend (API Laravel)

```bash
# Naviguer vers le backend
cd backend

# Installer les dépendances PHP
composer install

# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate

# Configurer la base de données dans .env :
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=esl_university
# DB_USERNAME=root
# DB_PASSWORD=

# Créer la base de données
mysql -u root -e "CREATE DATABASE IF NOT EXISTS esl_university;"

# Exécuter les migrations et remplir les données
php artisan migrate:fresh --seed

# Créer le lien symbolique pour les fichiers uploadés
php artisan storage:link

# Démarrer le serveur Laravel
php artisan serve
# → Accessible sur http://localhost:8000
```

### 2. Frontend (React.js)

```bash
# Dans un nouveau terminal
cd frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
# → Accessible sur http://localhost:5173
```

### 3. Vérification

- Ouvrir **http://localhost:5173** dans le navigateur
- Se connecter avec `admin` / `admin123`
- Les deux serveurs doivent tourner en même temps

---

## 👥 Rôles & Fonctionnalités / Roles & Features

### 1. Administrateur / Admin (`admin`)

| Fonctionnalité | Description |
|----------------|-------------|
| **Dashboard** | Vue globale : nombre d'étudiants, enseignants, cours, graphiques |
| **Facultés** | Créer, modifier, supprimer des facultés |
| **Départements** | Gérer les départements par faculté |
| **Cours** | Créer/modifier des cours (code, nom, crédits, niveau LMD) |
| **Classes** | Créer des classes, assigner enseignants et salles |
| **Gestion Étudiants** | Recherche, profils, assignation de cours par étudiant |
| **Gestion Enseignants** | Recherche, profils, assignation de cours par enseignant |
| **Inscription Auto** | Inscrire en masse des étudiants dans leurs cours |
| **Rapports** | Statistiques académiques et financières |
| **Journal d'Activité** | Historique de toutes les actions système |
| **Paramètres** | Thème, langue, notifications, widgets |

### 2. Secrétariat / Registrar (`registrar1`)

| Fonctionnalité | Description |
|----------------|-------------|
| **Dashboard** | Statistiques d'inscriptions |
| **Étudiants** | Créer, modifier, consulter les profils étudiants |
| **Enseignants** | Créer, modifier, consulter les profils enseignants |
| **Paramètres** | Personnalisation de l'interface |

### 3. Finance (`finance1`)

| Fonctionnalité | Description |
|----------------|-------------|
| **Dashboard** | Revenus, paiements du jour, statistiques financières |
| **Types de Frais** | Créer/modifier les catégories de frais (scolarité, labo, etc.) |
| **Frais Étudiants** | Attribuer des frais aux étudiants |
| **Paiements** | Enregistrer et consulter les paiements |
| **Paramètres** | Personnalisation |

### 4. Enseignant / Teacher (`teacher_1` à `teacher_15`)

| Fonctionnalité | Description |
|----------------|-------------|
| **Dashboard** | Classes assignées, nombre d'étudiants |
| **Mes Classes** | Voir les classes et étudiants inscrits |
| **E-Learning** | Créer cours en ligne, documents, quiz, devoirs |
| **Notes** | Saisir les notes (CA + Examen) |
| **Présences** | Marquer les présences par séance |
| **Emploi du Temps** | Consulter son planning |
| **Paramètres** | Thème, langue, notifications |

### 5. Étudiant / Student (`student_1` à `student_40`)

| Fonctionnalité | Description |
|----------------|-------------|
| **Dashboard** | Cours inscrits, notes récentes, présences |
| **Mes Cours** | Liste des cours où l'étudiant est inscrit |
| **E-Learning** | Rejoindre cours live, télécharger docs, quiz, devoirs |
| **Notes** | Consulter ses notes par cours |
| **Présences** | Consulter son historique de présence |
| **Emploi du Temps** | Voir son planning de cours |
| **Frais** | Consulter le détail de ses frais (lecture seule) |
| **Paiement** | Effectuer un paiement (carte bancaire, PayPal) |
| **Paramètres** | Thème, langue, notifications |

---

## 🔄 Comment Chaque Action Fonctionne / How Every Action Works

### Connexion / Login

```
1. L'utilisateur saisit username + password sur /login
2. Le frontend envoie POST /api/login { username, password }
3. Laravel AuthController::login() :
   - Cherche l'utilisateur par username OU email
   - Vérifie le mot de passe avec Hash::check()
   - Si OK : crée un token Sanctum, retourne { token, user, role }
   - Si KO : retourne erreur 401
4. Le frontend stocke le token dans localStorage
5. Toutes les requêtes suivantes incluent le header :
   Authorization: Bearer {token}
6. Redirection vers /{role} (ex: /admin, /student, /teacher)
```

### Création d'un Étudiant (par Admin ou Registrar)

```
1. Admin va dans Gestion Étudiants → Nouveau
2. Remplit le formulaire (nom, email, département, niveau)
3. POST /api/students { first_name, last_name, email, department_id, level }
4. StudentController::store() :
   - Valide les données (required, unique email, exists department_id)
   - Crée un User (role = 'student', password hashé)
   - Crée un Student lié au User
   - Retourne le profil complet
5. Le frontend ajoute l'étudiant à la liste
```

### Assignation de Cours à un Étudiant

```
1. Admin ouvre le profil d'un étudiant
2. Clique "Assigner un cours"
3. Sélectionne le cours dans la liste
4. POST /api/students/{id}/courses { course_id }
5. Le backend :
   - Trouve ou crée une classe pour ce cours
   - Crée une inscription (Enrollment) student_id + class_id
   - Ne duplique pas si déjà inscrit
6. L'étudiant voit maintenant ce cours dans son tableau de bord
```

### Saisie de Notes (par l'Enseignant)

```
1. L'enseignant va dans Notes → Sélectionne une classe
2. Voit la liste des étudiants inscrits
3. Saisit les notes CA (Contrôle Continu) et Examen pour chaque étudiant
4. POST /api/grades { enrollment_id, ca_score, exam_score }
5. GradeController::store() :
   - Valide les scores (0-100)
   - Calcule la note finale (ca * 0.4 + exam * 0.6)
   - Sauvegarde dans la table grades
6. L'étudiant voit ses notes mises à jour dans Notes
```

### Marquage des Présences (par l'Enseignant)

```
1. L'enseignant va dans Présences → Sélectionne une classe et une date
2. Coche chaque étudiant comme Présent / Absent / En retard
3. POST /api/attendance { class_id, date, records: [{student_id, status}] }
4. AttendanceController::store() :
   - Crée un enregistrement par étudiant pour cette date
   - Statut : present / absent / late / excused
5. L'étudiant voit son historique de présence mis à jour
```

### Gestion des Frais (par Finance)

```
1. Finance crée les types de frais : POST /api/fee-types { name, amount }
2. Finance attribue des frais aux étudiants : POST /api/student-fees { student_id, fee_type_id }
3. L'étudiant voit ses frais dans la page Frais :
   - Scolarité : 500,000 FCFA — Solde : 500,000 FCFA — Statut : Impayé
4. Quand l'étudiant paie, le solde est mis à jour automatiquement
```

### Paiement par l'Étudiant

```
1. L'étudiant va dans Paiement
2. Choisit la méthode : Carte bancaire ou PayPal
3. Saisit le montant et les détails
4. POST /api/payment/initialize { amount, payment_method, card_number... }
5. PaymentController::initializePayment() :
   - Crée une transaction (status = pending)
   - Si un provider externe est configuré → redirige vers le provider
   - Sinon → auto-confirme le paiement immédiatement
   - Met à jour le statut de la transaction (completed)
6. Le frontend affiche la confirmation
7. L'historique de paiement et le solde des frais sont mis à jour
```

### E-Learning : Upload de Document (par l'Enseignant)

```
1. L'enseignant va dans E-Learning → Sélectionne un cours → Documents
2. Clique "Uploader" → Choisit un fichier (PDF, DOC, PPT)
3. POST /api/elearning/materials (multipart/form-data)
   { course_id, title, description, file }
4. ELearningController::uploadMaterial() :
   - Vérifie que l'enseignant enseigne bien ce cours
   - Valide le fichier (type, taille max 10MB)
   - Stocke dans storage/app/public/materials/{course_id}/
   - Crée l'enregistrement dans course_materials
5. Les étudiants inscrits au cours voient le document et peuvent le télécharger
```

### E-Learning : Création de Quiz (par l'Enseignant)

```
1. L'enseignant va dans E-Learning → Quiz → Créer un quiz
2. Remplit : titre, cours, durée, nombre de tentatives, score de passage
3. Ajoute des questions :
   - Question texte
   - 4 options de réponse
   - Marque la réponse correcte
   - Points par question
4. POST /api/elearning/quizzes { course_id, title, duration, questions: [...] }
5. ELearningController::createQuiz() :
   - Crée le quiz
   - Crée les questions liées
   - Statut : draft → publish pour rendre visible
6. POST /api/elearning/quizzes/{id}/publish → quiz visible aux étudiants
```

### E-Learning : Passer un Quiz (par l'Étudiant)

```
1. L'étudiant va dans E-Learning → Quiz → Voit les quiz disponibles
2. Clique "Commencer" → POST /api/elearning/quizzes/{id}/start
3. Le backend crée un quiz_attempt (start_time = now)
4. Le frontend affiche les questions avec un chronomètre
5. L'étudiant répond aux questions
6. POST /api/elearning/quizzes/attempt/{id}/submit { answers: [...] }
7. Le backend :
   - Compare chaque réponse à la bonne réponse
   - Calcule le score total
   - Marque la tentative comme complétée
   - Détermine si réussi ou échoué (vs score de passage)
8. L'étudiant voit immédiatement son résultat
```

### E-Learning : Devoir / Assignment

```
ENSEIGNANT :
1. Crée un devoir : POST /api/elearning/assignments
   { course_id, title, description, due_date, total_points }
2. Publie le devoir → visible aux étudiants
3. Consulte les soumissions : GET /api/elearning/assignments/{id}/submissions
4. Télécharge et note : POST /api/elearning/assignments/submission/{id}/grade

ÉTUDIANT :
1. Voit les devoirs pour ses cours : GET /api/elearning/assignments/course/{id}
2. Upload sa soumission : POST /api/elearning/assignments/{id}/submit
   (fichier PDF/DOC + texte optionnel)
3. Voit le statut : Soumis / En attente / En retard
4. Reçoit la note et le feedback de l'enseignant
```

### Changement de Langue / Language Switch

```
1. L'utilisateur va dans Paramètres → Langue
2. Clique sur 🇫🇷 Français ou 🇬🇧 English
3. Le changement est IMMÉDIAT (pas besoin de sauvegarder)
4. Le I18nProvider met à jour la langue globalement
5. Tous les composants utilisant t('clé') se re-rendent
6. Le choix est sauvegardé dans localStorage + serveur
7. Au prochain chargement, la langue est restaurée
```

### Changement de Thème / Theme Switch

```
1. Cliquer sur l'icône 🌙/☀️ dans le header → toggle sombre/clair
2. Ou aller dans Paramètres → Apparence → Clair / Sombre / Système
3. La classe CSS 'dark' est ajoutée/retirée sur <html>
4. Tailwind CSS applique les styles dark: automatiquement
5. Préférence sauvegardée dans localStorage
```

---

## 🎓 Plateforme E-Learning

### Vue d'Ensemble

La plateforme e-learning permet aux enseignants de créer du contenu pédagogique et aux étudiants d'y accéder selon leurs inscriptions.

### Modules E-Learning

#### 1. Cours en Ligne (Online Courses)

- **Enseignant** : Créer une session (live ou enregistrée), planifier date/heure, définir la durée
- **Étudiant** : Rejoindre les sessions en direct, voir l'historique des cours
- **Table BDD** : `online_courses`, `online_course_attendance`

#### 2. Documents de Cours (Course Materials)

- **Enseignant** : Uploader PDF, DOC, DOCX, PPT, PPTX, images. Ajouter titre + description.
- **Étudiant** : Voir et télécharger les documents de ses cours
- **Table BDD** : `course_materials`
- **Stockage** : `/backend/storage/app/public/materials/{course_id}/`

#### 3. Quiz Interactifs

- **Enseignant** : Créer quiz avec questions à choix multiple, définir durée, tentatives max, score de passage, date limite
- **Étudiant** : Passer le quiz avec chronomètre, soumettre, voir le score immédiatement
- **Correction automatique** : Le système compare les réponses et calcule le score
- **Tables BDD** : `quizzes`, `quiz_questions`, `quiz_attempts`

#### 4. Devoirs (Assignments)

- **Enseignant** : Créer avec instructions, date limite, points totaux. Voir les soumissions, noter.
- **Étudiant** : Voir les devoirs, uploader fichier (PDF, DOC), voir statut de soumission
- **Tables BDD** : `assignments`, `assignment_submissions`
- **Stockage** : `/backend/storage/app/public/assignments/{assignment_id}/`

### Contrôle d'Accès E-Learning

- Les **enseignants** ne voient que les cours qu'ils enseignent
- Les **étudiants** ne voient que les cours où ils sont inscrits
- Vérification d'inscription avant chaque accès au contenu
- Tous les fichiers sont protégés et accessibles uniquement aux utilisateurs autorisés

---

## 💰 Système de Paiement / Payment System

### Page Frais (Lecture seule / Read-only)

L'étudiant consulte :
- **Aperçu** : Total scolarité, montant payé, solde restant
- **Détail** : Chaque type de frais avec montant, payé, solde, échéance, statut

### Page Paiement (Action)

L'étudiant peut payer par :
- **Carte bancaire** (Visa / MasterCard)
- **PayPal**

Après paiement :
- Transaction enregistrée dans `transactions`
- Historique mis à jour
- Solde des frais recalculé
- Reçu disponible

### Fournisseurs de Paiement (optionnel)

Le système supporte l'intégration de :
- **Paystack** (configurable via `.env`)
- **Flutterwave** (configurable via `.env`)
- **PayPal** (configurable via `.env`)

> Si aucun fournisseur n'est configuré, les paiements sont **auto-confirmés** pour permettre les présentations/démos.

---

## 🔌 API Endpoints

### Authentification

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/login` | Connexion (username + password) |
| POST | `/api/logout` | Déconnexion (invalide le token) |
| GET | `/api/me` | Informations utilisateur connecté |
| PUT | `/api/profile` | Modifier le profil |
| PUT | `/api/change-password` | Changer le mot de passe |

### Dashboards

| Méthode | Route | Rôle | Description |
|---------|-------|------|-------------|
| GET | `/api/dashboard/admin` | Admin | KPIs, statistiques globales |
| GET | `/api/dashboard/student` | Student | Cours, notes, présences |
| GET | `/api/dashboard/teacher` | Teacher | Classes, étudiants |
| GET | `/api/dashboard/finance` | Finance | Revenus, paiements |
| GET | `/api/dashboard/registrar` | Registrar | Inscriptions |

### Ressources Académiques

| Méthode | Route | Description |
|---------|-------|-------------|
| GET/POST | `/api/faculties` | Lister / Créer facultés |
| GET/POST | `/api/departments` | Lister / Créer départements |
| GET/POST | `/api/courses` | Lister / Créer cours |
| GET/POST | `/api/classes` | Lister / Créer classes |
| GET/POST | `/api/students` | Lister / Créer étudiants |
| GET/POST | `/api/teachers` | Lister / Créer enseignants |
| GET/POST | `/api/enrollments` | Lister / Créer inscriptions |
| GET/POST | `/api/grades` | Lister / Créer notes |
| GET/POST | `/api/attendance` | Lister / Créer présences |

### E-Learning

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/elearning/courses/teacher` | Cours de l'enseignant |
| GET | `/api/elearning/courses/student` | Cours de l'étudiant |
| POST | `/api/elearning/courses` | Créer cours en ligne |
| POST | `/api/elearning/courses/{id}/join` | Rejoindre un cours |
| POST | `/api/elearning/materials` | Uploader document |
| GET | `/api/elearning/materials/course/{id}` | Documents d'un cours |
| GET | `/api/elearning/materials/{id}/download` | Télécharger document |
| POST | `/api/elearning/quizzes` | Créer quiz |
| GET | `/api/elearning/quizzes/course/{id}` | Quiz d'un cours |
| POST | `/api/elearning/quizzes/{id}/start` | Démarrer quiz |
| POST | `/api/elearning/quizzes/attempt/{id}/submit` | Soumettre quiz |
| POST | `/api/elearning/assignments` | Créer devoir |
| GET | `/api/elearning/assignments/course/{id}` | Devoirs d'un cours |
| POST | `/api/elearning/assignments/{id}/submit` | Soumettre devoir |
| GET | `/api/elearning/assignments/{id}/submissions` | Voir soumissions |
| POST | `/api/elearning/assignments/submission/{id}/grade` | Noter devoir |

### Paiements

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/payment/summary` | Résumé des frais étudiant |
| GET | `/api/payment/history` | Historique paiements |
| POST | `/api/payment/initialize` | Initier un paiement |
| GET | `/api/payment/status/{ref}` | Statut d'un paiement |
| GET | `/api/payment/receipt/{id}` | Reçu de paiement |

### Finance

| Méthode | Route | Description |
|---------|-------|-------------|
| GET/POST | `/api/fee-types` | Types de frais |
| GET/POST | `/api/student-fees` | Frais étudiants |
| GET/POST | `/api/payments` | Paiements (gestion finance) |

---

## 💾 Base de Données / Database

### 30+ Tables organisées en groupes :

#### Authentification & Utilisateurs
| Table | Rôle |
|-------|------|
| `users` | Tous les utilisateurs (admin, finance, registrar, teacher, student) |
| `personal_access_tokens` | Tokens Sanctum pour l'authentification |
| `user_settings` | Préférences utilisateur (langue, thème) |

#### Structure Académique
| Table | Rôle |
|-------|------|
| `faculties` | Facultés (ex: Faculty of Sciences) |
| `departments` | Départements (ex: Biology, Immunology) |
| `courses` | Cours/matières (ex: BIO101 General Biology) |
| `classes` | Classes/groupes (cours + enseignant + salle + semestre) |

#### Personnes
| Table | Rôle |
|-------|------|
| `students` | Profils étudiants (lié à users, department) |
| `teachers` | Profils enseignants (lié à users, department) |

#### Inscriptions & Suivi
| Table | Rôle |
|-------|------|
| `enrollments` | Inscriptions (student + class) |
| `grades` | Notes (CA + Examen + Final) |
| `attendance` | Présences par séance |

#### Finances
| Table | Rôle |
|-------|------|
| `fee_types` | Catégories de frais (Scolarité, Labo, etc.) |
| `student_fees` | Frais attribués aux étudiants |
| `payments` | Paiements enregistrés par finance |
| `transactions` | Transactions en ligne (paiements étudiants) |

#### E-Learning
| Table | Rôle |
|-------|------|
| `online_courses` | Sessions de cours en ligne |
| `online_course_attendance` | Présence aux cours vidéo |
| `course_materials` | Documents uploadés |
| `quizzes` | Quiz créés |
| `quiz_questions` | Questions des quiz |
| `quiz_attempts` | Tentatives des étudiants |
| `assignments` | Devoirs créés |
| `assignment_submissions` | Soumissions des étudiants |

#### Système
| Table | Rôle |
|-------|------|
| `schedules` | Emplois du temps |
| `announcements` | Annonces |
| `activity_logs` | Journaux d'activité |
| `chatbot_conversations` | Historique chatbot Simon |
| `grade_modifications` | Historique modifications notes |
| `course_equivalences` | Équivalences de cours (transferts) |

### Relations Principales

```
users (1) ──────► (1) students
  │                     │
  │                     ├──► (N) enrollments ◄──── (1) classes ◄──── (1) courses
  │                     │           │
  │                     │           ├──► (N) grades
  │                     │           └──► (N) attendance
  │                     │
  │                     ├──► (N) student_fees ◄──── (1) fee_types
  │                     └──► (N) transactions
  │
users (1) ──────► (1) teachers
                        │
                        ├──► (N) classes
                        ├──► (N) online_courses
                        ├──► (N) quizzes
                        └──► (N) assignments
```

---

## 🔐 Authentification & Sécurité / Authentication & Security

### Comment fonctionne l'authentification / How auth works

1. **Login** : POST `/api/login` avec `username` + `password`
2. **Vérification** : Laravel cherche l'utilisateur, vérifie le mot de passe avec `Hash::check()`
3. **Token** : Si OK, génère un token Sanctum unique
4. **Stockage** : Token stocké dans la table `personal_access_tokens`
5. **Frontend** : Token sauvegardé dans `localStorage`
6. **Requêtes** : Chaque requête inclut `Authorization: Bearer {token}`
7. **Middleware** : `auth:sanctum` vérifie le token à chaque requête protégée
8. **Rôle** : Le middleware `role:admin` (ou student, teacher...) vérifie le rôle

### Sécurité des Mots de Passe

- **Hashage Bcrypt** : Mot de passe jamais stocké en clair
- `Hash::make('password')` → `$2y$12$...` (hash irréversible)
- `Hash::check('password', $hash)` → true/false

### Protection des Routes (api.php)

```php
// Route publique (pas de token requis)
Route::post('/login', [AuthController::class, 'login']);

// Route protégée (token requis)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
});

// Route protégée par rôle (token + rôle admin requis)
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::resource('faculties', FacultyController::class);
});
```

---

## 🌍 Multilingue / Multilingual

### Langues supportées / Supported Languages

- 🇫🇷 **Français** (par défaut)
- 🇬🇧 **English**

### Comment ça marche / How it works

Le système utilise un **I18nProvider** (React Context) qui :

1. Charge les traductions depuis `src/locales/fr.json` et `src/locales/en.json`
2. Expose une fonction `t('clé')` qui retourne le texte traduit
3. Tous les composants utilisent `t('clé')` au lieu de texte en dur
4. Le changement de langue est **instantané** (pas de rechargement)
5. La préférence est sauvegardée dans `localStorage` et sur le serveur

### Où changer la langue / Where to change language

- **Page de connexion** : Bouton FR/EN en haut à droite
- **Paramètres** : Section "Langue" avec drapeaux 🇫🇷 / 🇬🇧

### Composants traduits / Translated components

- Page de connexion (Login)
- Barre latérale / Sidebar (tous les menus)
- En-tête / Header (tooltips)
- Page des paramètres / Settings
- Labels de rôle (Administrateur, Enseignant, Étudiant...)

---

## 📁 Structure du Projet / Project Structure

```
ESL2/
├── backend/                          # API Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/     # Tous les contrôleurs API
│   │   │   │   ├── AuthController.php          # Login, logout, profil
│   │   │   │   ├── AdminController.php         # Dashboard admin
│   │   │   │   ├── StudentController.php       # CRUD étudiants
│   │   │   │   ├── TeacherController.php       # CRUD enseignants
│   │   │   │   ├── PaymentController.php       # Paiements étudiants
│   │   │   │   ├── ELearningController.php     # E-Learning complet
│   │   │   │   ├── FacultyController.php       # Facultés
│   │   │   │   ├── DepartmentController.php    # Départements
│   │   │   │   ├── CourseController.php        # Cours
│   │   │   │   ├── ClassController.php         # Classes
│   │   │   │   ├── EnrollmentController.php    # Inscriptions
│   │   │   │   ├── GradeController.php         # Notes
│   │   │   │   ├── AttendanceController.php    # Présences
│   │   │   │   └── ...
│   │   │   └── Middleware/
│   │   │       ├── RoleMiddleware.php          # Vérification du rôle
│   │   │       ├── VerifyCsrfToken.php         # CSRF (api/* exempté)
│   │   │       └── ...
│   │   ├── Models/                  # Modèles Eloquent
│   │   │   ├── User.php
│   │   │   ├── Student.php
│   │   │   ├── Teacher.php
│   │   │   ├── Transaction.php
│   │   │   ├── Quiz.php
│   │   │   └── ...
│   │   └── Providers/
│   ├── config/
│   │   ├── cors.php                 # Configuration CORS
│   │   ├── sanctum.php              # Configuration Sanctum
│   │   └── services.php             # Clés API (Paystack, PayPal...)
│   ├── database/
│   │   ├── migrations/              # 30+ migrations
│   │   └── seeders/
│   │       └── DatabaseSeeder.php   # Données initiales
│   ├── routes/
│   │   └── api.php                  # Toutes les routes API
│   ├── storage/app/public/
│   │   ├── materials/               # Documents e-learning
│   │   └── assignments/             # Soumissions devoirs
│   └── .env                         # Configuration environnement
│
├── frontend/                         # Application React
│   ├── src/
│   │   ├── components/              # Composants réutilisables
│   │   │   └── Chatbot.jsx          # Chatbot Simon IA
│   │   ├── context/                 # React Context API
│   │   │   ├── AuthContext.jsx      # Authentification globale
│   │   │   └── ThemeContext.jsx     # Thème sombre/clair
│   │   ├── i18n/                    # Internationalisation
│   │   │   └── index.jsx           # I18nProvider + useI18n hook
│   │   ├── locales/                 # Fichiers de traduction
│   │   │   ├── en.json             # English translations
│   │   │   └── fr.json             # French translations
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx # Layout principal (sidebar, header)
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Page de connexion
│   │   │   ├── Settings.jsx        # Paramètres (tous rôles)
│   │   │   ├── admin/              # Pages admin
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── UnifiedStudentManagement.jsx
│   │   │   │   ├── UnifiedTeacherManagement.jsx
│   │   │   │   └── ...
│   │   │   ├── student/            # Pages étudiant
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── ELearning.jsx
│   │   │   │   ├── Fees.jsx
│   │   │   │   ├── Payment.jsx
│   │   │   │   └── ...
│   │   │   ├── teacher/            # Pages enseignant
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── ELearning.jsx
│   │   │   │   └── ...
│   │   │   ├── finance/            # Pages finance
│   │   │   └── registrar/          # Pages secrétariat
│   │   ├── services/
│   │   │   └── api.js              # Client Axios + intercepteurs
│   │   ├── App.jsx                 # Routeur principal
│   │   ├── main.jsx                # Point d'entrée React
│   │   └── index.css               # Styles Tailwind globaux
│   ├── public/
│   │   └── esl-logo.png            # Logo ESL
│   ├── package.json
│   ├── vite.config.js              # Config Vite + proxies API
│   └── tailwind.config.js          # Config Tailwind CSS
│
└── README.md                        # Ce fichier
```

---

## 🤖 Chatbot Simon

Assistant IA intégré accessible depuis tous les dashboards.

- **Accès** : Bouton flottant en bas à droite
- **Fonctionnalités** : Réponses contextuelles selon le rôle, recherche d'étudiants (admin), consultation notes
- **Historique** : Conversations sauvegardées dans `chatbot_conversations`

---

## 📝 Notes Importantes / Important Notes

### Développement / Development
- **Frontend** : Hot reload avec Vite (modifications instantanées)
- **Backend** : Redémarrage automatique après modifications PHP
- Les deux serveurs doivent tourner en même temps

### Commandes Utiles / Useful Commands

```bash
# Réinitialiser la base de données avec données fraîches
cd backend && php artisan migrate:fresh --seed

# Vider les caches Laravel
cd backend && php artisan config:clear && php artisan cache:clear

# Build frontend pour production
cd frontend && npm run build
```

---

© 2026 ESL - École de Santé de Libreville. Tous droits réservés / All rights reserved.

**Version :** 1.0.0  
**Dernière mise à jour / Last updated :** Février 2026
