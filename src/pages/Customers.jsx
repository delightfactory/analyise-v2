import { useState, useEffect } from 'react'
import { Search, SortAsc, SortDesc, TrendingUp, ShoppingCart, Package, Calendar, MapPin } from 'lucide-react'
import { loadFromLocalStorage, DataProcessor } from '../utils/dataProcessor'
import { formatNumber, formatCurrency, formatDate, formatDuration } from '../utils/formatters'
import Modal, { ModalContent, StatsGrid, DataTable } from '../components/Modal'
import DateRangeFilter from '../components/DateRangeFilter'

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [inactiveCustomers, setInactiveCustomers] = useState([])
  const [filteredInactiveCustomers, setFilteredInactiveCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'totalPurchases', direction: 'desc' })
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [dateFilter, setDateFilter] = useState(null)
  const [dataProcessor, setDataProcessor] = useState(null)
  const [activeTab, setActiveTab] = useState('active') // 'active' or 'inactive'

  // تحميل البيانات الأولية
  useEffect(() => {
    const initData = async () => {
      const data = await loadFromLocalStorage()
      if (data) {
        const processor = new DataProcessor(data)
        setDataProcessor(processor)
        loadCustomers(processor, null)
      }
    }
    initData()
  }, [])

  // تحديث العملاء عند تغيير الفلتر الزمني
  useEffect(() => {
    if (dataProcessor) {
      loadCustomers(dataProcessor, dateFilter)
      // إعادة تعيين التبويب عند إزالة الفلتر
      if (!dateFilter) {
        setActiveTab('active')
      }
    }
  }, [dateFilter])

  // دالة تحميل العملاء مع الفلترة
  const loadCustomers = (processor, filter) => {
    if (filter && (filter.startDate || filter.governorate || filter.city)) {
      // استخدام الفلترة الشاملة
      const filteredProcessor = processor.getCompleteFilteredProcessor(filter)
      
      // إذا كان هناك فلتر زمني، نقسم إلى نشطين وغير نشطين
      if (filter.startDate && filter.endDate) {
        const { active, inactive } = processor.getCustomersByActivity(filter.startDate, filter.endDate)
        
        // تطبيق فلتر المنطقة على النتائج
        let filteredActive = active
        let filteredInactive = inactive
        
        if (filter.governorate || filter.city) {
          filteredActive = active.filter(customer => {
            if (filter.governorate && customer.governorate !== filter.governorate) return false
            if (filter.city && customer.city !== filter.city) return false
            return true
          })
          
          filteredInactive = inactive.filter(customer => {
            if (filter.governorate && customer.governorate !== filter.governorate) return false
            if (filter.city && customer.city !== filter.city) return false
            return true
          })
        }
        
        // إثراء البيانات
        const enrichedActive = filteredActive.map(customer => ({
          ...customer,
          invoiceGaps: processor.calculateInvoiceGaps(customer.invoices)
        }))
        
        const enrichedInactive = filteredInactive.map(customer => ({
          ...customer,
          invoiceGaps: processor.calculateInvoiceGaps(customer.invoices)
        }))
        
        setCustomers(enrichedActive)
        setFilteredCustomers(enrichedActive)
        setInactiveCustomers(enrichedInactive)
      } else {
        // فقط فلتر منطقة بدون فلتر زمني
        const customersData = filteredProcessor.getCustomersAnalysis()
        const enrichedCustomers = customersData.map(customer => ({
          ...customer,
          invoiceGaps: processor.calculateInvoiceGaps(customer.invoices)
        }))
        
        setCustomers(enrichedCustomers)
        setFilteredCustomers(enrichedCustomers)
        setInactiveCustomers([])
      }
    } else {
      // عرض جميع العملاء بدون فلترة
      const customersData = processor.getCustomersAnalysis()
      const enrichedCustomers = customersData.map(customer => ({
        ...customer,
        invoiceGaps: processor.calculateInvoiceGaps(customer.invoices)
      }))
      
      setCustomers(enrichedCustomers)
      setFilteredCustomers(enrichedCustomers)
      setInactiveCustomers([])
    }
  }

  // دالة مساعدة للبحث والفلترة
  const applySearchAndSort = (customerList, search, sort) => {
    // البحث
    let filtered = customerList.filter(customer =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.code.toLowerCase().includes(search.toLowerCase()) ||
      customer.city.toLowerCase().includes(search.toLowerCase()) ||
      customer.governorate.toLowerCase().includes(search.toLowerCase())
    )

    // الترتيب
    filtered.sort((a, b) => {
      let aValue = a[sort.key]
      let bValue = b[sort.key]

      // معالجة التواريخ
      if (sort.key === 'lastPurchaseDate') {
        aValue = aValue ? new Date(aValue).getTime() : 0
        bValue = bValue ? new Date(bValue).getTime() : 0
      }

      if (aValue < bValue) {
        return sort.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sort.direction === 'asc' ? 1 : -1
      }
      return 0
    })

    return filtered
  }

  // البحث والفلترة للعملاء النشطين
  useEffect(() => {
    const filtered = applySearchAndSort(customers, searchTerm, sortConfig)
    setFilteredCustomers(filtered)
  }, [searchTerm, sortConfig, customers])

  // البحث والفلترة للعملاء غير النشطين
  useEffect(() => {
    const filtered = applySearchAndSort(inactiveCustomers, searchTerm, sortConfig)
    setFilteredInactiveCustomers(filtered)
  }, [searchTerm, sortConfig, inactiveCustomers])

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleCustomerClick = (customer) => {
    if (dateFilter && dataProcessor) {
      // تحميل تفاصيل العميل مع الفلترة الزمنية
      const filteredCustomer = dataProcessor.getCustomerDetails(
        customer.code,
        dateFilter.startDate,
        dateFilter.endDate
      )
      if (filteredCustomer) {
        setSelectedCustomer({
          ...filteredCustomer,
          invoiceGaps: dataProcessor.calculateInvoiceGaps(filteredCustomer.invoices)
        })
      }
    } else {
      setSelectedCustomer(customer)
    }
  }

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <SortAsc className="w-4 h-4 opacity-0 group-hover:opacity-50" />
    return sortConfig.direction === 'asc' 
      ? <SortAsc className="w-4 h-4" />
      : <SortDesc className="w-4 h-4" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">العملاء</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">إدارة ومتابعة بيانات العملاء</p>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter
        onFilterChange={setDateFilter}
        dataProcessor={dataProcessor}
        className="animate-fadeIn"
      />

      {/* Search and Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft hover:shadow-medium p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث عن عميل (الاسم، الكود، المدينة...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            عرض {formatNumber(activeTab === 'active' ? filteredCustomers.length : filteredInactiveCustomers.length)} من {formatNumber(activeTab === 'active' ? customers.length : inactiveCustomers.length)} عميل
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft hover:shadow-medium border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300">
        {/* Tabs - only show when date filter is active and there are inactive customers */}
        {dateFilter && inactiveCustomers.length > 0 ? (
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 relative ${
                activeTab === 'active'
                  ? 'text-green-600 dark:text-green-400 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-b-2 border-green-600 dark:border-green-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>العملاء النشطون</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  activeTab === 'active' 
                    ? 'bg-green-600 dark:bg-green-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}>
                  {formatNumber(filteredCustomers.length)}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('inactive')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 relative ${
                activeTab === 'inactive'
                  ? 'text-orange-600 dark:text-orange-400 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-b-2 border-orange-600 dark:border-orange-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Package className="w-4 h-4" />
                <span>بدون نشاط</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  activeTab === 'inactive' 
                    ? 'bg-orange-600 dark:bg-orange-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}>
                  {formatNumber(filteredInactiveCustomers.length)}
                </span>
              </div>
            </button>
          </div>
        ) : (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">جميع العملاء</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              عدد العملاء: {formatNumber(filteredCustomers.length)}
            </p>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 group"
                >
                  <div className="flex items-center gap-2">
                    <span>العميل</span>
                    <SortIcon columnKey="name" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('totalPurchases')}
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 group"
                >
                  <div className="flex items-center gap-2">
                    <span>إجمالي المشتريات</span>
                    <SortIcon columnKey="totalPurchases" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('orderCount')}
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 group"
                >
                  <div className="flex items-center gap-2">
                    <span>عدد الطلبات</span>
                    <SortIcon columnKey="orderCount" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('avgOrderValue')}
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 group"
                >
                  <div className="flex items-center gap-2">
                    <span>متوسط الطلب</span>
                    <SortIcon columnKey="avgOrderValue" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('lastPurchaseDate')}
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 group"
                >
                  <div className="flex items-center gap-2">
                    <span>آخر شراء</span>
                    <SortIcon columnKey="lastPurchaseDate" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  المنطقة
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {(activeTab === 'active' ? filteredCustomers : filteredInactiveCustomers).map((customer) => (
                <tr
                  key={customer.code}
                  onClick={() => activeTab === 'active' ? handleCustomerClick(customer) : setSelectedCustomer(customer)}
                  className={`cursor-pointer transition-colors ${
                    activeTab === 'active'
                      ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      : 'hover:bg-orange-50 dark:hover:bg-orange-900/20 opacity-75 hover:opacity-100'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{customer.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{customer.code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(customer.totalPurchases)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatNumber(customer.orderCount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(customer.avgOrderValue)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(customer.lastPurchaseDate, 'medium')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>{customer.city}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{customer.governorate}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  )
}

// Modal لعرض تفاصيل العميل
const CustomerDetailsModal = ({ customer, onClose }) => {
  // إعداد بيانات الإحصائيات
  const stats = [
    {
      icon: TrendingUp,
      value: formatCurrency(customer.totalPurchases),
      label: 'إجمالي المشتريات',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      valueColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: ShoppingCart,
      value: formatNumber(customer.orderCount),
      label: 'عدد الطلبات',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      valueColor: 'text-green-600 dark:text-green-400'
    },
    {
      icon: Package,
      value: formatNumber(customer.products?.length || 0),
      label: 'عدد الأصناف',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      valueColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: Calendar,
      value: customer.invoiceGaps && customer.invoiceGaps.avgGap ? formatDuration(Math.round(customer.invoiceGaps.avgGap)) : '-',
      label: 'متوسط المدى',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      valueColor: 'text-orange-600 dark:text-orange-400'
    }
  ]

  // إعداد أعمدة جدول المنتجات
  const productColumns = [
    { key: 'index', header: '#', render: (_, index) => formatNumber(index + 1) },
    { 
      key: 'name', 
      header: 'المنتج', 
      render: (product) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">{product.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{product.code}</div>
        </div>
      )
    },
    { key: 'category', header: 'الفئة' },
    { key: 'quantity', header: 'الكمية', render: (product) => formatNumber(product.quantity) },
    { key: 'totalValue', header: 'القيمة', render: (product) => formatCurrency(product.totalValue) },
    { key: 'orderCount', header: 'عدد الطلبات', render: (product) => formatNumber(product.orderCount) }
  ]

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={customer.name}
      subtitle={`كود العميل: ${customer.code}`}
      size="xl"
      headerColor="blue"
    >
      <ModalContent>
        {/* Stats Grid */}
        <StatsGrid stats={stats} columns={4} />

        {/* Location Info */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <div>
            <span className="font-medium text-gray-900 dark:text-gray-100">{customer.city}</span>
            <span className="text-gray-600 dark:text-gray-400"> - {customer.governorate}</span>
          </div>
        </div>

        {/* Products Table */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">الأصناف المشتراة</h3>
          <DataTable
            columns={productColumns}
            data={customer.products || []}
            emptyMessage="لا توجد منتجات"
          />
        </div>

        {/* Invoice Timeline */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            سجل الفواتير ({formatNumber((customer.invoices || []).length)} فاتورة)
          </h3>
          <div className="grid gap-3">
            {(customer.invoices || []).slice(0, 10).map((invoice, index) => (
              <div key={invoice.number} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 transition-all duration-200 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold shadow-sm">
                    {formatNumber(index + 1)}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">فاتورة #{invoice.number}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(invoice.date, 'long')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(invoice.total)}
                  </div>
                </div>
              </div>
            ))}
            {(customer.invoices || []).length > 10 && (
              <div className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                وعرض {formatNumber((customer.invoices || []).length - 10)} فاتورة أخرى...
              </div>
            )}
          </div>
        </div>

        {/* Invoice Gaps Info */}
        {customer.invoiceGaps && customer.invoiceGaps.gaps && customer.invoiceGaps.gaps.length > 0 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">المدى الزمني بين الفواتير</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">متوسط:</span>
                <span className="font-semibold text-blue-900 dark:text-blue-100 mr-2">
                  {customer.invoiceGaps?.avgGap ? formatDuration(Math.round(customer.invoiceGaps.avgGap)) : '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">الحد الأدنى:</span>
                <span className="font-semibold text-blue-900 dark:text-blue-100 mr-2">
                  {customer.invoiceGaps?.minGap ? formatDuration(customer.invoiceGaps.minGap) : '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">الحد الأقصى:</span>
                <span className="font-semibold text-blue-900 dark:text-blue-100 mr-2">
                  {customer.invoiceGaps?.maxGap ? formatDuration(customer.invoiceGaps.maxGap) : '-'}
                </span>
              </div>
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  )
}

export default Customers
