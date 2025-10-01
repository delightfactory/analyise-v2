import { useState, useEffect } from 'react'
import { Search, SortAsc, SortDesc, TrendingUp, ShoppingCart, Package, Calendar, MapPin } from 'lucide-react'
import { loadFromLocalStorage, DataProcessor } from '../utils/dataProcessor'
import { formatNumber, formatCurrency, formatDate, formatDuration } from '../utils/formatters'
import Modal, { ModalContent, StatsGrid, DataTable } from '../components/Modal'

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'totalPurchases', direction: 'desc' })
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  useEffect(() => {
    const data = loadFromLocalStorage()
    if (data) {
      const processor = new DataProcessor(data)
      const customersData = processor.getCustomersAnalysis()
      
      // حساب المسافة الزمنية بين الفواتير
      const enrichedCustomers = customersData.map(customer => ({
        ...customer,
        invoiceGaps: processor.calculateInvoiceGaps(customer.invoices)
      }))
      
      setCustomers(enrichedCustomers)
      setFilteredCustomers(enrichedCustomers)
    }
  }, [])

  // البحث والفلترة
  useEffect(() => {
    let filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.governorate.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // الترتيب
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key]
      let bValue = b[sortConfig.key]

      // معالجة التواريخ
      if (sortConfig.key === 'lastPurchaseDate') {
        aValue = aValue ? new Date(aValue).getTime() : 0
        bValue = bValue ? new Date(bValue).getTime() : 0
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })

    setFilteredCustomers(filtered)
  }, [searchTerm, sortConfig, customers])

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
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
            عرض {formatNumber(filteredCustomers.length)} من {formatNumber(customers.length)} عميل
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft hover:shadow-medium border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300">
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
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.code}
                  onClick={() => setSelectedCustomer(customer)}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
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
