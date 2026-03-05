import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { studentApi } from '../../services/api'
import DataTable from '../../components/DataTable'
import { UserGroupIcon, EyeIcon } from '@heroicons/react/24/outline'

const LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2', 'D1', 'D2', 'D3']

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

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
      header: 'Email',
      accessor: (row) => row.user?.email,
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
        <span className={`badge ${
          row.status === 'active' ? 'badge-success' : 
          row.status === 'graduated' ? 'badge-info' : 'badge-warning'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Enrolled',
      accessor: (row) => new Date(row.enrollment_date).toLocaleDateString(),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <button
          onClick={() => toast.success(`View ${row.user?.first_name}'s profile`)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 text-gray-600 dark:text-gray-400"
        >
          <EyeIcon className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
          Students
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          View all registered students
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
