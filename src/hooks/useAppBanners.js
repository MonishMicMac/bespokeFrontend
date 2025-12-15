import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { toast } from "react-toastify";

export const useAppBanners = (params = {}) => {
    return useQuery({
        queryKey: ["app-banners", params],
        queryFn: async () => {
            const { page, ...rest } = params;
            const response = await api.get("/app-banners", {
                params: {
                    page: page || 1,
                    per_page: 10,
                    ...rest,
                },
            });
            return response.data;
        },
        keepPreviousData: true,
    });
};

export const useAppBannerMeta = () => {
    return useQuery({
        queryKey: ["app-banners-meta"],
        queryFn: async () => {
            const response = await api.get("/app-banners/meta");
            return response.data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
};

export const useCreateAppBanner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData) => {
            const response = await api.post("/app-banners", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success(data.message || "Banner created successfully");
                queryClient.invalidateQueries(["app-banners"]);
            } else {
                toast.error(data.message || "Failed to create banner");
            }
        },
        onError: (err) => {
            if (err.response?.status === 403) {
                toast.error(err.response.data.message);
            } else {
                toast.error("An error occurred while creating banner");
            }
        },
    });
};

export const useUpdateAppBanner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, formData }) => {
            formData.append('_method', 'PUT');
            const response = await api.post(`/app-banners/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Banner updated successfully");
                queryClient.invalidateQueries(["app-banners"]);
            } else {
                toast.error(data.message || "Failed to update banner");
            }
        },
        onError: () => {
            toast.error("An error occurred while updating banner");
        },
    });
};

export const useDeleteAppBanner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/app-banners/${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Banner removed");
                queryClient.invalidateQueries(["app-banners"]);
            } else {
                toast.error("Could not remove banner");
            }
        },
        onError: () => {
            toast.error("Failed to remove banner");
        },
    });
};
