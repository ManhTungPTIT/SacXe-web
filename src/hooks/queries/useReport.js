import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  // groupBy nằm trong queryKey: đổi mức gom nhóm mà giữ nguyên khoảng ngày vẫn
  // là một truy vấn khác, thiếu nó react-query sẽ trả lại cache của mức cũ.
  useGetTopUpGrowth: ({ fromDate, toDate, groupBy }) => {
    const { data, isLoading, isError, ...rest } = useQuery({
      queryKey: ["reports", "topup-growth", fromDate, toDate, groupBy],
      queryFn: async () => {
        return await reportService.getTopUpGrowth({
          fromDate,
          toDate,
          groupBy,
        });
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    });
    return { data, isLoading, isError, ...rest };
  },
};

export default useReport;
