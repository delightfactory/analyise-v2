import { Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, Package, Upload } from 'lucide-react'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'

const Layout = () => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved theme preference or default to system preference
    const saved = localStorage.getItem('theme')
    if (saved) {
      return saved === 'dark'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    // Apply theme to document immediately
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  // Initialize theme on component mount
  useEffect(() => {
    const root = document.documentElement
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      root.classList.add('dark')
    } else if (saved === 'light') {
      root.classList.remove('dark')
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev)
  }

  const navItems = [
    { path: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
    { path: '/customers', label: 'العملاء', icon: Users },
    { path: '/products', label: 'المنتجات', icon: Package },
    { path: '/upload', label: 'رفع ملف', icon: Upload },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar 
        navItems={navItems}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Main Content */}
      <main className="lg:mr-64 min-h-screen">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
