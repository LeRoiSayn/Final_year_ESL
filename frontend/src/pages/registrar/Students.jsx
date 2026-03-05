import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { studentApi, departmentApi } from '../../services/api'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import { PlusIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline'

const LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2', 'D1', 'D2', 'D3']

export default function RegistrarStudents() {
  const [students, setStudents] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', username: '', password: '', phone: '', 
    date_of_birth: '', gender: '', department_id: '', level: 'L1', 
    enrollment_date: new Date().toISOString().split('T')[0], guardian_name: '', guardian_phone: ''
  })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [studRes, deptRes] = await Promise.all([studentApi.getAll({ per_page: 100 }), departmentApi.getAll({ active_only: true })])
      setStudents(studRes.data.data.data || studRes.data.data)
      setDepartments(deptRes.data.data)
    } catch (error) { toast.error('Failed to fetch data') } finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await studentApi.create(formData)
      toast.success('Student created and auto-enrolled successfully!')
      setModalOpen(false)
      setFormData({ first_name: '', last_name: '', email: '', username: '', password: '', phone: '', date_of_birth: '', gender: '', department_id: '', level: 'L1', enrollment_date: new Date().toISOString().split('T')[0], guardian_name: '', guardian_phone: '' })
      fetchData()
    } catch (error) { toast.error(error.response?.data?.message || 'Creation failed') }
  }

  const handleDelete = async (student) => {
    if (!window.confirm(`Delete ${student.user?.first_name}?`)) return
    try { await studentApi.delete(student.id); toast.success('Deleted'); fetchData() } 
    catch (error) { toast.error('Delete failed') }
  }

  const columns = [
    { header: 'Student', cell: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white font-medium">{row.user?.first_name?.[0]}{row.user?.last_name?.[0]}</div>
        <div><p className="font-medium">{row.user?.first_name} {row.user?.last_name}</p><p className="text-sm text-gray-500">{row.student_id}</p></div>
      </div>
    )},
    { header: 'Email', accessor: (row) => row.user?.email },
    { header: 'Department', accessor: (row) => row.department?.name },
    { header: 'Level', cell: (row) => <span className="badge badge-info">{row.level}</span> },
    { header: 'Status', cell: (row) => <span className={`badge ${row.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{row.status}</span> },
    { header: 'Actions', cell: (row) => (
      <button onClick={() => handleDelete(row)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"><TrashIcon className="w-4 h-4" /></button>
    )},
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Students</h1><p className="text-gray-500 dark:text-gray-400">Manage student registrations</p></div>
        <button onClick={() => setModalOpen(true)} className="btn-primary"><PlusIcon className="w-5 h-5 mr-2" />Add Student</button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <DataTable columns={columns} data={students} loading={loading} searchPlaceholder="Search students..." />
      </motion.div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Student" size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">First Name</label><input type="text" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="input" required /></div>
            <div><label className="label">Last Name</label><input type="text" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="input" required /></div>
            <div><label className="label">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="input" required /></div>
            <div><label className="label">Username</label><input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="input" required /></div>
            <div><label className="label">Password</label><input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="input" required minLength={6} /></div>
            <div><label className="label">Phone</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input" /></div>
            <div><label className="label">Date of Birth</label><input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} className="input" /></div>
            <div><label className="label">Gender</label><select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="input"><option value="">Select</option><option value="male">Male</option><option value="female">Female</option></select></div>
            <div><label className="label">Department</label><select value={formData.department_id} onChange={(e) => setFormData({...formData, department_id: e.target.value})} className="input" required><option value="">Select</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            <div><label className="label">Level</label><select value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} className="input" required>{LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
            <div><label className="label">Enrollment Date</label><input type="date" value={formData.enrollment_date} onChange={(e) => setFormData({...formData, enrollment_date: e.target.value})} className="input" required /></div>
            <div><label className="label">Guardian Name</label><input type="text" value={formData.guardian_name} onChange={(e) => setFormData({...formData, guardian_name: e.target.value})} className="input" /></div>
          </div>
          <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
            <p className="text-sm text-primary-700 dark:text-primary-300">ℹ️ The student will be automatically enrolled in all courses for their department and level.</p>
          </div>
          <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Create Student</button></div>
        </form>
      </Modal>
    </div>
  )
}
