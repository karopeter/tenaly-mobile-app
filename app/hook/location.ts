import { useQuery } from "@tanstack/react-query";
import apiClient from "../utils/apiClient";
import { Location } from "../types/location.types";

// Fetch all locations
export const useLocations = () => {
    return useQuery<Location[]>({
     queryKey: ['locations'],
     queryFn: async () => {
        const response = await apiClient!.get('/api/locations/getLocation');
        return response.data;
     },
     staleTime: 1000 * 60 * 60, // 1 hour (locations don't change often)
    });
};