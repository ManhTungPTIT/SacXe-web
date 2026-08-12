import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import electricityPriceService from "../../services/electricityPriceService";

const PRICE_KEY = ["ELECTRICITY_PRICE"];
const HISTORY_KEY = ["ELECTRICITY_PRICE_HISTORY"];

const useElectricityPrice = {
  useGetPrice: () => {
    const { data, isLoading, isError, ...rest } = useQuery({
      queryKey: PRICE_KEY,
      queryFn: async () => {
        return await electricityPriceService.getPrice();
      },
      refetchOnWindowFocus: false,
    });
    return { data, isLoading, isError, ...rest };
  },
  useGetHistory: () => {
    const { data, isLoading, isError, ...rest } = useQuery({
      queryKey: HISTORY_KEY,
      queryFn: async () => {
        return await electricityPriceService.getHistory();
      },
      refetchOnWindowFocus: false,
    });
    return { data, isLoading, isError, ...rest };
  },
  useUpdatePrice: () => {
    const queryClient = useQueryClient();
    const { mutate, mutateAsync, isPending, error } = useMutation({
      mutationFn: async (price) => {
        return await electricityPriceService.updatePrice(price);
      },
      // Invalidate cả hai: đổi giá xong thì bảng lịch sử có thêm một dòng.
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: PRICE_KEY });
        queryClient.invalidateQueries({ queryKey: HISTORY_KEY });
      },
      onError: (mutationError) => {
        console.error("Error updating electricity price:", mutationError);
      },
    });
    return { mutate, mutateAsync, isPending, error };
  },
};

export default useElectricityPrice;
