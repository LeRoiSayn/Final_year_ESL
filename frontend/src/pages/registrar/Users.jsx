import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import { PlusIcon, TrashIcon, ShieldCheckIcon, CurrencyDollarIcon, ClipboardDocumentCheckIcon, KeyIcon } from '@heroicons/react/24/outline'
import { useI18n } from '../../i18n/index.jsx'

const ROLE_CONFIG = {
  admin: {
    label: 'Administrator',
    icon: ShieldCheckIcon,
    color: 'text-red-500',
    bg: 'bg-red-100 dark:bg-red-900/20',
  },
  finance: {
    label: 'Finance Officer',
    icon: CurrencyDollarIcon,
    color: 'text-green-500',
    bg: 'bg-green-100 dark:bg-green-900/20',
  },
  registrar: {
    label: 'Registrar',
    icon: ClipboardDocumentCheckIcon,
    color: 'text-orange-500',
    bg: 'bg-orange-100 dark:bg-orange-900/20',
  },
}

export default function RegistrarUsers() {
  const [searchParams] = useSearchParams()
  const { t } = useI18n()
  const roleParam = searchParams.get('role') || 'admin'
  const roleConfig = ROLE_CONFIG[roleParam] || ROLE_CONFIG.admin

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetting, setResetting] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    date_of_birth: '',
    role: roleParam,
  })

  useEffect(() => {
    setFormData(prev => ({ ...prev, role: roleParam }))
    fetchUsers()
  }, [roleParam])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await api.get('/registrar/users', { params: { role: roleParam } })
      setUsers(response.data.data || [])
    } catch (error) {
      toast.error(t('error'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/registrar/users', { ...formData, role: roleParam })
      toast.success(t('user_created_success'))
      setModalOpen(false)
      resetForm()
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Creation failed')
    }
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.first_name} ${user.last_name}?`)) return
    try {
      await api.delete(`/registrar/users/${user.id}`)
      toast.success(t('user_deleted'))
      fetchUsers()
    } catch (error) {
      toast.error(t('error'))
    }
  }

  const openResetModal = (user) => {
    setSelectedUser(user)
    setNewPassword('')
    setResetModalOpen(true)
  }

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error(t('password_min_length'))
      return
    }
    setResetting(true)
    try {
      await api.post(`/registrar/users/${selectedUser.id}/reset-password`, { password: newPassword })
      toast.success(t('password_reset_success'))
      setResetModalOpen(false)
      setSelectedUser(null)
      setNewPassword('')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed')
    } finally {
      setResetting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      username: '',
      password: '',
      phone: '',
      date_of_birth: '',
      role: roleParam,
    })
  }

  const columns = [
    {
      header: 'User',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${roleConfig.bg} flex items-center justify-center`}>
            <span className={`font-bold ${roleConfig.color}`}>{row.first_name?.[0]}{row.last_name?.[0]}</span>
          </div>
          <div>
            <p className="font-medium">{row.first_name} {row.last_name}</p>
            <p className="text-sm text-gray-500">@{row.username}</p>
          </div>
        </div>
      ),
    },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: (row) => row.phone || '—' },
    {
      header: 'Status',
      cell: (row) => (
        <span className={`badge ${row.is_active ? 'badge-success' : 'badge-danger'}`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openResetModal(row)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 text-yellow-600"
            title="Reset password"
          >
            <KeyIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${roleConfig.bg} flex items-center justify-center`}>
            <roleConfig.icon className={`w-5 h-5 ${roleConfig.color}`} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
              {roleConfig.label}s
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Manage {roleConfig.label.toLowerCase()} accounts</p>
          </div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add {roleConfig.label}
        </button>
      </motion.div>

      <DataTable columns={columns} data={users} loading={loading} />

      {/* Create User Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); resetForm() }} title={`Add ${roleConfig.label}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input type="text" className="input" required value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input type="text" className="input" required value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" className="input" required value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Username *</label>
            <input type="text" className="input" required value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })} />
          </div>
          <div>
            <label className="label">Password *</label>
            <input type="password" className="input" required minLength={8} value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <input type="tel" className="input" value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input type="date" className="input" value={formData.date_of_birth}
                onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setModalOpen(false); resetForm() }} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create {roleConfig.label}</button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-200 rounded-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Reset Password</h2>
            <p className="text-sm text-gray-500 mb-4">
              Setting new password for <strong>{selectedUser?.first_name} {selectedUser?.last_name}</strong>
            </p>
            <div>
              <label className="label">New Password (min. 8 characters) *</label>
              <input
                type="password"
                className="input"
                minLength={8}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setResetModalOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleResetPassword} disabled={resetting} className="btn-primary">
                {resetting ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
