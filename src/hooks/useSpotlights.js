import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { toast } from "react-toastify";

export const useSpotlights = (params = {}) => {
    return useQuery({
        queryKey: ["spotlights", params],
        queryFn: async () => {
            const { page, search, ...rest } = params;
            const response = await api.get("/spotlights", {
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

export const useSpotlightMeta = () => {
    return useQuery({
        queryKey: ["spotlights-meta"],
        queryFn: async () => {
            const response = await api.get("/spotlights/meta");
            return response.data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
};

export const useCreateSpotlight = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData) => {
            const response = await api.post("/spotlights", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success(data.message || "Spotlight created successfully");
                queryClient.invalidateQueries(["spotlights"]);
            } else {
                toast.error(data.message || "Failed to create spotlight");
            }
        },
        onError: () => {
            toast.error("An error occurred while creating spotlight");
        },
    });
};

export const useUpdateSpotlight = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, formData }) => {
            formData.append('_method', 'PUT');
            const response = await api.post(`/spotlights/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Spotlight updated successfully");
                queryClient.invalidateQueries(["spotlights"]);
            } else {
                toast.error(data.message || "Failed to update spotlight");
            }
        },
        onError: () => {
            toast.error("An error occurred while updating spotlight");
        },
    });
};

export const useDeleteSpotlight = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/spotlights/${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Spotlight deleted successfully");
                queryClient.invalidateQueries(["spotlights"]);
            } else {
                toast.error("Could not delete spotlight");
            }
        },
        onError: () => {
            toast.error("Failed to delete spotlight");
        },
    });
};
