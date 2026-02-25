import  { create } from 'zustand';
import { TierNumber } from '../types/tier.types';

interface TierStore {
 selectedTier: TierNumber | 4;
 setSelectedTier: (tier: TierNumber |  4) => void;
}

export const useTierStore = create<TierStore>((set) => ({
    selectedTier: 1,
    setSelectedTier: (tier) => set({ selectedTier: tier }),
}));