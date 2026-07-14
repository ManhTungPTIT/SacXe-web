import { useMutation, useQueryClient } from "@tanstack/react-query";
import payoutService from "../../services/payoutService";

const getPayoutId = (payout) => payout?._id || payout?.id;

const mergeAcceptedPayoutIntoList = (list, acceptedPayout) => {
  if (!Array.isArray(list)) return list;

  const acceptedId = getPayoutId(acceptedPayout);
  if (!acceptedId) return list;

  let found = false;
  const nextList = list.map((item) => {
    if (getPayoutId(item) === acceptedId) {
      found = true;
      return {
        ...item,
        ...acceptedPayout,
        status: acceptedPayout.status || item.status || "completed",
      };
    }
    return item;
  });

  if (found) return nextList;
  return [acceptedPayout, ...nextList];
};

const updateRevenueCacheAfterAccept = (oldData, acceptedPayout) => {
  if (!oldData || !acceptedPayout) return oldData;

  const nextRevenue =
    oldData.revenue && typeof oldData.revenue === "object"
      ? {
          ...oldData.revenue,
          payouts: mergeAcceptedPayoutIntoList(
            oldData.revenue.payouts,
            acceptedPayout,
          ),
          revenue:
            oldData.revenue.revenue &&
            typeof oldData.revenue.revenue === "object"
              ? {
                  ...oldData.revenue.revenue,
                  payouts: mergeAcceptedPayoutIntoList(
                    oldData.revenue.revenue.payouts,
                    acceptedPayout,
                  ),
                }
              : oldData.revenue.revenue,
        }
      : oldData.revenue;

  return {
    ...oldData,
    revenue: nextRevenue,
    payouts: mergeAcceptedPayoutIntoList(oldData.payouts, acceptedPayout),
  };
};

const updatePayoutHistoriesCacheAfterAccept = (oldData, acceptedPayout) => {
  if (!oldData || !acceptedPayout) return oldData;

  if (Array.isArray(oldData)) {
    return mergeAcceptedPayoutIntoList(oldData, acceptedPayout);
  }

  if (oldData.data && Array.isArray(oldData.data)) {
    return {
      ...oldData,
      data: mergeAcceptedPayoutIntoList(oldData.data, acceptedPayout),
    };
  }

  const nextData =
    oldData.data && typeof oldData.data === "object"
      ? {
          ...oldData.data,
          histories: mergeAcceptedPayoutIntoList(
            oldData.data.histories,
            acceptedPayout,
          ),
          payouts: mergeAcceptedPayoutIntoList(
            oldData.data.payouts,
            acceptedPayout,
          ),
        }
      : oldData.data;

  return {
    ...oldData,
    histories: mergeAcceptedPayoutIntoList(oldData.histories, acceptedPayout),
    payouts: mergeAcceptedPayoutIntoList(oldData.payouts, acceptedPayout),
    data: nextData,
  };
};

const usePayout = {
  useCreatePayout: () => {
    const queryClient = useQueryClient();
    const { mutate, mutateAsync, isLoading, error } = useMutation({
      mutationFn: async () => {
        return await payoutService.createPayout();
      },
      onSuccess: (newPayout) => {
        queryClient.setQueryData(["revenue"], (oldData) => {
          if (!oldData) return oldData;

          const payout = newPayout?.payout || newPayout?.data?.payout;
          if (!payout) return oldData;

          return {
            ...oldData,
            revenue: {
              ...oldData.revenue,
              revenue: {
                ...oldData.revenue?.revenue,
                revenue: 0, // reset về 0
                payouts: [payout, ...(oldData.revenue?.revenue?.payouts || [])],
              },
              payouts: [payout, ...(oldData.revenue?.payouts || [])],
            },
          };
        });
      },
      onError: (error) => {
        console.error("Error creating payout:", error);
      },
    });
    return { mutate, mutateAsync, isLoading, error };
  },
  useAcceptPayout: () => {
    const queryClient = useQueryClient();
    const { mutate, mutateAsync, isLoading, error } = useMutation({
      mutationFn: async (payoutId) => {
        return await payoutService.acceptPayout(payoutId);
      },
      onSuccess: async (response) => {
        queryClient.setQueriesData(["revenue"], (oldData) => {
          const acceptedPayout = response?.payout || response?.data?.payout;
          return updateRevenueCacheAfterAccept(oldData, acceptedPayout);
        });

        queryClient.setQueriesData(["payout-histories"], (oldData) => {
          const acceptedPayout = response?.payout || response?.data?.payout;
          return updatePayoutHistoriesCacheAfterAccept(oldData, acceptedPayout);
        });

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["revenue"] }),
          queryClient.invalidateQueries({ queryKey: ["payout-histories"] }),
        ]);
      },
      onError: (error) => {
        console.error("Error accepting payout:", error);
      },
    });
    return { mutate, mutateAsync, isLoading, error };
  },
};

export default usePayout;
