import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

export const useOrderList = (params = {}) => {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: async () => {
      const { page, search, ...rest } = params;
      const response = await api.get("/orders/list", {
        params: {
          page: page || 1,
          search: search || "",
          ...rest,
        },
      });
      return response.data;
    },
    keepPreviousData: true,
  });
};
