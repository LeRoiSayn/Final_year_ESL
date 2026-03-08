# Plan d'Implémentation — ESL MIS (School of Health Libreville)

> Date de création : 8 mars 2026  
> Dernière mise à jour : 8 mars 2026  
> Statut : Phases 1, 2, 3 terminées — Phase 4+ à démarrer

---

## Statut des Phases

| Phase | Titre | Statut |
|-------|-------|--------|
| 1 | Corrections rapides UI (Settings, Reports, Registrar) | ✅ Terminé |
| 2 | Traductions French/English (i18n) | ✅ Terminé |
| 3 | Restrictions profil & Gestion utilisateurs | ✅ Terminé |
| 4 | Emplois du temps avec dates d'examens | ⏳ À faire |
| 5 | Auto-enrollment & Workflow semestre | ⏳ À faire |
| 6 | Améliorations module Enseignant | ⏳ À faire |
| 7 | Workflow notes avec notifications | ⏳ À faire |
| 8 | Admin Schedule & Actions Registrar | ⏳ À faire |

---

## Résumé des problèmes identifiés

Après analyse complète du projet, les problèmes suivants ont été identifiés et regroupés en 8 phases d'implémentation.

---

## PHASE 1 — Corrections rapides UI (Settings & Reports & Registrar) ✅ TERMINÉ
**Priorité : HAUTE — Facilité : Facile**

### 1.1 Settings — Suppression du sélecteur de couleur
- **Problème :** La page Paramètres (`Settings.jsx`) propose 6 couleurs d'accent (vert, bleu, violet, orange, rose, turquoise). L'application doit uniquement supporter les thèmes **Light** et **Dark**.
- **Action :** Supprimer la section "Couleur d'accent" entière du composant Settings. Retirer les états et la logique liée à `accent_color`. Supprimer les clés de traduction correspondantes.

### 1.2 Reports — Graphique en secteur avec couleurs dynamiques
- **Problème :** Le graphique "Students by Department" dans `Reports.jsx` n'a que 4 couleurs codées en dur, ignorant les départements supplémentaires. Idem pour "Students by Level".
- **Action :** Remplacer les tableaux de couleurs fixes par une fonction de génération de couleurs dynamique qui s'adapte au nombre réel de départements/niveaux retournés par l'API.

### 1.3 Registrar Dashboard — Quick Actions manquantes
- **Problème :** Le dashboard du Registrar (`registrar/Dashboard.jsx`) n'a que "Add Student" et "Add Teacher" dans les actions rapides. Il manque : **Add Finance**, **Add Registrar**, **Add Admin**.
- **Action :** Ajouter les 3 boutons manquants avec navigation vers les formulaires de création correspondants.

---

## PHASE 2 — Traductions French/English ✅ TERMINÉ
**Priorité : HAUTE — Facilité : Moyenne**

### Problème général
De nombreuses pages utilisent des chaînes de caractères codées en dur en anglais au lieu d'utiliser le hook `useI18n` / fonction `t()`. Quand l'utilisateur change la langue en français, ces textes restent en anglais.

