import { useQuery, useQueryClient } from "@tanstack/react-query";
import revenueService from "../../services/revenueService";

const useRevenue = {
  useGetRevenue: () => {
    const queryClient = useQueryClient();
    const { data, isLoading, isError, ...rest } = useQuery({
      queryKey: ["revenue"],
      queryFn: async () => {
        return await revenueService.getRevenue();
      },
      onSuccess: (data) => {
        queryClient.setQueryData(["revenue"], data);
      },
      onError: (error) => {
        console.error("Error fetching revenue data:", error);
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    });
    return { data, isLoading, isError, ...rest };
  },
};

export default useRevenue;
