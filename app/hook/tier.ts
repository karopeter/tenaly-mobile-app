import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tierVerificationApi } from '../services/tier.service';
import { SubmitTier1Data, SubmitTier2Data, SubmitTier3Data } from '../types/tier.types';
import { showErrorToast, showSuccessToast } from '../utils/toast';

// Ger tier status 
export const useTierStatus = () => {
    return useQuery({
      queryKey: ['tierStatus'],
      queryFn: tierVerificationApi.getTierStatus,
      staleTime: 1000 * 60 * 5, // 5 minutes 
    });
};

// Get businesses 
export const useBusinesses = () => {
   return useQuery({
     queryKey: ['businesses'],
     queryFn: tierVerificationApi.getBusinesses,
     staleTime: 1000 * 60 * 5,
   });
};

// Submit Tier 1 
export const useSubmitTier1 = () => {
   const queryClient = useQueryClient();

   return useMutation({
     mutationFn: (data: SubmitTier1Data) => tierVerificationApi.submitTier1(data),
     onSuccess: () => {
        showSuccessToast('Tier 1 verification submitted successfully');
        queryClient.invalidateQueries({ queryKey: ['tierStatus'] });
     },
     onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to submit Tier 1';
      showErrorToast(message);
     },
   });
};

// Submit Tier 2 
export const useSubmitTier2 = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (data: SubmitTier2Data) => tierVerificationApi.submitTier2(data),
      onSuccess: () => {
        showSuccessToast('Tier 2 verification submitted successfully');
        queryClient.invalidateQueries({ queryKey: ['tierStatus'] });
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to submit Tier 2';
        showErrorToast(message);
      },
    });
};

// Submit Tier 3 
export const useSubmitTier3 = () => {
    const queryClient = useQueryClient();

    return useMutation({
     mutationFn: (data: SubmitTier3Data) => tierVerificationApi.submitTier3(data),
     onSuccess: () => {
        showSuccessToast('Tier 3 verification submitted successfully');
        queryClient.invalidateQueries({ queryKey: ['tierStatus'] });
     },
     onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to submit Tier 3';
      showErrorToast(message);
     }
    });
};