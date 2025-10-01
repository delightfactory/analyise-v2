/**
 * معالج البيانات - يحول البيانات الخام إلى تحليلات جاهزة للعرض
 */

export class DataProcessor {
  constructor(rawData) {
    this.rawData = rawData || [];
  }

  /**
   * فلترة البيانات حسب الفترة الزمنية
   */
  filterByDateRange(startDate, endDate) {
    if (!startDate || !endDate) return this.rawData;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // نهاية اليوم
    
    return this.rawData.filter(record => {
      const recordDate = new Date(record.invoice_date);
      return recordDate >= start && recordDate <= end;
    });
  }

  /**
   * الحصول على نسخة مفلترة من المعالج
   */
  getFilteredProcessor(startDate, endDate) {
    const filteredData = this.filterByDateRange(startDate, endDate);
    return new DataProcessor(filteredData);
  }

  /**
   * معالجة بيانات العملاء
   */
  getCustomersAnalysis() {
    const customerMap = new Map();

    this.rawData.forEach(record => {
      const code = record.customer_code;
      
      if (!customerMap.has(code)) {
        customerMap.set(code, {
          code: code,
          name: record.customer_name,
          city: record.city,
          governorate: record.governorate,
          totalPurchases: 0,
          orderCount: 0,
          lastPurchaseDate: null,
          products: new Map(),
          invoices: []
        });
      }

      const customer = customerMap.get(code);
      
      // إضافة قيمة المنتج
      customer.totalPurchases += parseFloat(record.item_total) || 0;
      
      // تتبع المنتجات
      const productKey = record.product_code;
      if (!customer.products.has(productKey)) {
        customer.products.set(productKey, {
          code: record.product_code,
          name: record.product_name,
          category: record.product_category,
          quantity: 0,
          totalValue: 0,
          orderCount: 0
        });
      }
      
      const product = customer.products.get(productKey);
      product.quantity += parseFloat(record.quantity) || 0;
      product.totalValue += parseFloat(record.item_total) || 0;
      product.orderCount++;
      
      // تتبع الفواتير
      const invoiceKey = record.invoice_number;
      const existingInvoice = customer.invoices.find(inv => inv.number === invoiceKey);
      if (!existingInvoice) {
        customer.invoices.push({
          number: invoiceKey,
          date: record.invoice_date,
          total: parseFloat(record.item_total) || 0
        });
        customer.orderCount++;
      } else {
        // إضافة قيمة الصنف إلى إجمالي الفاتورة
        existingInvoice.total += parseFloat(record.item_total) || 0;
      }
      
      // تحديث آخر تاريخ شراء
      if (!customer.lastPurchaseDate || record.invoice_date > customer.lastPurchaseDate) {
        customer.lastPurchaseDate = record.invoice_date;
      }
    });

    // تحويل إلى مصفوفة وترتيب
    const customers = Array.from(customerMap.values()).map(customer => ({
      ...customer,
      products: Array.from(customer.products.values())
        .sort((a, b) => b.totalValue - a.totalValue),
      avgOrderValue: customer.orderCount > 0 ? customer.totalPurchases / customer.orderCount : 0,
      invoices: customer.invoices.sort((a, b) => new Date(b.date) - new Date(a.date))
    }));

    return customers.sort((a, b) => b.totalPurchases - a.totalPurchases);
  }

  /**
   * معالجة بيانات المنتجات
   */
  getProductsAnalysis() {
    const productMap = new Map();
    let totalSales = 0;

    this.rawData.forEach(record => {
      const code = record.product_code;
      const itemTotal = parseFloat(record.item_total) || 0;
      totalSales += itemTotal;

      if (!productMap.has(code)) {
        productMap.set(code, {
          code: code,
          name: record.product_name,
          category: record.product_category,
          price: parseFloat(record.product_price) || 0,
          totalSales: 0,
          totalQuantity: 0,
          orderCount: 0,
          customers: new Set(),
          invoices: []
        });
      }

      const product = productMap.get(code);
      product.totalSales += itemTotal;
      product.totalQuantity += parseFloat(record.quantity) || 0;
      product.orderCount++;
      product.customers.add(record.customer_code);
      
      product.invoices.push({
        invoice: record.invoice_number,
        date: record.invoice_date,
        customer: record.customer_name,
        customerCode: record.customer_code,
        quantity: parseFloat(record.quantity) || 0,
        total: itemTotal
      });
    });

    // تحويل إلى مصفوفة
    const products = Array.from(productMap.values()).map(product => ({
      ...product,
      customerCount: product.customers.size,
      customers: Array.from(product.customers),
      salesPercentage: totalSales > 0 ? (product.totalSales / totalSales) * 100 : 0,
      avgPrice: product.totalQuantity > 0 ? product.totalSales / product.totalQuantity : 0,
      invoices: product.invoices.sort((a, b) => new Date(b.date) - new Date(a.date))
    }));

    // حذف Set من الكائن
    products.forEach(p => delete p.customers);

    return products.sort((a, b) => b.totalSales - a.totalSales);
  }

