import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apartmentSerice from "../../services/apartmentService";

const useApartment = {
  useGetAll: () => {
    const queryClient = useQueryClient();
    const { data, isLoading, isError, ...rest } = useQuery({
      queryKey: ["ALL_APARTMENTS"],
      queryFn: async () => {
        return await apartmentSerice.getAll();
      },
      onSuccess: (data) => {
        queryClient.setQueryData(["ALL_APARTMENTS"], data);
      },
      onError: (error) => {
        console.error("Error fetching apartments:", error);
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    });
    return { data, isLoading, isError, ...rest };
  },
  useGetDetails: (apartmentId, options = {}) => {
    const queryClient = useQueryClient();
    const { data, isLoading, isError, ...rest } = useQuery({
      queryKey: ["APARTMENT_DETAILS", apartmentId],
      queryFn: async () => {
        return await apartmentSerice.getApartmentDetails(apartmentId);
      },
      onSuccess: (data) => {
        queryClient.setQueryData(["APARTMENT_DETAILS", apartmentId], data);
      },
      onError: (error) => {
        console.error("Error fetching apartment details:", error);
      },
      enabled: options.enabled ?? !!apartmentId, // Chỉ chạy query khi apartmentId có giá trị
    });
    return { data, isLoading, isError, ...rest };
  },
  useAddApartment: () => {
    const queryClient = useQueryClient();
    const { mutate, mutateAsync, isLoading, error } = useMutation({
      mutationFn: async (apartmentData) => {
        return await apartmentSerice.addApartment(apartmentData);
      },
      onSuccess: (newRes) => {
        queryClient.setQueryData(["ALL_APARTMENTS"], (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: [...(oldData.data || []), newRes.data],
          };
        });
      },
      onError: (error) => {
        console.error("Error adding apartment:", error);
      },
    });
    return { mutate, mutateAsync, isLoading, error };
  },
  useAssignAdmin: () => {
    const queryClient = useQueryClient();
    const { mutate, mutateAsync, isPending, error } = useMutation({
      mutationFn: async ({ apartmentId, adminId }) => {
        return await apartmentSerice.assignAdmin(apartmentId, adminId);
      },
      // Ba key: trang chi tiết (tên người quản lý), danh sách chung cư (route
      // state của trang chi tiết lấy từ đây), và danh sách admin — nhãn "đang
      // quản lý" của người vừa bị điều chuyển đã đổi.
      onSuccess: (_response, variables) => {
        queryClient.invalidateQueries({
          queryKey: ["APARTMENT_DETAILS", variables.apartmentId],
        });
        queryClient.invalidateQueries({ queryKey: ["ALL_APARTMENTS"] });
        queryClient.invalidateQueries({ queryKey: ["ALL_ADMINS"] });
      },
      onError: (mutationError) => {
        console.error("Error assigning apartment admin:", mutationError);
      },
    });
    return { mutate, mutateAsync, isPending, error };
  },
};

export default useApartment;
