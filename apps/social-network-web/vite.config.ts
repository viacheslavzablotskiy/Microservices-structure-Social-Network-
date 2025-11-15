import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      
      '@repo/user-interfaces': path.resolve(__dirname, '../../packages/user-interfaces/src/entry.ts')
    }
  }
})