  /**
   * تحليل المنتجات المشتراة معاً (Market Basket Analysis)
   */
  getProductBundlesAnalysis() {
    const invoiceProducts = new Map();

    // تجميع المنتجات حسب الفاتورة
    this.rawData.forEach(record => {
      const invoice = record.invoice_number;
      
      if (!invoiceProducts.has(invoice)) {
        invoiceProducts.set(invoice, {
          customer: record.customer_name,
          customerCode: record.customer_code,
          date: record.invoice_date,
          products: []
        });
      }
      
      invoiceProducts.get(invoice).products.push({
        code: record.product_code,
        name: record.product_name,
        category: record.product_category
      });
    });

    // إيجاد الأزواج والمجموعات
    const bundleMap = new Map();

    invoiceProducts.forEach(invoice => {
      const products = invoice.products;
      
      // إنشاء أزواج من المنتجات
      for (let i = 0; i < products.length; i++) {
        for (let j = i + 1; j < products.length; j++) {
          const product1 = products[i];
          const product2 = products[j];
          
          // ترتيب المنتجات لضمان عدم التكرار
          const bundleKey = [product1.code, product2.code].sort().join('-');
          
          if (!bundleMap.has(bundleKey)) {
            bundleMap.set(bundleKey, {
              products: [
                { code: product1.code, name: product1.name, category: product1.category },
                { code: product2.code, name: product2.name, category: product2.category }
              ],
              count: 0,
              customers: new Set(),
              invoices: []
            });
          }
          
          const bundle = bundleMap.get(bundleKey);
          bundle.count++;
          bundle.customers.add(invoice.customerCode);
          bundle.invoices.push({
            customer: invoice.customer,
            customerCode: invoice.customerCode,
            date: invoice.date
          });
        }
      }
    });

    // تحويل إلى مصفوفة
    const bundles = Array.from(bundleMap.values()).map(bundle => ({
      ...bundle,
      customerCount: bundle.customers.size,
      customers: Array.from(bundle.customers),
      support: (bundle.count / invoiceProducts.size) * 100
    }));

    // حذف Set من الكائن
    bundles.forEach(b => delete b.customers);

    return bundles
      .filter(b => b.count >= 2) // عرض فقط المنتجات التي اشتُريت معاً مرتين على الأقل
      .sort((a, b) => b.count - a.count);
  }

  /**
   * إحصائيات عامة
   */
  getOverallStats() {
    const customers = this.getCustomersAnalysis();
    const products = this.getProductsAnalysis();
    
    const invoices = new Set(this.rawData.map(r => r.invoice_number));
    
    // حساب إجمالي المبيعات الصحيح: مجموع قيمة كل صنف (item_total)
    // لأن item_total = quantity × price ولا يتكرر للصنف الواحد
    const actualTotalSales = this.rawData.reduce((sum, record) => {
      return sum + (parseFloat(record.item_total) || 0);
    }, 0);

    return {
      totalCustomers: customers.length,
      totalProducts: products.length,
      totalInvoices: invoices.size,
      totalSales: actualTotalSales,
      avgOrderValue: invoices.size > 0 ? actualTotalSales / invoices.size : 0,
      topCustomer: customers[0] || null,
      topProduct: products[0] || null
    };
  }

  /**
   * حساب المسافة الزمنية بين الفواتير للعميل
   */
  calculateInvoiceGaps(invoices) {
    if (invoices.length < 2) return [];

    const gaps = [];
    for (let i = 1; i < invoices.length; i++) {
      const date1 = new Date(invoices[i - 1].date);
      const date2 = new Date(invoices[i].date);
      const diffTime = Math.abs(date1 - date2);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      gaps.push(diffDays);
    }

    return {
      gaps,
      avgGap: gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0,
      minGap: gaps.length > 0 ? Math.min(...gaps) : 0,
      maxGap: gaps.length > 0 ? Math.max(...gaps) : 0
    };
  }

  /**
   * تقسيم العملاء إلى نشطين وغير نشطين في فترة معينة
   */
  getCustomersByActivity(startDate, endDate) {
    // الحصول على جميع العملاء
    const allCustomers = this.getCustomersAnalysis();
    
    if (!startDate || !endDate) {
      return {
        active: allCustomers,
        inactive: []
      };
    }
    
    // الحصول على العملاء النشطين في الفترة
    const filteredProcessor = this.getFilteredProcessor(startDate, endDate);
    const activeCustomers = filteredProcessor.getCustomersAnalysis();
    
    // الحصول على أكواد العملاء النشطين
    const activeCustomerCodes = new Set(activeCustomers.map(c => c.code));
    
    // تقسيم العملاء
    const active = allCustomers.filter(c => activeCustomerCodes.has(c.code));
    const inactive = allCustomers.filter(c => !activeCustomerCodes.has(c.code));
    
    return {
      active,
      inactive
    };
  }

