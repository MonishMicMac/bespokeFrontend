import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { toast } from "react-toastify";

export const useDesigners = (params = {}) => {
    return useQuery({
        queryKey: ["designers", params],
        queryFn: async () => {
            const { page, search, ...rest } = params;
            const response = await api.get("/designers", {
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

export const useDesignerMeta = () => {
    return useQuery({
        queryKey: ["designers-meta"],
        queryFn: async () => {
            const response = await api.get("/designers/meta");
            return response.data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
};

export const useCreateDesigner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData) => {
            const response = await api.post("/designers", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success(data.message || "Designer created successfully");
                queryClient.invalidateQueries(["designers"]);
            } else {
                toast.error(data.message || "Failed to create designer");
            }
        },
        onError: () => {
            toast.error("An error occurred while creating designer");
        },
    });
};

export const useUpdateDesigner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, formData }) => {
            formData.append('_method', 'PUT');
            const response = await api.post(`/designers/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Designer updated successfully");
                queryClient.invalidateQueries(["designers"]);
            } else {
                toast.error(data.message || "Failed to update designer");
            }
        },
        onError: () => {
            toast.error("An error occurred while updating designer");
        },
    });
};

export const useDeleteDesigner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/designers/${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Designer deleted successfully");
                queryClient.invalidateQueries(["designers"]);
            } else {
                toast.error("Could not delete designer");
            }
        },
        onError: () => {
            toast.error("Failed to delete designer");
        },
    });
};
