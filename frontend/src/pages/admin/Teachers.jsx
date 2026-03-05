import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { teacherApi } from '../../services/api'
import DataTable from '../../components/DataTable'
import { UsersIcon, EyeIcon } from '@heroicons/react/24/outline'

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const response = await teacherApi.getAll({ per_page: 100 })
      setTeachers(response.data.data.data || response.data.data)
    } catch (error) {
      toast.error('Failed to fetch teachers')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      header: 'Teacher',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
            {row.user?.first_name?.[0]}{row.user?.last_name?.[0]}
          </div>
          <div>
            <p className="font-medium">{row.user?.first_name} {row.user?.last_name}</p>
            <p className="text-sm text-gray-500">{row.employee_id}</p>
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
      header: 'Qualification',
      accessor: 'qualification',
    },
    {
      header: 'Specialization',
      accessor: (row) => row.specialization || '-',
    },
    {
      header: 'Status',
      cell: (row) => (
        <span className={`badge ${
          row.status === 'active' ? 'badge-success' : 
          row.status === 'on_leave' ? 'badge-warning' : 'badge-danger'
        }`}>
          {row.status}
        </span>
      ),
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
          Teachers
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          View all registered teachers
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <DataTable
          columns={columns}
          data={teachers}
          loading={loading}
          searchPlaceholder="Search teachers..."
        />
      </motion.div>
    </div>
  )
}
