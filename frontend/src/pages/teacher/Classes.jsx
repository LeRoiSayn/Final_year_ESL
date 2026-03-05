import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { teacherApi } from '../../services/api'
import { BookOpenIcon, UserGroupIcon } from '@heroicons/react/24/outline'

export default function TeacherClasses() {
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user?.teacher?.id) fetchClasses() }, [user])

  const fetchClasses = async () => {
    try { const response = await teacherApi.getClasses(user.teacher.id); setClasses(response.data.data) } 
    catch (error) { toast.error('Failed to fetch classes') } finally { setLoading(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">My Classes</h1>
        <p className="text-gray-500 dark:text-gray-400">View and manage your assigned classes</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls, index) => (
          <motion.div key={cls.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="card-hover p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <BookOpenIcon className="w-6 h-6 text-white" />
              </div>
              <span className="badge badge-info">{cls.section}</span>
            </div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">{cls.course?.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{cls.course?.code}</p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-100">
              <div className="flex items-center gap-2 text-gray-500">
                <UserGroupIcon className="w-4 h-4" />
                <span className="text-sm">{cls.enrollments?.filter(e => e.status === 'enrolled').length || 0} students</span>
              </div>
              <span className="text-sm text-gray-500">{cls.room || 'No room'}</span>
            </div>
          </motion.div>
        ))}
        {classes.length === 0 && (
          <div className="col-span-full text-center py-12">
            <BookOpenIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No classes assigned yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
