import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { dashboardApi } from '../../services/api'
import StatCard from '../../components/StatCard'
import { BookOpenIcon, ChartBarIcon, ClockIcon, CurrencyDollarIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

export default function StudentDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try { const response = await dashboardApi.getStudentStats(); setStats(response.data.data) }
    catch (error) { console.error('Failed to fetch stats:', error) } finally { setLoading(false) }
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>

  const pendingFees = stats?.fees_summary?.pending || 0
  const isPaid = pendingFees <= 0
  const totalFees = stats?.fees_summary?.total || 0
  const paidAmount = stats?.fees_summary?.paid || 0
  const paymentPercent = totalFees > 0 ? Math.round((paidAmount / totalFees) * 100) : 100

  return (
    <div className="space-y-6">
      {/* Payment Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-4 flex items-center gap-4 ${
          isPaid
            ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700'
            : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700'
        }`}
      >
        <div className={`p-3 rounded-full ${isPaid ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
          {isPaid ? (
            <CheckCircleIcon className="w-7 h-7 text-green-600 dark:text-green-400" />
          ) : (
            <ExclamationTriangleIcon className="w-7 h-7 text-red-600 dark:text-red-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold text-lg ${isPaid ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
            {isPaid ? 'Compte en règle' : 'Paiement en attente'}
          </h3>
          <p className={`text-sm ${isPaid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPaid
              ? 'Tous vos frais de scolarité sont à jour.'
              : `Solde restant : ${formatCurrency(pendingFees)} — Veuillez régulariser votre situation.`
            }
          </p>
          {!isPaid && totalFees > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-500 dark:text-red-400">{paymentPercent}% payé</span>
                <span className="text-red-500 dark:text-red-400">{formatCurrency(paidAmount)} / {formatCurrency(totalFees)}</span>
              </div>
              <div className="h-2 bg-red-200 dark:bg-red-900/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all"
                  style={{ width: `${paymentPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
        {!isPaid && (
          <Link
            to="/student/payment"
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors whitespace-nowrap"
          >
            Payer maintenant
          </Link>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
        <p className="text-gray-500 dark:text-gray-400">Bienvenue ! Voici un aperçu de votre parcours académique.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Enrolled Courses" value={stats?.enrolled_courses || 0} icon={BookOpenIcon} color="primary" />
        <StatCard title="Total Credits" value={stats?.total_credits || 0} icon={ChartBarIcon} color="blue" delay={0.1} />
        <StatCard title="Attendance Rate" value={`${stats?.attendance_rate || 0}%`} icon={ClockIcon} color="teal" delay={0.2} />
        <StatCard title="Pending Fees" value={formatCurrency(stats?.pending_fees || 0)} icon={CurrencyDollarIcon} color="orange" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mes Cours ce Semestre</h3>
          <div className="space-y-3">
            {stats?.courses?.slice(0, 5).map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-dark-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
                    <BookOpenIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{enrollment.class?.course?.name}</p>
                    <p className="text-xs text-gray-500">{enrollment.class?.course?.code}
                      {enrollment.class?.teacher?.user && (
                        <span className="ml-2 text-primary-600">
                          · Prof. {enrollment.class.teacher.user.first_name} {enrollment.class.teacher.user.last_name}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <span className="badge badge-info">{enrollment.class?.course?.credits} cr</span>
              </div>
            ))}
            {(!stats?.courses || stats.courses.length === 0) && <p className="text-gray-500 text-center py-4">Aucun cours inscrit</p>}
          </div>
          <Link to="/student/courses" className="block mt-4 text-center text-primary-600 hover:text-primary-700 font-medium">Voir tous les cours →</Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 rounded-xl bg-gray-50 dark:bg-dark-300">
              <span className="text-gray-600 dark:text-gray-400">Total Fees</span>
              <span className="font-semibold">{formatCurrency(stats?.fees_summary?.total || 0)}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
              <span className="text-green-600 dark:text-green-400">Total Paid</span>
              <span className="font-semibold text-green-600">{formatCurrency(stats?.fees_summary?.paid || 0)}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
              <span className="text-red-600 dark:text-red-400">Balance Due</span>
              <span className="font-semibold text-red-600">{formatCurrency(stats?.fees_summary?.pending || 0)}</span>
            </div>
          </div>
          <Link to="/student/fees" className="block mt-4 text-center text-primary-600 hover:text-primary-700 font-medium">View fees & payments →</Link>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to="/student/courses" className="p-4 rounded-xl bg-gray-50 dark:bg-dark-300 hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors text-center"><BookOpenIcon className="w-8 h-8 mx-auto mb-2 text-primary-500" /><p className="font-medium text-sm">My Courses</p></Link>
          <Link to="/student/grades" className="p-4 rounded-xl bg-gray-50 dark:bg-dark-300 hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors text-center"><ChartBarIcon className="w-8 h-8 mx-auto mb-2 text-green-500" /><p className="font-medium text-sm">My Grades</p></Link>
          <Link to="/student/schedule" className="p-4 rounded-xl bg-gray-50 dark:bg-dark-300 hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors text-center"><ClockIcon className="w-8 h-8 mx-auto mb-2 text-blue-500" /><p className="font-medium text-sm">Schedule</p></Link>
          <Link to="/student/fees" className="p-4 rounded-xl bg-gray-50 dark:bg-dark-300 hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors text-center"><CurrencyDollarIcon className="w-8 h-8 mx-auto mb-2 text-orange-500" /><p className="font-medium text-sm">Fees</p></Link>
        </div>
      </motion.div>
    </div>
  )
}
