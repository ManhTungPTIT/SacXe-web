import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { adminSocket } from "../services/socketClient";
import { useAuthStore } from "../stores/authStore";

const TRANSACTION_EVENTS = [
  "admin_transaction_new",
  "admin_transaction_claimed",
  "admin_transaction_resolved",
  // Khách bấm "Vẫn huỷ" ở màn QR. Thiếu event này thì dòng đã huỷ nằm lì ở tab
  // "Chờ xử lý" cho tới lần polling kế tiếp.
  "admin_transaction_cancelled",
];

const useAdminSocket = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    // Payload chỉ mang id nên không dùng trực tiếp — nạp lại qua HTTP đã kiểm
    // quyền để không bao giờ hiển thị dữ liệu chưa qua kiểm tra phân quyền.
    const refetchTransactions = () => {
      queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
    };

    TRANSACTION_EVENTS.forEach((event) => {
      adminSocket.on(event, refetchTransactions);
    });

    adminSocket.connect();

    return () => {
      TRANSACTION_EVENTS.forEach((event) => {
        adminSocket.off(event, refetchTransactions);
      });
      adminSocket.disconnect();
    };
  }, [isAuthenticated, queryClient]);
};

export default useAdminSocket;
