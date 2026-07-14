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
