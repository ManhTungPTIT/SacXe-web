import { useMutation, useQueryClient } from "@tanstack/react-query";
import authService from "../../services/authService";
import { useAuthStore } from "../../stores/authStore";

const AUTH_USER_QUERY_KEY = ["auth", "user"];

const useAuthMutation = {
  useLogin: () => {
    const queryClient = useQueryClient();
    const { mutate, mutateAsync, isLoading, error } = useMutation({
      mutationFn: async ({ email, password }) => {
        return await authService.login({ email, password });
      },
      onSuccess: (data) => {
        const user = data?.user || null;

        if (user?.role === "user") {
          useAuthStore.getState().logout();
          queryClient.removeQueries({ queryKey: AUTH_USER_QUERY_KEY });
          return;
        }

        if (user) {
          useAuthStore.getState().login(user);
          queryClient.removeQueries({ queryKey: AUTH_USER_QUERY_KEY });
          queryClient.setQueryData(AUTH_USER_QUERY_KEY, user);
        }
      },
      onError: (error) => {
        console.error("Login error:", error);
      },
    });
    return { mutate, mutateAsync, isLoading, error };
  },
};

export default useAuthMutation;
