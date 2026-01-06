import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { toast } from "react-toastify";

/**
 * Hook to fetch measurement mappings with pagination and search.
 */
export const useMeasurementMappings = (params = {}) => {
    return useQuery({
        queryKey: ["measurement-mappings", params],
        queryFn: async () => {
            const { page, search, ...rest } = params;
            const response = await api.get("/measurement-mappings", {
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
 * Hook to create a new measurement mapping.
 */
export const useCreateMeasurementMapping = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload) => {
            const response = await api.post("/measurement-mappings/store", payload);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Mapping saved successfully");
                queryClient.invalidateQueries(["measurement-mappings"]);
            } else {
                toast.error(data.message || "Failed to save mapping");
            }
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "An error occurred while saving mapping");
        },
    });
};

/**
 * Hook to update an existing measurement mapping.
 */
export const useUpdateMeasurementMapping = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }) => {
            const response = await api.post(`/measurement-mappings/update/${id}`, payload);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Mapping updated successfully");
                queryClient.invalidateQueries(["measurement-mappings"]);
            } else {
                toast.error(data.message || "Failed to update mapping");
            }
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "An error occurred while updating mapping");
        },
    });
};

/**
 * Hook to delete a measurement mapping.
 */
export const useDeleteMeasurementMapping = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/measurement-mappings/delete/${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Mapping deleted successfully");
                queryClient.invalidateQueries(["measurement-mappings"]);
            } else {
                toast.error(data.message || "Could not delete mapping");
            }
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete mapping");
        },
    });
};
