import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import reportService from "../../services/reportService";

const useReport = {
  useGetReport: ({ fromDate, toDate }) => {
    const queryClient = useQueryClient();
    const { data, isLoading, isError, ...rest } = useQuery({
      queryKey: ["reports", fromDate, toDate],
      queryFn: async () => {
        return await reportService.getReports({ fromDate, toDate });
      },
      onSuccess: (data) => {
        queryClient.setQueryData(["report", "reports"], data);
      },
      onError: (error) => {
        console.error("Error fetching reports:", error);
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    });
    return { data, isLoading, isError, ...rest };
  },
};

export default useReport;
