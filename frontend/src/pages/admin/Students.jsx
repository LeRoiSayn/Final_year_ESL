import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { studentApi, adminApi } from '../../services/api'
import DataTable from '../../components/DataTable'
import {
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
  BookOpenIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'

const SEMESTER_LABELS = { '1': 'Semestre 1', '2': 'Semestre 2', '3': 'Semestre 3' }

function letterGradeBadgeClass(letter) {
  if (!letter) return 'bg-gray-100 text-gray-600'
  if (letter.startsWith('A')) return 'bg-green-100 text-green-700'
  if (letter.startsWith('B')) return 'bg-blue-100 text-blue-700'
  if (letter.startsWith('C')) return 'bg-yellow-100 text-yellow-700'
  if (letter.startsWith('D')) return 'bg-orange-100 text-orange-700'
  return 'bg-red-100 text-red-700'
}

/** Single course row inside a semester table */
function TranscriptCourseRow({ item }) {
  const { course, grade, course_status: status, enrollment } = item
  const isFuture = status === 'not_enrolled'
  const teacher = enrollment?.teacher

  const statusIcon = {
    validated:    <CheckCircleIcon    className="w-4 h-4 text-green-500 shrink-0" />,
    enrolled:     <BookOpenIcon       className="w-4 h-4 text-blue-500 shrink-0"  />,
    failed:       <ExclamationCircleIcon className="w-4 h-4 text-red-500 shrink-0" />,
    not_enrolled: <ClockIcon          className="w-4 h-4 text-gray-300 shrink-0"  />,
  }[status]

  return (
    <tr className={`border-b border-gray-100 dark:border-dark-100 ${isFuture ? 'opacity-50' : 'hover:bg-gray-50 dark:hover:bg-dark-100'}`}>
      <td className="py-2 px-3 w-8">{statusIcon}</td>
      <td className="py-2 px-3 text-xs font-mono text-gray-500">{course.code}</td>
      <td className="py-2 px-3 text-sm font-medium text-gray-800 dark:text-gray-200">{course.name}</td>
      <td className="py-2 px-3 text-xs text-gray-500 whitespace-nowrap">
        {teacher ? (
          <span className="text-primary-600">Prof. {teacher.first_name} {teacher.last_name}</span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
      <td className="py-2 px-3 text-xs text-center text-gray-500 whitespace-nowrap">{course.credits} cr.</td>
      <td className="py-2 px-3 text-xs text-center">
        {grade ? (
          <span className="font-semibold text-gray-700 dark:text-gray-300">{grade.final_grade}%</span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
      <td className="py-2 px-3 text-xs text-center">
        {grade?.letter_grade ? (
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${letterGradeBadgeClass(grade.letter_grade)}`}>
            {grade.letter_grade}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
    </tr>
  )
}

/** Collapsible semester block inside a year accordion */
function SemesterSection({ sem, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const { stats } = sem

  const headerCls = {
    past:    'bg-gray-50 dark:bg-dark-100 text-gray-700 dark:text-gray-300',
    current: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200',
    future:  'bg-gray-50 dark:bg-dark-100 text-gray-400',
  }[sem.status] ?? 'bg-gray-50 dark:bg-dark-100'

  const badgeCls = {
    past:    'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    current: 'bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-100',
    future:  'bg-gray-100 text-gray-400',
  }[sem.status] ?? ''

  const badgeLabel = { past: 'Terminé', current: 'En cours', future: 'À venir' }[sem.status]

  return (
    <div className="mb-2 border border-gray-100 dark:border-dark-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-3 py-2.5 px-4 text-left transition-colors ${headerCls}`}
      >
        <span className="font-semibold text-sm">{sem.label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeCls}`}>{badgeLabel}</span>
        <span className="ml-auto text-xs text-gray-400">
          {stats.validated}/{stats.total} validés · {stats.credits_earned}/{stats.credits_total} cr.
        </span>
        <span className="text-xs text-gray-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-dark-100 text-xs text-gray-500 uppercase">
                <th className="py-1.5 px-3 w-8" />
                <th className="py-1.5 px-3">Code</th>
                <th className="py-1.5 px-3">Intitulé</th>
                <th className="py-1.5 px-3">Professeur</th>
                <th className="py-1.5 px-3 text-center">Crédits</th>
                <th className="py-1.5 px-3 text-center">Note</th>
                <th className="py-1.5 px-3 text-center">Mention</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-200">
              {sem.courses.map((item, i) => (
                <TranscriptCourseRow key={item.course?.id ?? i} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/** Collapsible year accordion shown in the transcript */
function YearSection({ yearData, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const { year, year_label, is_current_year, is_past_year, semesters, year_stats } = yearData

  const headerCls = is_current_year
    ? 'bg-primary-50 dark:bg-primary-900/20'
    : is_past_year
      ? 'bg-green-50 dark:bg-green-900/10'
      : 'bg-gray-50 dark:bg-dark-100'

  const yearLabelCls = is_current_year
    ? 'text-primary-700 dark:text-primary-300'
    : is_past_year
      ? 'text-green-700 dark:text-green-400'
      : 'text-gray-400'

  return (
    <div className="mb-4 border border-gray-200 dark:border-dark-100 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-3 py-3 px-4 text-left transition-colors ${headerCls}`}
      >
        <span className={`text-base font-bold ${yearLabelCls}`}>{year}</span>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{year_label}</span>

        {is_current_year && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200 font-medium">
            Année en cours
          </span>
        )}
        {is_past_year && year_stats.is_year_passed && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
            ✓ Réussie
          </span>
        )}
        {is_past_year && !year_stats.is_year_passed && year_stats.failed > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
            Partiellement validée
          </span>
        )}

        <span className="ml-auto text-xs text-gray-400">
          {year_stats.validated}/{year_stats.total} validés · {year_stats.credits_earned}/{year_stats.credits_total} cr.
        </span>
        <span className="text-xs text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="p-3 bg-white dark:bg-dark-200 space-y-2">
          {semesters.map((sem) => (
            <SemesterSection
              key={sem.semester}
              sem={sem}
              defaultOpen={sem.status === 'current'}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/** Full transcript modal — Year → Semester → Course hierarchy */
function StudentProfileModal({ studentId, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getStudentDetails(studentId)
      .then(res => setData(res.data))
      .catch(() => toast.error('Erreur lors du chargement du profil'))
      .finally(() => setLoading(false))
  }, [studentId])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-dark-200 rounded-2xl p-10 flex flex-col items-center gap-4 shadow-2xl">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Chargement du profil académique...</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { student, academic_progress = {}, statistics = {} } = data
  const prog    = academic_progress
  const summary = prog.programme_summary || {}
  const years   = prog.years || []

  // Legend counts derived from the years tree
  const totalValidated   = years.reduce((s, y) => s + (y.year_stats?.validated   ?? 0), 0)
  const totalInProgress  = years.reduce((s, y) => s + (y.year_stats?.in_progress ?? 0), 0)
  const totalFailed      = years.reduce((s, y) => s + (y.year_stats?.failed      ?? 0), 0)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-dark-200 rounded-2xl shadow-2xl w-full max-w-4xl my-8"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white text-xl font-bold shadow">
              {student.user?.first_name?.[0]}{student.user?.last_name?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">
                {student.user?.first_name} {student.user?.last_name}
              </h2>
              <p className="text-sm text-gray-500">
                {student.student_id} · {student.department?.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-primary-50 dark:bg-primary-900/20 p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Niveau actuel</p>
              <p className="text-lg font-bold text-primary-600">{prog.current_level}</p>
              <p className="text-xs text-gray-400">{SEMESTER_LABELS[prog.current_semester]}</p>
            </div>
            <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Cours validés</p>
              <p className="text-lg font-bold text-green-600">{totalValidated}</p>
              <p className="text-xs text-gray-400">/ {summary.total_programme_courses ?? 0}</p>
            </div>
            <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Crédits</p>
              <p className="text-lg font-bold text-blue-600">{summary.credits_earned ?? 0}</p>
              <p className="text-xs text-gray-400">/ {summary.credits_total ?? 0}</p>
            </div>
            <div className="rounded-xl bg-purple-50 dark:bg-purple-900/20 p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Avancement</p>
              <p className="text-lg font-bold text-purple-600">{summary.completion_percentage ?? 0}%</p>
              <p className="text-xs text-gray-400">
                Moy.&nbsp;
                {statistics.overall_average != null ? `${statistics.overall_average}%` : '—'}
              </p>
            </div>
          </div>

          {/* ── Progress bar ── */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progression du cursus</span>
              <span>{summary.completion_percentage ?? 0}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-dark-100 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-primary-500 to-teal-500 transition-all"
                style={{ width: `${Math.min(100, summary.completion_percentage ?? 0)}%` }}
              />
            </div>
          </div>

          {/* ── Legend ── */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              {totalValidated} validé{totalValidated !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpenIcon className="w-4 h-4 text-blue-500" />
              {totalInProgress} en cours
            </span>
            {totalFailed > 0 && (
              <span className="flex items-center gap-1.5">
                <ExclamationCircleIcon className="w-4 h-4 text-red-500" />
                {totalFailed} non validé{totalFailed !== 1 ? 's' : ''}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <ClockIcon className="w-4 h-4 text-gray-300" />
              À venir
            </span>
          </div>

          {/* ── Transcript: Year → Semester → Courses ── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
              Relevé de notes — Vue par année et semestre
            </h3>
            {years.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                Aucun cours trouvé dans le programme de cet étudiant.
              </p>
            ) : (
              years.map((yearData) => (
                <YearSection
                  key={yearData.year}
                  yearData={yearData}
                  defaultOpen={yearData.is_current_year}
                />
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStudentId, setSelectedStudentId] = useState(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await studentApi.getAll({ per_page: 100 })
      setStudents(response.data.data.data || response.data.data)
    } catch (error) {
      toast.error('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      header: 'Étudiant',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white font-medium">
            {row.user?.first_name?.[0]}{row.user?.last_name?.[0]}
          </div>
          <div>
            <p className="font-medium">{row.user?.first_name} {row.user?.last_name}</p>
            <p className="text-sm text-gray-500">{row.student_id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: (row) => row.user?.email,
    },
    {
      header: 'Filière',
      accessor: (row) => row.department?.name,
    },
    {
      header: 'Niveau',
      cell: (row) => <span className="badge badge-info">{row.level}</span>,
    },
    {
      header: 'Statut',
      cell: (row) => (
        <span className={`badge ${
          row.status === 'active' ? 'badge-success' :
          row.status === 'graduated' ? 'badge-info' : 'badge-warning'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Inscription',
      accessor: (row) => row.enrollment_date ? new Date(row.enrollment_date).toLocaleDateString('fr-FR') : '—',
    },
    {
      header: 'Profil',
      cell: (row) => (
        <button
          onClick={() => setSelectedStudentId(row.id)}
          className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600"
          title="Voir le profil académique complet"
        >
          <EyeIcon className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
          Étudiants
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Cliquez sur l'icône <EyeIcon className="inline w-4 h-4 text-primary-500" /> pour voir le profil académique complet d'un étudiant.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <DataTable
          columns={columns}
          data={students}
          loading={loading}
          searchPlaceholder="Rechercher un étudiant..."
        />
      </motion.div>

      <AnimatePresence>
        {selectedStudentId && (
          <StudentProfileModal
            studentId={selectedStudentId}
            onClose={() => setSelectedStudentId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

