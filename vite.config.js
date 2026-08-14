import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Tham số thứ ba là "" để nạp cả biến không có tiền tố VITE_ — biến này chỉ
  // dùng ở phía Node lúc dev, không được nhúng vào bundle gửi cho trình duyệt.
  const env = loadEnv(mode, process.cwd(), "");

  // Đổi backend mà không phải sửa file: đặt VITE_PROXY_TARGET trong .env
  //   local      → http://localhost:6868   (mặc định)
  //   production → https://enovo.slink.ai.vn
  const target = env.VITE_PROXY_TARGET || "http://localhost:6868";

  return {
    plugins: [react()],
    server: {
      // Proxy /api sang backend để FE và API cùng origin (localhost:5173).
      // Cookie httpOnly (SameSite=Strict) chỉ được trình duyệt lưu/gửi khi
      // same-site — gọi thẳng sang domain khác là cross-site nên cookie bị từ chối.
      // Nhờ proxy, trình duyệt chỉ thấy localhost dù backend nằm ở đâu.
      proxy: {
        "/api": {
          target,
          changeOrigin: true,
        },
        // Socket cũng phải đi qua proxy vì đúng lý do trên: cookie httpOnly chỉ
        // được gửi kèm handshake khi same-origin. ws: true để nâng cấp WebSocket.
        "/socket.io": {
          target,
          ws: true,
          changeOrigin: true,
        },
      },
    },
  };
});
