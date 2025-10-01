import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    // تحسينات البناء للإنتاج
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          // فصل المكتبات الكبيرة لتحسين التحميل
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          charts: ['recharts'],
          utils: ['date-fns', 'xlsx']
        }
      }
    },
    // ضغط الأصول
    assetsInlineLimit: 4096,
    // تحسين CSS
    cssCodeSplit: true
  },
  // تحسين الاستيراد
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react', 'recharts']
  }
})
