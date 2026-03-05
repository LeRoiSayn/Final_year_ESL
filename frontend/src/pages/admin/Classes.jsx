import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { classApi, courseApi, teacherApi } from '../../services/api'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline'

export default function AdminClasses() {
  const [classes, setClasses] = useState([])
  const [courses, setCourses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [formData, setFormData] = useState({
    course_id: '',
    teacher_id: '',
    section: 'A',
    room: '',
    capacity: '50',
    academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    semester: '1',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [classRes, courseRes, teacherRes] = await Promise.all([
        classApi.getAll({ per_page: 100 }),
        courseApi.getAll({ active_only: true, per_page: 100 }),
        teacherApi.getAll({ status: 'active', per_page: 100 }),
      ])
      setClasses(classRes.data.data.data || classRes.data.data)
      setCourses(courseRes.data.data.data || courseRes.data.data)
      setTeachers(teacherRes.data.data.data || teacherRes.data.data)
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        teacher_id: formData.teacher_id || null,
      }
      if (editingClass) {
        await classApi.update(editingClass.id, data)
        toast.success('Class updated successfully')
      } else {
        await classApi.create(data)
        toast.success('Class created successfully')
      }
      setModalOpen(false)
      setEditingClass(null)
      resetForm()
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const resetForm = () => {
    setFormData({
      course_id: '',
      teacher_id: '',
      section: 'A',
      room: '',
      capacity: '50',
      academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      semester: '1',
    })
  }

  const handleEdit = (cls) => {
    setEditingClass(cls)
    setFormData({
      course_id: cls.course_id,
      teacher_id: cls.teacher_id || '',
      section: cls.section,
      room: cls.room || '',
      capacity: cls.capacity.toString(),
      academic_year: cls.academic_year,
      semester: cls.semester,
    })
    setModalOpen(true)
  }

  const handleDelete = async (cls) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return
    try {
      await classApi.delete(cls.id)
      toast.success('Class deleted successfully')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed')
    }
  }

  const columns = [
    {
      header: 'Class',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium">{row.course?.name}</p>
            <p className="text-sm text-gray-500">{row.course?.code} - Section {row.section}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Teacher',
      cell: (row) => row.teacher ? (
        <div className="flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-gray-400" />
          <span>{row.teacher.user?.first_name} {row.teacher.user?.last_name}</span>
        </div>
      ) : (
        <span className="text-gray-400">Not assigned</span>
      ),
    },
    {
      header: 'Room',
      cell: (row) => row.room || '-',
    },
    {
      header: 'Students',
      cell: (row) => `${row.enrollments_count || 0}/${row.capacity}`,
    },
    {
      header: 'Year/Semester',
      cell: (row) => (
        <span className="text-sm">
          {row.academic_year} / S{row.semester}
        </span>
      ),
    },
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
            Classes
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage course sections
          </p>
        </div>
        <button
          onClick={() => {
            setEditingClass(null)
            resetForm()
            setModalOpen(true)
          }}
          className="btn-primary"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Class
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
          data={classes}
          loading={loading}
          searchPlaceholder="Search classes..."
        />
      </motion.div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingClass(null)
        }}
        title={editingClass ? 'Edit Class' : 'Add Class'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Course</label>
              <select
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                className="input"
                required
                disabled={editingClass}
              >
                <option value="">Select a course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Teacher (Optional)</label>
              <select
                value={formData.teacher_id}
                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                className="input"
              >
                <option value="">Select a teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.user?.first_name} {t.user?.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Section</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                className="input"
                placeholder="e.g., A"
                required
                maxLength={5}
              />
            </div>
            <div>
              <label className="label">Room</label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="input"
                placeholder="e.g., Room 101"
              />
            </div>
            <div>
              <label className="label">Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="input"
                placeholder="e.g., 50"
                min="1"
                required
              />
            </div>
            <div>
              <label className="label">Academic Year</label>
              <input
                type="text"
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                className="input"
                placeholder="e.g., 2025-2026"
                required
                disabled={editingClass}
              />
            </div>
            <div>
              <label className="label">Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="input"
                required
                disabled={editingClass}
              >
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
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
              {editingClass ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
