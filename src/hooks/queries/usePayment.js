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
      // Khách bấm "Tôi đã chuyển" trên app phải tự hiện ra trên bảng, admin
      // không phải F5 mới thấy yêu cầu chờ duyệt.
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
