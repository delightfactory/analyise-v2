// Utility to load and cache product functional classification (by product_code)
// Source CSV expected at: public/merged_products_classified_v2.csv
// CSV columns (no header assumed):
// code,name,brand_or_segment,function_category_ar

let _cache = null;
let _loadingPromise = null;

const PUBLIC_CSV_PATH = '/merged_products_classified_v2.csv';

function normalizeArabic(str = '') {
  return String(str)
    .replace(/[\u200E\u200F]/g, '') // remove LTR/RTL marks
    .replace(/أ|إ|آ/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}

function shortenFunctionCategory(ar) {
  const s = normalizeArabic(ar);
  if (!s) return '';
  // Keyword-based mapping to concise labels
  if (/(السطح|الخارج)/.test(s)) return 'الخارجى';
  if (/(الاطارات|الإطارات|اطار|عجلات)/.test(s)) return 'الاطارات';
  if (/(الفرش|الفرش الداخلي|الفرش الداخلى|المقاعد|الانتريه)/.test(s)) return 'الفرش';
  if (/(المحرك|موتور)/.test(s)) return 'المحرك';
  if (/(التابلو|التابلوه|الطابلوه)/.test(s)) return 'التابلو';
  if (/(مستلزمات|تولز|ادوات)/.test(s)) return 'تولز';
  return s; // fallback: return normalized original
}

function parseCSV(text) {
  // Simple line-based parser; assumes fields do not contain commas
  // If a header is present, we will detect non-numeric first cell and skip it
  const lines = text.split(/\r?\n/).filter(l => l.trim().length);
  const rows = [];
  for (const line of lines) {
    const parts = line.split(',');
    if (parts.length < 4) continue; // skip malformed
    const code = parts[0].trim();
    const name = parts[1]?.trim() || '';
    const brand = parts[2]?.trim() || '';
    const fn = parts[3]?.trim() || '';
    // skip header-like line
    if (code && !/^[0-9A-Za-z_-]+$/.test(code)) continue;
    rows.push({ code, name, brand, functionCategory: fn });
  }
  return rows;
}

export async function loadProductClassifier(forceReload = false) {
  if (_cache && !forceReload) return _cache;
  if (_loadingPromise && !forceReload) return _loadingPromise;

  _loadingPromise = fetch(PUBLIC_CSV_PATH, { cache: 'no-cache' })
    .then(async (res) => {
      if (!res.ok) throw new Error(`Failed to fetch classifier CSV: ${res.status}`);
      const text = await res.text();
      const rows = parseCSV(text);
      const map = new Map();
      for (const r of rows) {
        const key = String(r.code).trim();
        const fnNorm = normalizeArabic(r.functionCategory);
        const fnShort = shortenFunctionCategory(fnNorm);
        map.set(key, {
          code: key,
          name: r.name,
          brand: r.brand,
          functionCategory: fnNorm,
          functionShort: fnShort,
        });
      }
      _cache = map;
      return _cache;
    })
    .finally(() => {
      _loadingPromise = null;
    });

  return _loadingPromise;
}

export function getCachedProductClassifier() {
  return _cache; // may be null if not loaded yet
}

export function getFunctionByCode(productCode) {
  const map = _cache;
  if (!map) return null;
  const key = String(productCode ?? '').trim();
  if (!key) return null;
  return map.get(key) || null;
}

export function shortenCategory(ar) {
  return shortenFunctionCategory(ar);
}
