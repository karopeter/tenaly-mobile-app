import apiClient from "../utils/apiClient";
import { VerificationStatus, Business } from "../types/verification.types";

export const VerificationService = {
  // Get Verification status 
  getVerificationStatus: async (): Promise<VerificationStatus> => {
    const response = await apiClient?.get('/api/verification/status');
    return response?.data;
  },

  // Get user's businesses 
  getUserBusinesses: async (): Promise<Business[]> => {
    const response = await apiClient?.get('/api/business/my-businesses');
    return response?.data;
  },

  // submit personal verification
  submitPersonalVerification: async (formData: FormData) => {
    const response = await apiClient?.post(
        '/api/verification/submit-personal',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
    );
    return response?.data;
  },

  // Submit business verification 
  submitBusinessVerification: async (formData: FormData) => {
    const response = await apiClient?.post(
        '/api/verification/submit-business',
        formData,
        {
         headers: {
            'Content-Type': 'multipart/form-data',
         },
        }
    );
    return response?.data;
  },
};