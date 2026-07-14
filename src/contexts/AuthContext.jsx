import { createContext, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import authService from "../services/authService";
import { useAuthStore } from "../stores/authStore";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const initialize = useAuthStore((state) => state.initialize);
  const storedUser = useAuthStore((state) => state.user);
  const isStoreLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const {
    data: user,
    isLoading: isUserLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["auth", "user"],
    enabled: !isStoreLoading,
    queryFn: async () => {
      const response = await authService.checkAuth();
      return response?.user || null;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    retry: 1,
  });

  const isLoading = isStoreLoading || isUserLoading;
  const resolvedUser = user || (isLoading ? storedUser : null);

  return (
    <AuthContext.Provider
      value={{ user: resolvedUser, isLoading, isError, refetch }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
