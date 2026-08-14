import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import paymentService from "../../services/paymentService";

const usePayment = {
  useAddPaymentProfile: () => {
    const queryClient = useQueryClient();
    const { mutate, mutateAsync, isLoading, error } = useMutation({
      mutationFn: async (paymentProfileData) => {
        return await paymentService.addPaymentProfile(paymentProfileData);
      },
      onSuccess: (newData) => {
        // cập nhật lại payment profile sau khi thêm mới bằng newData
        queryClient.setQueryData(["payment-profile"], newData);
      },
      onError: (error) => {
        console.error("Error adding payment profile:", error);
      },
    });
    return { mutate, mutateAsync, isLoading, error };
  },
  useAdminTransactions: ({ status, page = 1, limit = 20 }) => {
    const { data, isLoading, isError, ...rest } = useQuery({
      queryKey: ["admin-transactions", status, page, limit],
      queryFn: async () => {
        return await paymentService.getAdminTransactions({
          status,
          page,
          limit,
        });
      },
      // Giữ dữ liệu trang cũ trong lúc tải trang mới để bảng không nhấp nháy.
      placeholderData: (previousData) => previousData,
      staleTime: 0,
      // Socket (useAdminSocket) lo phần tức thời khi khách bấm "Tôi đã chuyển"
      // hoặc khi một admin khác duyệt xong. Polling ở lại làm lưới an toàn cho
      // lúc socket rớt — socket.io không phát lại sự kiện đã lỡ.
      refetchInterval: 60000,
      refetchIntervalInBackground: false,
    });
    return { data, isLoading, isError, ...rest };
  },
  // Polling ngắn hơn bảng giao dịch: đây là thứ admin nhìn để quyết định có nên
  // duyệt tay hay không, biết muộn 1 phút là đã kịp cộng đè lên vòng lặp.
  useReconciliationStatus: () => {
    const { data, isLoading, isError, ...rest } = useQuery({
      queryKey: ["reconciliation-status"],
      queryFn: async () => {
        return await paymentService.getReconciliationStatus();
      },
      refetchInterval: 20000,
      refetchIntervalInBackground: false,
    });
    return { data, isLoading, isError, ...rest };
  },
  useConfirmTransaction: () => {
    const queryClient = useQueryClient();
    const { mutate, mutateAsync, isPending, error } = useMutation({
      mutationFn: async (transactionId) => {
        return await paymentService.confirmTransaction(transactionId);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
      },
    });
    return { mutate, mutateAsync, isPending, error };
  },
  useGetPaymentProfile: () => {
    const queryClient = useQueryClient();
    const { data, isLoading, isError, ...rest } = useQuery({
      queryKey: ["payment-profile"],
      queryFn: async () => {
        return await paymentService.getPaymentProfile();
      },
      onSuccess: (data) => {
        queryClient.setQueryData(["payment-profile"], data);
      },
      onError: (error) => {
        console.error("Error fetching payment profile:", error);
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    });
    return { data, isLoading, isError, ...rest };
  },
};

export default usePayment;
