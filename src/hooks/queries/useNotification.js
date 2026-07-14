import { useQuery, useQueryClient } from "@tanstack/react-query";
import feedbackService from "../../services/feedbackService";

const useNotification = {
  useGetNotifications: () => {
    const queryClient = useQueryClient();
    const { data, isLoading, isError, ...rest } = useQuery({
      queryKey: ["NOTIFICATIONS"],
      queryFn: async () => {
        return await feedbackService.getFeedbacks();
      },
      onSuccess: (data) => {
        queryClient.setQueryData(["NOTIFICATIONS"], data);
      },
      onError: (error) => {
        console.error("Error fetching notifications:", error);
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    });
    return { data, isLoading, isError, ...rest };
  },
};

export default useNotification;
