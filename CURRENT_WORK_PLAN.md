# Plan de Travail Actuel - ESL2 (14 Février 2026)

## État Actuel

- ✅ Login 500 error RÉSOLU (infinite recursion fixed in ELearningController)
- ✅ Backend API endpoints + search fonctionnent correctement
- ❌ Données mock seulement : 1 student, 1 teacher, 5 users
- ❌ Recherches pas testables faute de données
- ❌ Settings (couleurs, i18n) non testés
- ❌ E-learning non testé faute de données réelles

## Tâches Prioritaires

### 1. SUPPRIMER DONNÉES MOCK ET AJOUTER DONNÉES RÉELLES (**URGENT**)

**Raison**: Pour tester les recherches, il faut au minimum 20-50 étudiants/professeurs/cours

**Actions**:

- [ ] Modifier `DatabaseSeeder.php`:
  - Garder les utilisateurs de base (admin, finance, registrar)
  - **AJOUTER** 20+ étudiants fake (Faker)
  - **AJOUTER** 5+ professeurs fake (Faker)
  - Créer 50+ classes automatiquement
  - Auto-enroll 20+ étudiants dans des cours
- [ ] Lancer seeder frais : `php artisan migrate:fresh --seed`

- [ ] Vérifier base de données : `php artisan tinker` → `\App\Models\Student::count()`

**Fichier à modifier**: `/backend/database/seeders/DatabaseSeeder.php`

---

### 2. TESTER ET RÉPARER RECHERCHES

**Raison**: Les recherches ne "fonctionnent pas" = pas de données pour tester

**Actions**:

- [ ] Après seeder, utiliser frontend pour tester recherches
- [ ] Chercher "alice" → devrait trouver 1-2 étudiants avec ce nom
- [ ] Chercher par cours, département, etc.
- [ ] Si recherches ne fonctionnent toujours pas:
  - [ ] Déboguer frontend (console browser)
  - [ ] Vérifier API avec curl
  - [ ] Fixer parsing réponse si nécessaire

**Fichiers impliqués**:

- Frontend: `UnifiedStudentManagement.jsx`, `UnifiedTeacherManagement.jsx`, etc.
- Backend: `StudentController.php`, `TeacherController.php`, etc. (déjà OK)

---

### 3. SETTINGS: COULEURS ET I18N

**Actions**:

- [ ] Ouvrir Settings page
- [ ] Tester sélecteur de couleur d'accent
- [ ] Vérifier que couleur s'applique aux CSS variables
- [ ] Tester switch langue FR/EN
- [ ] Identifier pages sans traduction
- [ ] Ajouter traductions manquantes aux fichiers locales

**Fichiers impliqués**:

- Frontend: `pages/Settings.jsx`
- Locales: `frontend/src/locales/en.json`, `fr.json`
- Backend: `SettingsController.php`

---

### 4. E-LEARNING: AUTO-ENROLL 5 COURS

**Actions** (après Step 1):

- [ ] Créer nouvel étudiant via UI admin
- [ ] Vérifier qu'auto-enroll fonctionne (5 cours du même level)
- [ ] Se connecter en tant qu'étudiant
- [ ] Vérifier que les 5 cours apparaissent dans E-Learning
- [ ] Se connecter en tant que professeur
- [ ] Uploader matériau, quiz, devoir, Google Meet link
- [ ] Se reconnecter en tant qu'étudiant
- [ ] Vérifier que matériaux/quiz/devoirs apparaissent

**Fichiers impliqués**:

- `StudentController.php` (autoEnrollStudent method)
- `ELearningController.php`
- `frontend/src/pages/teacher/ELearning.jsx`
- `frontend/src/pages/student/ELearning.jsx`

---

## Code à Modifier

### DatabaseSeeder.php - Exemple

```php
// Remplacer createSampleStudentsAndTeachers() par:
private function createSampleStudentsAndTeachers(Faculty $faculty): void
{
    // Faker instance
    $faker = \Faker\Factory::create('fr_FR');

    // Créer 20 professeurs
    for ($i = 0; $i < 20; $i++) {
        $teacherUser = User::create([
            'username' => "teacher{$i}",
            'email' => "teacher{$i}@esl.local",
            'password' => Hash::make('password'),
            'first_name' => $faker->firstName(),
            'last_name' => $faker->lastName(),
            ...
        ]);
        Teacher::create([...]);
    }

    // Créer 50 étudiants
    for ($i = 0; $i < 50; $i++) {
        $studentUser = User::create([...]);
        $student = Student::create([...]);
        // Auto-enroll dans 5 cours
        $this->autoEnrollStudent($student);
    }
}
```

---

## Commandes à Exécuter

```bash
# 1. Réinitialiser BD avec données mock améliorées
cd backend
php artisan migrate:fresh --seed

# 2. Vérifier comptes
php artisan tinker
>>> \App\Models\Student::count()
>>> \App\Models\Teacher::count()
>>> \App\Models\User::where('role', 'student')->first()->email

# 3. Accéder à l'app
Frontend: http://localhost:5174
Backend: http://127.0.0.1:8000
```

---

## Tests Finaux

- [ ] Admin peut chercher étudiant par nom → trouve résultats
- [ ] Admin peut chercher cours par code → trouve résultats
- [ ] Admin peut chercher professeur par nom → trouve résultats
- [ ] Settings couleurs change l'accent de l'app
- [ ] Settings langue switch app en français/anglais
- [ ] Nouvel étudiant créé → auto-inscrit 5 cours
- [ ] Étudiant voit ses 5 cours en E-Learning
- [ ] Professeur peut ajouter Google Meet link
- [ ] Étudiant voit le Google Meet link

---

## Priorité

🔴 **URGENT** : Step 1 (seeder + données réelles)
🟡 **HIGH** : Step 2 (tester recherches)
🟡 **HIGH** : Step 3 (Settings)
🟢 **MEDIUM** : Step 4 (E-learning full flow)
