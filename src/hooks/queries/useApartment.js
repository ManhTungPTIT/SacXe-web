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
  useGetDetails: (apartmentId) => {
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
      enabled: !!apartmentId, // Chỉ chạy query khi apartmentId có giá trị
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
};

export default useApartment;