### Pages à corriger (hardcoded strings détectées)
| Page | Chaînes hardcodées |
|------|---------------------|
| `admin/Dashboard.jsx` | "Dashboard", "Welcome back!", "Total Students", "Total Teachers", "Enrollment Trends", etc. |
| `admin/Grades.jsx` | "Classes", "Students", "Grade Overview", statuts (pending, submitted, validated, rejected) |
| `admin/Reports.jsx` | "Reports", "University statistics", "Students by Level", "Students by Department" |
| `admin/Classes.jsx` | "Classes", "Manage course sections", "Not assigned", "Active/Inactive" |
| `admin/Courses.jsx` | "Courses", "Failed to fetch", "Course created/updated/deleted" |
| `admin/Schedules.jsx` | Jours de la semaine en français hardcodés (incohérence), messages d'erreur |
| `admin/Enrollment.jsx` | "Auto Enrollment", "Auto Enroll All", "Active" |
| `admin/Students.jsx` | Colonnes et labels |
| `admin/Teachers.jsx` | Colonnes et labels |
| `teacher/Attendance.jsx` | "Attendance", "Mark student attendance", statuts |
| `teacher/Grades.jsx` | "Classes", messages de succès/erreur |
| `teacher/Schedule.jsx` | "My Schedule", "No classes" |
| `teacher/Dashboard.jsx` | Hardcodé en anglais |
| `teacher/Classes.jsx` | Hardcodé en anglais |
| `student/Schedule.jsx` | "My Schedule", "No classes scheduled" |
| `student/Grades.jsx` | Hardcodé |
| `student/Dashboard.jsx` | Hardcodé |
| `student/Courses.jsx` | Hardcodé |
| `registrar/Dashboard.jsx` | "Registrar Dashboard", "Add Student", "Add Teacher" |
| `registrar/Students.jsx` | Hardcodé |
| `registrar/Teachers.jsx` | Hardcodé |
| `Profile.jsx` | "My Profile", "First Name", "Last Name", "Save Changes", etc. |

### Action
1. Ajouter toutes les clés manquantes dans `en.json` et `fr.json`.
2. Importer `useI18n` dans chaque page concernée.
3. Remplacer toutes les chaînes hardcodées par `{t("clé")}`.

---

## PHASE 3 — Restrictions du profil & Gestion des utilisateurs ✅ TERMINÉ
**Priorité : HAUTE — Facilité : Moyenne**

### 3.1 Restrictions profil (Profile.jsx)
- **Problème :** N'importe quel utilisateur peut modifier son nom, prénom, téléphone, adresse, date de naissance. Seul le Registrar doit pouvoir le faire.
- **Règle :**
  - **Tous les utilisateurs** : peuvent uniquement changer leur **mot de passe**.
  - **Registrar uniquement** : peut modifier nom, prénom, téléphone, adresse, date de naissance, et la **photo de profil**.
- **Action :** Conditionner l'affichage du formulaire de modification profil au rôle `registrar`. Pour les autres rôles, n'afficher que la section changement de mot de passe.

### 3.2 Photo de profil
- **Problème :** Aucun champ photo de profil n'existe lors de la création d'utilisateurs.
- **Action :**
  - Ajouter un champ upload d'image dans les formulaires de création utilisateur (`registrar/Students.jsx`, `registrar/Teachers.jsx`).
  - Ajouter le support upload photo dans le backend (`AuthController@updateProfile`).
  - Afficher la photo de profil réelle dans `Profile.jsx` (au lieu des initiales).

### 3.3 Reset password par le Registrar
- **Problème :** Aucune fonctionnalité de reset de mot de passe par le Registrar n'existe.
- **Action :**
  - Ajouter un bouton "Reset Password" dans la vue détail d'un utilisateur (côté Registrar).
  - Ajouter un endpoint backend : `POST /registrar/users/{id}/reset-password`.
  - Le Registrar saisit un nouveau mot de passe temporaire pour l'utilisateur.

### 3.4 Registrar peut créer Admin, Finance, Registrar
- **Problème :** Le Registrar ne peut créer que des étudiants et des enseignants.
- **Action :**
  - Ajouter un formulaire/page pour créer des utilisateurs avec rôle : `admin`, `finance`, `registrar`.
  - Ajouter les quick actions dans le dashboard Registrar.
  - Endpoint backend : `POST /registrar/users` avec validation du rôle.

---

## PHASE 4 — Emplois du temps avec dates d'examens ⏳ À FAIRE
**Priorité : HAUTE — Facilité : Moyenne**

