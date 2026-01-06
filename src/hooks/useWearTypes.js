import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { toast } from "react-toastify";

/**
 * Hook to fetch wear types with pagination and search.
 */
export const useWearTypes = (params = {}) => {
    return useQuery({
        queryKey: ["wear-types", params],
        queryFn: async () => {
            const { page, search, ...rest } = params;
            const response = await api.get("/wear-types", {
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
 * Hook to create a new wear type.
 */
export const useCreateWearType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const response = await api.post("/wear-types/add", payload);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Wear Type created successfully");
                queryClient.invalidateQueries(["wear-types"]);
            } else {
                toast.error(data.message || "Failed to create wear type");
            }
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "An error occurred while creating wear type");
        },
    });
};

/**
 * Hook to update an existing wear type.
 */
export const useUpdateWearType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }) => {
            const response = await api.post(`/wear-types/update/${id}`, payload);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Wear Type updated successfully");
                queryClient.invalidateQueries(["wear-types"]);
            } else {
                toast.error(data.message || "Failed to update wear type");
            }
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "An error occurred while updating wear type");
        },
    });
};

/**
 * Hook to delete a wear type.
 */
export const useDeleteWearType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await api.get(`/wear-types/delete/${id}`); // User said wear-types/delete/{id}
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Wear Type deleted successfully");
                queryClient.invalidateQueries(["wear-types"]);
            } else {
                toast.error(data.message || "Could not delete wear type");
            }
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete wear type");
        },
    });
};
