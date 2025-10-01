import { useState, useEffect } from 'react'
import { Users, Package, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react'
import { loadFromLocalStorage, DataProcessor } from '../utils/dataProcessor'
import { formatNumber, formatCurrency, formatPercentage } from '../utils/formatters'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [topCustomers, setTopCustomers] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [categoryData, setCategoryData] = useState([])

  useEffect(() => {
    const data = loadFromLocalStorage()
    if (data) {
      const processor = new DataProcessor(data)
      const overallStats = processor.getOverallStats()
      const customers = processor.getCustomersAnalysis()
      const products = processor.getProductsAnalysis()

      setStats(overallStats)
      setTopCustomers(customers.slice(0, 5))
      setTopProducts(products.slice(0, 5))

      // تجميع حسب الفئة
      const categoryMap = new Map()
      products.forEach(product => {
        const category = product.category || 'غير محدد'
        if (!categoryMap.has(category)) {
          categoryMap.set(category, 0)
        }
        categoryMap.set(category, categoryMap.get(category) + product.totalSales)
      })

      const catData = Array.from(categoryMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6)

      setCategoryData(catData)
    }
  }, [])

  if (!stats) {
    return <div className="text-center py-12">جاري تحميل البيانات...</div>
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-soft hover:shadow-medium p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 dark:to-gray-700/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</p>
          <p className={`text-3xl font-bold ${color} mb-1 transition-colors duration-200`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        <div className="relative">
          <div className={`absolute inset-0 ${color.replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')} opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity duration-300`}></div>
          <Icon className={`relative w-12 h-12 ${color} opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110`} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">لوحة التحكم</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">نظرة شاملة على أداء المبيعات</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={DollarSign}
          title="إجمالي المبيعات"
          value={formatCurrency(stats.totalSales)}
          color="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={ShoppingCart}
          title="عدد الفواتير"
          value={formatNumber(stats.totalInvoices)}
          subtitle={`متوسط: ${formatCurrency(stats.avgOrderValue)}`}
          color="text-green-600 dark:text-green-400"
        />
        <StatCard
          icon={Users}
          title="عدد العملاء"
          value={formatNumber(stats.totalCustomers)}
          color="text-purple-600 dark:text-purple-400"
        />
        <StatCard
          icon={Package}
          title="عدد المنتجات"
          value={formatNumber(stats.totalProducts)}
          color="text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Customers Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft hover:shadow-medium p-4 sm:p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">أفضل 5 عملاء</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topCustomers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80} 
                fontSize={10}
                interval={0}
              />
              <YAxis fontSize={10} />
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'المبيعات']}
                contentStyle={{ 
                  direction: 'rtl', 
                  backgroundColor: 'var(--tooltip-bg)', 
                  border: '1px solid var(--tooltip-border)',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="totalPurchases" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft hover:shadow-medium p-4 sm:p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">توزيع المبيعات حسب الفئة</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${formatPercentage(percent * 100, 0)})`}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ 
                  direction: 'rtl', 
                  backgroundColor: 'var(--tooltip-bg)', 
                  border: '1px solid var(--tooltip-border)',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft hover:shadow-medium border border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">أفضل 5 منتجات</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">المنتج</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الفئة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">الكمية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">المبيعات</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">العملاء</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">النسبة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {topProducts.map((product, index) => (
                <tr key={product.code} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">
                        {formatNumber(index + 1)}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{product.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{product.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{product.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {formatNumber(product.totalQuantity)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {formatCurrency(product.totalSales)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatNumber(product.customerCount)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
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
    </div>
  )
}

export default Dashboard
