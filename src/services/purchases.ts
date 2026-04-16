import { Platform } from 'react-native';
import Purchases, {
  type CustomerInfo,
  type PurchasesOfferings,
  type PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Env } from '../config/env';

let configured = false;

/**
 * Configure the RevenueCat SDK once per app launch. Safe to call repeatedly.
 * `appUserId` should be the Firebase UID when known so entitlements follow
 * the user across devices; pass `null` for an anonymous (guest) install.
 */
export async function configurePurchases(appUserId: string | null): Promise<void> {
  if (configured) return;
  const apiKey = Platform.select({
    ios: Env.revenuecat.iosKey,
    android: Env.revenuecat.androidKey,
  });
  if (!apiKey) {
    console.warn('[purchases] No RevenueCat API key for this platform; purchases disabled.');
    return;
  }
  if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey, appUserID: appUserId ?? undefined });
  configured = true;
}

/** Identify the customer with the Firebase UID after sign-in. */
export async function logInPurchases(uid: string): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.logIn(uid);
  return customerInfo;
}

/** Revert to an anonymous customer after sign-out. */
export async function logOutPurchases(): Promise<void> {
  try {
    await Purchases.logOut();
  } catch {
    // logOut throws if the current user is already anonymous – ignore.
  }
}

export function onCustomerInfoUpdated(cb: (info: CustomerInfo) => void): () => void {
  Purchases.addCustomerInfoUpdateListener(cb);
  return () => Purchases.removeCustomerInfoUpdateListener(cb);
}

export async function getCustomerInfo(): Promise<CustomerInfo> {
  return Purchases.getCustomerInfo();
}

export async function getOfferings(): Promise<PurchasesOfferings> {
  return Purchases.getOfferings();
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

/** Whether the given customer info grants the premium entitlement. */
export function hasPremium(info: CustomerInfo | null): boolean {
  const id = Platform.select({
    ios: 'UK Driving Theory Practice Premium',
    android: 'UK Theory Practice Pro - Android',
  })!;
  return info?.entitlements.active[id] !== undefined;
}
