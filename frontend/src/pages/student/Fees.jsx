import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { studentApi } from '../../services/api'
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'

export default function StudentFees() {
  const { user } = useAuth()
  const [data, setData] = useState({ fees: [], summary: {} })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.student?.id) fetchFees()
  }, [user])

  const fetchFees = async () => {
    try {
      const response = await studentApi.getFees(user.student.id)
      setData(response.data.data)
    } catch (error) {
      toast.error('Erreur lors du chargement des frais')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR').format(amount || 0) + ' FCFA'

  const getStatusConfig = (status) => {
    const configs = {
      paid: { label: 'Payé', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
      partial: { label: 'Partiel', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
      pending: { label: 'En attente', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
      overdue: { label: 'En retard', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
    }
    return configs[status] || configs.pending
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-gray-100 dark:bg-dark-200 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-100 dark:bg-dark-200 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Frais de Scolarité</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Année académique {new Date().getFullYear()} - {new Date().getFullYear() + 1}
        </p>
      </motion.div>

      {/* Tuition Overview - Simple and Clean */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-dark-200 rounded-lg border border-gray-200 dark:border-dark-100 p-6"
      >
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Récapitulatif</h2>
        <div className="grid grid-cols-3 gap-8">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total des frais</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {formatCurrency(data.summary?.total)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Montant payé</p>
            <p className="text-xl font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(data.summary?.paid)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Solde restant</p>
            <p className={`text-xl font-semibold ${
              (data.summary?.balance || 0) > 0 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-green-600 dark:text-green-400'
            }`}>
              {formatCurrency(data.summary?.balance)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Fee Breakdown Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-dark-200 rounded-lg border border-gray-200 dark:border-dark-100 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-100">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Détail des frais</h2>
        </div>

        {data.fees?.length === 0 ? (
          <div className="p-8 text-center">
            <CurrencyDollarIcon className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Aucun frais assigné pour le moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-dark-300">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type de frais
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Payé
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Échéance
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-100">
                {data.fees?.map((fee) => {
                  const statusConfig = getStatusConfig(fee.status)
                  const balance = (fee.amount || 0) - (fee.paid_amount || 0)
                  const isOverdue = fee.due_date && new Date(fee.due_date) < new Date() && balance > 0

                  return (
                    <tr key={fee.id} className="hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {fee.fee_type?.name || 'Frais'}
                        </span>
                        {fee.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{fee.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                        {formatCurrency(fee.amount)}
                      </td>
                      <td className="px-6 py-4 text-right text-green-600 dark:text-green-400">
                        {formatCurrency(fee.paid_amount)}
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${
                        balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                      }`}>
                        {formatCurrency(balance)}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                        {fee.due_date ? (
                          <span className={isOverdue ? 'text-red-600 dark:text-red-400' : ''}>
                            {new Date(fee.due_date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          isOverdue 
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : `${statusConfig.bg} ${statusConfig.text}`
                        }`}>
                          {isOverdue ? 'En retard' : statusConfig.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Payment History */}
      {data.fees?.some(f => f.payments?.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-dark-200 rounded-lg border border-gray-200 dark:border-dark-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-100">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Historique des paiements</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-dark-100">
            {data.fees
              ?.flatMap(f => f.payments || [])
              .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
              .slice(0, 10)
              .map((payment) => (
                <div key={payment.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {payment.reference_number}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(payment.payment_date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })} • {(payment.payment_method || 'espèces').replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium text-green-600 dark:text-green-400">
                    +{formatCurrency(payment.amount)}
                  </p>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Note */}
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        Pour effectuer un paiement, veuillez accéder à la page <strong>Paiement</strong> dans le menu.
      </p>
    </div>
  )
}
