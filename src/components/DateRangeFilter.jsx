import { useState, useEffect } from 'react'
import { Calendar, X, MapPin, ChevronDown, ChevronUp } from 'lucide-react'

/**
 * مكون فلترة شامل (التاريخ والمنطقة)
 */
const DateRangeFilter = ({ onFilterChange, dataProcessor, className = '' }) => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [governorate, setGovernorate] = useState('')
  const [city, setCity] = useState('')
  const [governorates, setGovernorates] = useState([])
  const [cities, setCities] = useState([])
  const [isActive, setIsActive] = useState(false)
  const [isExpanded, setIsExpanded] = useState(() => {
    // تحميل الحالة من localStorage
    const saved = localStorage.getItem('filterExpanded')
    return saved !== null ? JSON.parse(saved) : true
  })

  // حفظ حالة الفرد/الطي في localStorage
  useEffect(() => {
    localStorage.setItem('filterExpanded', JSON.stringify(isExpanded))
  }, [isExpanded])

  // تحميل المحافظات
  useEffect(() => {
    if (dataProcessor) {
      const govs = dataProcessor.getGovernorates()
      setGovernorates(govs)
    }
  }, [dataProcessor])

  // تحديث المدن عند تغيير المحافظة
  useEffect(() => {
    if (dataProcessor) {
      const citiesList = dataProcessor.getCitiesByGovernorate(governorate)
      setCities(citiesList)
      // إعادة تعيين المدينة إذا لم تكن موجودة في القائمة الجديدة
      if (city && !citiesList.includes(city)) {
        setCity('')
      }
    }
  }, [governorate, dataProcessor])

  // تطبيق الفلتر
  const applyFilter = () => {
    const hasDateFilter = startDate && endDate
    const hasLocationFilter = governorate || city
    
    if (hasDateFilter || hasLocationFilter) {
      setIsActive(true)
      onFilterChange({ 
        startDate: startDate || null, 
        endDate: endDate || null,
        governorate: governorate || null,
        city: city || null
      })
    }
  }

  // إزالة الفلتر
  const clearFilter = () => {
    setStartDate('')
    setEndDate('')
    setGovernorate('')
    setCity('')
    setIsActive(false)
    onFilterChange(null)
  }

  // التحقق من صحة البيانات
  const isValidDateRange = !startDate || !endDate || new Date(startDate) <= new Date(endDate)
  const canApply = (startDate && endDate && isValidDateRange) || governorate || city

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ${className}`}>
      {/* Header قابل للنقر */}
      <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 px-3 py-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-white font-bold text-xs sm:text-sm hover:opacity-80 transition-opacity"
        >
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>فلاتر البحث</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 transition-transform" />
          ) : (
            <ChevronDown className="w-4 h-4 transition-transform" />
          )}
        </button>
        
        {/* أزرار مدمجة في الهيدر */}
        <div className="flex gap-1.5">
          <button
            onClick={applyFilter}
            disabled={!canApply}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${canApply ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-gray-400 text-gray-600 cursor-not-allowed'}`}
          >
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="hidden sm:inline">تطبيق</span>
            </span>
          </button>
          
          {isActive && (
            <button
              onClick={clearFilter}
              className="px-3 sm:px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition-all"
            >
              <span className="flex items-center gap-1">
                <X className="w-3 h-3" />
                <span className="hidden sm:inline">إزالة</span>
              </span>
            </button>
          )}
        </div>
      </div>

      {/* المحتوى - قابل للطي */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-3">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 sm:gap-3">
            {/* من تاريخ */}
            <div>
              <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">من</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* إلى تاريخ */}
            <div>
              <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">إلى</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* المحافظة */}
            <div>
              <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">المحافظة</label>
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">الكل</option>
                {governorates.map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
            </div>

            {/* المدينة */}
            <div>
              <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">المدينة</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!governorate && cities.length === 0}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">الكل</option>
                {cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* شارات الفلاتر النشطة - مدمجة في الأسفل */}
      {isActive && isExpanded && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5 animate-fadeIn">
          {startDate && endDate && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md text-[10px] font-medium">
              <Calendar className="w-3 h-3" />
              <span className="hidden sm:inline">{new Date(startDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}</span>
              <span>-</span>
              <span className="hidden sm:inline">{new Date(endDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}</span>
            </span>
          )}
          {governorate && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-md text-[10px] font-medium">
              <MapPin className="w-3 h-3" />
              {governorate}
            </span>
          )}
          {city && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 rounded-md text-[10px] font-medium">
              {city}
            </span>
          )}
        </div>
      )}

      {/* رسالة تحذير مدمجة */}
      {startDate && endDate && !isValidDateRange && isExpanded && (
        <div className="px-3 pb-2 animate-shake">
          <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <svg className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-[10px] sm:text-xs font-medium text-red-700 dark:text-red-200">
              تاريخ غير صحيح
            </p>
          </div>
        </div>
      )}

      {/* شارات مصغرة عند الطي */}
      {isActive && !isExpanded && (
        <div className="px-3 py-2 flex flex-wrap gap-1 border-t border-gray-200 dark:border-gray-700 animate-fadeIn">
          {startDate && endDate && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-[9px] font-medium">
              <Calendar className="w-2.5 h-2.5" />
              <span>{new Date(startDate).toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' })}</span>
            </span>
          )}
          {governorate && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded text-[9px] font-medium">
              <MapPin className="w-2.5 h-2.5" />
              <span>{governorate}</span>
            </span>
          )}
          {city && (
            <span className="inline-flex items-center px-1.5 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 rounded text-[9px] font-medium">
              {city}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default DateRangeFilter
