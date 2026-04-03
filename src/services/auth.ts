import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { auth, type ConfirmationResult, type FirebaseUser } from './firebase';
import { Env } from '../config/env';

let googleConfigured = false;

function ensureGoogleConfigured(): void {
  if (googleConfigured) return;
  GoogleSignin.configure({
    webClientId: Env.googleSignIn.webClientId,
    offlineAccess: false,
  });
  googleConfigured = true;
}

/** Sign in with the device Google account, returning the Firebase user. */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  ensureGoogleConfigured();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const { data } = await GoogleSignin.signIn();
  const idToken = data?.idToken;
  if (!idToken) throw new Error('Google sign-in did not return an ID token.');
  const credential = auth.GoogleAuthProvider.credential(idToken);
  const result = await auth().signInWithCredential(credential);
  return result.user;
}

/**
 * Sign in with Apple. iOS-only – callers should not render the Apple button
 * on Android (Apple HIG / App Review guideline 4.8).
 */
export async function signInWithApple(): Promise<FirebaseUser> {
  if (Platform.OS !== 'ios') {
    throw new Error('Sign in with Apple is only available on iOS.');
  }
  const response = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });
  if (!response.identityToken) {
    throw new Error('Apple sign-in did not return an identity token.');
  }
  const credential = auth.AppleAuthProvider.credential(
    response.identityToken,
    // RNFirebase derives the rawNonce internally; passing undefined is valid.
    undefined,
  );
  const result = await auth().signInWithCredential(credential);
  return result.user;
}

/**
 * Begin phone-number verification. Resolves to a confirmation handle whose
 * `confirm(code)` method completes sign-in.
 */
export async function signInWithPhone(e164: string): Promise<ConfirmationResult> {
  return auth().signInWithPhoneNumber(e164);
}

export async function signOut(): Promise<void> {
  try {
    if (googleConfigured) await GoogleSignin.signOut();
  } catch {
    // Non-fatal: the Google session may already be revoked.
  }
  await auth().signOut();
}

/**
 * Permanently delete the signed-in user's Firebase account. Callers must
 * separately remove any Firestore data; this only handles the auth record.
 * Re-throws `auth/requires-recent-login` so the UI can prompt to re-auth.
 */
export async function deleteAccount(): Promise<void> {
  const user = auth().currentUser;
  if (!user) return;
  await user.delete();
}

export function onAuthStateChanged(cb: (user: FirebaseUser | null) => void): () => void {
  return auth().onAuthStateChanged(cb);
}

export function currentUser(): FirebaseUser | null {
  return auth().currentUser;
}
