import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { toast } from "react-toastify";

/**
 * Hook to fetch rooms with pagination and search.
 */
export const useRooms = (params = {}) => {
    return useQuery({
        queryKey: ["rooms", params],
        queryFn: async () => {
            const { page, search, ...rest } = params;
            const response = await api.get("/rooms", {
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
 * Hook to create a new room.
 */
export const useCreateRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData) => {
            // Using FormData for name and image
            const response = await api.post("/rooms/add", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Room created successfully");
                queryClient.invalidateQueries(["rooms"]);
            } else {
                toast.error(data.message || "Failed to create room");
            }
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "An error occurred while creating room");
        },
    });
};

/**
 * Hook to update an existing room.
 */
export const useUpdateRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, formData }) => {
            // The user mentioned: http://3.7.112.78/bespoke/public/api/rooms/update/1?name=test edit
            // It seems it could be a query param or body. 
            // Most Laravel APIs (which this seems to be) handle POST with _method=PUT for multipart updates,
            // or just POST if the endpoint handles it. 
            // I'll use FormData to support image updates too if needed.
            const response = await api.post(`/rooms/update/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Room updated successfully");
                queryClient.invalidateQueries(["rooms"]);
            } else {
                toast.error(data.message || "Failed to update room");
            }
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "An error occurred while updating room");
        },
    });
};

/**
 * Hook to delete a room. (Endpoint not provided, but adding for completeness if it follows pattern)
 */
export const useDeleteRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/rooms/delete/${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.status) {
                toast.success("Room deleted successfully");
                queryClient.invalidateQueries(["rooms"]);
            } else {
                toast.error(data.message || "Could not delete room");
            }
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete room");
        },
    });
};
