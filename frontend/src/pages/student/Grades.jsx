import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { studentApi } from '../../services/api'
import { ChartBarIcon } from '@heroicons/react/24/outline'

function fmtScore(val) {
  if (val === null || val === undefined || val === '') return '—'
  return parseFloat(val).toFixed(1)
}

export default function StudentGrades() {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user?.student?.id) fetchGrades() }, [user])

  const fetchGrades = async () => {
    try { const response = await studentApi.getGrades(user.student.id); setEnrollments(response.data.data) }
    catch { toast.error('Impossible de charger les notes') }
    finally { setLoading(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>

  const totalCredits = enrollments.reduce((sum, e) => sum + (e.class?.course?.credits || 0), 0)
  const graded = enrollments.filter(e => e.grades?.length > 0 && e.grades[0]?.final_grade != null)
  const avgGrade = graded.length > 0 ? graded.reduce((s, e) => s + parseFloat(e.grades[0].final_grade), 0) / graded.length : 0

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Mes Notes</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Présence (/10) · Quiz (/20) · Contrôle Continu (/30) · Examen Final (/40)
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Crédits Total</p>
          <p className="text-3xl font-bold text-primary-600">{totalCredits}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Moyenne Générale</p>
          <p className="text-3xl font-bold text-blue-600">{avgGrade.toFixed(1)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Cours Notés</p>
          <p className="text-3xl font-bold text-teal-600">{graded.length}/{enrollments.length}</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Cours</th>
                <th>Code</th>
                <th>Crédits</th>
                <th className="text-center">Présence<br/><span className="font-normal text-xs">/10</span></th>
                <th className="text-center">Quiz<br/><span className="font-normal text-xs">/20</span></th>
                <th className="text-center">CC<br/><span className="font-normal text-xs">/30</span></th>
                <th className="text-center">Examen<br/><span className="font-normal text-xs">/40</span></th>
                <th className="text-center">Final</th>
                <th className="text-center">Mention</th>
                <th className="text-center">Statut</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map(enrollment => {
                const g = enrollment.grades?.[0]
                const final = g?.final_grade != null ? parseFloat(g.final_grade) : null
                return (
                  <tr key={enrollment.id}>
                    <td className="font-medium">{enrollment.class?.course?.name}</td>
                    <td className="text-gray-500">{enrollment.class?.course?.code}</td>
                    <td className="text-center">{enrollment.class?.course?.credits}</td>
                    <td className="text-center">{fmtScore(g?.attendance_score)}</td>
                    <td className="text-center">{fmtScore(g?.quiz_score)}</td>
                    <td className="text-center">{fmtScore(g?.continuous_assessment)}</td>
                    <td className="text-center">{fmtScore(g?.exam_score)}</td>
                    <td className="text-center font-semibold">
                      {final != null ? (
                        <span className={final >= 50 ? 'text-green-600' : 'text-red-500'}>{final.toFixed(1)}</span>
                      ) : '—'}
                    </td>
                    <td className="text-center">
                      <span className={`badge ${g ? (final >= 50 ? 'badge-success' : 'badge-danger') : 'badge-info'}`}>
                        {g?.letter_grade || 'N/A'}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${
                        g ? (final >= 50 ? 'badge-success' : 'badge-danger') : 'badge-warning'
                      }`}>
                        {g ? (final >= 50 ? 'Reçu' : 'Ajourné') : 'En attente'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
