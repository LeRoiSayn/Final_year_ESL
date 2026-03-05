import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline'

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    date_of_birth: user?.date_of_birth || '',
  })
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [loading, setLoading] = useState(false)

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateProfile(profileData)
      setIsEditing(false)
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordData.password !== passwordData.password_confirmation) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await changePassword(
        passwordData.current_password,
        passwordData.password,
        passwordData.password_confirmation
      )
      setIsChangingPassword(false)
      setPasswordData({ current_password: '', password: '', password_confirmation: '' })
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false)
    }
  }

  const roleColors = {
    admin: 'from-red-500 to-orange-500',
    registrar: 'from-blue-500 to-cyan-500',
    finance: 'from-green-500 to-emerald-500',
    teacher: 'from-purple-500 to-pink-500',
    student: 'from-primary-500 to-teal-500',
  }

  const roleLabels = {
    admin: 'Administrator',
    registrar: 'Registrar',
    finance: 'Finance Officer',
    teacher: 'Teacher',
    student: 'Student',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account information</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        {/* Cover */}
        <div className={`h-32 bg-gradient-to-r ${roleColors[user?.role]} relative`}>
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-dark-200 shadow-lg flex items-center justify-center border-4 border-white dark:border-dark-200">
              <span className={`text-3xl font-bold bg-gradient-to-r ${roleColors[user?.role]} bg-clip-text text-transparent`}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="pt-16 pb-6 px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">{roleLabels[user?.role]}</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-secondary"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Profile Form */}
          {isEditing ? (
            <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Date of Birth</label>
                  <input
                    type="date"
                    value={profileData.date_of_birth}
                    onChange={(e) => setProfileData({ ...profileData, date_of_birth: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Address</label>
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <EnvelopeIcon className="w-5 h-5" />
                <span>{user?.email}</span>
              </div>
              {user?.phone && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <PhoneIcon className="w-5 h-5" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user?.address && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <MapPinIcon className="w-5 h-5" />
                  <span>{user.address}</span>
                </div>
              )}
              {user?.date_of_birth && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="w-5 h-5" />
                  <span>{new Date(user.date_of_birth).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Security Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-dark-300 flex items-center justify-center">
              <KeyIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Security</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Change your password</p>
            </div>
          </div>
          <button
            onClick={() => setIsChangingPassword(!isChangingPassword)}
            className="btn-secondary"
          >
            {isChangingPassword ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {isChangingPassword && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className="input pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.password}
                  onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                  className="input pr-12"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.password_confirmation}
                  onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                  className="input pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}
