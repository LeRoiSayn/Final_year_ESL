import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { studentFeeApi, studentApi, feeTypeApi } from '../../services/api'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import { PlusIcon, CalendarDaysIcon, CheckCircleIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useI18n } from '../../i18n/index.jsx'

const CURRENT_YEAR = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
const emptyFee = { student_id: '', fee_type_id: '', amount: '', due_date: '', academic_year: CURRENT_YEAR }
const emptyPlan = { plan_type: 'monthly', periods: 3, start_date: '' }

export default function FinanceStudentFees() {
  const { t } = useI18n()
  const [fees, setFees] = useState([])
  const [students, setStudents] = useState([])
  const [feeTypes, setFeeTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState(emptyFee)

  // Detail / plan state
  const [selectedFee, setSelectedFee] = useState(null)
  const [planMode, setPlanMode] = useState(false)
  const [planData, setPlanData] = useState(emptyPlan)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [feeRes, studRes, typeRes] = await Promise.all([
        studentFeeApi.getAll({ per_page: 100 }),
        studentApi.getAll({ per_page: 500 }),
        feeTypeApi.getAll({ active_only: true }),
      ])
      setFees(feeRes.data.data.data || feeRes.data.data)
      setStudents(studRes.data.data.data || studRes.data.data)
      setFeeTypes(typeRes.data.data)
    } catch { toast.error(t('error')) } finally { setLoading(false) }
  }

  const handleAssignSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await studentFeeApi.create(formData)
      toast.success(t('fee_assigned'))
      setAssignModalOpen(false)
      setFormData(emptyFee)
      fetchData()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
    finally { setSubmitting(false) }
  }

  const handlePlanSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFee) return
    setSubmitting(true)
    try {
      const res = await studentFeeApi.setInstallmentPlan(selectedFee.id, planData)
      toast.success('Plan de paiement défini')
      setPlanMode(false)
      setPlanData(emptyPlan)
      const updated = res.data.data
      setSelectedFee(updated)
      setFees(prev => prev.map(f => f.id === updated.id ? updated : f))
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!selectedFee) return
    setSubmitting(true)
    try {
      await studentFeeApi.delete(selectedFee.id)
      toast.success('Frais supprimé')
      setDetailModalOpen(false)
      setDeleteConfirm(false)
      setSelectedFee(null)
      fetchData()
    } catch (err) { toast.error(err.response?.data?.message || 'Impossible de supprimer') }
    finally { setSubmitting(false) }
  }

  const handleFeeTypeChange = (feeTypeId) => {
    const ft = feeTypes.find(f => f.id.toString() === feeTypeId)
    setFormData(p => ({ ...p, fee_type_id: feeTypeId, amount: ft?.amount || '' }))
  }

  const openDetail = (fee) => {
    setSelectedFee(fee)
    setPlanMode(false)
    setPlanData(emptyPlan)
    setDeleteConfirm(false)
    setDetailModalOpen(true)
  }

  const closeDetail = () => {
    setDetailModalOpen(false)
    setPlanMode(false)
    setDeleteConfirm(false)
    setSelectedFee(null)
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR').format(amount) + ' RWF'

  const getStatusBadge = (status) => {
    const styles = { paid: 'badge-success', partial: 'badge-warning', pending: 'badge-info', overdue: 'badge-danger' }
    return <span className={`badge ${styles[status] || 'badge-info'}`}>{status}</span>
  }

  const remaining = selectedFee ? (parseFloat(selectedFee.amount) - parseFloat(selectedFee.paid_amount)) : 0
  const installmentPreviewAmount = remaining > 0 && planData.periods > 0
    ? Math.round(remaining / parseInt(planData.periods))
    : 0

  const columns = [
    { header: 'Étudiant', cell: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white font-medium text-sm">
          {row.student?.user?.first_name?.[0]}{row.student?.user?.last_name?.[0]}
        </div>
        <div>
          <p className="font-medium">{row.student?.user?.first_name} {row.student?.user?.last_name}</p>
          <p className="text-xs text-gray-500">{row.student?.student_id}</p>
        </div>
      </div>
    )},
    { header: 'Type', accessor: (row) => row.fee_type?.name },
    { header: 'Montant', cell: (row) => <span className="font-semibold">{formatCurrency(row.amount)}</span> },
    { header: 'Payé', cell: (row) => <span className="text-green-600">{formatCurrency(row.paid_amount)}</span> },
    { header: 'Solde', cell: (row) => <span className={row.amount - row.paid_amount > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>{formatCurrency(row.amount - row.paid_amount)}</span> },
    { header: 'Échéance', accessor: (row) => row.due_date ? new Date(row.due_date).toLocaleDateString('fr-FR') : '—' },
    { header: 'Plan', cell: (row) => row.installment_plan
      ? <span className="badge badge-info flex items-center gap-1"><CalendarDaysIcon className="w-3.5 h-3.5" />{row.installment_plan.periods} tr.</span>
      : <span className="text-gray-400 text-xs">—</span>
    },
    { header: 'Statut', cell: (row) => getStatusBadge(row.status) },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Frais des étudiants</h1>
          <p className="text-gray-500 dark:text-gray-400">Cliquez sur une ligne pour voir les détails ou créer un plan de paiement</p>
        </div>
        <button onClick={() => setAssignModalOpen(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Assigner frais
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <DataTable
          columns={columns}
          data={fees}
          loading={loading}
          searchPlaceholder="Rechercher..."
          onRowClick={openDetail}
        />
      </motion.div>

      {/* ── Detail / Plan modal ── */}
      <Modal isOpen={detailModalOpen} onClose={closeDetail} title="Détail du frais" size="lg">
        {selectedFee && (
          <div className="space-y-6">

            {/* Student + fee summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-dark-300">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white font-semibold text-lg">
                  {selectedFee.student?.user?.first_name?.[0]}{selectedFee.student?.user?.last_name?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedFee.student?.user?.first_name} {selectedFee.student?.user?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{selectedFee.student?.student_id} · {selectedFee.fee_type?.name}</p>
                </div>
                <div className="ml-auto">{getStatusBadge(selectedFee.status)}</div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-300">
                <p className="text-xs text-gray-500 mb-1">Montant total</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(selectedFee.amount)}</p>
              </div>
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                <p className="text-xs text-green-600 mb-1">Déjà payé</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(selectedFee.paid_amount)}</p>
              </div>
              <div className={`col-span-2 p-4 rounded-xl ${remaining > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                <p className={`text-xs mb-1 ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>Solde restant</p>
                <p className={`text-2xl font-bold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(remaining)}</p>
                {selectedFee.amount > 0 && (
                  <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-dark-100 overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (selectedFee.paid_amount / selectedFee.amount) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Installment plan section */}
            {!planMode && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Plan de paiement par tranches</h4>
                  {remaining > 0 && (
                    <button onClick={() => setPlanMode(true)} className="btn-secondary text-sm flex items-center gap-1.5">
                      <CalendarDaysIcon className="w-4 h-4" />
                      {selectedFee.installment_plan ? 'Modifier le plan' : 'Créer un plan'}
                    </button>
                  )}
                </div>

                {selectedFee.installment_plan ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 mb-2">
                      Plan {selectedFee.installment_plan.plan_type === 'monthly' ? 'mensuel' : 'trimestriel'} — {selectedFee.installment_plan.periods} tranches
                    </p>
                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
                      {selectedFee.installment_plan.installments?.map((inst) => (
                        <div key={inst.number} className={`flex items-center justify-between p-3 rounded-xl text-sm ${inst.paid ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-dark-300'}`}>
                          <div className="flex items-center gap-3">
                            {inst.paid
                              ? <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                              : <ClockIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            }
                            <div>
                              <p className="font-medium">Tranche {inst.number}</p>
                              <p className="text-xs text-gray-500">{new Date(inst.due_date).toLocaleDateString('fr-FR')}</p>
                            </div>
                          </div>
                          <span className={`font-semibold ${inst.paid ? 'text-green-600' : 'text-gray-700 dark:text-gray-300'}`}>
                            {formatCurrency(inst.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-dark-100 rounded-xl">
                    <CalendarDaysIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Aucun plan de paiement défini</p>
                    {remaining <= 0 && <p className="text-xs text-green-600 mt-1">Ce frais est entièrement payé.</p>}
                  </div>
                )}
              </div>
            )}

            {/* Plan form */}
            {planMode && remaining > 0 && (
              <form onSubmit={handlePlanSubmit} className="space-y-4 p-4 rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/10">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Définir un plan <span className="text-red-600">— {formatCurrency(remaining)} restant</span>
                  </h4>
                  <button type="button" onClick={() => { setPlanMode(false); setPlanData(emptyPlan) }} className="text-sm text-gray-500 hover:text-gray-700">Annuler</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Type de plan</label>
                    <select value={planData.plan_type} onChange={e => setPlanData(p => ({...p, plan_type: e.target.value}))} className="input">
                      <option value="monthly">Mensuel</option>
                      <option value="quarterly">Trimestriel</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Nombre de tranches</label>
                    <input type="number" value={planData.periods} onChange={e => setPlanData(p => ({...p, periods: parseInt(e.target.value) || 2}))} className="input" required min="2" max="24" />
                  </div>
                </div>
                <div>
                  <label className="label">Date de la première tranche</label>
                  <input type="date" value={planData.start_date} onChange={e => setPlanData(p => ({...p, start_date: e.target.value}))} className="input" required />
                </div>
                {installmentPreviewAmount > 0 && (
                  <div className="bg-white dark:bg-dark-200 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">Aperçu du plan</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      {planData.periods} tranches de ≈ <strong>{formatCurrency(installmentPreviewAmount)}</strong>
                      {' '}({planData.plan_type === 'monthly' ? 'chaque mois' : 'chaque trimestre'})
                    </p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setPlanMode(false); setPlanData(emptyPlan) }} className="btn-secondary flex-1">Annuler</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Enregistrement...' : 'Confirmer le plan'}</button>
                </div>
              </form>
            )}

            {/* Delete section */}
            <div className="border-t border-gray-100 dark:border-dark-100 pt-4">
              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  Supprimer ce frais
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 space-y-3">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300">Confirmer la suppression ?</p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Cette action est irréversible. La suppression sera refusée si des paiements sont associés à ce frais.
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setDeleteConfirm(false)} className="btn-secondary text-sm flex-1">Annuler</button>
                    <button
                      onClick={handleDelete}
                      disabled={submitting}
                      className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Suppression...' : 'Supprimer définitivement'}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </Modal>

      {/* ── Assign fee modal ── */}
      <Modal isOpen={assignModalOpen} onClose={() => { setAssignModalOpen(false); setFormData(emptyFee) }} title="Assigner un frais">
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="label">Étudiant</label>
            <select value={formData.student_id} onChange={e => setFormData(p => ({...p, student_id: e.target.value}))} className="input" required>
              <option value="">Sélectionner un étudiant</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.user?.first_name} {s.user?.last_name} ({s.student_id})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Type de frais</label>
            <select value={formData.fee_type_id} onChange={e => handleFeeTypeChange(e.target.value)} className="input" required>
              <option value="">Sélectionner un type</option>
              {feeTypes.map(f => <option key={f.id} value={f.id}>{f.name} ({formatCurrency(f.amount)})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Montant (RWF)</label>
            <input type="number" value={formData.amount} onChange={e => setFormData(p => ({...p, amount: e.target.value}))} className="input" required min="0" />
          </div>
          <div>
            <label className="label">Date d'échéance</label>
            <input type="date" value={formData.due_date} onChange={e => setFormData(p => ({...p, due_date: e.target.value}))} className="input" required />
          </div>
          <div>
            <label className="label">Année académique</label>
            <input type="text" value={formData.academic_year} onChange={e => setFormData(p => ({...p, academic_year: e.target.value}))} className="input" required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setAssignModalOpen(false); setFormData(emptyFee) }} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Enregistrement...' : 'Assigner'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
