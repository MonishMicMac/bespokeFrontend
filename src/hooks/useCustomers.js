import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

export const useCustomers = (params = {}) => {
    return useQuery({
        queryKey: ["customers", params],
        queryFn: async () => {
            const { page, search, ...rest } = params;
            const response = await api.get("/user/list", {
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
