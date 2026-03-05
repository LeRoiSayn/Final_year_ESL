import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { teacherApi, gradeApi } from '../../services/api'
import { BookOpenIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function TeacherGrades() {
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [students, setStudents] = useState([])
  const [grades, setGrades] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (user?.teacher?.id) fetchClasses() }, [user])

  const fetchClasses = async () => {
    try { const response = await teacherApi.getClasses(user.teacher.id); setClasses(response.data.data) } 
    catch (error) { toast.error('Failed to fetch classes') } finally { setLoading(false) }
  }

  const fetchStudents = async (classId) => {
    setLoading(true)
    try {
      const response = await gradeApi.getByClass(classId)
      setStudents(response.data.data)
      const gradeMap = {}
      response.data.data.forEach(enrollment => {
        const grade = enrollment.grades?.[0]
        gradeMap[enrollment.id] = { continuous_assessment: grade?.continuous_assessment || '', exam_score: grade?.exam_score || '' }
      })
      setGrades(gradeMap)
    } catch (error) { toast.error('Failed to fetch students') } finally { setLoading(false) }
  }

  const handleClassSelect = (cls) => { setSelectedClass(cls); fetchStudents(cls.id) }

  const handleGradeChange = (enrollmentId, field, value) => {
    setGrades(prev => ({ ...prev, [enrollmentId]: { ...prev[enrollmentId], [field]: value } }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const gradeData = Object.entries(grades).map(([enrollmentId, data]) => ({
        enrollment_id: parseInt(enrollmentId), continuous_assessment: data.continuous_assessment || null, exam_score: data.exam_score || null
      })).filter(g => g.continuous_assessment !== null || g.exam_score !== null)
      await gradeApi.bulkUpdate(gradeData)
      toast.success('Grades saved successfully')
    } catch (error) { toast.error('Failed to save grades') } finally { setSaving(false) }
  }

  if (loading && !selectedClass) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Gradebook</h1>
        <p className="text-gray-500 dark:text-gray-400">Enter and manage student grades</p>
      </motion.div>

      {!selectedClass ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <button key={cls.id} onClick={() => handleClassSelect(cls)} className="card-hover p-6 text-left">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center"><BookOpenIcon className="w-6 h-6 text-white" /></div>
                <div><h3 className="font-semibold">{cls.course?.name}</h3><p className="text-sm text-gray-500">{cls.course?.code}</p></div>
              </div>
              <p className="text-sm text-gray-500">{cls.enrollments?.filter(e => e.status === 'enrolled').length || 0} students</p>
            </button>
          ))}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSelectedClass(null)} className="btn-secondary">← Back</button>
              <div><h2 className="font-semibold">{selectedClass.course?.name}</h2><p className="text-sm text-gray-500">{selectedClass.course?.code} - Section {selectedClass.section}</p></div>
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary"><CheckCircleIcon className="w-5 h-5 mr-2" />{saving ? 'Saving...' : 'Save Grades'}</button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr><th>Student</th><th>Student ID</th><th className="w-32">CA (40%)</th><th className="w-32">Exam (60%)</th><th className="w-24">Final</th><th className="w-20">Grade</th></tr>
                </thead>
                <tbody>
                  {students.map((enrollment) => {
                    const ca = parseFloat(grades[enrollment.id]?.continuous_assessment) || 0
                    const exam = parseFloat(grades[enrollment.id]?.exam_score) || 0
                    const final = (ca * 0.4) + (exam * 0.6)
                    const letter = final >= 90 ? 'A+' : final >= 85 ? 'A' : final >= 80 ? 'A-' : final >= 75 ? 'B+' : final >= 70 ? 'B' : final >= 65 ? 'B-' : final >= 60 ? 'C+' : final >= 55 ? 'C' : final >= 50 ? 'C-' : final >= 45 ? 'D+' : final >= 40 ? 'D' : 'F'
                    return (
                      <tr key={enrollment.id}>
                        <td><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white text-xs font-medium">{enrollment.student?.user?.first_name?.[0]}{enrollment.student?.user?.last_name?.[0]}</div><span>{enrollment.student?.user?.first_name} {enrollment.student?.user?.last_name}</span></div></td>
                        <td className="text-gray-500">{enrollment.student?.student_id}</td>
                        <td><input type="number" value={grades[enrollment.id]?.continuous_assessment || ''} onChange={(e) => handleGradeChange(enrollment.id, 'continuous_assessment', e.target.value)} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-dark-100 bg-white dark:bg-dark-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" min="0" max="100" /></td>
                        <td><input type="number" value={grades[enrollment.id]?.exam_score || ''} onChange={(e) => handleGradeChange(enrollment.id, 'exam_score', e.target.value)} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-dark-100 bg-white dark:bg-dark-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" min="0" max="100" /></td>
                        <td className="font-semibold">{final.toFixed(1)}</td>
                        <td><span className={`badge ${final >= 50 ? 'badge-success' : 'badge-danger'}`}>{letter}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
