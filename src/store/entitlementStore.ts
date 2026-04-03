import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import {
  configurePurchases,
  getCustomerInfo,
  getOfferings,
  hasPremium,
  onCustomerInfoUpdated,
} from '../services/purchases';

interface EntitlementState {
  /** True once `initialise()` has resolved at least once. */
  ready: boolean;
  isPremium: boolean;
  offering: PurchasesOffering | null;
  /** Mock-test credits earned via rewarded ads (free tier only). */
  mockTrialCredits: number;

  initialise: (appUserId: string | null) => Promise<void>;
  refresh: () => Promise<void>;
  grantMockTrial: () => void;
  consumeMockTrial: () => boolean;
}

/**
 * Single source of truth for "what is unlocked". `isPremium` is driven by
 * RevenueCat; `mockTrialCredits` is a local, ad-funded allowance persisted
 * to AsyncStorage so it survives restarts but is intentionally per-device.
 */
export const useEntitlementStore = create<EntitlementState>()(
  persist(
    (set, get) => {
      const apply = (info: CustomerInfo | null) => set({ isPremium: hasPremium(info) });

      return {
        ready: false,
        isPremium: false,
        offering: null,
        mockTrialCredits: 0,

        initialise: async (appUserId) => {
          try {
            await configurePurchases(appUserId);
            onCustomerInfoUpdated(apply);
            await get().refresh();
          } catch (e) {
            console.warn('[entitlements] initialise failed', e);
          } finally {
            set({ ready: true });
          }
        },

        refresh: async () => {
          try {
            const [info, offerings] = await Promise.all([getCustomerInfo(), getOfferings()]);
            apply(info);
            set({ offering: offerings.current ?? null });
          } catch (e) {
            console.warn('[entitlements] refresh failed', e);
          }
        },

        grantMockTrial: () =>
          set((s) => ({ mockTrialCredits: Math.min(s.mockTrialCredits + 1, 5) })),

        consumeMockTrial: () => {
          const { mockTrialCredits } = get();
          if (mockTrialCredits <= 0) return false;
          set({ mockTrialCredits: mockTrialCredits - 1 });
          return true;
        },
      };
    },
    {
      name: 'entitlement-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only the trial-credit balance is meaningful to persist; entitlement
      // truth always comes from RevenueCat on launch.
      partialize: (s) => ({ mockTrialCredits: s.mockTrialCredits }),
    },
  ),
);
