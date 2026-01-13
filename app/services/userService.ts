import apiClient from "../utils/apiClient";
import { showErrorToast } from "../utils/toast";

const userService = {
    // Get User Profile by Id 
    getUserProfile: async (userId: string) => {
        try {
        if (!apiClient) {
            showErrorToast("API client is not initialized");
            return;
        }
        const response = await apiClient.get(`/api/profile/user/${userId}`);
        return response?.data;
        } catch (error: any) {
         console.error('Error fetching user profile:', error);
         throw error;
        }
    },
};

export default userService;