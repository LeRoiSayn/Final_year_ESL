import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'
import { registrarApi } from '../../services/api'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import {
  PlusIcon,
  TrashIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ClipboardDocumentCheckIcon,
  KeyIcon,
  PencilIcon,
} from '@heroicons/react/24/outline'
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

const emptyForm = (role) => ({
  first_name: '',
  last_name: '',
  email: '',
  username: '',
  password: '',
  phone: '',
  date_of_birth: '',
  role,
})

export default function RegistrarUsers() {
  const [searchParams] = useSearchParams()
  const { t } = useI18n()
  const roleParam = searchParams.get('role') || 'admin'
  const roleConfig = ROLE_CONFIG[roleParam] || ROLE_CONFIG.admin

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetting, setResetting] = useState(false)
  const [formData, setFormData] = useState(emptyForm(roleParam))
  const [editData, setEditData] = useState({})

  useEffect(() => {
    setFormData(emptyForm(roleParam))
    fetchUsers()
  }, [roleParam])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await registrarApi.getUsers(roleParam)
      setUsers(response.data.data || [])
    } catch (error) {
      toast.error(t('error'))
    } finally {
      setLoading(false)
    }
  }

  const buildFormData = (data) => {
    const fd = new FormData()
    Object.entries(data).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== '') {
        fd.append(key, val)
      }
    })
    return fd
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const fd = buildFormData({ ...formData, role: roleParam })
      await registrarApi.createUser(fd)
      toast.success(t('user_created_success'))
      setModalOpen(false)
      resetForm()
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'))
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      const fd = buildFormData(editData)
      await registrarApi.updateUser(selectedUser.id, fd)
      toast.success(t('success'))
      setEditModalOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'))
    }
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.first_name} ${user.last_name}?`)) return
    try {
      await registrarApi.deleteUser(user.id)
      toast.success(t('user_deleted'))
      fetchUsers()
    } catch (error) {
      toast.error(t('error'))
    }
  }

  const openEditModal = (user) => {
    setSelectedUser(user)
    setEditData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      username: user.username || '',
      phone: user.phone || '',
      date_of_birth: user.date_of_birth ? user.date_of_birth.substring(0, 10) : '',
      password: '',
    })
    setEditModalOpen(true)
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
      await registrarApi.resetPassword(selectedUser.id, newPassword)
      toast.success(t('password_reset_success'))
      setResetModalOpen(false)
      setSelectedUser(null)
      setNewPassword('')
    } catch (error) {
      toast.error(error.response?.data?.message || t('error'))
    } finally {
      setResetting(false)
    }
  }

  const resetForm = () => {
    setFormData(emptyForm(roleParam))
  }

  const columns = [
    {
      header: t('user'),
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
    { header: t('email'), accessor: 'email' },
    { header: t('phone'), accessor: (row) => row.phone || '—' },
    {
      header: t('status'),
      cell: (row) => (
        <span className={`badge ${row.is_active ? 'badge-success' : 'badge-danger'}`}>
          {row.is_active ? t('active') : t('inactive')}
        </span>
      ),
    },
    {
      header: t('actions'),
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 text-blue-600"
            title={t('edit')}
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => openResetModal(row)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 text-yellow-600"
            title={t('reset_password')}
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
              <label className="label">{t('first_name')} *</label>
              <input type="text" className="input" required value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('last_name')} *</label>
              <input type="text" className="input" required value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">{t('email')} *</label>
            <input type="email" className="input" required value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <label className="label">{t('username')} *</label>
            <input type="text" className="input" required value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })} />
          </div>
          <div>
            <label className="label">{t('password')} *</label>
            <input type="password" className="input" required minLength={8} value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('phone')}</label>
              <input type="tel" className="input" value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('date_of_birth') || 'Date of Birth'}</label>
              <input type="date" className="input" value={formData.date_of_birth}
                onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setModalOpen(false); resetForm() }} className="btn-secondary">{t('cancel')}</button>
            <button type="submit" className="btn-primary">{t('create')} {roleConfig.label}</button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={editModalOpen} onClose={() => { setEditModalOpen(false); setSelectedUser(null) }} title={`Edit ${roleConfig.label}`} size="md">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('first_name')}</label>
              <input type="text" className="input" value={editData.first_name}
                onChange={e => setEditData({ ...editData, first_name: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('last_name')}</label>
              <input type="text" className="input" value={editData.last_name}
                onChange={e => setEditData({ ...editData, last_name: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">{t('email')}</label>
            <input type="email" className="input" value={editData.email}
              onChange={e => setEditData({ ...editData, email: e.target.value })} />
          </div>
          <div>
            <label className="label">{t('username')}</label>
            <input type="text" className="input" value={editData.username}
              onChange={e => setEditData({ ...editData, username: e.target.value })} />
          </div>
          <div>
            <label className="label">{t('new_password') || 'New Password'} <span className="text-gray-400 text-xs">({t('leave_blank_unchanged') || 'leave blank to keep unchanged'})</span></label>
            <input type="password" className="input" minLength={8} value={editData.password}
              onChange={e => setEditData({ ...editData, password: e.target.value })}
              placeholder={t('leave_blank_unchanged') || 'Leave blank to keep unchanged'} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('phone')}</label>
              <input type="tel" className="input" value={editData.phone}
                onChange={e => setEditData({ ...editData, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">{t('date_of_birth') || 'Date of Birth'}</label>
              <input type="date" className="input" value={editData.date_of_birth}
                onChange={e => setEditData({ ...editData, date_of_birth: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setEditModalOpen(false); setSelectedUser(null) }} className="btn-secondary">{t('cancel')}</button>
            <button type="submit" className="btn-primary">{t('update')}</button>
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
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t('reset_password')}</h2>
            <p className="text-sm text-gray-500 mb-4">
              {t('setting_new_password_for') || 'Setting new password for'} <strong>{selectedUser?.first_name} {selectedUser?.last_name}</strong>
            </p>
            <div>
              <label className="label">{t('new_password') || 'New Password'} (min. 8) *</label>
              <input
                type="password"
                className="input"
                minLength={8}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder={t('enter_new_password') || 'Enter new password'}
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setResetModalOpen(false)} className="btn-secondary">{t('cancel')}</button>
              <button onClick={handleResetPassword} disabled={resetting} className="btn-primary">
                {resetting ? t('saving') || 'Saving...' : t('reset_password')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