  /**
   * الحصول على بيانات عميل معين مع فلترة زمنية
   */
  getCustomerDetails(customerCode, startDate = null, endDate = null) {
    const processor = startDate && endDate 
      ? this.getFilteredProcessor(startDate, endDate)
      : this;
    
    const customers = processor.getCustomersAnalysis();
    return customers.find(c => c.code === customerCode);
  }

  /**
   * تقسيم المنتجات إلى نشطة وغير نشطة في فترة معينة
   */
  getProductsByActivity(startDate, endDate) {
    // الحصول على جميع المنتجات
    const allProducts = this.getProductsAnalysis();
    
    if (!startDate || !endDate) {
      return {
        active: allProducts,
        inactive: []
      };
    }
    
    // الحصول على المنتجات النشطة في الفترة
    const filteredProcessor = this.getFilteredProcessor(startDate, endDate);
    const activeProducts = filteredProcessor.getProductsAnalysis();
    
    // الحصول على أكواد المنتجات النشطة
    const activeProductCodes = new Set(activeProducts.map(p => p.code));
    
    // تقسيم المنتجات
    const active = allProducts.filter(p => activeProductCodes.has(p.code));
    const inactive = allProducts.filter(p => !activeProductCodes.has(p.code));
    
    return {
      active,
      inactive
    };
  }
}

/**
 * حفظ البيانات في LocalStorage مع الضغط
 */
export const saveToLocalStorage = (data) => {
  try {
    // استيراد مكتبة الضغط
    import('lz-string').then(LZString => {
      // تقليل حجم البيانات بحذف الحقول غير الضرورية
      const optimizedData = data.map(record => ({
        cn: record.customer_name,
        cc: record.customer_code,
        ci: record.city,
        g: record.governorate,
        pn: record.product_name,
        pc: record.product_code,
        cat: record.category,
        q: parseFloat(record.quantity) || 0,
        p: parseFloat(record.price) || 0,
        it: parseFloat(record.item_total) || 0,
        in: record.invoice_number,
        id: record.invoice_date
      }));
      
      // ضغط البيانات
      const compressed = LZString.default.compressToUTF16(JSON.stringify(optimizedData));
      
      // حفظ البيانات المضغوطة
      localStorage.setItem('salesData_compressed', compressed);
      localStorage.setItem('salesData_version', '2.0'); // نسخة جديدة مع الضغط
      localStorage.setItem('salesDataTimestamp', new Date().toISOString());
      
      console.log('✓ تم حفظ البيانات بنجاح');
      console.log(`  - حجم البيانات الأصلي: ${(JSON.stringify(data).length / 1024).toFixed(2)} KB`);
      console.log(`  - حجم البيانات المضغوطة: ${(compressed.length / 1024).toFixed(2)} KB`);
      console.log(`  - نسبة الضغط: ${((1 - compressed.length / JSON.stringify(data).length) * 100).toFixed(1)}%`);
    });
    
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    
    // محاولة حفظ بدون ضغط كحل احتياطي
    try {
      localStorage.clear(); // مسح كل البيانات القديمة
      localStorage.setItem('salesData', JSON.stringify(data));
      localStorage.setItem('salesDataTimestamp', new Date().toISOString());
      console.warn('تم الحفظ بدون ضغط (قد يسبب مشاكل مع الملفات الكبيرة)');
      return true;
    } catch (fallbackError) {
      console.error('فشل الحفظ حتى بدون ضغط:', fallbackError);
      return false;
    }
  }
};

/**
 * تحميل البيانات من LocalStorage مع دعم الضغط
 */
export const loadFromLocalStorage = async () => {
  try {
    // التحقق من وجود النسخة المضغوطة
    const version = localStorage.getItem('salesData_version');
    
    if (version === '2.0') {
      // تحميل البيانات المضغوطة
      const compressed = localStorage.getItem('salesData_compressed');
      if (compressed) {
        const LZString = await import('lz-string');
        const decompressed = LZString.default.decompressFromUTF16(compressed);
        const optimizedData = JSON.parse(decompressed);
        
        // إعادة البيانات إلى الشكل الأصلي
        const originalData = optimizedData.map(record => ({
          customer_name: record.cn,
          customer_code: record.cc,
          city: record.ci,
          governorate: record.g,
          product_name: record.pn,
          product_code: record.pc,
          category: record.cat,
          quantity: record.q,
          price: record.p,
          item_total: record.it,
          invoice_number: record.in,
          invoice_date: record.id
        }));
        
        console.log('✓ تم تحميل البيانات المضغوطة بنجاح');
        return originalData;
      }
    }
    
    // تحميل البيانات القديمة (غير المضغوطة)
    const data = localStorage.getItem('salesData');
    if (data) {
      console.log('⚠ تم تحميل بيانات بالنسخة القديمة (غير مضغوطة)');
      return JSON.parse(data);
    }
    
    return null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

/**
 * مسح البيانات من LocalStorage
 */
export const clearLocalStorage = () => {
  try {
    localStorage.removeItem('salesData');
    localStorage.removeItem('salesDataTimestamp');
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};
