import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bar } from 'react-chartjs-2'
import { dashboardApi } from '../../services/api'
import StatCard from '../../components/StatCard'
import { UserGroupIcon, UsersIcon, CalendarIcon, PlusCircleIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

export default function RegistrarDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await dashboardApi.getRegistrarStats()
      setStats(response.data.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const levelData = {
    labels: stats?.students_by_level?.map((l) => l.level) || [],
    datasets: [{
      label: 'Students',
      data: stats?.students_by_level?.map((l) => l.count) || [],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderRadius: 8,
    }],
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
          Registrar Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage student and teacher registrations
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={stats?.stats?.total_students || 0} icon={UserGroupIcon} color="primary" />
        <StatCard title="Active Students" value={stats?.stats?.active_students || 0} icon={UserGroupIcon} color="teal" delay={0.1} />
        <StatCard title="Total Teachers" value={stats?.stats?.total_teachers || 0} icon={UsersIcon} color="blue" delay={0.2} />
        <StatCard title="New This Month" value={stats?.stats?.new_this_month || 0} icon={CalendarIcon} color="orange" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Students by Level</h3>
          <div className="h-64">
            <Bar data={levelData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/registrar/students" className="p-4 rounded-xl bg-gray-50 dark:bg-dark-300 hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors text-center group">
              <PlusCircleIcon className="w-8 h-8 mx-auto mb-2 text-primary-500 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-gray-900 dark:text-white">Add Student</p>
            </Link>
            <Link to="/registrar/teachers" className="p-4 rounded-xl bg-gray-50 dark:bg-dark-300 hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors text-center group">
              <PlusCircleIcon className="w-8 h-8 mx-auto mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-gray-900 dark:text-white">Add Teacher</p>
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Registrations</h3>
        <div className="space-y-4">
          {stats?.recent_students?.map((student) => (
            <div key={student.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-300">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium">
                {student.user?.first_name?.[0]}{student.user?.last_name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{student.user?.first_name} {student.user?.last_name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{student.department?.name} - {student.level}</p>
              </div>
              <span className="badge badge-info">{student.student_id}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
