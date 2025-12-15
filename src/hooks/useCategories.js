import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { toast } from "react-toastify";

export const useCategories = (params = {}) => {
    return useQuery({
        queryKey: ["categories", params],
        queryFn: async () => {
            const { page, search, ...rest } = params;
            const response = await api.get("/categories", {
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

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData) => {
            const response = await api.post("/categories", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Category created successfully");
                queryClient.invalidateQueries(["categories"]);
            } else {
                toast.error(data.message || "Failed to create category");
            }
        },
        onError: () => {
            toast.error("An error occurred while creating category");
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, formData }) => {
            const response = await api.post(`/categories/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Category updated successfully");
                queryClient.invalidateQueries(["categories"]);
            } else {
                toast.error(data.message || "Failed to update category");
            }
        },
        onError: () => {
            toast.error("An error occurred while updating category");
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/categories/${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Category deleted successfully");
                queryClient.invalidateQueries(["categories"]);
            } else {
                toast.error("Could not delete category");
            }
        },
        onError: () => {
            toast.error("Failed to delete category");
        },
    });
};
