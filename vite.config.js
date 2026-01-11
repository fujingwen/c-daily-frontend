import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

export default defineConfig({
  plugins: [uni()],
  server: {
    port: 8080,
    host: '0.0.0.0'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname)
    }
  }
})