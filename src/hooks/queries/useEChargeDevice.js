import { useMutation, useQueryClient } from "@tanstack/react-query";
import eChargeDeviceService from "../../services/eChargeDeviceService";

const useEChargeDevice = {
  useAdd: () => {
    const queryClient = useQueryClient();
    const { mutate, mutateAsync, isLoading, error } = useMutation({
      mutationFn: async (deviceData) => {
        return await eChargeDeviceService.add(deviceData);
      },
      onSuccess: (newData) => {},
      onError: (error) => {
        console.error("Error adding e-charge device:", error);
      },
    });
    return { mutate, mutateAsync, isLoading, error };
  },
};

export default useEChargeDevice;