### 4.1 Créer un cours avec heures de cours
- **Problème :** Lors de la création d'une classe (`Classes.jsx`), l'admin ne spécifie pas les heures de cours. Les horaires sont définis séparément dans `Schedules.jsx`. La liaison est incomplète.
- **Action :**
  - Le formulaire Schedule doit déjà gérer `start_time` et `end_time` ✅ (déjà fait).
  - Ajouter les champs **midterm_date** et **final_date** dans le formulaire de création/modification de Schedule.
  - Mettre à jour le backend `ScheduleController` pour accepter et stocker ces dates.
  - Migration : ajouter `midterm_date` et `final_date` à la table `schedules`.

### 4.2 Emploi du temps étudiant avec examens
- **Problème :** `student/Schedule.jsx` affiche heure de début/fin mais pas les dates d'examens.
- **Action :** Afficher `midterm_date` et `final_date` dans chaque bloc de cours de l'emploi du temps étudiant.

### 4.3 Emploi du temps enseignant avec examens  
- **Problème :** `teacher/Schedule.jsx` n'affiche pas les dates d'examens.
- **Action :** Idem — afficher `midterm_date` et `final_date`.

---

## PHASE 5 — Auto-enrollment & Workflow semestre ⏳ À FAIRE
**Priorité : HAUTE — Facilité : Complexe**

### 5.1 Vue profil étudiant avec matières validées/échouées
- **Problème :** La page `UnifiedStudentManagement.jsx` montre les cours de l'étudiant mais ne distingue pas clairement les cours **validés** (note >= seuil) des cours **échoués** (note < seuil).
- **Action :**
  - Dans la vue profil student (UnifiedStudentManagement), ajouter deux sections :
    - **Matières validées** (cours avec note finale >= 50)
    - **Matières échouées / à rattraper** (cours avec note finale < 50)
  - Utiliser les données de grades existantes via l'API.

### 5.2 Re-inscription (Retakes)
- **Problème :** L'admin doit pouvoir inscrire un étudiant à des cours qu'il a échoués (retakes) pour le semestre suivant.
- **Action :**
  - Dans le profil étudiant (UnifiedStudentManagement), ajouter un bouton **"Re-enroll in failed courses"** dans la section "matières échouées".
  - Créer un modal de sélection semestre/année académique pour les retakes.
  - Endpoint : `POST /student-management/{id}/retake-courses` avec `{ course_ids: [], academic_year, semester }`.

