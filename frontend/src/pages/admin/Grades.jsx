import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import api, { adminApi } from '../../services/api'
import {
  AcademicCapIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────
function letterGrade(score) {
  if (score >= 90) return 'A+'
  if (score >= 85) return 'A'
  if (score >= 80) return 'A-'
  if (score >= 75) return 'B+'
  if (score >= 70) return 'B'
  if (score >= 65) return 'B-'
  if (score >= 60) return 'C+'
  if (score >= 55) return 'C'
  if (score >= 50) return 'C-'
  if (score >= 45) return 'D+'
  if (score >= 40) return 'D'
  return 'F'
}

const statusConfig = {
  pending:   { label: 'En attente',  bg: 'bg-amber-50 dark:bg-amber-900/20',  text: 'text-amber-600 dark:text-amber-400', Icon: ClockIcon },
  submitted: { label: 'Soumis',      bg: 'bg-blue-50 dark:bg-blue-900/20',    text: 'text-blue-600 dark:text-blue-400',   Icon: AcademicCapIcon },
  validated: { label: 'Validé',      bg: 'bg-green-50 dark:bg-green-900/20',  text: 'text-green-600 dark:text-green-400', Icon: CheckCircleIcon },
  rejected:  { label: 'Refusé',      bg: 'bg-red-50 dark:bg-red-900/20',      text: 'text-red-600 dark:text-red-400',     Icon: XCircleIcon },
}

// ──────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────
export default function AdminGrades() {
  const [classes, setClasses]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [selectedClass, setSelectedClass] = useState(null)
  const [gradeRows, setGradeRows]     = useState([])
  const [gradeLoading, setGradeLoading] = useState(false)
  const [editingId, setEditingId]     = useState(null)
  const [editValues, setEditValues]   = useState({})
  const [saving, setSaving]           = useState(false)

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectClassId, setRejectClassId]     = useState(null)
  const [rejectReason, setRejectReason]       = useState('')
  const [rejecting, setRejecting]             = useState(false)
  const [validating, setValidating]           = useState(false)

  // ── Fetch overview ──────────────────────────────────────
  const fetchClasses = useCallback(async () => {
    try {
      const res = await api.get('/admin/grades/overview')
      const payload = res.data?.data ?? res.data
      setClasses(Array.isArray(payload) ? payload : [])
    } catch {
      toast.error('Impossible de charger les classes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchClasses() }, [fetchClasses])

  // ── Fetch grades for selected class ────────────────────
  const openClass = useCallback(async (cls) => {
    setSelectedClass(cls)
    setGradeLoading(true)
    setGradeRows([])
    setEditingId(null)
    try {
      const res  = await api.get(`/grades/class/${cls.id}`)
      const rows = res.data?.data ?? res.data ?? []
      setGradeRows(Array.isArray(rows) ? rows : [])
    } catch {
      toast.error('Impossible de charger les notes')
    } finally {
      setGradeLoading(false)
    }
  }, [])

  // ── Save grade edit ─────────────────────────────────────
  const saveEdit = async (gradeId) => {
    setSaving(true)
    try {
      await api.put(`/admin/grades/${gradeId}`, editValues)
      setGradeRows((prev) =>
        prev.map((g) => (g.id === gradeId ? { ...g, ...editValues } : g))
      )
      setEditingId(null)
      toast.success('Note mise à jour')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  // ── Validate grades ───────────────────────────────────
  const handleValidate = async (classId) => {
    setValidating(true)
    try {
      await adminApi.validateClassGrades(classId)
      toast.success('Notes validées avec succès')
      // Update local state
      setClasses(prev => prev.map(c =>
        c.id === classId ? { ...c, status: 'validated', rejection_reason: null } : c
      ))
      if (selectedClass?.id === classId) {
        setSelectedClass(prev => ({ ...prev, status: 'validated', rejection_reason: null }))
      }
    } catch {
      toast.error('Erreur lors de la validation')
    } finally {
      setValidating(false)
    }
  }

  // ── Reject grades ─────────────────────────────────────
  const openRejectModal = (classId) => {
    setRejectClassId(classId)
    setRejectReason('')
    setShowRejectModal(true)
  }

  const handleReject = async () => {
    if (rejectReason.trim().length < 5) {
      toast.error('Le motif doit contenir au moins 5 caractères')
      return
    }
    setRejecting(true)
    try {
      await adminApi.rejectClassGrades(rejectClassId, rejectReason)
      toast.success('Notes refusées — le professeur a été notifié')
      setShowRejectModal(false)
      // Update local state
      setClasses(prev => prev.map(c =>
        c.id === rejectClassId ? { ...c, status: 'rejected', rejection_reason: rejectReason } : c
      ))
      if (selectedClass?.id === rejectClassId) {
        setSelectedClass(prev => ({ ...prev, status: 'rejected', rejection_reason: rejectReason }))
      }
    } catch {
      toast.error('Erreur lors du refus')
    } finally {
      setRejecting(false)
    }
  }

  // ── Filtered classes ────────────────────────────────────
  const filtered = classes.filter((c) =>
    [c.name, c.course, c.code, c.teacher]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  // ──────────────────────────────────────────────────────────
  // Rejection Modal
  // ──────────────────────────────────────────────────────────
  const RejectModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-dark-200 rounded-xl w-full max-w-md overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-100 flex items-center gap-3">
          <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Refuser les notes</h2>
            <p className="text-sm text-gray-500">Le professeur sera notifié du motif</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Motif du refus
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Ex: Un élève absent n'a pas pu passer l'examen mais a reçu une note. Veuillez vérifier et corriger."
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-dark-100 bg-white dark:bg-dark-300 text-gray-900 dark:text-white text-sm resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{rejectReason.length}/500 caractères (min. 5)</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowRejectModal(false)}
              className="flex-1 py-2.5 border border-gray-200 dark:border-dark-100 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-dark-300"
            >
              Annuler
            </button>
            <button
              onClick={handleReject}
              disabled={rejecting || rejectReason.trim().length < 5}
              className="flex-1 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {rejecting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <XCircleIcon className="w-4 h-4" />
                  Refuser
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )

  // ──────────────────────────────────────────────────────────
  // Render: class detail view
  // ──────────────────────────────────────────────────────────
  if (selectedClass) {
    const cls = selectedClass
    const st = statusConfig[cls.status] || statusConfig.pending

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedClass(null)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {cls.course} — {cls.name}
              </h1>
              <p className="text-sm text-gray-500">
                Prof: {cls.teacher} · Code: {cls.code}
              </p>
            </div>
          </div>

          {/* Status badge + action buttons */}
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
              <st.Icon className="w-3.5 h-3.5" />
              {st.label}
            </span>

            {(cls.status === 'submitted' || cls.status === 'rejected') && (
              <>
                <button
                  onClick={() => handleValidate(cls.id)}
                  disabled={validating}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  {validating ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShieldCheckIcon className="w-4 h-4" />
                  )}
                  Valider
                </button>
                <button
                  onClick={() => openRejectModal(cls.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  <XCircleIcon className="w-4 h-4" />
                  Refuser
                </button>
              </>
            )}
          </div>
        </div>

        {/* Rejection reason banner */}
        {cls.status === 'rejected' && cls.rejection_reason && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Motif du refus</p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">{cls.rejection_reason}</p>
            </div>
          </div>
        )}

        {/* Grade table */}
        <div className="card overflow-hidden">
          {gradeLoading ? (
            <div className="p-8 text-center text-gray-400">Chargement…</div>
          ) : gradeRows.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Aucune note enregistrée pour cette classe.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Étudiant</th>
                    <th>Matricule</th>
                    <th className="text-center">Présence<br /><span className="font-normal text-xs text-gray-400">/10</span></th>
                    <th className="text-center">Quiz<br /><span className="font-normal text-xs text-gray-400">/20</span></th>
                    <th className="text-center">CC<br /><span className="font-normal text-xs text-gray-400">/30</span></th>
                    <th className="text-center">Examen<br /><span className="font-normal text-xs text-gray-400">/40</span></th>
                    <th className="text-center">Total /100</th>
                    <th className="text-center">Mention</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {gradeRows.map((enrollment) => {
                    const grade = enrollment.grades?.[0]
                    if (!grade) return null
                    const isEditing = editingId === grade.id
                    const student   = enrollment.student?.user
                    const name      = student
                      ? `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim()
                      : '—'
                    const sid       = enrollment.student?.student_id ?? '—'
                    const total     = parseFloat(grade.final_grade) || 0

                    return (
                      <tr key={grade.id}>
                        <td>{name}</td>
                        <td className="text-gray-500">{sid}</td>

                        {isEditing ? (
                          <>
                            {[
                              ['attendance_score', 10],
                              ['quiz_score', 20],
                              ['continuous_assessment', 30],
                              ['exam_score', 40],
                            ].map(([field, max]) => (
                              <td key={field}>
                                <input
                                  type="number"
                                  min="0"
                                  max={max}
                                  step="0.5"
                                  value={editValues[field] ?? grade[field] ?? ''}
                                  onChange={(e) =>
                                    setEditValues((prev) => ({ ...prev, [field]: e.target.value }))
                                  }
                                  className="w-20 px-2 py-1 rounded border border-gray-300 dark:border-dark-100 bg-white dark:bg-dark-300 text-sm"
                                />
                              </td>
                            ))}
                          </>
                        ) : (
                          <>
                            <td className="text-center">{grade.attendance_score ?? '—'}</td>
                            <td className="text-center">{grade.quiz_score ?? '—'}</td>
                            <td className="text-center">{grade.continuous_assessment ?? '—'}</td>
                            <td className="text-center">{grade.exam_score ?? '—'}</td>
                          </>
                        )}

                        <td className={`text-center font-semibold ${total >= 50 ? 'text-green-600' : 'text-red-500'}`}>
                          {total ? total.toFixed(1) : '—'}
                        </td>
                        <td className="text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${total >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {grade.letter_grade ?? letterGrade(total)}
                          </span>
                        </td>
                        <td className="text-center">
                          {isEditing ? (
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => saveEdit(grade.id)}
                                disabled={saving}
                                className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                              >
                                {saving ? '…' : 'Sauver'}
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingId(grade.id)
                                setEditValues({
                                  attendance_score: grade.attendance_score ?? '',
                                  quiz_score: grade.quiz_score ?? '',
                                  continuous_assessment: grade.continuous_assessment ?? '',
                                  exam_score: grade.exam_score ?? '',
                                })
                              }}
                              className="p-1 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reject modal */}
        <AnimatePresence>
          {showRejectModal && <RejectModal />}
        </AnimatePresence>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────
  // Render: class list / overview
  // ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestion des Notes
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Consultez et validez les notes soumises par les enseignants
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une classe…"
          className="input pl-9"
        />
      </div>

      {/* Class grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Aucune classe trouvée.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cls) => {
            const st = statusConfig[cls.status] || statusConfig.pending
            return (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-5 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openClass(cls)}
              >
                {/* Status badge */}
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                    <AcademicCapIcon className="w-5 h-5" />
                  </div>
                  <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${st.bg} ${st.text}`}>
                    <st.Icon className="w-3.5 h-3.5" />
                    {st.label}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white">{cls.course}</h3>
                <p className="text-sm text-gray-500 mb-1">{cls.name} · {cls.code}</p>
                <p className="text-xs text-gray-400 mb-3">Prof: {cls.teacher || '—'}</p>

                {/* Rejection reason preview */}
                {cls.status === 'rejected' && cls.rejection_reason && (
                  <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400 line-clamp-2">
                    {cls.rejection_reason}
                  </div>
                )}

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Notes saisies</span>
                    <span>{cls.graded}/{cls.total_enrolled}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-dark-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        cls.status === 'validated' ? 'bg-green-500' :
                        cls.status === 'rejected' ? 'bg-red-500' :
                        'bg-primary-500'
                      }`}
                      style={{ width: cls.total_enrolled > 0 ? `${Math.round((cls.graded / cls.total_enrolled) * 100)}%` : '0%' }}
                    />
                  </div>
                </div>

                {/* Quick action buttons for submitted classes */}
                {(cls.status === 'submitted') && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-dark-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleValidate(cls.id) }}
                      disabled={validating}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                    >
                      <ShieldCheckIcon className="w-3.5 h-3.5" />
                      Valider
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openRejectModal(cls.id) }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                    >
                      <XCircleIcon className="w-3.5 h-3.5" />
                      Refuser
                    </button>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Reject modal */}
      <AnimatePresence>
        {showRejectModal && <RejectModal />}
      </AnimatePresence>
    </div>
  )
}
