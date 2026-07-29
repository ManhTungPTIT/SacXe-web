import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy /api sang backend để FE và API cùng origin (localhost:5173).
    // Cookie httpOnly (SameSite=Strict) chỉ được trình duyệt lưu/gửi khi
    // same-site — gọi thẳng IP LAN từ localhost là cross-site nên cookie bị từ chối.
    proxy: {
      "/api": {
        target: "http://localhost:6868",
        changeOrigin: true,
      },
    },
  },
})
