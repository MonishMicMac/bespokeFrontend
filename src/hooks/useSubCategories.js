import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { toast } from "react-toastify";

export const useSubCategories = (params = {}) => {
    return useQuery({
        queryKey: ["subcategories", params],
        queryFn: async () => {
            const { page, search, ...rest } = params;
            const response = await api.get("/subcategories", {
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

export const useSubCategoryMeta = () => {
    return useQuery({
        queryKey: ["subcategories-meta"],
        queryFn: async () => {
            const response = await api.get("/subcategories/meta");
            return response.data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
};

export const useCreateSubCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData) => {
            const response = await api.post("/subcategories", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success(data.message || "Subcategory created successfully");
                queryClient.invalidateQueries(["subcategories"]);
            } else {
                toast.error(data.message || "Failed to create subcategory");
            }
        },
        onError: () => {
            toast.error("An error occurred while creating subcategory");
        },
    });
};

export const useUpdateSubCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, formData }) => {
            // Logic from original: if editingId exists, use PUT method override in FormData or just POST to ID URL?
            // Original code used api.post with _method: PUT if editingId was present.
            // And url was `/subcategories/${editingId}`
            formData.append('_method', 'PUT');
            const response = await api.post(`/subcategories/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Subcategory updated successfully");
                queryClient.invalidateQueries(["subcategories"]);
            } else {
                toast.error(data.message || "Failed to update subcategory");
            }
        },
        onError: () => {
            toast.error("An error occurred while updating subcategory");
        },
    });
};

export const useDeleteSubCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/subcategories/${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Subcategory deleted successfully");
                queryClient.invalidateQueries(["subcategories"]);
            } else {
                toast.error("Could not delete subcategory");
            }
        },
        onError: () => {
            toast.error("Failed to delete subcategory");
        },
    });
};
