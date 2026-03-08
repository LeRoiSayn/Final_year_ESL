import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { studentFeeApi, studentApi, feeTypeApi } from '../../services/api'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import { PlusIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { useI18n } from '../../i18n/index.jsx'

export default function FinanceStudentFees() {
  const { t } = useI18n()
  const [fees, setFees] = useState([])
  const [students, setStudents] = useState([])
  const [feeTypes, setFeeTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({ student_id: '', fee_type_id: '', amount: '', due_date: '', academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}` })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [feeRes, studRes, typeRes] = await Promise.all([studentFeeApi.getAll({ per_page: 100 }), studentApi.getAll({ per_page: 500 }), feeTypeApi.getAll({ active_only: true })])
      setFees(feeRes.data.data.data || feeRes.data.data)
      setStudents(studRes.data.data.data || studRes.data.data)
      setFeeTypes(typeRes.data.data)
    } catch (error) { toast.error(t('error')) } finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try { await studentFeeApi.create(formData); toast.success(t('fee_assigned')); setModalOpen(false); setFormData({ student_id: '', fee_type_id: '', amount: '', due_date: '', academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}` }); fetchData() } 
    catch (error) { toast.error(error.response?.data?.message || 'Failed') }
  }

  const handleFeeTypeChange = (feeTypeId) => {
    const ft = feeTypes.find(f => f.id.toString() === feeTypeId)
    setFormData({ ...formData, fee_type_id: feeTypeId, amount: ft?.amount || '' })
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'

  const getStatusBadge = (status) => {
    const styles = { paid: 'badge-success', partial: 'badge-warning', pending: 'badge-info', overdue: 'badge-danger' }
    return <span className={`badge ${styles[status]}`}>{status}</span>
  }

  const columns = [
    { header: 'Student', cell: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white font-medium">{row.student?.user?.first_name?.[0]}{row.student?.user?.last_name?.[0]}</div>
        <div><p className="font-medium">{row.student?.user?.first_name} {row.student?.user?.last_name}</p><p className="text-sm text-gray-500">{row.student?.student_id}</p></div>
      </div>
    )},
    { header: 'Fee Type', accessor: (row) => row.fee_type?.name },
    { header: 'Amount', cell: (row) => <span className="font-semibold">{formatCurrency(row.amount)}</span> },
    { header: 'Paid', cell: (row) => <span className="text-green-600">{formatCurrency(row.paid_amount)}</span> },
    { header: 'Balance', cell: (row) => <span className={row.amount - row.paid_amount > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>{formatCurrency(row.amount - row.paid_amount)}</span> },
    { header: 'Due Date', accessor: (row) => new Date(row.due_date).toLocaleDateString() },
    { header: 'Status', cell: (row) => getStatusBadge(row.status) },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Student Fees</h1><p className="text-gray-500 dark:text-gray-400">Manage student fee assignments</p></div>
        <button onClick={() => setModalOpen(true)} className="btn-primary"><PlusIcon className="w-5 h-5 mr-2" />Assign Fee</button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card"><DataTable columns={columns} data={fees} loading={loading} searchPlaceholder="Search fees..." /></motion.div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Assign Fee to Student">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Student</label>
            <select value={formData.student_id} onChange={(e) => setFormData({...formData, student_id: e.target.value})} className="input" required>
              <option value="">Select student</option>{students.map(s => <option key={s.id} value={s.id}>{s.user?.first_name} {s.user?.last_name} ({s.student_id})</option>)}
            </select>
          </div>
          <div><label className="label">Fee Type</label>
            <select value={formData.fee_type_id} onChange={(e) => handleFeeTypeChange(e.target.value)} className="input" required>
              <option value="">Select fee type</option>{feeTypes.map(f => <option key={f.id} value={f.id}>{f.name} ({formatCurrency(f.amount)})</option>)}
            </select>
          </div>
          <div><label className="label">Amount (FCFA)</label><input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="input" required min="0" /></div>
          <div><label className="label">Due Date</label><input type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} className="input" required /></div>
          <div><label className="label">Academic Year</label><input type="text" value={formData.academic_year} onChange={(e) => setFormData({...formData, academic_year: e.target.value})} className="input" required /></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Assign Fee</button></div>
        </form>
      </Modal>
    </div>
  )
}
