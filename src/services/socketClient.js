import { io } from "socket.io-client";

// Không truyền URL tuyệt đối: để socket.io dùng chính origin của trang, nhờ đó
// đi qua Vite dev proxy và cookie httpOnly mới được gửi kèm handshake. Gọi
// thẳng IP backend là cross-site nên trình duyệt sẽ không gửi cookie.
export const adminSocket = io("/admin", {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"],
});

export default adminSocket;
