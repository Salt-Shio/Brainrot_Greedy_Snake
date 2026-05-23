import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  optimizeDeps: {
    // @mediapipe 套件是純 CJS 格式，沒有 ESM export
    // 讓 Vite dev server 直接 pass-through，不做 esbuild pre-bundle
    exclude: ['@mediapipe/hands', '@mediapipe/camera_utils'],
  },
})
