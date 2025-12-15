import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

// Hook for Vendor List
export const useVendorList = (params = {}) => {
    return useQuery({
        queryKey: ["vendors", params],
        queryFn: async () => {
            const { page, search, ...rest } = params;
            const response = await api.get("/vendor/list", {
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

// Hook for Vendor Details
export const useVendorDetail = (id) => {
    return useQuery({
        queryKey: ["vendor", id],
        queryFn: async () => {
            const response = await api.get(`/vendor/details/${id}`);
            return response.data;
        },
        enabled: !!id, // Only run if ID is present
    });
};
