import { create } from 'zustand';
import type { FirebaseUser } from '../services/firebase';
import { onAuthStateChanged } from '../services/auth';
import { startProgressSync } from '../services/progressSync';

export type AuthStatus = 'loading' | 'guest' | 'authed';

interface UserState {
  status: AuthStatus;
  user: FirebaseUser | null;
  /** Begin listening to Firebase auth and start/stop cloud sync accordingly. */
  initialise: () => void;
}

/**
 * Auth + identity store. Not persisted: Firebase keeps its own session and
 * `onAuthStateChanged` re-hydrates `user` on every cold start.
 */
export const useUserStore = create<UserState>((set, get) => {
  let stopSync: (() => void) | undefined;
  let unsubscribeAuth: (() => void) | undefined;

  return {
    status: 'loading',
    user: null,

    initialise: () => {
      if (unsubscribeAuth) return; // idempotent across fast-refresh
      unsubscribeAuth = onAuthStateChanged(async (user) => {
        // Tear down any sync belonging to the previous user.
        stopSync?.();
        stopSync = undefined;

        if (user) {
          set({ user, status: 'authed' });
          try {
            stopSync = await startProgressSync(user.uid);
          } catch (e) {
            console.warn('[user] failed to start sync', e);
          }
        } else {
          set({ user: null, status: 'guest' });
        }
      });
    },
  };
});
