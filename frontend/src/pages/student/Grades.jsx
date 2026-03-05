import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { studentApi } from '../../services/api'
import { ChartBarIcon } from '@heroicons/react/24/outline'

export default function StudentGrades() {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user?.student?.id) fetchGrades() }, [user])

  const fetchGrades = async () => {
    try { const response = await studentApi.getGrades(user.student.id); setEnrollments(response.data.data) } 
    catch (error) { toast.error('Failed to fetch grades') } finally { setLoading(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>

  const totalCredits = enrollments.reduce((sum, e) => sum + (e.class?.course?.credits || 0), 0)
  const gradedEnrollments = enrollments.filter(e => e.grades?.length > 0)
  const avgGrade = gradedEnrollments.length > 0 
    ? gradedEnrollments.reduce((sum, e) => sum + (e.grades[0]?.final_grade || 0), 0) / gradedEnrollments.length 
    : 0

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">My Grades</h1>
        <p className="text-gray-500 dark:text-gray-400">View your academic performance</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Total Credits</p>
          <p className="text-3xl font-bold text-primary-600">{totalCredits}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Average Grade</p>
          <p className="text-3xl font-bold text-blue-600">{avgGrade.toFixed(1)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Courses Graded</p>
          <p className="text-3xl font-bold text-teal-600">{gradedEnrollments.length}/{enrollments.length}</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr><th>Course</th><th>Code</th><th>Credits</th><th>CA (40%)</th><th>Exam (60%)</th><th>Final</th><th>Grade</th><th>Status</th></tr>
            </thead>
            <tbody>
              {enrollments.map((enrollment) => {
                const grade = enrollment.grades?.[0]
                return (
                  <tr key={enrollment.id}>
                    <td className="font-medium">{enrollment.class?.course?.name}</td>
                    <td className="text-gray-500">{enrollment.class?.course?.code}</td>
                    <td>{enrollment.class?.course?.credits}</td>
                    <td>{grade?.continuous_assessment || '-'}</td>
                    <td>{grade?.exam_score || '-'}</td>
                    <td className="font-semibold">{grade?.final_grade?.toFixed(1) || '-'}</td>
                    <td><span className={`badge ${grade ? (grade.final_grade >= 50 ? 'badge-success' : 'badge-danger') : 'badge-info'}`}>{grade?.letter_grade || 'N/A'}</span></td>
                    <td><span className={`badge ${grade ? (grade.final_grade >= 50 ? 'badge-success' : 'badge-danger') : 'badge-warning'}`}>{grade ? (grade.final_grade >= 50 ? 'Passed' : 'Failed') : 'Pending'}</span></td>
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
