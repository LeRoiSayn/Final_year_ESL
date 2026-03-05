import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { courseApi, departmentApi } from '../../services/api'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline'

const LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2', 'D1', 'D2', 'D3']

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [formData, setFormData] = useState({
    department_id: '',
    code: '',
    name: '',
    description: '',
    credits: '',
    level: '',
    hours_per_week: '3',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [courseRes, deptRes] = await Promise.all([
        courseApi.getAll({ per_page: 100 }),
        departmentApi.getAll({ active_only: true }),
      ])
      setCourses(courseRes.data.data.data || courseRes.data.data)
      setDepartments(deptRes.data.data)
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCourse) {
        await courseApi.update(editingCourse.id, formData)
        toast.success('Course updated successfully')
      } else {
        await courseApi.create(formData)
        toast.success('Course created successfully')
      }
      setModalOpen(false)
      setEditingCourse(null)
      resetForm()
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const resetForm = () => {
    setFormData({
      department_id: '',
      code: '',
      name: '',
      description: '',
      credits: '',
      level: '',
      hours_per_week: '3',
    })
  }

  const handleEdit = (course) => {
    setEditingCourse(course)
    setFormData({
      department_id: course.department_id,
      code: course.code,
      name: course.name,
      description: course.description || '',
      credits: course.credits.toString(),
      level: course.level,
      hours_per_week: course.hours_per_week?.toString() || '3',
    })
    setModalOpen(true)
  }

  const handleDelete = async (course) => {
    if (!window.confirm(`Are you sure you want to delete ${course.name}?`)) return
    try {
      await courseApi.delete(course.id)
      toast.success('Course deleted successfully')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed')
    }
  }

  const handleToggle = async (course) => {
    try {
      await courseApi.toggle(course.id)
      toast.success(`Course ${course.is_active ? 'deactivated' : 'activated'}`)
      fetchData()
    } catch (error) {
      toast.error('Toggle failed')
    }
  }

  const columns = [
    {
      header: 'Course',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <BookOpenIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-sm text-gray-500">{row.code}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: (row) => row.department?.name,
    },
    {
      header: 'Level',
      cell: (row) => <span className="badge badge-info">{row.level}</span>,
    },
    {
      header: 'Credits',
      accessor: 'credits',
    },
    {
      header: 'Hours/Week',
      accessor: 'hours_per_week',
    },
    {
      header: 'Status',
      cell: (row) => (
        <button
          onClick={() => handleToggle(row)}
          className={`badge ${row.is_active ? 'badge-success' : 'badge-danger'}`}
        >
          {row.is_active ? 'Active' : 'Inactive'}
        </button>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 text-gray-600 dark:text-gray-400"
          >
            <PencilIcon className="w-4 h-4" />
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            Courses
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage academic courses
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCourse(null)
            resetForm()
            setModalOpen(true)
          }}
          className="btn-primary"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Course
        </button>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <DataTable
          columns={columns}
          data={courses}
          loading={loading}
          searchPlaceholder="Search courses..."
        />
      </motion.div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingCourse(null)
        }}
        title={editingCourse ? 'Edit Course' : 'Add Course'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Department</label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="input"
                required
              >
                <option value="">Select a department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="input"
                required
              >
                <option value="">Select a level</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Course Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="input"
                placeholder="e.g., BIO101"
                required
              />
            </div>
            <div>
              <label className="label">Course Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="e.g., General Biology"
                required
              />
            </div>
            <div>
              <label className="label">Credits</label>
              <input
                type="number"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                className="input"
                placeholder="e.g., 15"
                min="1"
                max="30"
                required
              />
            </div>
            <div>
              <label className="label">Hours per Week</label>
              <input
                type="number"
                value={formData.hours_per_week}
                onChange={(e) => setFormData({ ...formData, hours_per_week: e.target.value })}
                className="input"
                placeholder="e.g., 3"
                min="1"
                max="20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                rows={3}
                placeholder="Brief description of the course"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingCourse ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
