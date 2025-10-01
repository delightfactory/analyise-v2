import { useState, useEffect } from 'react'
import { Search, SortAsc, SortDesc, X, TrendingUp, Users, ShoppingCart, Percent, Package2 } from 'lucide-react'
import { loadFromLocalStorage, DataProcessor } from '../utils/dataProcessor'
import { formatNumber, formatCurrency, formatPercentage, formatDate } from '../utils/formatters'
import Modal, { ModalContent, StatsGrid, DataTable } from '../components/Modal'
import DateRangeFilter from '../components/DateRangeFilter'

const Products = () => {
  const [activeTab, setActiveTab] = useState('products') // 'products', 'products-inactive', or 'bundles'
  const [products, setProducts] = useState([])
  const [inactiveProducts, setInactiveProducts] = useState([])
  const [bundles, setBundles] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [filteredInactiveProducts, setFilteredInactiveProducts] = useState([])
  const [filteredBundles, setFilteredBundles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'totalSales', direction: 'desc' })
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedBundle, setSelectedBundle] = useState(null)
  const [dateFilter, setDateFilter] = useState(null)
  const [dataProcessor, setDataProcessor] = useState(null)

  useEffect(() => {
    const initData = async () => {
      const data = await loadFromLocalStorage()
      if (data) {
        const processor = new DataProcessor(data)
        setDataProcessor(processor)
        loadProductsData(processor, null)
      }
    }
    initData()
  }, [])

  useEffect(() => {
    if (dataProcessor) {
      loadProductsData(dataProcessor, dateFilter)
      // إعادة تعيين التبويب عند إزالة الفلتر
      if (!dateFilter) {
        setActiveTab('products')
      }
    }
  }, [dateFilter])

  const loadProductsData = (processor, filter) => {
    if (filter && (filter.startDate || filter.governorate || filter.city)) {
      // استخدام الفلترة الشاملة
      const filteredProcessor = processor.getCompleteFilteredProcessor(filter)
      
      // إذا كان هناك فلتر زمني، نقسم إلى نشطة وغير نشطة
      if (filter.startDate && filter.endDate) {
        const { active, inactive } = processor.getProductsByActivity(filter.startDate, filter.endDate)
        
        // المنتجات المشتراة معاً من البيانات المفلترة
        const bundlesData = filteredProcessor.getProductBundlesAnalysis()
        
        setProducts(active)
        setFilteredProducts(active)
        setInactiveProducts(inactive)
        setFilteredInactiveProducts(inactive)
        setBundles(bundlesData)
        setFilteredBundles(bundlesData)
      } else {
        // فقط فلتر منطقة بدون فلتر زمني
        const productsData = filteredProcessor.getProductsAnalysis()
        const bundlesData = filteredProcessor.getProductBundlesAnalysis()
        
        setProducts(productsData)
        setFilteredProducts(productsData)
        setInactiveProducts([])
        setFilteredInactiveProducts([])
        setBundles(bundlesData)
        setFilteredBundles(bundlesData)
      }
    } else {
      // عرض جميع المنتجات بدون فلترة
      const productsData = processor.getProductsAnalysis()
      const bundlesData = processor.getProductBundlesAnalysis()
      
      setProducts(productsData)
      setFilteredProducts(productsData)
      setInactiveProducts([])
      setFilteredInactiveProducts([])
      setBundles(bundlesData)
      setFilteredBundles(bundlesData)
    }
  }

  // البحث والفلترة للمنتجات النشطة
  useEffect(() => {
    if (activeTab === 'products') {
      let filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )

      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })

      setFilteredProducts(filtered)
    }
  }, [searchTerm, sortConfig, products, activeTab])

  // البحث والفلترة للمنتجات غير النشطة
  useEffect(() => {
    if (activeTab === 'products-inactive') {
      let filtered = inactiveProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )

      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })

      setFilteredInactiveProducts(filtered)
    }
  }, [searchTerm, sortConfig, inactiveProducts, activeTab])

  // البحث للمنتجات المشتراة معاً
  useEffect(() => {
    if (activeTab === 'bundles') {
      const filtered = bundles.filter(bundle =>
        bundle.products.some(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.code.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      setFilteredBundles(filtered)
    }
  }, [searchTerm, bundles, activeTab])

  // مسح البحث عند التبديل بين التبويبات
  useEffect(() => {
    setSearchTerm('')
  }, [activeTab])

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">المنتجات</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">تحليل وإدارة المنتجات</p>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter
        onFilterChange={setDateFilter}
        dataProcessor={dataProcessor}
        className="animate-fadeIn"
      />

      {/* Tabs and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft hover:shadow-medium border border-gray-200 dark:border-gray-700 transition-all duration-300">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
              activeTab === 'products'
                ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>{dateFilter ? 'المنتجات النشطة' : 'جميع المنتجات'}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                activeTab === 'products' 
                  ? 'bg-green-600 dark:bg-green-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}>
                {formatNumber(filteredProducts.length)}
              </span>
            </div>
          </button>
          {dateFilter && inactiveProducts.length > 0 && (
            <button
              onClick={() => setActiveTab('products-inactive')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                activeTab === 'products-inactive'
                  ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Package2 className="w-4 h-4" />
                <span>بدون نشاط</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  activeTab === 'products-inactive' 
                    ? 'bg-orange-600 dark:bg-orange-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}>
                  {formatNumber(filteredInactiveProducts.length)}
                </span>
              </div>
            </button>
          )}
          <button
            onClick={() => setActiveTab('bundles')}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
              activeTab === 'bundles'
                ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span>منتجات تُشترى معاً ({formatNumber(bundles.length)})</span>
            </div>
          </button>
        </div>

        {/* Search */}
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder={
                  activeTab === 'products' ? 'البحث عن منتج...' :
                  activeTab === 'products-inactive' ? 'البحث في المنتجات غير النشطة...' :
                  'البحث في المنتجات المشتراة معاً...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {activeTab === 'products' 
                ? `عرض ${formatNumber(filteredProducts.length)} من ${formatNumber(products.length)} منتج`
                : activeTab === 'products-inactive'
                ? `عرض ${formatNumber(filteredInactiveProducts.length)} من ${formatNumber(inactiveProducts.length)} منتج`
                : `عرض ${formatNumber(filteredBundles.length)} من ${formatNumber(bundles.length)} مجموعة`
              }
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'products' ? (
        <ProductsTable
          products={filteredProducts}
          sortConfig={sortConfig}
          onSort={handleSort}
          onProductClick={setSelectedProduct}
          SortIcon={SortIcon}
          isInactive={false}
        />
      ) : activeTab === 'products-inactive' ? (
        <ProductsTable
          products={filteredInactiveProducts}
          sortConfig={sortConfig}
          onSort={handleSort}
          onProductClick={setSelectedProduct}
          SortIcon={SortIcon}
          isInactive={true}
        />
      ) : (
        <BundlesTable
          bundles={filteredBundles}
          onBundleClick={setSelectedBundle}
        />
      )}

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {selectedBundle && (
        <BundleDetailsModal
          bundle={selectedBundle}
          onClose={() => setSelectedBundle(null)}
        />
      )}
    </div>
  )
}

