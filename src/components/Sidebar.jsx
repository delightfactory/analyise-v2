import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X, Menu, TrendingUp, Moon, Sun } from 'lucide-react'

const Sidebar = ({ navItems, darkMode, toggleDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.sidebar') && !event.target.closest('.menu-button')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="menu-button lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        aria-label="فتح القائمة"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300" />
      )}

      {/* Sidebar */}
      <aside className={`
        sidebar fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 z-40
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:w-64 lg:shadow-none lg:border-l-0 lg:border-r
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">تحليل المبيعات</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">نظام إدارة البيانات</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-4 border-blue-600 dark:border-blue-400' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer with Dark Mode Toggle */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200"
            title={darkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
          >
            {darkMode ? (
              <>
                <Sun className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">الوضع الفاتح</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-blue-500" />
                <span className="font-medium">الوضع الداكن</span>
              </>
            )}
          </button>
          
          {/* App Info */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              الإصدار 2.0 - تطوير محسن
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
