import { useQuery, useQueryClient } from "@tanstack/react-query";
import historyService from "../../services/historyService";

const useHistory = {
  useGetHistoryForAdmin: ({ fromDate, toDate }) => {
    const queryClient = useQueryClient();
    const { data, isLoading, isError, ...rest } = useQuery({
      queryKey: ["admin-history"],
      queryFn: async () => {
        return await historyService.getAdminHistory({ fromDate, toDate });
      },
      onSuccess: (data) => {
        queryClient.setQueryData(["admin-history"], data);
      },
      onError: (error) => {
        console.error("Error fetching admin history:", error);
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    });
    return { data, isLoading, isError, ...rest };
  },
};

export default useHistory;
