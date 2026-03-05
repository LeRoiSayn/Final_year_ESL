import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { studentApi } from '../../services/api'
import DataTable from '../../components/DataTable'
import {
  CheckCircleIcon,
  PlayIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

export default function AdminEnrollment() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [enrollingAll, setEnrollingAll] = useState(false)

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

  const handleAutoEnroll = async (student) => {
    try {
      const response = await studentApi.autoEnroll(student.id)
      toast.success(response.data.message)
      fetchStudents()
    } catch (error) {
      toast.error('Auto-enrollment failed')
    }
  }

  const handleAutoEnrollAll = async () => {
    if (!window.confirm('This will auto-enroll all active students in their respective courses. Continue?')) return
    
    setEnrollingAll(true)
    try {
      const response = await studentApi.autoEnrollAll()
      toast.success(response.data.message)
      fetchStudents()
    } catch (error) {
      toast.error('Mass auto-enrollment failed')
    } finally {
      setEnrollingAll(false)
    }
  }

  const columns = [
    {
      header: 'Student',
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
      header: 'Department',
      accessor: (row) => row.department?.name,
    },
    {
      header: 'Level',
      cell: (row) => <span className="badge badge-info">{row.level}</span>,
    },
    {
      header: 'Status',
      cell: (row) => (
        <span className={`badge ${row.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <button
          onClick={() => handleAutoEnroll(row)}
          disabled={row.status !== 'active'}
          className="btn-primary py-1.5 px-3 text-sm disabled:opacity-50"
        >
          <PlayIcon className="w-4 h-4 mr-1" />
          Auto Enroll
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            Auto Enrollment
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Automatically enroll students in their level courses
          </p>
        </div>
        <button
          onClick={handleAutoEnrollAll}
          disabled={enrollingAll}
          className="btn-accent"
        >
          {enrollingAll ? (
            <>
              <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
              Enrolling...
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Enroll All Students
            </>
          )}
        </button>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 bg-gradient-to-r from-primary-500/10 to-teal-500/10 border-primary-200 dark:border-primary-800"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center">
            <CheckCircleIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">How Auto-Enrollment Works</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              When you auto-enroll a student, the system automatically:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1 list-disc list-inside">
              <li>Finds all courses for the student's department and level</li>
              <li>Creates class sections if they don't exist</li>
              <li>Enrolls the student in all matching courses</li>
            </ul>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <DataTable
          columns={columns}
          data={students}
          loading={loading}
          searchPlaceholder="Search students..."
        />
      </motion.div>
    </div>
  )
}
