import React, { useState, useEffect } from 'react'
import { X, Users, Package, TrendingUp, Building2, Calendar, Percent, Activity, UserX, PackageX } from 'lucide-react'
import CategoryIndicators from './CategoryIndicators'

/**
 * مكون عرض تفاصيل المدينة (المنتجات والعملاء)
 */
const CityDetailsModal = ({ 
  isOpen, 
  onClose, 
  city, 
  governorate, 
  dataProcessor, 
  type = 'products', // 'products' or 'customers'
  filters = null // الفلاتر المطبقة من الصفحة الأصلية
}) => {
  const [data, setData] = useState({ active: [], inactive: [], totalSales: 0 })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('active') // 'active' or 'inactive'

  // تحميل البيانات عند فتح المودال
  useEffect(() => {
    if (isOpen && city && governorate && dataProcessor) {
      setLoading(true)
      setActiveTab('active') // إعادة تعيين التبويب النشط
      try {
        if (type === 'products') {
          const result = dataProcessor.getCityProductsAnalysis(governorate, city, filters)
          setData(result)
        } else if (type === 'customers') {
          const result = dataProcessor.getCityCustomersAnalysis(governorate, city, filters)
          setData(result)
        }
      } catch (error) {
        console.error('خطأ في تحميل البيانات:', error)
        setData({ active: [], inactive: [], totalSales: 0 })
      } finally {
        setLoading(false)
      }
    }
  }, [isOpen, city, governorate, dataProcessor, type, filters])

  // تنسيق الأرقام باللغة الإنجليزية
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatCurrency = (amount) => {
    return `${formatNumber(amount)} EGP`
  }

  const formatPercentage = (percentage) => {
    return `${percentage.toFixed(1)}%`
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US')
  }

  if (!isOpen) return null

  const title = type === 'products' ? 'منتجات' : 'عملاء'
  const icon = type === 'products' ? Package : Users

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {React.createElement(icon, { className: "w-5 h-5 text-white" })}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {title} مدينة {city}
              </h2>
              <p className="text-sm text-white/80">
                محافظة {governorate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">جاري تحميل البيانات...</p>
              </div>
            </div>
          ) : (
            <>
              {/* إحصائيات عامة محسنة للهاتف */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
                <div className="p-3 sm:p-4 space-y-3">
                  {/* الإحصائيات الأساسية - تخطيط محسن للهاتف */}
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <div className="flex-1 min-w-0 bg-gradient-to-r from-green-500 to-green-600 p-2 sm:p-3 rounded-lg text-white">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <TrendingUp className="w-4 h-4 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs opacity-90 truncate">المبيعات</p>
                          <p className="text-sm font-bold truncate">{formatCurrency(data.totalSales)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0 bg-gradient-to-r from-blue-500 to-blue-600 p-2 sm:p-3 rounded-lg text-white">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Activity className="w-4 h-4 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs opacity-90 truncate">النشطة</p>
                          <p className="text-sm font-bold">{formatNumber(data.active.length)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 bg-gradient-to-r from-gray-500 to-gray-600 p-2 sm:p-3 rounded-lg text-white">
                      <div className="flex items-center gap-1 sm:gap-2">
                        {type === 'products' ? <PackageX className="w-4 h-4 flex-shrink-0" /> : <UserX className="w-4 h-4 flex-shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-xs opacity-90 truncate">غير نشطة</p>
                          <p className="text-sm font-bold">{formatNumber(data.inactive.length)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* مؤشرات التصنيف للمنتجات فقط - مدمجة بشكل أفضل */}
                  {type === 'products' && data.active.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-2 sm:p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" />
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                          توزيع التصنيفات
                        </h4>
                      </div>
                      <CategoryIndicators
                        products={data.active}
                        totalSales={data.totalSales}
                        mode="percentage"
                        layout="horizontal"
                        size="small"
                        showLabels={false}
                        showValues={true}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* التبويبات */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'active'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Activity className="w-4 h-4" />
                      <span className="hidden sm:inline">النشطة</span>
                      <span className="sm:hidden">نشطة</span>
                      <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                        {data.active.length}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('inactive')}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'inactive'
                        ? 'border-gray-500 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/20'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {type === 'products' ? <PackageX className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      <span className="hidden sm:inline">غير النشطة</span>
                      <span className="sm:hidden">غير نشطة</span>
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-xs">
                        {data.inactive.length}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* محتوى التبويبات */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-3 sm:p-4">
                  {activeTab === 'active' ? (
                    <ActiveTabContent 
                      data={data.active} 
                      type={type} 
                      formatNumber={formatNumber}
                      formatCurrency={formatCurrency}
                      formatPercentage={formatPercentage}
                      formatDate={formatDate}
                    />
                  ) : (
                    <InactiveTabContent 
                      data={data.inactive} 
                      type={type} 
                      formatNumber={formatNumber}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                      filters={filters}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// مكون عرض البيانات النشطة
const ActiveTabContent = ({ data, type, formatNumber, formatCurrency, formatPercentage, formatDate }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        {type === 'products' ? <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" /> : <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />}
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
          لا توجد بيانات نشطة
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          لا توجد {type === 'products' ? 'منتجات' : 'عملاء'} نشطة في الفترة المحددة
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div 
          key={item.code}
          className="bg-gray-50 dark:bg-gray-700/50 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-600"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 flex-shrink-0">
                #{index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                  {item.name}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  {type === 'products' ? `تصنيف: ${item.functionShort || item.category || 'غير محدد'}` : `كود: ${item.code}`}
                </p>
              </div>
            </div>
            
            <div className="text-right flex-shrink-0 ml-2">
              <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-2 py-1 rounded mb-2">
                <div className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400 font-medium">
                  <Activity className="w-3 h-3" />
                  <span>نشط</span>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <Percent className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs sm:text-sm font-bold text-green-600 dark:text-green-400">
                  {formatPercentage(item.salesPercentage)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                من المبيعات
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded border">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">المبيعات</p>
              <p className="font-bold text-green-600 dark:text-green-400 text-xs sm:text-sm">
                {formatCurrency(item.totalSales)}
              </p>
            </div>

            {type === 'products' ? (
              <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded border">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">الكمية</p>
                <p className="font-bold text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                  {formatNumber(item.totalQuantity)}
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded border">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">المنتجات</p>
                <p className="font-bold text-blue-600 dark:text-blue-400 text-xs sm:text-sm">
                  {formatNumber(item.productCount)}
                </p>
              </div>
            )}

            {type === 'products' ? (
              <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded border">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">العملاء</p>
                <p className="font-bold text-purple-600 dark:text-purple-400 text-xs sm:text-sm">
                  {formatNumber(item.customerCount)}
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded border">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">الفواتير</p>
                <p className="font-bold text-purple-600 dark:text-purple-400 text-xs sm:text-sm">
                  {formatNumber(item.invoiceCount)}
                </p>
              </div>
            )}

            {type === 'products' ? (
              <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded border">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">متوسط السعر</p>
                <p className="font-bold text-orange-600 dark:text-orange-400 text-xs sm:text-sm">
                  {formatCurrency(item.avgPrice)}
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded border">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">آخر شراء</p>
                <p className="font-bold text-orange-600 dark:text-orange-400 text-xs sm:text-sm">
                  {formatDate(item.lastPurchaseDate)}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// مكون عرض البيانات غير النشطة
const InactiveTabContent = ({ data, type, formatNumber, formatCurrency, formatDate, filters }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        {type === 'products' ? <PackageX className="w-12 h-12 text-gray-400 mx-auto mb-4" /> : <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />}
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
          لا توجد بيانات غير نشطة
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          جميع {type === 'products' ? 'المنتجات' : 'العملاء'} نشطة في الفترة المحددة
        </p>
      </div>
    )
  }

  const hasFilters = filters && (filters.startDate || filters.endDate)

  return (
    <div className="space-y-4">
      {hasFilters && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-2">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                {type === 'products' ? 'منتجات' : 'عملاء'} غير نشطة في الفترة المحددة
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                هذه {type === 'products' ? 'المنتجات' : 'العملاء'} لم تسجل أي مبيعات في الفترة الزمنية المفلترة، 
                ولكن البيانات المعروضة تمثل إجمالي نشاطها التاريخي في هذه المدينة.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {data.map((item, index) => (
          <div 
            key={item.code}
            className="bg-gray-50 dark:bg-gray-700/50 p-3 sm:p-4 rounded-lg border border-gray-300 dark:border-gray-600 opacity-80 hover:opacity-90 transition-opacity duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 flex-shrink-0">
                  #{index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    {type === 'products' ? `تصنيف: ${item.functionShort || item.category || 'غير محدد'}` : `كود: ${item.code}`}
                  </p>
                </div>
              </div>
              
              <div className="text-right flex-shrink-0 ml-2">
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-2 py-1 rounded text-xs text-red-700 dark:text-red-400 font-medium">
                  غير نشط
                </div>
              </div>
            </div>

            <div className={`grid gap-2 sm:gap-3 ${type === 'products' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2'}`}>
              <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded border">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {hasFilters ? 'إجمالي المبيعات (تاريخي)' : 'المبيعات'}
                </p>
                <p className="font-bold text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                  {formatCurrency(item.totalSales)}
                </p>
              </div>

              {type === 'products' ? (
                <>
                  <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded border">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">الكمية (تاريخي)</p>
                    <p className="font-bold text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      {formatNumber(item.totalQuantity)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded border">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">العملاء (تاريخي)</p>
                    <p className="font-bold text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      {formatNumber(item.customerCount)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded border">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">متوسط السعر</p>
                    <p className="font-bold text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      {formatCurrency(item.avgPrice)}
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded border">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">المنتجات (تاريخي)</p>
                  <p className="font-bold text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                    {formatNumber(item.productCount)}
                  </p>
                </div>
              )}

              {type === 'customers' && (
                <>
                  <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded border">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">الفواتير (تاريخي)</p>
                    <p className="font-bold text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      {formatNumber(item.invoiceCount)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded border">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">آخر شراء</p>
                    <p className="font-bold text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      {formatDate(item.lastPurchaseDate)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CityDetailsModal
