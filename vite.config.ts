import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',  // Altere para '/' ou seu repositório se estiver em subdiretório
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index.html',
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
        entryFileNames: 'assets/[name].[hash].js',
      }
    }
  }
})
