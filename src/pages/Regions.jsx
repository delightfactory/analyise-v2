import { useState, useEffect, useMemo } from 'react'
import { MapPin, Users, Package, TrendingUp, ChevronDown, ChevronUp, Building2, BarChart3 } from 'lucide-react'
import { DataProcessor, loadFromLocalStorage } from '../utils/dataProcessor'
import { loadProductClassifier } from '../utils/productClassifier'
import DateRangeFilter from '../components/DateRangeFilter'
import CityDetailsModal from '../components/CityDetailsModal'
import CategoryIndicators from '../components/CategoryIndicators'

/**
 * صفحة تحليل المناطق والمحافظات
 */
const Regions = () => {
  const [rawData, setRawData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(null)
  const [classifierMap, setClassifierMap] = useState(null)
  const [selectedGovernorate, setSelectedGovernorate] = useState(null)
  const [expandedGov, setExpandedGov] = useState(null)
  const [modalData, setModalData] = useState({ isOpen: false, city: null, governorate: null, type: null })

  // تحميل البيانات
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadFromLocalStorage()
        if (data) {
          setRawData(data)
        }
      } catch (error) {
        console.error('خطأ في تحميل البيانات:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // تحميل ملف تصنيف المنتجات (public/merged_products_classified_v2.csv)
  useEffect(() => {
    let mounted = true
    loadProductClassifier()
      .then((map) => {
        if (mounted) setClassifierMap(map || null)
      })
      .catch((err) => console.warn('تعذر تحميل ملف تصنيف المنتجات:', err))
    return () => { mounted = false }
  }, [])

  // معالج البيانات مع الفلاتر
  const dataProcessor = useMemo(() => {
    if (!rawData.length) return null
    
    const processor = new DataProcessor(rawData, { productClassifier: classifierMap })
    
    if (filters) {
      return processor.getCompleteFilteredProcessor(filters)
    }
    
    return processor
  }, [rawData, filters, classifierMap])

  // تحليل المحافظات
  const governoratesAnalysis = useMemo(() => {
    if (!dataProcessor) return []
    return dataProcessor.getGovernoratesAnalysis()
  }, [dataProcessor])

  // إحصائيات عامة
  const overallStats = useMemo(() => {
    if (!dataProcessor) return null
    return dataProcessor.getOverallStats()
  }, [dataProcessor])

  // معالج تغيير الفلاتر
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setSelectedGovernorate(null)
    setExpandedGov(null)
  }

  // معالج النقر على كارت المحافظة
  const handleGovernorateClick = (governorate) => {
    if (expandedGov === governorate.name) {
      setExpandedGov(null)
    } else {
      setExpandedGov(governorate.name)
    }
  }

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

  // معالج فتح المودال
  const openModal = (city, governorate, type) => {
    setModalData({ isOpen: true, city, governorate, type })
  }

  // معالج إغلاق المودال
  const closeModal = () => {
    setModalData({ isOpen: false, city: null, governorate: null, type: null })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل بيانات المناطق...</p>
        </div>
      </div>
    )
  }

  if (!dataProcessor) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">لا توجد بيانات</h3>
        <p className="text-gray-600 dark:text-gray-400">يرجى رفع ملف البيانات أولاً</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* العنوان */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">تحليل المناطق</h1>
          <p className="text-gray-600 dark:text-gray-400">إحصائيات وتحليلات المحافظات والمدن</p>
        </div>
      </div>

      {/* فلاتر البحث */}
      <DateRangeFilter 
        onFilterChange={handleFilterChange}
        dataProcessor={new DataProcessor(rawData, { productClassifier: classifierMap })}
        className="mb-6"
      />

      {/* الإحصائيات العامة */}
      {overallStats && (
        <div className="space-y-6 mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المبيعات</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(overallStats.totalSales)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">عدد المحافظات</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {governoratesAnalysis.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي العملاء</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {formatNumber(overallStats.totalCustomers)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المنتجات</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {formatNumber(overallStats.totalProducts)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* مؤشرات التصنيف العامة */}
          {dataProcessor && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  توزيع التصنيفات الوظيفية
                </h3>
                {filters && (
                  <span className="text-sm font-normal text-blue-600 dark:text-blue-400">
                    (مفلتر)
                  </span>
                )}
              </div>
              <CategoryIndicators
                products={dataProcessor.getProductsAnalysis()}
                totalSales={overallStats.totalSales}
                mode="percentage"
                layout="grid"
                size="medium"
                showLabels={true}
                showValues={true}
              />
            </div>
          )}
        </div>
      )}

      {/* كروت المحافظات */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          تحليل المحافظات
          {filters && (
            <span className="text-sm font-normal text-blue-600 dark:text-blue-400">
              (مفلتر)
            </span>
          )}
        </h2>

        {governoratesAnalysis.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">لا توجد بيانات للمحافظات في الفترة المحددة</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {governoratesAnalysis.map((governorate, index) => (
              <div key={governorate.name} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* هيدر المحافظة */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => handleGovernorateClick(governorate)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                          #{index + 1}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {governorate.name}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-gray-600 dark:text-gray-400">المبيعات</p>
                          <p className="font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(governorate.totalSales)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 dark:text-gray-400">العملاء</p>
                          <p className="font-bold text-blue-600 dark:text-blue-400">
                            {formatNumber(governorate.customerCount)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 dark:text-gray-400">المدن</p>
                          <p className="font-bold text-purple-600 dark:text-purple-400">
                            {governorate.cityCount}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 dark:text-gray-400">المنتجات</p>
                          <p className="font-bold text-orange-600 dark:text-orange-400">
                            {formatNumber(governorate.productCount)}
                          </p>
                        </div>
                      </div>
                      
                      {expandedGov === governorate.name ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* إحصائيات مبسطة للموبايل */}
                  <div className="sm:hidden mt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400">المبيعات</p>
                        <p className="font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(governorate.totalSales)}
                        </p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400">العملاء</p>
                        <p className="font-bold text-blue-600 dark:text-blue-400">
                          {formatNumber(governorate.customerCount)}
                        </p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400">المدن</p>
                        <p className="font-bold text-purple-600 dark:text-purple-400">
                          {governorate.cityCount}
                        </p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400">المنتجات</p>
                        <p className="font-bold text-orange-600 dark:text-orange-400">
                          {formatNumber(governorate.productCount)}
                        </p>
                      </div>
                    </div>

                    {/* مؤشرات التصنيف للمحافظة */}
                    {dataProcessor && (
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">توزيع التصنيفات:</p>
                        <CategoryIndicators
                          products={dataProcessor.getCompleteFilteredProcessor({ governorate: governorate.name, ...filters }).getProductsAnalysis()}
                          totalSales={governorate.totalSales}
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

                {/* تفاصيل المدن */}
                {expandedGov === governorate.name && (
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                    <div className="p-4">
                      <h4 className="text-md font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        مدن محافظة {governorate.name} ({governorate.cities.length} مدينة)
                      </h4>
                      
                      {governorate.cities.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                          لا توجد بيانات للمدن
                        </p>
                      ) : (
                        <div className="grid gap-3">
                          {governorate.cities.map((city, cityIndex) => (
                            <div 
                              key={city.name}
                              className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                                    #{cityIndex + 1}
                                  </span>
                                  <h5 className="font-bold text-gray-900 dark:text-gray-100">
                                    {city.name}
                                  </h5>
                                </div>
                              </div>
                              
                              <div className="mt-2 space-y-3">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                                  <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">المبيعات</p>
                                    <p className="font-bold text-green-600 dark:text-green-400">
                                      {formatCurrency(city.totalSales)}
                                    </p>
                                  </div>
                                  <div 
                                    className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                    onClick={() => openModal(city.name, governorate.name, 'customers')}
                                    title="انقر لعرض تفاصيل العملاء"
                                  >
                                    <p className="text-xs text-gray-600 dark:text-gray-400">العملاء</p>
                                    <p className="font-bold text-blue-600 dark:text-blue-400">
                                      {formatNumber(city.customerCount)}
                                    </p>
                                  </div>
                                  <div 
                                    className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
                                    onClick={() => openModal(city.name, governorate.name, 'products')}
                                    title="انقر لعرض تفاصيل المنتجات"
                                  >
                                    <p className="text-xs text-gray-600 dark:text-gray-400">المنتجات</p>
                                    <p className="font-bold text-orange-600 dark:text-orange-400">
                                      {formatNumber(city.productCount)}
                                    </p>
                                  </div>
                                  <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">الفواتير</p>
                                    <p className="font-bold text-purple-600 dark:text-purple-400">
                                      {formatNumber(city.invoiceCount)}
                                    </p>
                                  </div>
                                </div>

                                {/* مؤشرات التصنيف للمدينة */}
                                {dataProcessor && (
                                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">توزيع التصنيفات:</p>
                                    <CategoryIndicators
                                      products={dataProcessor.getCityProductsAnalysis(governorate.name, city.name, filters).active}
                                      totalSales={city.totalSales}
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
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* مودال تفاصيل المدينة */}
      <CityDetailsModal
        isOpen={modalData.isOpen}
        onClose={closeModal}
        city={modalData.city}
        governorate={modalData.governorate}
        dataProcessor={new DataProcessor(rawData, { productClassifier: classifierMap })} // تمرير المعالج الأصلي مع التصنيف
        type={modalData.type}
        filters={filters} // تمرير الفلاتر المطبقة
      />
    </div>
  )
}

export default Regions
