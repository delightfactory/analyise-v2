import { useEffect } from 'react'
import { X } from 'lucide-react'

/**
 * مكون Modal احترافي ومتجاوب مع دعم كامل للوضع الداكن
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'default', // 'sm', 'default', 'lg', 'xl', 'full'
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  headerColor = 'blue', // 'blue', 'green', 'purple', 'orange', 'red', 'gray'
}) => {
  // إغلاق النافذة بمفتاح Escape
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  // منع التمرير في الخلفية عند فتح النافذة
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

  if (!isOpen) return null

  // أحجام النافذة - محسنة للهواتف
  const sizeClasses = {
    sm: 'max-w-md mx-4',
    default: 'max-w-2xl mx-4',
    lg: 'max-w-4xl mx-4',
    xl: 'max-w-6xl mx-4',
    full: 'max-w-[95vw] max-h-[95vh] mx-2'
  }

  // ألوان الرأس
  const headerColors = {
    blue: 'from-blue-600 to-blue-700',
    green: 'from-green-600 to-green-700',
    purple: 'from-purple-600 to-purple-700',
    orange: 'from-orange-600 to-orange-700',
    red: 'from-red-600 to-red-700',
    gray: 'from-gray-600 to-gray-700'
  }

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div 
        className={`
          relative w-full ${sizeClasses[size]} 
          bg-white dark:bg-gray-800 
          rounded-xl shadow-2xl 
          max-h-[95vh] sm:max-h-[90vh] overflow-hidden
          transform transition-all duration-300 ease-out
          animate-in fade-in-0 zoom-in-95
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className={`
            bg-gradient-to-r ${headerColors[headerColor]} 
            text-white px-4 sm:px-6 py-3 sm:py-4 
            flex items-center justify-between
            border-b border-gray-200 dark:border-gray-700
          `}>
            <div className="flex-1 min-w-0 pr-2">
              {title && (
                <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-white/80 mt-1 truncate">
                  {subtitle}
                </p>
              )}
            </div>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="
                  flex-shrink-0 p-2 
                  text-white/80 hover:text-white 
                  hover:bg-white/10 
                  rounded-lg transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-white/20
                  touch-manipulation
                "
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="
          overflow-y-auto 
          max-h-[calc(95vh-60px)] sm:max-h-[calc(90vh-80px)]
          scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
          scrollbar-track-transparent
        ">
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * مكون ModalContent لتنظيم المحتوى
 */
export const ModalContent = ({ children, className = "" }) => (
  <div className={`p-4 sm:p-6 ${className}`}>
    {children}
  </div>
)

/**
 * مكون ModalHeader للرأس المخصص
 */
export const ModalHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
)

/**
 * مكون ModalFooter للذيل
 */
export const ModalFooter = ({ children, className = "" }) => (
  <div className={`
    px-6 py-4 
    border-t border-gray-200 dark:border-gray-700 
    bg-gray-50 dark:bg-gray-800/50
    flex items-center justify-end gap-3
    ${className}
  `}>
    {children}
  </div>
)

/**
 * مكون ModalSection لتقسيم المحتوى
 */
export const ModalSection = ({ title, children, className = "" }) => (
  <div className={`mb-6 ${className}`}>
    {title && (
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        {title}
      </h3>
    )}
    {children}
  </div>
)

/**
 * مكون StatsGrid لعرض الإحصائيات
 */
export const StatsGrid = ({ stats, columns = 4 }) => {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4 mb-6`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className={`
            ${stat.bgColor || 'bg-blue-50 dark:bg-blue-900/20'} 
            rounded-lg p-4 text-center
            border border-gray-200 dark:border-gray-700
          `}>
            {Icon && (
              <Icon className={`
                w-8 h-8 mx-auto mb-2 
                ${stat.iconColor || 'text-blue-600 dark:text-blue-400'}
              `} />
            )}
            <div className={`
              text-2xl font-bold 
              ${stat.valueColor || 'text-blue-600 dark:text-blue-400'}
            `}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * مكون DataTable لعرض الجداول - محسن للهواتف
 */
export const DataTable = ({ 
  columns, 
  data, 
  maxHeight = '400px',
  emptyMessage = 'لا توجد بيانات',
  onRowClick
}) => {
  // عرض مبسط للهواتف
  const MobileView = () => (
    <div className="sm:hidden space-y-3">
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </div>
      ) : (
        data.map((row, rowIndex) => (
          <div 
            key={rowIndex}
            className={`
              bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700
              ${onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''}
              transition-colors duration-150
            `}
            onClick={() => onRowClick?.(row, rowIndex)}
          >
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="flex justify-between items-start py-1">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {column.header}:
                </span>
                <span className="text-sm text-gray-900 dark:text-gray-100 text-right mr-2">
                  {column.render ? column.render(row, rowIndex) : row[column.key]}
                </span>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )

  // عرض الجدول للشاشات الكبيرة
  const DesktopView = () => (
    <div className="hidden sm:block border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <div className="overflow-y-auto" style={{ maxHeight }}>
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
              <tr>
                {columns.map((column, index) => (
                  <th 
                    key={index}
                    className="
                      px-4 py-3 text-right text-xs font-medium 
                      text-gray-500 dark:text-gray-400 uppercase tracking-wider
                    "
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length}
                    className="
                      px-4 py-8 text-center text-gray-500 dark:text-gray-400
                    "
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex}
                    className={`
                      hover:bg-gray-50 dark:hover:bg-gray-700/50 
                      ${onRowClick ? 'cursor-pointer' : ''}
                      transition-colors duration-150
                    `}
                    onClick={() => onRowClick?.(row, rowIndex)}
                  >
                    {columns.map((column, colIndex) => (
                      <td 
                        key={colIndex}
                        className="
                          px-4 py-3 text-sm 
                          text-gray-900 dark:text-gray-100
                        "
                      >
                        {column.render ? column.render(row, rowIndex) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <MobileView />
      <DesktopView />
    </>
  )
}

export default Modal