// جدول المنتجات
const ProductsTable = ({ products, sortConfig, onSort, onProductClick, SortIcon, isInactive = false }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-soft hover:shadow-medium overflow-hidden transition-all duration-300 ${
    isInactive ? 'border-2 border-orange-300 dark:border-orange-700' : 'border border-gray-200 dark:border-gray-700'
  }`}>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th
              onClick={() => onSort('name')}
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 group"
            >
              <div className="flex items-center gap-2">
                <span>المنتج</span>
                <SortIcon columnKey="name" />
              </div>
            </th>
            <th
              onClick={() => onSort('category')}
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 group"
            >
              <div className="flex items-center gap-2">
                <span>الفئة</span>
                <SortIcon columnKey="category" />
              </div>
            </th>
            <th
              onClick={() => onSort('totalSales')}
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 group"
            >
              <div className="flex items-center gap-2">
                <span>إجمالي المبيعات</span>
                <SortIcon columnKey="totalSales" />
              </div>
            </th>
            <th
              onClick={() => onSort('totalQuantity')}
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 group"
            >
              <div className="flex items-center gap-2">
                <span>الكمية المباعة</span>
                <SortIcon columnKey="totalQuantity" />
              </div>
            </th>
            <th
              onClick={() => onSort('customerCount')}
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 group"
            >
              <div className="flex items-center gap-2">
                <span>عدد العملاء</span>
                <SortIcon columnKey="customerCount" />
              </div>
            </th>
            <th
              onClick={() => onSort('salesPercentage')}
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 group"
            >
              <div className="flex items-center gap-2">
                <span>النسبة</span>
                <SortIcon columnKey="salesPercentage" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {products.map((product) => (
            <tr
              key={product.code}
              onClick={() => onProductClick(product)}
              className={`cursor-pointer transition-colors ${
                isInactive
                  ? 'hover:bg-orange-50 dark:hover:bg-orange-900/20 opacity-75 hover:opacity-100'
                  : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
            >
              <td className="px-6 py-4">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{product.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{product.code}</div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                {product.category}
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(product.totalSales)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                {formatNumber(product.totalQuantity)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                {formatNumber(product.customerCount)}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 max-w-[100px]">
                    <div
                      className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                      style={{ width: `${Math.min(product.salesPercentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 w-12">
                    {formatPercentage(product.salesPercentage)}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

// جدول المنتجات المشتراة معاً
const BundlesTable = ({ bundles, onBundleClick }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft hover:shadow-medium border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">المنتجات</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">عدد مرات الشراء</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">عدد العملاء</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">نسبة التكرار</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {bundles.map((bundle, index) => (
            <tr
              key={index}
              onClick={() => onBundleClick(bundle)}
              className="hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4">
                <div className="space-y-1">
                  {bundle.products.map((product, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-blue-600 dark:text-blue-400">•</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{product.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">({product.category})</span>
                    </div>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                  {formatNumber(bundle.count)} مرة
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                {formatNumber(bundle.customerCount)} عميل
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                {formatPercentage(bundle.support)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

// Modal تفاصيل المنتج
const ProductDetailsModal = ({ product, onClose }) => {
  // إعداد بيانات الإحصائيات
  const stats = [
    {
      icon: TrendingUp,
      value: formatCurrency(product.totalSales),
      label: 'إجمالي المبيعات',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      valueColor: 'text-green-600 dark:text-green-400'
    },
    {
      icon: ShoppingCart,
      value: formatNumber(product.totalQuantity),
      label: 'الكمية المباعة',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      valueColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: Users,
      value: formatNumber(product.customerCount),
      label: 'عدد العملاء',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      valueColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: Percent,
      value: formatPercentage(product.salesPercentage),
      label: 'نسبة المبيعات',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      valueColor: 'text-orange-600 dark:text-orange-400'
    }
  ]

  // إعداد أعمدة جدول الفواتير
  const invoiceColumns = [
    { key: 'date', header: 'التاريخ', render: (invoice) => formatDate(invoice.date, 'short') },
    { 
      key: 'customer', 
      header: 'العميل', 
      render: (invoice) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">{invoice.customer}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{invoice.customerCode}</div>
        </div>
      )
    },
    { key: 'invoice', header: 'الفاتورة', render: (invoice) => `#${invoice.invoice}` },
    { key: 'quantity', header: 'الكمية', render: (invoice) => formatNumber(invoice.quantity) },
    { key: 'total', header: 'القيمة', render: (invoice) => formatCurrency(invoice.total) }
  ]

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={product.name}
      subtitle={`${product.category} - كود: ${product.code}`}
      size="xl"
      headerColor="green"
    >
      <ModalContent>
        {/* Stats Grid */}
        <StatsGrid stats={stats} columns={4} />

        {/* Price Info */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600 dark:text-gray-400 text-sm">السعر المسجل:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 mr-2">
                {formatCurrency(product.price)}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400 text-sm">متوسط سعر البيع:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 mr-2">
                {formatCurrency(product.avgPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Sales Timeline */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">سجل المبيعات</h3>
          <DataTable
            columns={invoiceColumns}
            data={product.invoices || []}
            maxHeight="400px"
            emptyMessage="لا توجد فواتير"
          />
        </div>
      </ModalContent>
    </Modal>
  )
}

// Modal تفاصيل المنتجات المشتراة معاً
const BundleDetailsModal = ({ bundle, onClose }) => {
  // تجميع حسب العميل
  const customerPurchases = (bundle.invoices || []).reduce((acc, inv) => {
    if (!acc[inv.customerCode]) {
      acc[inv.customerCode] = {
        code: inv.customerCode,
        name: inv.customer,
        count: 0,
        dates: []
      }
    }
    acc[inv.customerCode].count++
    acc[inv.customerCode].dates.push(inv.date)
    return acc
  }, {})

  const customers = Object.values(customerPurchases).sort((a, b) => b.count - a.count)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">منتجات تُشترى معاً</h2>
            <p className="text-purple-100 mt-1">تحليل نمط الشراء المشترك</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Products in Bundle */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">المنتجات في هذه المجموعة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bundle.products.map((product, index) => (
                <div key={index} className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="font-semibold text-purple-900">{product.name}</div>
                  <div className="text-sm text-purple-700 mt-1">{product.category}</div>
                  <div className="text-xs text-purple-600 mt-1">كود: {product.code}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{bundle.count}</div>
              <div className="text-sm text-gray-600">مرات الشراء المشترك</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{bundle.customerCount}</div>
              <div className="text-sm text-gray-600">عدد العملاء</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{bundle.support.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">نسبة التكرار</div>
            </div>
          </div>

          {/* Customers Who Bought This Bundle */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">العملاء الذين اشتروا هذه المجموعة</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">#</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">العميل</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">عدد المرات</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">آخر عملية شراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customers.map((customer, index) => (
                    <tr key={customer.code} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-xs text-gray-500">{customer.code}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                          {customer.count} مرة
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(customer.dates[0], 'medium')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* All Purchase Instances */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">سجل عمليات الشراء المشترك</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {bundle.invoices.map((invoice, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{invoice.customer}</div>
                    <div className="text-xs text-gray-500">{invoice.customerCode}</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(invoice.date, 'long')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products
