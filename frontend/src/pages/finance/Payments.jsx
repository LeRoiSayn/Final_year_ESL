import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { paymentApi, studentFeeApi } from '../../services/api'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useI18n } from '../../i18n/index.jsx'

const PAYMENT_METHODS = ['cash', 'bank_transfer', 'mobile_money', 'check']
const emptyForm = { student_fee_id: '', amount: '', payment_method: 'cash', payment_date: new Date().toISOString().split('T')[0], notes: '' }

export default function FinancePayments() {
  const { t } = useI18n()
  const [payments, setPayments] = useState([])
  const [pendingFees, setPendingFees] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [editData, setEditData] = useState({ amount: '', payment_method: 'cash', payment_date: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [payRes, feeRes] = await Promise.all([paymentApi.getAll({ per_page: 100 }), studentFeeApi.getAll({ status: 'pending', per_page: 500 })])
      setPayments(payRes.data.data.data || payRes.data.data)
      const fees = feeRes.data.data.data || feeRes.data.data
      setPendingFees(fees.filter(f => f.status !== 'paid'))
    } catch { toast.error(t('error')) } finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await paymentApi.create(formData)
      toast.success(t('payment_recorded'))
      setModalOpen(false)
      setFormData(emptyForm)
      fetchData()
    } catch (error) { toast.error(error.response?.data?.message || 'Failed') }
    finally { setSubmitting(false) }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingPayment) return
    setSubmitting(true)
    try {
      await paymentApi.update(editingPayment.id, editData)
      toast.success('Paiement modifié')
      setEditModalOpen(false)
      setEditingPayment(null)
      fetchData()
    } catch (error) { toast.error(error.response?.data?.message || 'Erreur') }
    finally { setSubmitting(false) }
  }

  const openEdit = (payment) => {
    setEditingPayment(payment)
    setEditData({
      amount: payment.amount,
      payment_method: payment.payment_method,
      payment_date: payment.payment_date?.split('T')[0] || payment.payment_date,
      notes: payment.notes || '',
    })
    setEditModalOpen(true)
  }

  const handleFeeChange = (feeId) => {
    const fee = pendingFees.find(f => f.id.toString() === feeId)
    setFormData({ ...formData, student_fee_id: feeId, amount: fee ? (fee.amount - fee.paid_amount).toString() : '' })
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR').format(amount) + ' RWF'

  const columns = [
    { header: 'Reference', cell: (row) => <span className="font-mono text-sm">{row.reference_number}</span> },
    { header: 'Student', cell: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-medium">
          {row.student_fee?.student?.user?.first_name?.[0]}{row.student_fee?.student?.user?.last_name?.[0]}
        </div>
        <div>
          <p className="font-medium">{row.student_fee?.student?.user?.first_name} {row.student_fee?.student?.user?.last_name}</p>
          <p className="text-sm text-gray-500">{row.student_fee?.fee_type?.name}</p>
        </div>
      </div>
    )},
    { header: 'Amount', cell: (row) => <span className="font-semibold text-green-600">{formatCurrency(row.amount)}</span> },
    { header: 'Method', cell: (row) => <span className="badge badge-info">{row.payment_method?.replace('_', ' ')}</span> },
    { header: 'Date', accessor: (row) => new Date(row.payment_date).toLocaleDateString('fr-FR') },
    { header: 'Received By', accessor: (row) => row.received_by?.first_name ? `${row.received_by.first_name} ${row.received_by.last_name}` : 'System' },
    { header: 'Actions', cell: (row) => (
      <button
        onClick={(e) => { e.stopPropagation(); openEdit(row) }}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 text-gray-500 hover:text-primary-600"
        title="Modifier"
      >
        <PencilIcon className="w-4 h-4" />
      </button>
    )},
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Payments</h1>
          <p className="text-gray-500 dark:text-gray-400">Record and track payments</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Record Payment
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <DataTable columns={columns} data={payments} loading={loading} searchPlaceholder="Search payments..." />
      </motion.div>

      {/* Record payment modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Record Payment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Student Fee</label>
            <select value={formData.student_fee_id} onChange={(e) => handleFeeChange(e.target.value)} className="input" required>
              <option value="">Select fee</option>
              {pendingFees.map(f => <option key={f.id} value={f.id}>{f.student?.user?.first_name} {f.student?.user?.last_name} - {f.fee_type?.name} (Balance: {formatCurrency(f.amount - f.paid_amount)})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Amount (RWF)</label>
            <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="input" required min="1" />
          </div>
          <div>
            <label className="label">Payment Method</label>
            <select value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})} className="input" required>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m.replace('_', ' ').toUpperCase()}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Payment Date</label>
            <input type="date" value={formData.payment_date} onChange={(e) => setFormData({...formData, payment_date: e.target.value})} className="input" required />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="input" rows={2} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Recording...' : 'Record Payment'}</button>
          </div>
        </form>
      </Modal>

      {/* Edit payment modal */}
      <Modal isOpen={editModalOpen} onClose={() => { setEditModalOpen(false); setEditingPayment(null) }} title="Modifier le paiement">
        {editingPayment && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="p-3 bg-gray-50 dark:bg-dark-300 rounded-xl text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Étudiant :</strong> {editingPayment.student_fee?.student?.user?.first_name} {editingPayment.student_fee?.student?.user?.last_name}</p>
              <p><strong>Type :</strong> {editingPayment.student_fee?.fee_type?.name}</p>
            </div>
            <div>
              <label className="label">Montant (RWF)</label>
              <input type="number" value={editData.amount} onChange={(e) => setEditData({...editData, amount: e.target.value})} className="input" required min="1" />
            </div>
            <div>
              <label className="label">Méthode de paiement</label>
              <select value={editData.payment_method} onChange={(e) => setEditData({...editData, payment_method: e.target.value})} className="input" required>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m.replace('_', ' ').toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" value={editData.payment_date} onChange={(e) => setEditData({...editData, payment_date: e.target.value})} className="input" required />
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea value={editData.notes} onChange={(e) => setEditData({...editData, notes: e.target.value})} className="input" rows={2} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setEditModalOpen(false); setEditingPayment(null) }} className="btn-secondary">Annuler</button>
              <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Enregistrement...' : 'Enregistrer'}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
