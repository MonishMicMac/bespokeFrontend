import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { toast } from "react-toastify";

/**
 * Hook to fetch materials with pagination and search.
 */
export const useMaterials = (params = {}) => {
    return useQuery({
        queryKey: ["materials", params],
        queryFn: async () => {
            const { page, search, ...rest } = params;
            const response = await api.get("/materials", {
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
 * Hook to create a new material.
 */
export const useCreateMaterial = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const response = await api.post("/materials/store", payload);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success(data.message || "Material created successfully");
                queryClient.invalidateQueries(["materials"]);
            } else {
                toast.error(data.message || "Failed to create material");
            }
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "An error occurred while creating material");
        },
    });
};

/**
 * Hook to update an existing material.
 */
export const useUpdateMaterial = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }) => {
            const response = await api.post(`/materials/update/${id}`, payload);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success(data.message || "Material updated successfully");
                queryClient.invalidateQueries(["materials"]);
            } else {
                toast.error(data.message || "Failed to update material");
            }
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "An error occurred while updating material");
        },
    });
};

/**
 * Hook to delete a material.
 */
export const useDeleteMaterial = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/materials/delete/${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success(data.message || "Material deleted successfully");
                queryClient.invalidateQueries(["materials"]);
            } else {
                toast.error(data.message || "Could not delete material");
            }
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete material");
        },
    });
};
