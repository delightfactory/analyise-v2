import pandas as pd
import json
from datetime import datetime

def clean_and_prepare_data(input_file, output_file):
    """
    تنظيف وتحويل ملف Excel الخام إلى JSON مصغر للاستخدام في LocalStorage
    """
    print("جاري قراءة الملف...")
    df = pd.read_excel(input_file)
    
    print(f"عدد الصفوف الأصلية: {len(df)}")
    print(f"عدد الأعمدة الأصلية: {len(df.columns)}")
    
    # الأعمدة المهمة فقط
    important_columns = {
        # معلومات الفاتورة
        'مسلسل': 'invoice_id',
        'الرقم': 'invoice_number',
        'تاريخ الإنشاء': 'invoice_date',
        'الإجمالي النهائي': 'invoice_total',
        
        # معلومات العميل
        'العميل - الكود': 'customer_code',
        'العميل - الاسم': 'customer_name',
        'العميل - المنطقة - الاسم': 'city',
        'العميل - المنطقة - المنطقة الرئيسية - الاسم': 'governorate',
        
        # معلومات المنتج
        'العناصر - المنتج - الكود': 'product_code',
        'العناصر - المنتج - الاسم': 'product_name',
        'العناصر - المنتج - التصنيف': 'product_category',
        'العناصر - المنتج - سعر القطعة': 'product_price',
        
        # معلومات العنصر في الفاتورة
        'العناصر - الكمية': 'quantity',
        'العناصر - سعر القطعة': 'item_price',
        'العناصر - الكلي': 'item_total',
        
        # معلومات المسؤول
        'مسئول التوصيل - الاسم': 'delivery_person'
    }
    
    # اختيار الأعمدة المهمة فقط
    df_clean = df[list(important_columns.keys())].copy()
    df_clean.columns = list(important_columns.values())
    
    # تنظيف البيانات
    print("\nجاري تنظيف البيانات...")
    
    # إزالة الصفوف التي لا تحتوي على معلومات أساسية
    df_clean = df_clean.dropna(subset=['customer_code', 'product_code'])
    
    # تحويل التواريخ
    df_clean['invoice_date'] = pd.to_datetime(df_clean['invoice_date'], format='%d/%m/%Y %I:%M %p', errors='coerce')
    df_clean['invoice_date'] = df_clean['invoice_date'].dt.strftime('%Y-%m-%d')
    
    # تحويل القيم الرقمية وملء القيم الناقصة
    numeric_columns = ['invoice_total', 'product_price', 'quantity', 'item_price', 'item_total']
    for col in numeric_columns:
        df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce').fillna(0)
    
    # تحويل الكود إلى string
    df_clean['customer_code'] = df_clean['customer_code'].astype(str)
    df_clean['product_code'] = df_clean['product_code'].astype(str)
    df_clean['invoice_number'] = df_clean['invoice_number'].astype(str)
    
    # ملء القيم النصية الناقصة
    text_columns = ['customer_name', 'city', 'governorate', 'product_name', 'product_category', 'delivery_person']
    for col in text_columns:
        df_clean[col] = df_clean[col].fillna('غير محدد')
    
    print(f"عدد الصفوف بعد التنظيف: {len(df_clean)}")
    
    # تحويل إلى JSON
    print("\nجاري تحويل البيانات إلى JSON...")
    records = df_clean.to_dict('records')
    
    # حساب إحصائيات سريعة
    unique_customers = df_clean['customer_code'].nunique()
    unique_products = df_clean['product_code'].nunique()
    unique_invoices = df_clean['invoice_number'].nunique()
    total_sales = df_clean.groupby('invoice_number')['invoice_total'].first().sum()
    
    # إنشاء ملف JSON نهائي
    output_data = {
        'metadata': {
            'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'total_records': len(records),
            'unique_customers': unique_customers,
            'unique_products': unique_products,
            'unique_invoices': unique_invoices,
            'total_sales': float(total_sales)
        },
        'data': records
    }
    
    # حفظ الملف
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✓ تم الحفظ بنجاح في: {output_file}")
    print(f"\nالإحصائيات:")
    print(f"  - عدد العملاء الفريدين: {unique_customers}")
    print(f"  - عدد المنتجات الفريدة: {unique_products}")
    print(f"  - عدد الفواتير: {unique_invoices}")
    print(f"  - إجمالي المبيعات: {total_sales:,.2f} جنيه")
    
    # حساب حجم الملف
    import os
    file_size = os.path.getsize(output_file)
    print(f"  - حجم الملف: {file_size / 1024:.2f} KB")
    
    return output_data

if __name__ == "__main__":
    input_file = "export result.xlsx"
    output_file = "cleaned_data.json"
    
    clean_and_prepare_data(input_file, output_file)
