import React, { useMemo } from 'react'
import { TrendingUp, Package, Wrench, Car, Gauge, Settings, Zap, Disc, Sofa, Cog, Monitor, Hammer } from 'lucide-react'

/**
 * مكون مؤشرات التصنيف - يعرض نسب التصنيفات الوظيفية للمنتجات
 */
const CategoryIndicators = ({ 
  products = [], 
  totalSales = 0,
  mode = 'percentage', // 'percentage' | 'sales' | 'count'
  layout = 'horizontal', // 'horizontal' | 'vertical' | 'grid'
  size = 'medium', // 'small' | 'medium' | 'large'
  showLabels = true,
  showValues = true,
  className = ''
}) => {
  // خريطة الأيقونات والألوان للتصنيفات
  const categoryConfig = {
    'الخارجى': { 
      icon: Car, 
      color: 'blue', 
      bgColor: 'bg-blue-500', 
      lightBg: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      label: 'الخارجى'
    },
    'الاطارات': { 
      icon: Disc, 
      color: 'green', 
      bgColor: 'bg-green-500', 
      lightBg: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      label: 'الإطارات'
    },
    'الفرش': { 
      icon: Sofa, 
      color: 'purple', 
      bgColor: 'bg-purple-500', 
      lightBg: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      label: 'الفرش'
    },
    'المحرك': { 
      icon: Cog, 
      color: 'red', 
      bgColor: 'bg-red-500', 
      lightBg: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400',
      label: 'المحرك'
    },
    'التابلو': { 
      icon: Monitor, 
      color: 'orange', 
      bgColor: 'bg-orange-500', 
      lightBg: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      label: 'التابلو'
    },
    'تولز': { 
      icon: Hammer, 
      color: 'gray', 
      bgColor: 'bg-gray-500', 
      lightBg: 'bg-gray-50 dark:bg-gray-700/20',
      textColor: 'text-gray-600 dark:text-gray-400',
      label: 'الأدوات'
    }
  }

  // حساب إحصائيات التصنيفات
  const categoryStats = useMemo(() => {
    const stats = new Map()
    let totalCategorySales = 0
    let totalCategoryCount = 0

    // تهيئة جميع التصنيفات
    Object.keys(categoryConfig).forEach(cat => {
      stats.set(cat, { sales: 0, count: 0, percentage: 0 })
    })

    // حساب الإحصائيات
    products.forEach(product => {
      const category = product.functionShort || product.category || 'غير محدد'
      const sales = parseFloat(product.totalSales) || 0
      
      if (stats.has(category)) {
        const current = stats.get(category)
        current.sales += sales
        current.count += 1
        totalCategorySales += sales
        totalCategoryCount += 1
      } else {
        // تصنيف غير معروف - إضافة إلى "تولز"
        const current = stats.get('تولز')
        current.sales += sales
        current.count += 1
        totalCategorySales += sales
        totalCategoryCount += 1
      }
    })

    // حساب النسب المئوية
    const baseSales = mode === 'percentage' ? (totalSales || totalCategorySales) : totalCategorySales
    stats.forEach((stat, category) => {
      stat.percentage = baseSales > 0 ? (stat.sales / baseSales) * 100 : 0
    })

    // ترتيب حسب المبيعات
    return Array.from(stats.entries())
      .map(([category, stat]) => ({ category, ...stat }))
      .sort((a, b) => b.sales - a.sales)
      .filter(item => item.sales > 0 || item.count > 0) // إظهار التصنيفات التي لها بيانات فقط
  }, [products, totalSales, mode])

  // تنسيق القيم
  const formatValue = (stat) => {
    switch (mode) {
      case 'sales':
        return formatCurrency(stat.sales)
      case 'count':
        return stat.count.toString()
      case 'percentage':
      default:
        return `${stat.percentage.toFixed(1)}%`
    }
  }

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`
    }
    return new Intl.NumberFormat('en-US').format(amount)
  }

  // تحديد أحجام المكونات
  const sizeConfig = {
    small: {
      container: 'gap-1',
      item: 'p-1.5',
      icon: 'w-3 h-3',
      text: 'text-xs',
      value: 'text-xs font-medium'
    },
    medium: {
      container: 'gap-2',
      item: 'p-2',
      icon: 'w-4 h-4',
      text: 'text-sm',
      value: 'text-sm font-semibold'
    },
    large: {
      container: 'gap-3',
      item: 'p-3',
      icon: 'w-5 h-5',
      text: 'text-base',
      value: 'text-base font-bold'
    }
  }

  const currentSize = sizeConfig[size] || sizeConfig.medium

  if (categoryStats.length === 0) {
    return null
  }

  // تخطيط شبكي للشاشات الصغيرة
  if (layout === 'grid') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 ${currentSize.container} ${className}`}>
        {categoryStats.map(stat => {
          const config = categoryConfig[stat.category]
          if (!config) return null
          
          const IconComponent = config.icon
          
          return (
            <div 
              key={stat.category}
              className={`${config.lightBg} ${currentSize.item} rounded-lg border border-gray-200 dark:border-gray-600 transition-all hover:shadow-md`}
            >
              <div className="flex items-center gap-2">
                <div className={`${config.bgColor} p-1 rounded`}>
                  <IconComponent className={`${currentSize.icon} text-white`} />
                </div>
                <div className="flex-1 min-w-0">
                  {showLabels && (
                    <p className={`${currentSize.text} ${config.textColor} truncate`}>
                      {config.label}
                    </p>
                  )}
                  {showValues && (
                    <p className={`${currentSize.value} text-gray-900 dark:text-gray-100`}>
                      {formatValue(stat)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // تخطيط أفقي أو عمودي
  const containerClass = layout === 'vertical' 
    ? `flex flex-col ${currentSize.container}` 
    : `flex flex-wrap ${currentSize.container}`

  return (
    <div className={`${containerClass} ${className}`}>
      {categoryStats.map(stat => {
        const config = categoryConfig[stat.category]
        if (!config) return null
        
        const IconComponent = config.icon
        
        return (
          <div 
            key={stat.category}
            className={`${config.lightBg} ${currentSize.item} rounded-lg border border-gray-200 dark:border-gray-600 transition-all hover:shadow-md flex-shrink-0`}
          >
            <div className="flex items-center gap-2">
              <div className={`${config.bgColor} p-1 rounded flex-shrink-0`}>
                <IconComponent className={`${currentSize.icon} text-white`} />
              </div>
              <div className="flex-1 min-w-0">
                {showLabels && (
                  <p className={`${currentSize.text} ${config.textColor} truncate`}>
                    {config.label}
                  </p>
                )}
                {showValues && (
                  <p className={`${currentSize.value} text-gray-900 dark:text-gray-100`}>
                    {formatValue(stat)}
                  </p>
                )}
              </div>
            </div>
            
            {/* شريط التقدم للنسب المئوية */}
            {mode === 'percentage' && stat.percentage > 0 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div 
                    className={`${config.bgColor} h-1 rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default CategoryIndicators
