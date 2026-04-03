/**
 * Thin re-export layer around `@react-native-firebase` so the rest of the
 * codebase never imports the SDK directly. Centralising here makes it
 * trivial to mock in tests and to swap implementations later.
 *
 * Native initialisation happens automatically via the
 * `GoogleService-Info.plist` / `google-services.json` files configured in
 * `app.config.ts` – there is intentionally no JS-side `initializeApp` call.
 */
import authModule, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestoreModule, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export const auth = authModule;
export const firestore = firestoreModule;

export type FirebaseUser = FirebaseAuthTypes.User;
export type ConfirmationResult = FirebaseAuthTypes.ConfirmationResult;
export type DocumentReference<T extends FirebaseFirestoreTypes.DocumentData> =
  FirebaseFirestoreTypes.DocumentReference<T>;
