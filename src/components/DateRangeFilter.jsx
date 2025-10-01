import { useState } from 'react'
import { Calendar, X } from 'lucide-react'

/**
 * مكون فلترة زمنية
 */
const DateRangeFilter = ({ onFilterChange, className = '' }) => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(false)

  // تطبيق الفلتر
  const applyFilter = () => {
    if (startDate && endDate) {
      setIsActive(true)
      onFilterChange({ startDate, endDate })
    }
  }

  // إزالة الفلتر
  const clearFilter = () => {
    setStartDate('')
    setEndDate('')
    setIsActive(false)
    onFilterChange(null)
  }

  // التحقق من صحة التواريخ
  const isValidRange = startDate && endDate && new Date(startDate) <= new Date(endDate)

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* أيقونة ونص */}
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">الفترة الزمنية:</span>
        </div>

        {/* حقول التاريخ */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
          <div className="w-full sm:w-auto">
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">من تاريخ</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="hidden sm:block text-gray-400 mt-5">←</div>

          <div className="w-full sm:w-auto">
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* أزرار التحكم */}
          <div className="flex gap-2 mt-5">
            <button
              onClick={applyFilter}
              disabled={!isValidRange}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                ${isValidRange
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }
              `}
            >
              تطبيق
            </button>

            {isActive && (
              <button
                onClick={clearFilter}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                إزالة الفلتر
              </button>
            )}
          </div>
        </div>
      </div>

      {/* رسالة الحالة */}
      {isActive && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            📊 عرض البيانات من <span className="font-bold">{new Date(startDate).toLocaleDateString('ar-EG')}</span> إلى <span className="font-bold">{new Date(endDate).toLocaleDateString('ar-EG')}</span>
          </p>
        </div>
      )}

      {/* رسالة تحذير */}
      {startDate && endDate && !isValidRange && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-300">
            ⚠️ تاريخ البداية يجب أن يكون قبل تاريخ النهاية
          </p>
        </div>
      )}
    </div>
  )
}

export default DateRangeFilter
