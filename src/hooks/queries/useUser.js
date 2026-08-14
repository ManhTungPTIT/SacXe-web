import { useQuery, useQueryClient } from "@tanstack/react-query";
import userService from "../../services/userService";

const useUser = {
  useGetAll: (params = {}, options = {}) => {
    const queryClient = useQueryClient();
    const { data, isLoading, isError, ...rest } = useQuery({
      queryKey: ["ALL_USERS", params],
      queryFn: async () => {
        return await userService.getAll();
      },
      onSuccess: (data) => {
        queryClient.setQueryData(["ALL_USERS", params], data);
      },
      onError: (error) => {
        console.error("Error fetching users:", error);
      },
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      enabled: options.enabled ?? true,
    });

    return { data, isLoading, isError, ...rest };
  },
  // enabled do dialog truyền vào: chỉ kéo danh sách admin khi dialog mở, không
  // fetch ở mỗi lần vào trang chi tiết chung cư.
  useGetAllAdmin: (options = {}) => {
    const { data, isLoading, isError, ...rest } = useQuery({
      queryKey: ["ALL_ADMINS"],
      queryFn: async () => {
        return await userService.getAllAdmin();
      },
      onError: (error) => {
        console.error("Error fetching admins:", error);
      },
      refetchOnWindowFocus: false,
      enabled: options.enabled ?? true,
    });

    return { data, isLoading, isError, ...rest };
  },
  useGetDetails: (userId, options = {}) => {
    const queryClient = useQueryClient();
    const { data, isLoading, isError, ...rest } = useQuery({
      queryKey: ["USER_DETAILS", userId],
      queryFn: async () => {
        return await userService.getDetails(userId);
      },
      onSuccess: (data) => {
        queryClient.setQueryData(["USER_DETAILS", userId], data);
      },
      onError: (error) => {
        console.error("Error fetching user details:", error);
      },
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      enabled: options.enabled ?? !!userId,
    });

    return { data, isLoading, isError, ...rest };
  },
};

export default useUser;
