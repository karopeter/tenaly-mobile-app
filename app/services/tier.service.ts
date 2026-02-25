import apiClient from "../utils/apiClient";
import { 
 SubmitTier1Data,
 SubmitTier2Data,
 SubmitTier3Data,
 Business,
 TierStatusResponse
} from "../types/tier.types";

export const tierVerificationApi = {
 // Get user's tier status 
 getTierStatus: async (): Promise<TierStatusResponse> => {
    const response = await apiClient!.get('/api/tier-verification/status');
    return response.data;
 },

 // Get user's businesses 
 getBusinesses: async (): Promise<Business[]> => {
     const response = await apiClient!.get('/api/business/my-businesses');
     return response.data;
 },

 // Submit Tier 1 
 submitTier1: async (data: SubmitTier1Data) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('idType', data.idType);

    // Append file 
    formData.append('idDocument', {
      uri: data.idDocument.uri,
      name: data.idDocument.name,
      type: data.idDocument.type,
    } as any);

    const response = await apiClient!.post('/api/tier-verification/tier1', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
 },

 // Submit Tier 2 
 submitTier2: async (data: SubmitTier2Data) => {
    const formData = new FormData();
    formData.append('state', data.state);
    formData.append('lga', data.lga);
    formData.append('address', data.address);
    formData.append('town', data.town);

    formData.append('utilityBill', {
       uri: data.utilityBill.uri,
       name: data.utilityBill.name,
       type: data.utilityBill.type
    } as any);

    const response = await apiClient!.post('/api/tier-verification/tier2', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
 },

 // Submit Tier 3 
 submitTier3: async (data: SubmitTier3Data) => {
    const formData = new FormData();
    formData.append('businessId', data.businessId);
    formData.append('cacNumber', data.cacNumber);
    formData.append('tinNumber', data.tinNumber);
    formData.append('businessLicenseNumber', data.businessLicenseNumber);

    formData.append('cacDocument', {
     uri: data.cacDocument.uri,
     name: data.cacDocument.name,
     type: data.cacDocument.type,
    } as any);

    if (data.otherDocument) {
        formData.append('otherDocument', {
         uri: data.otherDocument.uri,
         name: data.otherDocument.name,
         type: data.otherDocument.type,
        } as any);
    }

    const response = await apiClient!.post('/api/tier-verification/tier3', formData, {
       headers: {
        'Content-Type': 'multipart/form-data',
       },
    });
    return response.data;
 }
};