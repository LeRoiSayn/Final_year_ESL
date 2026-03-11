import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { feeTypeApi } from '../../services/api'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import { PlusIcon, PencilIcon, TrashIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { useI18n } from '../../i18n/index.jsx'

export default function FinanceFeeTypes() {
  const { t } = useI18n()
  const [feeTypes, setFeeTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', amount: '', is_mandatory: true, level: '' })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try { const response = await feeTypeApi.getAll(); setFeeTypes(response.data.data) } 
    catch (error) { toast.error(t('error')) } finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) { await feeTypeApi.update(editing.id, formData); toast.success(t('item_updated')) }
      else { await feeTypeApi.create(formData); toast.success(t('item_created')) }
      setModalOpen(false); setEditing(null); setFormData({ name: '', description: '', amount: '', is_mandatory: true, level: '' }); fetchData()
    } catch (error) { toast.error(error.response?.data?.message || 'Failed') }
  }

  const handleEdit = (item) => { setEditing(item); setFormData({ name: item.name, description: item.description || '', amount: item.amount, is_mandatory: item.is_mandatory, level: item.level || '' }); setModalOpen(true) }
  const handleDelete = async (item) => { if (!window.confirm('Delete?')) return; try { await feeTypeApi.delete(item.id); toast.success(t('item_deleted')); fetchData() } catch (error) { toast.error(t('error')) } }
  const handleToggle = async (item) => { try { await feeTypeApi.toggle(item.id); toast.success(t(item.is_active ? 'deactivated' : 'activated')); fetchData() } catch (error) { toast.error(t('error')) } }

  const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR').format(amount) + ' RWF'

  const columns = [
    { header: 'Fee Type', cell: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center"><CurrencyDollarIcon className="w-5 h-5 text-white" /></div>
        <div><p className="font-medium">{row.name}</p><p className="text-sm text-gray-500">{row.description?.substring(0, 50) || '-'}</p></div>
      </div>
    )},
    { header: 'Amount', cell: (row) => <span className="font-semibold text-green-600">{formatCurrency(row.amount)}</span> },
    { header: 'Level', cell: (row) => row.level ? <span className="badge badge-info">{row.level}</span> : <span className="text-gray-400 text-xs">All levels</span> },
    { header: 'Mandatory', cell: (row) => <span className={`badge ${row.is_mandatory ? 'badge-warning' : 'badge-info'}`}>{row.is_mandatory ? 'Yes' : 'No'}</span> },
    { header: 'Status', cell: (row) => <button onClick={() => handleToggle(row)} className={`badge ${row.is_active ? 'badge-success' : 'badge-danger'}`}>{row.is_active ? 'Active' : 'Inactive'}</button> },
    { header: 'Actions', cell: (row) => (
      <div className="flex items-center gap-2">
        <button onClick={() => handleEdit(row)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100"><PencilIcon className="w-4 h-4" /></button>
        <button onClick={() => handleDelete(row)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"><TrashIcon className="w-4 h-4" /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Fee Types</h1><p className="text-gray-500 dark:text-gray-400">Manage fee categories</p></div>
        <button onClick={() => { setEditing(null); setFormData({ name: '', description: '', amount: '', is_mandatory: true }); setModalOpen(true) }} className="btn-primary"><PlusIcon className="w-5 h-5 mr-2" />Add Fee Type</button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card"><DataTable columns={columns} data={feeTypes} loading={loading} searchPlaceholder="Search fee types..." /></motion.div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Fee Type' : 'Add Fee Type'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input" required /></div>
          <div><label className="label">Amount (RWF)</label><input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="input" required min="0" /></div>
          <div>
            <label className="label">Level (leave empty for all levels)</label>
            <select value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} className="input">
              <option value="">All levels</option>
              {['L1','L2','L3','M1','M2','D1','D2','D3'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div><label className="label">Description</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="input" rows={3} /></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={formData.is_mandatory} onChange={(e) => setFormData({...formData, is_mandatory: e.target.checked})} className="w-4 h-4 rounded border-gray-300" /><label className="text-sm">Mandatory fee</label></div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button></div>
        </form>
      </Modal>
    </div>
  )
}
