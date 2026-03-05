<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatbotConversation;
use App\Models\Student;
use App\Models\User;
use App\Models\Course;
use App\Models\Grade;
use App\Models\Payment;
use App\Models\StudentFee;
use App\Models\Attendance;
use App\Models\Schedule;
use App\Models\ClassModel;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ChatbotController extends Controller
{
    /**
     * Process a chatbot message with role-based access control
     */
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'session_id' => 'nullable|string',
        ]);

        $user = $request->user();
        $message = $request->message;
        $sessionId = $request->session_id ?? Str::uuid()->toString();

        try {
            // Get or create conversation
            $conversation = ChatbotConversation::firstOrCreate(
                ['user_id' => $user->id, 'session_id' => $sessionId],
                ['messages' => [], 'context' => ['role' => $user->role]]
            );

            // Add user message
            $conversation->addMessage('user', $message);

            // Process message based on user role
            $response = $this->processMessage($user, $message, $conversation);

            // Add bot response
            $conversation->addMessage('assistant', $response['message']);

            return response()->json([
                'session_id' => $sessionId,
                'response' => $response,
            ]);
        } catch (\Exception $e) {
            \Log::error('Chatbot error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            
            return response()->json([
                'session_id' => $sessionId,
                'response' => [
                    'message' => "Je suis désolé, une erreur technique est survenue. Veuillez réessayer.",
                    'type' => 'error',
                ],
            ]);
        }
    }

    /**
     * Search for a student (Admin only)
     */
    public function searchStudent(Request $request)
    {
        $user = $request->user();
        
        if (!in_array($user->role, ['admin'])) {
            return response()->json([
                'error' => 'Accès refusé',
                'message' => 'Vous n\'avez pas les permissions nécessaires pour rechercher des étudiants.',
            ], 403);
        }

        $request->validate([
            'query' => 'required|string|min:2',
        ]);

        $query = $request->query('query');

        $students = Student::with(['user', 'department.faculty', 'enrollments', 'fees'])
            ->where(function ($q) use ($query) {
                $q->whereHas('user', function ($uq) use ($query) {
                    $uq->where('first_name', 'like', "%{$query}%")
                        ->orWhere('last_name', 'like', "%{$query}%")
                        ->orWhere('email', 'like', "%{$query}%");
                })
                ->orWhere('student_id', 'like', "%{$query}%");
            })
            ->limit(10)
            ->get()
            ->map(function ($student) {
                return $this->formatStudentData($student);
            });

        return response()->json(['students' => $students]);
    }

    /**
     * Get detailed student info with trends (Admin only)
     */
    public function getStudentDetails(Request $request, $id)
    {
        $user = $request->user();
        
        if (!in_array($user->role, ['admin'])) {
            return response()->json([
                'error' => 'Accès refusé',
                'message' => 'Vous n\'avez pas les permissions nécessaires.',
            ], 403);
        }

        $student = Student::with([
            'user', 
            'department.faculty', 
            'enrollments', 
            'fees',
        ])->findOrFail($id);

        return response()->json([
            'student' => $this->formatStudentData($student, true),
        ]);
    }

    /**
     * Get conversation history
     */
    public function getHistory(Request $request)
    {
        $conversations = ChatbotConversation::where('user_id', $request->user()->id)
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json(['conversations' => $conversations]);
    }

    // ==================== PRIVATE METHODS ====================

    private function processMessage($user, $message, $conversation)
    {
        $lowerMessage = mb_strtolower($message);
        
        // Check for student search (Admin only)
        if ($user->role === 'admin' && $this->isStudentSearch($lowerMessage)) {
            return $this->handleStudentSearch($lowerMessage);
        }

        // Process based on role
        switch ($user->role) {
            case 'admin':
                return $this->processAdminMessage($user, $lowerMessage, $conversation);
            case 'teacher':
                return $this->processTeacherMessage($user, $lowerMessage, $conversation);
            case 'student':
                return $this->processStudentMessage($user, $lowerMessage, $conversation);
            case 'finance':
                return $this->processFinanceMessage($user, $lowerMessage, $conversation);
            case 'registrar':
                return $this->processRegistrarMessage($user, $lowerMessage, $conversation);
            default:
                return $this->getDefaultResponse();
        }
    }

    private function isStudentSearch($message)
    {
        $keywords = ['cherche', 'recherche', 'trouve', 'montre', 'infos', 'étudiant', 'student', 'reg', 'notes de'];
        foreach ($keywords as $keyword) {
            if (str_contains($message, $keyword)) {
                return true;
            }
        }
        return false;
    }

    private function handleStudentSearch($message)
    {
        // Extract search term
        preg_match('/(?:cherche|recherche|trouve|montre|infos|notes de)\s+(?:l\'étudiant|étudiant|student)?\s*(.+)/i', $message, $matches);
        
        if (empty($matches[1])) {
            // Try to find registration number
            preg_match('/reg[-\s]?(\d+)/i', $message, $regMatches);
            if (!empty($regMatches[1])) {
                $searchTerm = $regMatches[0];
            } else {
                // Try to find any name-like words
                preg_match('/(?:student|étudiant)\s+(\w+)/i', $message, $nameMatches);
                if (!empty($nameMatches[1])) {
                    $searchTerm = $nameMatches[1];
                } else {
                    return [
                        'message' => "Je n'ai pas pu identifier l'étudiant. Veuillez préciser le nom ou le numéro d'inscription.\n\nExemple: \"Recherche étudiant Dupont\" ou \"Infos REG-001\"",
                        'type' => 'help',
                        'quick_actions' => ['Statistiques des étudiants', 'KPIs institutionnels'],
                    ];
                }
            }
        } else {
            $searchTerm = trim($matches[1]);
        }

        $students = Student::with(['user', 'department', 'fees'])
            ->where(function ($q) use ($searchTerm) {
                $q->whereHas('user', function ($uq) use ($searchTerm) {
                    $uq->where('first_name', 'like', "%{$searchTerm}%")
                        ->orWhere('last_name', 'like', "%{$searchTerm}%");
                })
                ->orWhere('student_id', 'like', "%{$searchTerm}%");
            })
            ->limit(5)
            ->get();

        if ($students->isEmpty()) {
            return [
                'message' => "Aucun étudiant trouvé pour \"{$searchTerm}\".\n\nEssayez avec un autre nom ou numéro d'inscription.",
                'type' => 'not_found',
                'quick_actions' => ['Statistiques des étudiants', 'KPIs institutionnels'],
            ];
        }

        if ($students->count() === 1) {
            $student = $students->first();
            $data = $this->formatStudentData($student, true);
            
            return [
                'message' => $this->formatStudentReport($data),
                'type' => 'student_info',
                'data' => $data,
            ];
        }

        // Multiple students found
        $list = $students->map(function ($s) {
            return "- {$s->user->first_name} {$s->user->last_name} ({$s->student_id})";
        })->join("\n");

        return [
            'message' => "Plusieurs étudiants trouvés:\n{$list}\n\nVeuillez préciser le nom complet ou le numéro d'inscription.",
            'type' => 'multiple_results',
            'data' => $students->map(fn($s) => $this->formatStudentData($s)),
        ];
    }

    private function processAdminMessage($user, $message, $conversation)
    {
        // Statistics queries
        if (str_contains($message, 'statistique') || str_contains($message, 'combien') || str_contains($message, 'stats')) {
            return $this->getAdminStatistics($message);
        }

        // KPI queries
        if (str_contains($message, 'kpi') || str_contains($message, 'performance') || str_contains($message, 'indicateur')) {
            return $this->getKPIs();
        }

        // Alert queries
        if (str_contains($message, 'alerte') || str_contains($message, 'alert') || str_contains($message, 'retard')) {
            return $this->getStudentAlerts();
        }

        // Help
        return [
            'message' => "En tant qu'administrateur, voici ce que je peux faire:\n\n" .
                "🔍 **Rechercher un étudiant**\n   → \"Recherche étudiant Dupont\"\n\n" .
                "📊 **Statistiques globales**\n   → \"Montre les statistiques\"\n\n" .
                "📈 **KPIs institutionnels**\n   → \"KPIs\" ou \"Performance\"\n\n" .
                "⚠️ **Alertes**\n   → \"Alertes\" ou \"Étudiants en retard\"\n\n" .
                "Que souhaitez-vous faire?",
            'type' => 'help',
            'quick_actions' => [
                ['label' => '📊 Statistiques', 'action' => 'show_kpis'],
                ['label' => '⚠️ Alertes', 'action' => 'show_alerts'],
            ],
        ];
    }

    private function processTeacherMessage($user, $message, $conversation)
    {
        $teacher = $user->teacher;
        
        if (!$teacher) {
            return [
                'message' => "Votre profil enseignant n'est pas encore configuré. Veuillez contacter l'administration.",
                'type' => 'error',
            ];
        }

        if (str_contains($message, 'mes cours') || str_contains($message, 'my courses') || str_contains($message, 'cours')) {
            $classes = ClassModel::with('course')
                ->where('teacher_id', $teacher->id)
                ->where('is_active', true)
                ->get();

            if ($classes->isEmpty()) {
                return [
                    'message' => "Vous n'avez aucun cours assigné pour le moment.",
                    'type' => 'courses',
                ];
            }

            $list = $classes->map(fn($c) => "- {$c->course->name} ({$c->course->code}) - {$c->name}")->join("\n");
            
            return [
                'message' => "📚 Vos cours:\n{$list}\n\nTotal: {$classes->count()} classe(s)",
                'type' => 'courses',
                'data' => $classes,
            ];
        }

        if (str_contains($message, 'étudiant') || str_contains($message, 'students') || str_contains($message, 'inscrit')) {
            $classIds = ClassModel::where('teacher_id', $teacher->id)
                ->where('is_active', true)
                ->pluck('id');
            
            $enrolledCount = Enrollment::whereIn('class_id', $classIds)
                ->where('status', 'enrolled')
                ->count();

            return [
                'message' => "👥 Vous avez {$enrolledCount} étudiant(s) inscrit(s) dans vos cours.",
                'type' => 'info',
            ];
        }

        if (str_contains($message, 'emploi') || str_contains($message, 'schedule') || str_contains($message, 'horaire')) {
            $classIds = ClassModel::where('teacher_id', $teacher->id)->where('is_active', true)->pluck('id');
            $schedules = Schedule::with('class.course')
                ->whereIn('class_id', $classIds)
                ->orderByRaw("FIELD(day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')")
                ->orderBy('start_time')
                ->get();

            if ($schedules->isEmpty()) {
                return [
                    'message' => "Aucun horaire n'est encore défini pour vos cours. L'administration doit créer l'emploi du temps.",
                    'type' => 'schedule',
                ];
            }

            $list = $schedules->map(fn($s) => "- " . ucfirst($s->day_of_week) . ": {$s->class->course->name} ({$s->start_time} - {$s->end_time})" . ($s->room ? " - Salle {$s->room}" : ""))->join("\n");

            return [
                'message' => "📅 Votre emploi du temps:\n{$list}",
                'type' => 'schedule',
            ];
        }

        if (str_contains($message, 'absent') || str_contains($message, 'présence')) {
            return [
                'message' => "Pour gérer les présences, accédez à la section **Présence** dans le menu latéral.\n\nVous pouvez y:\n- Marquer les présences par classe\n- Voir les statistiques de présence\n- Générer des rapports",
                'type' => 'redirect',
            ];
        }

        return [
            'message' => "Bonjour {$user->first_name}! 🎓\n\nEn tant qu'enseignant, je peux vous aider avec:\n\n" .
                "📚 **Mes cours** → Voir vos cours assignés\n" .
                "👥 **Mes étudiants** → Nombre d'étudiants inscrits\n" .
                "📅 **Mon emploi du temps** → Vos horaires\n" .
                "📝 **Présences** → Accéder à la gestion des présences\n\n" .
                "Que souhaitez-vous faire?",
            'type' => 'help',
            'quick_actions' => [
                ['label' => '📚 Mes cours', 'action' => 'my_courses'],
                ['label' => '👥 Mes étudiants', 'action' => 'my_students'],
                ['label' => '📅 Mon emploi du temps', 'action' => 'my_schedule'],
            ],
        ];
    }

    private function processStudentMessage($user, $message, $conversation)
    {
        $student = $user->student;
        
        if (!$student) {
            return [
                'message' => "Votre profil étudiant n'est pas encore configuré. Veuillez contacter l'administration.",
                'type' => 'error',
            ];
        }

        if (str_contains($message, 'notes') || str_contains($message, 'grades') || str_contains($message, 'résultat')) {
            $grades = Grade::with('course')
                ->where('student_id', $student->id)
                ->get();
            
            if ($grades->isEmpty()) {
                return [
                    'message' => "Aucune note n'est encore disponible pour vous.",
                    'type' => 'grades',
                ];
            }

            $average = $grades->avg('grade');
            $list = $grades->map(fn($g) => "- " . ($g->course->name ?? 'Cours') . ": {$g->grade}/20")->join("\n");
            
            return [
                'message' => "📊 Vos notes:\n{$list}\n\n📈 Moyenne générale: " . round($average, 2) . "/20",
                'type' => 'grades',
                'data' => ['grades' => $grades, 'average' => $average],
            ];
        }

        if (str_contains($message, 'frais') || str_contains($message, 'payer') || str_contains($message, 'fees') || str_contains($message, 'scolarité')) {
            $fees = $student->fees;
            $totalFees = $fees->sum('amount');
            $totalPaid = $fees->sum('paid_amount');
            $remaining = $totalFees - $totalPaid;
            
            return [
                'message' => "💰 Situation financière:\n\n" .
                    "├── Frais totaux: " . number_format($totalFees) . " FCFA\n" .
                    "├── Payé: " . number_format($totalPaid) . " FCFA\n" .
                    "└── Reste: " . number_format($remaining) . " FCFA\n\n" .
                    ($remaining > 0 ? "⚠️ Il vous reste " . number_format($remaining) . " FCFA à payer.\nAccédez à la page **Paiement** pour effectuer un versement." : "✅ Tous vos frais sont réglés!"),
                'type' => 'fees',
                'data' => ['total' => $totalFees, 'paid' => $totalPaid, 'remaining' => $remaining],
            ];
        }

        if (str_contains($message, 'emploi') || str_contains($message, 'schedule') || str_contains($message, 'horaire')) {
            $enrolledClassIds = Enrollment::where('student_id', $student->id)
                ->where('status', 'enrolled')
                ->pluck('class_id');

            $schedules = Schedule::with('class.course')
                ->whereIn('class_id', $enrolledClassIds)
                ->orderByRaw("FIELD(day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')")
                ->orderBy('start_time')
                ->get();

            if ($schedules->isEmpty()) {
                return [
                    'message' => "Aucun horaire n'est encore défini pour vos cours. L'emploi du temps sera publié par l'administration.",
                    'type' => 'schedule',
                ];
            }

            $list = $schedules->map(fn($s) => "- " . ucfirst($s->day_of_week) . ": " . ($s->class?->course?->name ?? 'Cours') . " ({$s->start_time} - {$s->end_time})" . ($s->room ? " - Salle {$s->room}" : ""))->join("\n");

            return [
                'message' => "📅 Votre emploi du temps:\n{$list}",
                'type' => 'schedule',
            ];
        }

        if (str_contains($message, 'cours') || str_contains($message, 'courses') || str_contains($message, 'inscrit')) {
            $enrollments = Enrollment::with('class.course')
                ->where('student_id', $student->id)
                ->where('status', 'enrolled')
                ->get();

            if ($enrollments->isEmpty()) {
                return [
                    'message' => "Vous n'êtes inscrit(e) à aucun cours pour le moment.",
                    'type' => 'courses',
                ];
            }

            $list = $enrollments->map(fn($e) => "- " . ($e->class?->course?->name ?? 'Cours') . " (" . ($e->class?->course?->code ?? '') . ")")->join("\n");

            return [
                'message' => "📚 Vos cours inscrits:\n{$list}\n\nTotal: {$enrollments->count()} cours",
                'type' => 'courses',
            ];
        }

        return [
            'message' => "Bonjour {$user->first_name}! 👋\n\nJe suis Simon, votre assistant ESL. Je peux vous aider avec:\n\n" .
                "📊 **Mes notes** → Consulter vos résultats\n" .
                "💰 **Mes frais** → Situation financière\n" .
                "📅 **Mon emploi du temps** → Horaires de cours\n" .
                "📚 **Mes cours** → Cours inscrits\n\n" .
                "Que souhaitez-vous savoir?",
            'type' => 'help',
            'quick_actions' => [
                ['label' => '📊 Mes notes', 'action' => 'my_grades'],
                ['label' => '💰 Mes frais', 'action' => 'my_fees'],
                ['label' => '📅 Mon emploi du temps', 'action' => 'my_schedule'],
            ],
        ];
    }

    private function processFinanceMessage($user, $message, $conversation)
    {
        if (str_contains($message, 'impayé') || str_contains($message, 'retard') || str_contains($message, 'overdue')) {
            $overdueCount = StudentFee::where('status', 'overdue')->count();
            $overdueAmount = StudentFee::where('status', 'overdue')
                ->selectRaw('SUM(amount - paid_amount) as total_balance')
                ->value('total_balance') ?? 0;
            
            return [
                'message' => "💰 Rapport des impayés:\n\n" .
                    "├── Étudiants en retard: {$overdueCount}\n" .
                    "└── Montant total dû: " . number_format($overdueAmount) . " FCFA\n\n" .
                    "Accédez à **Frais Étudiants** pour voir les détails.",
                'type' => 'finance_stats',
            ];
        }

        if (str_contains($message, 'stat') || str_contains($message, "aujourd'hui") || str_contains($message, 'today')) {
            $todayPayments = Payment::whereDate('payment_date', today())->count();
            $todayAmount = Payment::whereDate('payment_date', today())->sum('amount');
            $totalCollected = Payment::sum('amount');

            return [
                'message' => "📊 Statistiques financières:\n\n" .
                    "📅 Aujourd'hui:\n" .
                    "├── Paiements: {$todayPayments}\n" .
                    "└── Montant: " . number_format($todayAmount) . " FCFA\n\n" .
                    "📈 Global:\n" .
                    "└── Total encaissé: " . number_format($totalCollected) . " FCFA",
                'type' => 'finance_stats',
            ];
        }

        if (str_contains($message, 'rapport') || str_contains($message, 'report') || str_contains($message, 'mensuel')) {
            $monthPayments = Payment::whereMonth('payment_date', now()->month)->count();
            $monthAmount = Payment::whereMonth('payment_date', now()->month)->sum('amount');
            $pendingCount = StudentFee::where('status', 'pending')->count();

            return [
                'message' => "📈 Rapport mensuel (" . now()->format('F Y') . "):\n\n" .
                    "├── Paiements reçus: {$monthPayments}\n" .
                    "├── Montant total: " . number_format($monthAmount) . " FCFA\n" .
                    "└── Frais en attente: {$pendingCount}",
                'type' => 'finance_report',
            ];
        }

        return [
            'message' => "En tant que gestionnaire financier, je peux vous aider avec:\n\n" .
                "💰 **Impayés** → Voir les paiements en retard\n" .
                "📊 **Stats du jour** → Statistiques d'aujourd'hui\n" .
                "📈 **Rapport mensuel** → Rapport du mois\n\n" .
                "Que souhaitez-vous faire?",
            'type' => 'help',
            'quick_actions' => [
                ['label' => '💰 Impayés', 'action' => 'show_unpaid'],
                ['label' => '📊 Stats du jour', 'action' => 'today_stats'],
                ['label' => '📈 Rapport mensuel', 'action' => 'monthly_report'],
            ],
        ];
    }

    private function processRegistrarMessage($user, $message, $conversation)
    {
        if (str_contains($message, 'inscript') || str_contains($message, 'enroll') || str_contains($message, 'étudiant')) {
            $activeStudents = Student::where('status', 'active')->count();
            $pendingEnrollments = Enrollment::where('status', 'pending')->count();

            return [
                'message' => "📋 Informations d'inscription:\n\n" .
                    "├── Étudiants actifs: {$activeStudents}\n" .
                    "└── Inscriptions en attente: {$pendingEnrollments}\n\n" .
                    "Accédez à **Étudiants** pour gérer les inscriptions.",
                'type' => 'registrar_stats',
            ];
        }

        return [
            'message' => "En tant que registraire, je peux vous aider avec:\n\n" .
                "📋 **Inscriptions** → Gérer les inscriptions\n" .
                "👥 **Étudiants** → Consulter les dossiers\n\n" .
                "Note: Vous n'avez pas accès aux notes détaillées ni aux finances.",
            'type' => 'help',
        ];
    }

    private function getDefaultResponse()
    {
        return [
            'message' => "Je suis Simon, votre assistant ESL. 👋\n\nComment puis-je vous aider?",
            'type' => 'default',
        ];
    }

    private function formatStudentData($student, $detailed = false)
    {
        $grades = Grade::where('student_id', $student->id)->get();
        $average = $grades->avg('grade');
        
        $fees = $student->fees ?? collect();
        $totalFees = $fees->sum('amount');
        $totalPaid = $fees->sum('paid_amount');
        $attendanceRate = $this->calculateAttendanceRate($student);

        $data = [
            'id' => $student->id,
            'student_id' => $student->student_id,
            'name' => $student->user->first_name . ' ' . $student->user->last_name,
            'email' => $student->user->email,
            'department' => $student->department->name ?? 'N/A',
            'level' => $student->level,
            'status' => $student->status,
            'average' => round($average ?? 0, 2),
            'attendance_rate' => $attendanceRate,
            'total_fees' => $totalFees,
            'paid' => $totalPaid,
            'remaining' => $totalFees - $totalPaid,
        ];

        if ($detailed) {
            // Add grade history for trends
            $gradeHistory = Grade::where('student_id', $student->id)
                ->selectRaw('semester, AVG(grade) as avg_grade')
                ->groupBy('semester')
                ->orderBy('semester')
                ->get();

            $data['grade_history'] = $gradeHistory;
            $data['trend'] = $this->calculateTrend($gradeHistory);
            $data['grades'] = $grades->map(fn($g) => [
                'course' => $g->course->name ?? 'N/A',
                'grade' => $g->grade,
                'semester' => $g->semester,
            ]);
            
            $enrollments = Enrollment::with('class.course')
                ->where('student_id', $student->id)
                ->where('status', 'enrolled')
                ->get();

            $data['enrollments'] = $enrollments->map(fn($e) => [
                'course' => $e->class?->course?->name ?? 'N/A',
                'code' => $e->class?->course?->code ?? '',
            ]);
        }

        return $data;
    }

    private function calculateAttendanceRate($student)
    {
        $enrollmentIds = Enrollment::where('student_id', $student->id)->pluck('id');
        $total = Attendance::whereIn('enrollment_id', $enrollmentIds)->count();
        $present = Attendance::whereIn('enrollment_id', $enrollmentIds)
            ->whereIn('status', ['present', 'late'])
            ->count();
        
        return $total > 0 ? round(($present / $total) * 100, 1) : 100;
    }

    private function calculateTrend($gradeHistory)
    {
        if ($gradeHistory->count() < 2) {
            return 'stable';
        }

        $first = $gradeHistory->first()->avg_grade;
        $last = $gradeHistory->last()->avg_grade;
        $diff = $last - $first;

        if ($diff > 0.5) return 'up';
        if ($diff < -0.5) return 'down';
        return 'stable';
    }

    private function formatStudentReport($data)
    {
        $trend = match($data['trend'] ?? 'stable') {
            'up' => '↗️ En progression',
            'down' => '↘️ En baisse',
            default => '→ Stable',
        };

        return "🎓 FICHE ÉTUDIANT - {$data['name']}\n" .
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" .
            "📋 Informations Générales\n" .
            "├── ID: {$data['student_id']}\n" .
            "├── Email: {$data['email']}\n" .
            "├── Département: {$data['department']}\n" .
            "├── Niveau: {$data['level']}\n" .
            "└── Statut: {$data['status']}\n\n" .
            "📊 Performance Académique\n" .
            "├── Moyenne Générale: {$data['average']}/20\n" .
            "└── Tendance: {$trend}\n\n" .
            "📅 Présences: {$data['attendance_rate']}%\n\n" .
            "💰 Situation Financière\n" .
            "├── Frais totaux: " . number_format($data['total_fees']) . " FCFA\n" .
            "├── Payé: " . number_format($data['paid']) . " FCFA\n" .
            "└── Reste: " . number_format($data['remaining']) . " FCFA";
    }

    private function getAdminStatistics($message)
    {
        $totalStudents = Student::count();
        $activeStudents = Student::where('status', 'active')->count();
        $avgGrade = Grade::avg('grade');
        $totalTeachers = \App\Models\Teacher::count();
        $totalCourses = Course::where('is_active', true)->count();

        return [
            'message' => "📊 Statistiques ESL\n\n" .
                "👥 Étudiants\n" .
                "├── Total: {$totalStudents}\n" .
                "└── Actifs: {$activeStudents}\n\n" .
                "🎓 Enseignants: {$totalTeachers}\n" .
                "📚 Cours actifs: {$totalCourses}\n\n" .
                "📈 Performance\n" .
                "└── Moyenne générale: " . round($avgGrade ?? 0, 2) . "/20",
            'type' => 'statistics',
        ];
    }

    private function getKPIs()
    {
        $totalStudents = Student::count();
        $totalPayments = Payment::sum('amount');
        $gradeCount = Grade::count();
        $passRate = $gradeCount > 0 ? (Grade::where('grade', '>=', 10)->count() / $gradeCount * 100) : 0;
        $attendanceAvg = Student::where('status', 'active')->get()->avg('attendance_rate') ?? 0;

        return [
            'message' => "📊 KPIs Institutionnels\n\n" .
                "├── Effectif total: {$totalStudents} étudiants\n" .
                "├── Revenus encaissés: " . number_format($totalPayments) . " FCFA\n" .
                "├── Taux de réussite: " . round($passRate, 1) . "%\n" .
                "└── Taux de présence moyen: " . round($attendanceAvg, 1) . "%",
            'type' => 'kpis',
        ];
    }

    private function getStudentAlerts()
    {
        $overdueCount = StudentFee::where('status', 'overdue')->count();
        $lowGradeStudents = Grade::selectRaw('student_id, AVG(grade) as avg_grade')
            ->groupBy('student_id')
            ->havingRaw('AVG(grade) < 10')
            ->count();

        return [
            'message' => "⚠️ Alertes Étudiants\n\n" .
                "💰 Paiements en retard: {$overdueCount} étudiant(s)\n" .
                "📉 Moyenne < 10/20: {$lowGradeStudents} étudiant(s)\n\n" .
                "Accédez au module **Gestion des Étudiants** pour voir les détails.",
            'type' => 'alerts',
        ];
    }
}
