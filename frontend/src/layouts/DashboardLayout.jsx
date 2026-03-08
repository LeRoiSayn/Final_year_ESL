import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useI18n } from '../i18n/index.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import Chatbot from '../components/Chatbot'
import NotificationDropdown from '../components/NotificationDropdown'
import {
  HomeIcon,
  AcademicCapIcon,
  UserGroupIcon,
  BuildingLibraryIcon,
  BookOpenIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  BellIcon,
  ClockIcon,
  UsersIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  VideoCameraIcon,
  CreditCardIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'

const menuItems = {
  admin: [
    { nameKey: 'menu_dashboard', path: '/admin', icon: HomeIcon },
    { nameKey: 'menu_faculties', path: '/admin/faculties', icon: BuildingLibraryIcon },
    { nameKey: 'menu_departments', path: '/admin/departments', icon: AcademicCapIcon },
    { nameKey: 'menu_courses', path: '/admin/courses', icon: BookOpenIcon },
    { nameKey: 'menu_classes', path: '/admin/classes', icon: CalendarIcon },
    { nameKey: 'menu_student_management', path: '/admin/student-management', icon: UserGroupIcon },
    { nameKey: 'menu_teacher_management', path: '/admin/teacher-management', icon: UsersIcon },
    { nameKey: 'menu_auto_enrollment', path: '/admin/enrollment', icon: CheckCircleIcon },
    { nameKey: 'menu_schedules', path: '/admin/schedules', icon: CalendarIcon },
    { nameKey: 'menu_reports', path: '/admin/reports', icon: ChartBarIcon },
    { nameKey: 'menu_grades', path: '/admin/grades', icon: AcademicCapIcon },
    { nameKey: 'menu_activity_log', path: '/admin/activity-log', icon: ClockIcon },
    { nameKey: 'menu_settings', path: '/admin/settings', icon: Cog6ToothIcon },
  ],
  registrar: [
    { nameKey: 'menu_dashboard', path: '/registrar', icon: HomeIcon },
    { nameKey: 'menu_students', path: '/registrar/students', icon: UserGroupIcon },
    { nameKey: 'menu_teachers', path: '/registrar/teachers', icon: UsersIcon },
    { nameKey: 'menu_settings', path: '/registrar/settings', icon: Cog6ToothIcon },
  ],
  finance: [
    { nameKey: 'menu_dashboard', path: '/finance', icon: HomeIcon },
    { nameKey: 'menu_fee_types', path: '/finance/fee-types', icon: DocumentTextIcon },
    { nameKey: 'menu_student_fees', path: '/finance/student-fees', icon: CurrencyDollarIcon },
    { nameKey: 'menu_payments', path: '/finance/payments', icon: ClipboardDocumentListIcon },
    { nameKey: 'menu_settings', path: '/finance/settings', icon: Cog6ToothIcon },
  ],
  teacher: [
    { nameKey: 'menu_dashboard', path: '/teacher', icon: HomeIcon },
    { nameKey: 'menu_my_classes', path: '/teacher/classes', icon: BookOpenIcon },
    { nameKey: 'menu_elearning', path: '/teacher/elearning', icon: VideoCameraIcon },
    { nameKey: 'menu_gradebook', path: '/teacher/grades', icon: ChartBarIcon },
    { nameKey: 'menu_attendance', path: '/teacher/attendance', icon: ClipboardDocumentListIcon },
    { nameKey: 'menu_schedule', path: '/teacher/schedule', icon: CalendarIcon },
    { nameKey: 'menu_settings', path: '/teacher/settings', icon: Cog6ToothIcon },
  ],
  student: [
    { nameKey: 'menu_dashboard', path: '/student', icon: HomeIcon },
    { nameKey: 'menu_my_courses', path: '/student/courses', icon: BookOpenIcon },
    { nameKey: 'menu_elearning', path: '/student/elearning', icon: VideoCameraIcon },
    { nameKey: 'menu_grades', path: '/student/grades', icon: ChartBarIcon },
    { nameKey: 'menu_attendance', path: '/student/attendance', icon: ClipboardDocumentListIcon },
    { nameKey: 'menu_schedule', path: '/student/schedule', icon: CalendarIcon },
    { nameKey: 'menu_fees', path: '/student/fees', icon: CurrencyDollarIcon },
    { nameKey: 'menu_payment', path: '/student/payment', icon: CreditCardIcon },
    { nameKey: 'menu_settings', path: '/student/settings', icon: Cog6ToothIcon },
  ],
}

const roleColors = {
  admin: 'from-red-500 to-orange-500',
  registrar: 'from-blue-500 to-cyan-500',
  finance: 'from-green-500 to-emerald-500',
  teacher: 'from-purple-500 to-pink-500',
  student: 'from-primary-500 to-teal-500',
}

// User Profile Component based on role
const UserProfileSection = ({ user, role, onLogout, t }) => {
  const getInitials = () => {
    return `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`
  }

  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`

  const renderProfileDetails = () => {
    switch (role) {
      case 'student':
        return (
          <>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="font-mono">{user?.student?.registration_number || 'N/A'}</span>
            </div>
            {user?.student?.department && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {user.student.department.name}
              </p>
            )}
            {user?.student?.program && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {user.student.program}
              </p>
            )}
          </>
        )
      case 'teacher':
        return (
          <>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <EnvelopeIcon className="w-3.5 h-3.5" />
              <span className="truncate">{user?.email}</span>
            </div>
            {user?.teacher?.department && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {user.teacher.department.name}
              </p>
            )}
          </>
        )
      case 'admin':
      case 'registrar':
      case 'finance':
        return (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
            <EnvelopeIcon className="w-3.5 h-3.5" />
            <span className="truncate">{user?.email}</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-4 border-t border-gray-200 dark:border-dark-100">
      <NavLink
        to={`/${role}/profile`}
        className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors group"
      >
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${roleColors[role]} flex items-center justify-center flex-shrink-0 shadow-md`}>
          <span className="text-white font-bold text-lg">{getInitials()}</span>
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {fullName}
          </p>
          <p className="text-xs font-medium text-primary-600 dark:text-primary-400">
            {t(`role_${role}`)}
          </p>
          {renderProfileDetails()}
        </div>
      </NavLink>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="w-full mt-2 flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
      >
        <ArrowLeftOnRectangleIcon className="w-4 h-4" />
        {t('logout')}
      </button>
    </div>
  )
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { t } = useI18n()
  const navigate = useNavigate()

  const items = menuItems[user?.role] || []

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-400">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col bg-white dark:bg-dark-200 border-r border-gray-200 dark:border-dark-100">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-gray-200 dark:border-dark-100">
            <div className="flex items-center gap-3">
              <img 
                src="/esl-logo.png" 
                alt="ESL" 
                className="w-10 h-10 object-cover rounded-lg shadow-sm"
              />
              <div>
                <h1 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                  {t('app_name')}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('app_subtitle')}</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === `/${user?.role}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-100 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{t(item.nameKey)}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Profile Section */}
          <UserProfileSection user={user} role={user?.role} onLogout={handleLogout} t={t} />
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-14 bg-white/90 dark:bg-dark-200/90 backdrop-blur-md border-b border-gray-200 dark:border-dark-100">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>

            {/* Spacer for desktop */}
            <div className="hidden lg:block" />

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors"
                title={isDark ? t('light_mode') : t('dark_mode')}
              >
                {isDark ? (
                  <SunIcon className="w-5 h-5 text-yellow-500" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Notifications */}
              <NotificationDropdown t={t} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}
