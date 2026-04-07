import { firestore } from './firebase';
import { useProgressStore } from '../store/progressStore';
import { ALL_CATEGORIES, buildEmptyCategoryStats } from '../data/categories';
import type { CategoryStats, MockTestResult, UserProgress } from '../types';

/** Firestore document layout for `users/{uid}`. */
interface UserDoc {
  progress: UserProgress;
  updatedAt: number;
  schemaVersion: 1;
}

const userDoc = (uid: string) => firestore().collection('users').doc(uid);

/**
 * Merge a remote snapshot into local progress. Strategy: counters take the
 * max of both sides, sets union, history concatenates and de-dupes by id.
 * This is intentionally last-writer-agnostic so a fresh install never wipes
 * cloud progress and an existing device never loses local work.
 */
export function mergeProgress(local: UserProgress, remote: UserProgress): UserProgress {
  const categoryStats: CategoryStats = buildEmptyCategoryStats();
  for (const c of ALL_CATEGORIES) {
    const l = local.categoryStats[c] ?? { correct: 0, total: 0 };
    const r = remote.categoryStats[c] ?? { correct: 0, total: 0 };
    categoryStats[c] = {
      correct: Math.max(l.correct, r.correct),
      total: Math.max(l.total, r.total),
    };
  }

  const historyById = new Map<string, MockTestResult>();
  for (const m of [...remote.mockTestHistory, ...local.mockTestHistory]) {
    historyById.set(m.id, m);
  }
  const mockTestHistory = [...historyById.values()]
    .sort((a, b) => b.date - a.date)
    .slice(0, 20);

  return {
    totalQuestionsAnswered: Math.max(local.totalQuestionsAnswered, remote.totalQuestionsAnswered),
    totalCorrect: Math.max(local.totalCorrect, remote.totalCorrect),
    currentStreak: Math.max(local.currentStreak, remote.currentStreak),
    longestStreak: Math.max(local.longestStreak, remote.longestStreak),
    bookmarkedIds: [...new Set([...local.bookmarkedIds, ...remote.bookmarkedIds])],
    categoryStats,
    mockTestHistory,
    dailyGoal: local.dailyGoal,
    questionsToday:
      local.todayDate === remote.todayDate
        ? Math.max(local.questionsToday, remote.questionsToday)
        : local.questionsToday,
    todayDate: local.todayDate,
    lastPracticeDate: Math.max(local.lastPracticeDate ?? 0, remote.lastPracticeDate ?? 0) || undefined,
  };
}

export interface SyncHandle {
  /** Immediately push the current local progress to Firestore, bypassing the debounce. */
  flush: () => Promise<void>;
  /** Cancel the debounce timer and unsubscribe from local store changes. */
  stop: () => void;
}

/**
 * Pull the user's cloud progress (if any), merge with the current local
 * store, write the merged result back to Firestore, then start a debounced
 * subscription that pushes future local changes upstream.
 *
 * Returns a SyncHandle — call flush() then stop() on sign-out so in-flight
 * changes are not lost when the debounce timer is cancelled.
 */
export async function startProgressSync(uid: string): Promise<SyncHandle> {
  const ref = userDoc(uid);
  const store = useProgressStore;

  // 1. Pull + merge.
  let merged = store.getState().progress;
  try {
    const snap = await ref.get();
    const remote = (snap.data() as UserDoc | undefined)?.progress;
    if (remote) merged = mergeProgress(merged, remote);
  } catch (e) {
    console.warn('[sync] initial pull failed', e);
  }
  store.getState().replaceProgress(merged);

  // 2. Push merged state immediately so a brand-new account has a baseline.
  void push(ref, merged);

  // 3. Subscribe to local changes and push with a 2 s debounce.
  let timer: ReturnType<typeof setTimeout> | undefined;
  const unsubscribe = store.subscribe((state, prev) => {
    if (state.progress === prev.progress) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void push(ref, state.progress), 2000);
  });

  return {
    flush: () => push(ref, store.getState().progress),
    stop: () => {
      if (timer) clearTimeout(timer);
      unsubscribe();
    },
  };
}

async function push(
  ref: ReturnType<typeof userDoc>,
  progress: UserProgress,
): Promise<void> {
  // Firestore rejects undefined values. JSON round-trip strips them cleanly
  // without mutating the store object. All UserProgress values are JSON-safe
  // (timestamps are numbers, not Date objects).
  const sanitised = JSON.parse(JSON.stringify(progress)) as UserProgress;
  const doc: UserDoc = { progress: sanitised, updatedAt: Date.now(), schemaVersion: 1 };
  try {
    await ref.set(doc, { merge: true });
  } catch (e) {
    console.warn('[sync] push failed', e);
  }
}

/** Remove the user's Firestore document. Called before account deletion. */
export async function deleteUserData(uid: string): Promise<void> {
  await userDoc(uid).delete();
}
