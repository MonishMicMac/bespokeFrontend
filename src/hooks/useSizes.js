import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { toast } from "react-toastify";

/**
 * Hook to fetch sizes with pagination and search.
 */
export const useSizes = (params = {}) => {
    return useQuery({
        queryKey: ["sizes", params],
        queryFn: async () => {
            const { page, search, ...rest } = params;
            const response = await api.get("/sizes/list", {
                params: {
                    page: page || 1,
                    search: search || "",
                    per_page: 10,
                    ...rest,
                },
            });
            return response.data;
        },
        keepPreviousData: true,
    });
};

/**
 * Hook to create a new size.
 */
export const useCreateSize = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            // Using JSON payload as per user's example
            const response = await api.post("/sizes/add", payload);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Size created successfully");
                queryClient.invalidateQueries(["sizes"]);
            } else {
                toast.error(data.message || "Failed to create size");
            }
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "An error occurred while creating size");
        },
    });
};

/**
 * Hook to update an existing size.
 */
export const useUpdateSize = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }) => {
            const response = await api.post(`/sizes/update/${id}`, payload);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Size updated successfully");
                queryClient.invalidateQueries(["sizes"]);
            } else {
                toast.error(data.message || "Failed to update size");
            }
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "An error occurred while updating size");
        },
    });
};

/**
 * Hook to delete a size.
 */
export const useDeleteSize = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/sizes/delete/${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Size deleted successfully");
                queryClient.invalidateQueries(["sizes"]);
            } else {
                toast.error(data.message || "Could not delete size");
            }
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete size");
        },
    });
};
