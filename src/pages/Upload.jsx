import { useState, useEffect } from 'react'
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, Trash2, Loader2 } from 'lucide-react'
import { saveToLocalStorage, clearLocalStorage, loadFromLocalStorage } from '../utils/dataProcessor'
import { cleanExcelData, validateExcelFile } from '../utils/excelCleaner'
import { formatNumber, formatCurrency, formatFileSize } from '../utils/formatters'

const Upload = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [stats, setStats] = useState(null)

  // تحميل الإحصائيات إذا كانت البيانات موجودة
  useEffect(() => {
    const initStats = async () => {
      const data = await loadFromLocalStorage()
      if (data) {
        setStats({
          records: data.length,
          customers: new Set(data.map(r => r.customer_code)).size,
          products: new Set(data.map(r => r.product_code)).size
        })
      }
    }
    initStats()
  }, [])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFile = async (file) => {
    // التحقق من نوع الملف
    const isExcel = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');
    const isJson = file.type === 'application/json' || file.name.toLowerCase().endsWith('.json');
    
    if (!isExcel && !isJson) {
      setUploadStatus({
        type: 'error',
        message: 'يرجى رفع ملف Excel (.xlsx, .xls) أو JSON'
      })
      return
    }

    setUploadStatus({ type: 'loading', message: 'جاري معالجة الملف...' })

    try {
      let cleanedData;
      let metadata;

      if (isExcel) {
        // معالجة ملف Excel
        const validation = validateExcelFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        setUploadStatus({ type: 'loading', message: 'جاري قراءة وتنظيف ملف Excel...' });
        const result = await cleanExcelData(file);
        cleanedData = result.data;
        metadata = result.metadata;
      } else {
        // معالجة ملف JSON
        const text = await file.text();
        const jsonData = JSON.parse(text);
        
        if (jsonData.data && Array.isArray(jsonData.data)) {
          cleanedData = jsonData.data;
          metadata = jsonData.metadata;
        } else if (Array.isArray(jsonData)) {
          cleanedData = jsonData;
        } else {
          throw new Error('بنية ملف JSON غير صحيحة');
        }
      }

      // حفظ البيانات
      const saved = saveToLocalStorage(cleanedData);
      
      if (saved) {
        const statsData = {
          records: cleanedData.length,
          customers: new Set(cleanedData.map(r => r.customer_code)).size,
          products: new Set(cleanedData.map(r => r.product_code)).size,
          totalSales: metadata?.total_sales || cleanedData.reduce((sum, r) => sum + (r.item_total || 0), 0)
        };
        
        setStats(statsData);
        
        setUploadStatus({
          type: 'success',
          message: `✓ تم رفع الملف بنجاح! (${cleanedData.length} سجل)`
        });
        
        // إخبار التطبيق بوجود بيانات
        setTimeout(() => {
          onDataLoaded();
        }, 1500);
      } else {
        throw new Error('فشل حفظ البيانات في المتصفح');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setUploadStatus({
        type: 'error',
        message: 'خطأ: ' + error.message
      });
    }
  }

  const handleClearData = () => {
    if (confirm('هل أنت متأكد من حذف جميع البيانات؟')) {
      clearLocalStorage()
      setStats(null)
      setUploadStatus(null)
      window.location.reload()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft hover:shadow-medium p-8 border border-gray-200 dark:border-gray-700 transition-all duration-300">
        <div className="text-center mb-8">
          <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">رفع ملف البيانات</h2>
          <p className="text-gray-600 dark:text-gray-400">
            قم برفع ملف Excel مباشرة (.xlsx أو .xls) وسيتم تنظيفه تلقائياً
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            أو ملف JSON إذا كان منظفاً مسبقاً
          </p>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/30'
          }`}
        >
          <div className={`absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300 ${isDragging ? 'opacity-100' : ''}`}></div>
          <div className="relative">
            <UploadIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
              اسحب وأفلت الملف هنا أو
            </p>
            <label className="inline-block">
              <input
                type="file"
                accept=".xlsx,.xls,.json"
                onChange={handleFileInput}
                className="hidden"
              />
              <span className="bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors inline-block">
                اختر ملف Excel أو JSON
              </span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">الحجم الأقصى: 50MB</p>
          </div>
        </div>

        {/* Status Messages */}
        {uploadStatus && (
          <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
            uploadStatus.type === 'success' ? 'bg-green-50 text-green-800' :
            uploadStatus.type === 'error' ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            {uploadStatus.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {uploadStatus.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {uploadStatus.type === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>{uploadStatus.message}</span>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(stats.records)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">سجل</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatNumber(stats.customers)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">عميل</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center border border-purple-200 dark:border-purple-800">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatNumber(stats.products)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">منتج</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center border border-orange-200 dark:border-orange-800">
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {stats.totalSales ? formatCurrency(stats.totalSales) : '-'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">إجمالي المبيعات</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">تعليمات:</h3>
          <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
            <li>قم برفع ملف Excel الخام مباشرة (.xlsx أو .xls)</li>
            <li>سيتم تنظيف البيانات تلقائياً وحفظها في المتصفح</li>
            <li>يمكنك استخدام التطبيق بدون إنترنت بعد رفع الملف</li>
            <li className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              (اختياري) يمكنك استخدام السكريبت Python لتنظيف الملف مسبقاً: 
              <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded mx-1">python clean_data.py</code>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default Upload
