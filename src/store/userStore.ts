import { create } from 'zustand';
import type { FirebaseUser } from '../services/firebase';
import { onAuthStateChanged } from '../services/auth';
import { startProgressSync, type SyncHandle } from '../services/progressSync';

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
  let syncHandle: SyncHandle | undefined;
  let unsubscribeAuth: (() => void) | undefined;

  return {
    status: 'loading',
    user: null,

    initialise: () => {
      if (unsubscribeAuth) return; // idempotent across fast-refresh
      unsubscribeAuth = onAuthStateChanged(async (user) => {
        // Flush any pending debounced push before tearing down the previous sync
        // so progress is not lost when the user signs out immediately after a quiz.
        if (syncHandle) {
          await syncHandle.flush().catch(() => {});
          syncHandle.stop();
          syncHandle = undefined;
        }

        if (user) {
          set({ user, status: 'authed' });
          try {
            syncHandle = await startProgressSync(user.uid);
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