### 5.3 Nouveau semestre / Nouvelle année
- **Problème :** Workflow pour nouvelle inscription annuelle non implémenté.
- **Action :**
  - Bouton "New Semester Enrollment" dans le profil étudiant.
  - L'admin sélectionne les nouveaux cours pour l'étudiant (peut inclure des rattrapage d'années précédentes).
  - Créer les enrollments avec le bon `academic_year` et `semester`.

---

## PHASE 6 — Améliorations module Enseignant ⏳ À FAIRE
**Priorité : HAUTE — Facilité : Moyenne**

### 6.1 Données réelles dans l'assiduité (Attendance)
- **Problème :** Les étudiants inscrits dans un cours n'apparaissent pas dans la liste de présence de l'enseignant. Soupçon de données mock.
- **Action :**
  - Vérifier et corriger l'endpoint `/teachers/{id}/classes` pour retourner les vraies classes.
  - Vérifier l'endpoint `/attendance/class/{classId}` pour retourner les vrais étudiants enrollés.
  - S'assurer que `enrollments` est correctement joint dans la réponse.

### 6.2 Créer ses propres sessions d'assiduité
- **Problème :** Le professeur ne peut pas créer une nouvelle session d'assiduité (il peut juste changer la date dans le calendrier, mais pas "ajouter" distinctement une nouvelle session visible).
- **Action :**
  - Dans `teacher/Attendance.jsx`, ajouter un bouton **"New Session"** pour créer une nouvelle entrée de date de présence.
  - Afficher l'historique des sessions créées (par date) pour chaque classe.
  - Permettre de naviguer entre les sessions passées pour les consulter/modifier.

### 6.3 Voir la liste des étudiants dans une classe
- **Problème :** L'enseignant ne peut pas voir directement le nombre et la liste des étudiants dans chaque classe.
- **Action :**
  - Dans `teacher/Classes.jsx`, dans chaque carte de classe, afficher le nombre d'étudiants.
  - Ajouter un bouton/lien "Voir les étudiants" qui ouvre un modal avec la liste complète.
  - Ajouter une barre de recherche dans ce modal.
  - Endpoint disponible : `/classes/{id}/students` ✅

### 6.4 Notification quand un nouvel étudiant rejoint
- **Problème :** L'enseignant n'est pas notifié quand un étudiant est ajouté à une de ses classes.
- **Action :**
  - Déclencher une notification au professeur lors d'un enrollment dans sa classe.
  - Utiliser le système de notifications existant.

### 6.5 Notification d'assiduité aux étudiants
- **Problème :** Quand le prof marque une présence, l'étudiant n'est pas notifié.
- **Action :** Envoyer une notification à l'étudiant lors du marquage d'assiduité.

---

## PHASE 7 — Workflow notes avec notifications ⏳ À FAIRE
**Priorité : HAUTE — Facilité : Moyenne**

### Workflow complet
```
Professeur saisit notes → Soumet à l'Admin
→ Admin vérifie (modèle MIS vs modèle papier)
→ Admin valide OU refuse
→ Si refusé : notification → Professeur (corrige et resoumet)
→ Si validé : notification → Professeur + notification → Étudiants
→ Les notes apparaissent chez les étudiants dans leur section Grades
```

### 7.1 Soumission à l'admin (déjà partiellement fait)
- `gradeApi.submitToAdmin(classId)` existe ✅
- Vérifier que l'admin reçoit bien une notification.

### 7.2 Validation/Refus par l'admin (déjà partiellement fait)
- Routes `/grades/validate-class/{classId}` et `/grades/reject-class/{classId}` existent ✅
- Vérifier que les notifications partent vers le prof quand validé/refusé.

### 7.3 Notification aux étudiants
- Quand les notes sont **validées**, tous les étudiants de cette classe doivent recevoir une notification.
- Implémenter dans `GradeController@validateClass`.

### 7.4 Affichage des notes validées chez l'étudiant
- `student/Grades.jsx` doit clairement afficher les notes validées vs non encore disponibles.
- Ajouter un badge "Validé" ou "En attente de validation".

---

## PHASE 8 — Emploi du temps Admin & Actions Registrar ⏳ À FAIRE
**Priorité : MOYENNE — Facilité : Moyenne**

### 8.1 Admin Schedule — Afficher tous les cours assignés
- **Problème :** Des cours ont été assignés à des professeurs mais n'apparaissent pas dans le tableau des emplois du temps admin.
- **Diagnostic :** L'endpoint `GET /schedules` ne filtre peut-être que les schedules créés manuellement, pas les cours assignés via `Classes`.
- **Action :**
  - Corriger `ScheduleController@index` pour inclure **toutes les classes avec enseignants assignés**, même si elles n'ont pas encore de schedule explicite.
  - Ou créer une vue unifiée qui montre les deux : classes avec enseignant + schedules définis.

### 8.2 Registrar — Toutes les actions rapides
*(intégré dans Phase 3.4)*

---

## Ordre de priorité d'exécution

| Phase | Contenu | Effort | Impact |
|-------|---------|--------|--------|
| 1 | Settings couleur, Reports dynamique, Registrar actions | Faible | Visible immédiat |
| 2 | Traductions i18n | Moyen | Très visible |
| 3 | Restrictions profil, photo, reset password | Moyen | Fonctionnel clé |
| 4 | Schedule + dates examens | Moyen | Fonctionnel |
| 6 | Enseignant améliorations | Moyen | Fonctionnel |
| 7 | Notes workflow notifications | Moyen | Fonctionnel |
| 5 | Auto-enrollment / retakes | Élevé | Fonctionnel complexe |
| 8 | Admin schedule fix | Moyen | Fonctionnel |

---

*Ce plan sera mis à jour au fur et à mesure de l'avancement des implémentations.*
