import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { teacherApi, departmentApi } from '../../services/api'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useI18n } from '../../i18n/index.jsx'

export default function RegistrarTeachers() {
  const { t } = useI18n()
  const [teachers, setTeachers] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', username: '', password: '', phone: '', 
    date_of_birth: '', gender: '', department_id: '', qualification: '', specialization: '',
    hire_date: new Date().toISOString().split('T')[0], salary: ''
  })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [teachRes, deptRes] = await Promise.all([teacherApi.getAll({ per_page: 100 }), departmentApi.getAll({ active_only: true })])
      setTeachers(teachRes.data.data.data || teachRes.data.data)
      setDepartments(deptRes.data.data)
    } catch (error) { toast.error(t('error')) } finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await teacherApi.create(formData)
      toast.success(t('teacher_created'))
      setModalOpen(false)
      setFormData({ first_name: '', last_name: '', email: '', username: '', password: '', phone: '', date_of_birth: '', gender: '', department_id: '', qualification: '', specialization: '', hire_date: new Date().toISOString().split('T')[0], salary: '' })
      fetchData()
    } catch (error) { toast.error(error.response?.data?.message || 'Creation failed') }
  }

  const handleDelete = async (teacher) => {
    if (!window.confirm(`Delete ${teacher.user?.first_name}?`)) return
    try { await teacherApi.delete(teacher.id); toast.success(t('item_deleted')); fetchData() } 
    catch (error) { toast.error(error.response?.data?.message || 'Delete failed') }
  }

  const columns = [
    { header: 'Teacher', cell: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">{row.user?.first_name?.[0]}{row.user?.last_name?.[0]}</div>
        <div><p className="font-medium">{row.user?.first_name} {row.user?.last_name}</p><p className="text-sm text-gray-500">{row.employee_id}</p></div>
      </div>
    )},
    { header: 'Email', accessor: (row) => row.user?.email },
    { header: 'Department', accessor: (row) => row.department?.name },
    { header: 'Qualification', accessor: 'qualification' },
    { header: 'Status', cell: (row) => <span className={`badge ${row.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{row.status}</span> },
    { header: 'Actions', cell: (row) => (
      <button onClick={() => handleDelete(row)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"><TrashIcon className="w-4 h-4" /></button>
    )},
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Teachers</h1><p className="text-gray-500 dark:text-gray-400">Manage teacher registrations</p></div>
        <button onClick={() => setModalOpen(true)} className="btn-primary"><PlusIcon className="w-5 h-5 mr-2" />Add Teacher</button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <DataTable columns={columns} data={teachers} loading={loading} searchPlaceholder="Search teachers..." />
      </motion.div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Teacher" size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">First Name</label><input type="text" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="input" required /></div>
            <div><label className="label">Last Name</label><input type="text" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="input" required /></div>
            <div><label className="label">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input" required /></div>
            <div><label className="label">Username</label><input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="input" required /></div>
            <div><label className="label">Password</label><input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="input" required minLength={6} /></div>
            <div><label className="label">Phone</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input" /></div>
            <div><label className="label">Department</label><select value={formData.department_id} onChange={(e) => setFormData({...formData, department_id: e.target.value})} className="input" required><option value="">Select</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            <div><label className="label">Qualification</label><input type="text" value={formData.qualification} onChange={(e) => setFormData({...formData, qualification: e.target.value})} className="input" required placeholder="e.g., PhD in Biology" /></div>
            <div><label className="label">Specialization</label><input type="text" value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} className="input" placeholder="e.g., Molecular Biology" /></div>
            <div><label className="label">Hire Date</label><input type="date" value={formData.hire_date} onChange={(e) => setFormData({...formData, hire_date: e.target.value})} className="input" required /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Create Teacher</button></div>
        </form>
      </Modal>
    </div>
  )
}
