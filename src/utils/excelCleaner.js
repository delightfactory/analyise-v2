import * as XLSX from 'xlsx';

/**
 * تنظيف ومعالجة ملف Excel في المتصفح
 */
export const cleanExcelData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // قراءة أول sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // تحويل إلى JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`تم قراءة ${jsonData.length} صف من ملف Excel`);
        
        // الأعمدة المهمة فقط
        const importantColumns = {
          // معلومات الفاتورة
          'مسلسل': 'invoice_id',
          'الرقم': 'invoice_number',
          'تاريخ الإنشاء': 'invoice_date',
          
          // معلومات العميل
          'العميل - الكود': 'customer_code',
          'العميل - الاسم': 'customer_name',
          'العميل - المنطقة - الاسم': 'city',
          'العميل - المنطقة - المنطقة الرئيسية - الاسم': 'governorate',
          
          // معلومات المنتج
          'العناصر - المنتج - الكود': 'product_code',
          'العناصر - المنتج - الاسم': 'product_name',
          'العناصر - المنتج - التصنيف': 'product_category',
          'العناصر - المنتج - سعر القطعة': 'product_price',
          
          // معلومات العنصر في الفاتورة
          'العناصر - الكمية': 'quantity',
          'العناصر - سعر القطعة': 'item_price',
          'العناصر - الكلي': 'item_total',
          
          // معلومات إضافية
          'مسئول التوصيل - الاسم': 'delivery_person'
        };
        
        // تنظيف البيانات
        const cleanedData = jsonData
          .filter(row => {
            // استبعاد الصفوف بدون بيانات أساسية
            return row['العميل - الكود'] && row['العناصر - المنتج - الكود'];
          })
          .map(row => {
            const cleanRow = {};
            
            // نسخ الأعمدة المهمة فقط
            Object.keys(importantColumns).forEach(arabicKey => {
              const englishKey = importantColumns[arabicKey];
              let value = row[arabicKey];
              
              // معالجة القيم حسب النوع
              if (['invoice_id', 'customer_code', 'product_code', 'invoice_number'].includes(englishKey)) {
                // تحويل الأكواد والأرقام إلى نص
                cleanRow[englishKey] = value ? String(value) : '';
              } else if (['quantity', 'item_price', 'item_total', 'product_price'].includes(englishKey)) {
                // تحويل القيم الرقمية
                cleanRow[englishKey] = parseFloat(value) || 0;
              } else if (englishKey === 'invoice_date') {
                // معالجة التواريخ
                cleanRow[englishKey] = formatExcelDate(value);
              } else {
                // النصوص العادية
                cleanRow[englishKey] = value || 'غير محدد';
              }
            });
            
            return cleanRow;
          });
        
        // حساب إحصائيات
        const uniqueCustomers = new Set(cleanedData.map(r => r.customer_code)).size;
        const uniqueProducts = new Set(cleanedData.map(r => r.product_code)).size;
        const uniqueInvoices = new Set(cleanedData.map(r => r.invoice_number)).size;
        
        // حساب إجمالي المبيعات الصحيح (مجموع item_total)
        const totalSales = cleanedData.reduce((sum, row) => sum + row.item_total, 0);
        
        console.log(`✓ تم التنظيف: ${cleanedData.length} سجل`);
        console.log(`  - ${uniqueCustomers} عميل فريد`);
        console.log(`  - ${uniqueProducts} منتج فريد`);
        console.log(`  - ${uniqueInvoices} فاتورة`);
        console.log(`  - إجمالي المبيعات: ${totalSales.toLocaleString('ar-EG')} ج.م`);
        
        resolve({
          data: cleanedData,
          metadata: {
            total_records: cleanedData.length,
            unique_customers: uniqueCustomers,
            unique_products: uniqueProducts,
            unique_invoices: uniqueInvoices,
            total_sales: totalSales,
            processed_at: new Date().toISOString()
          }
        });
        
      } catch (error) {
        console.error('خطأ في معالجة Excel:', error);
        reject(new Error('فشل في معالجة ملف Excel: ' + error.message));
      }
    };

    reader.onerror = () => {
      reject(new Error('فشل في قراءة الملف'));
    };

    reader.readAsBinaryString(file);
  });
};

/**
 * تنسيق التاريخ من Excel
 */
const formatExcelDate = (value) => {
  if (!value) return null;
  
  // إذا كان التاريخ بصيغة نصية (مثل "30/09/2025 10:49 AM")
  if (typeof value === 'string') {
    try {
      // محاولة تحويل التاريخ العربي
      const parts = value.split(' ');
      if (parts.length >= 1) {
        const datePart = parts[0]; // "30/09/2025"
        const [day, month, year] = datePart.split('/');
        if (day && month && year) {
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
    } catch (e) {
      console.warn('فشل في تحويل التاريخ:', value);
    }
  }
  
  // إذا كان التاريخ بصيغة Excel الرقمية
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    if (date) {
      const year = date.y;
      const month = String(date.m).padStart(2, '0');
      const day = String(date.d).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
  
  // إذا كان بالفعل كائن Date
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return null;
};

/**
 * التحقق من صحة ملف Excel
 */
export const validateExcelFile = (file) => {
  const validExtensions = ['.xlsx', '.xls'];
  const fileName = file.name.toLowerCase();
  
  if (!validExtensions.some(ext => fileName.endsWith(ext))) {
    return {
      valid: false,
      error: 'يرجى رفع ملف Excel (.xlsx أو .xls)'
    };
  }
  
  // التحقق من حجم الملف (أقل من 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'حجم الملف كبير جداً (الحد الأقصى 50MB)'
    };
  }
  
  return { valid: true };
};
