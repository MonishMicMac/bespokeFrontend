import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { toast } from "react-toastify";

/**
 * Hook to fetch measurements with pagination and search.
 */
export const useMeasurements = (params = {}) => {
    return useQuery({
        queryKey: ["measurements", params],
        queryFn: async () => {
            const { page, search, ...rest } = params;
            const response = await api.get("/measurements", {
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
 * Hook to create a new measurement.
 */
export const useCreateMeasurement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData) => {
            const response = await api.post("/measurements/add", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Measurement created successfully");
                queryClient.invalidateQueries(["measurements"]);
            } else {
                toast.error(data.message || "Failed to create measurement");
            }
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "An error occurred while creating measurement");
        },
    });
};

/**
 * Hook to update an existing measurement.
 */
export const useUpdateMeasurement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, formData }) => {
            // Using POST with _method=PUT is common for file uploads in some backends
            // or just POST to the update endpoint. Following the /add pattern.
            const response = await api.post(`/measurements/update/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Measurement updated successfully");
                queryClient.invalidateQueries(["measurements"]);
            } else {
                toast.error(data.message || "Failed to update measurement");
            }
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "An error occurred while updating measurement");
        },
    });
};

/**
 * Hook to delete a measurement.
 */
export const useDeleteMeasurement = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/measurements/delete/${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Measurement deleted successfully");
                queryClient.invalidateQueries(["measurements"]);
            } else {
                toast.error(data.message || "Could not delete measurement");
            }
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete measurement");
        },
    });
};
