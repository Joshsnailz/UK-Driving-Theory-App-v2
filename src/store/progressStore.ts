import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, QuizSession, MockTestResult, Category } from '../types';
import { buildEmptyCategoryStats } from '../data/categories';

const defaultProgress = (): UserProgress => ({
  totalQuestionsAnswered: 0,
  totalCorrect: 0,
  currentStreak: 0,
  longestStreak: 0,
  bookmarkedIds: [],
  categoryStats: buildEmptyCategoryStats(),
  mockTestHistory: [],
  dailyGoal: 20,
  questionsToday: 0,
  todayDate: new Date().toDateString(),
});

interface ProgressState {
  progress: UserProgress;
  recordSession: (session: QuizSession) => void;
  recordMockTest: (result: MockTestResult) => void;
  toggleBookmark: (questionId: string) => void;
  /** Overwrite progress wholesale (used by cloud-sync merge on sign-in). */
  replaceProgress: (progress: UserProgress) => void;
  resetProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      progress: defaultProgress(),

      recordSession: (session) =>
        set((state) => {
          const p = { ...state.progress };
          const today = new Date().toDateString();

          // Reset daily count if it's a new day
          if (p.todayDate !== today) {
            p.questionsToday = 0;
            p.todayDate = today;
          }

          let streak = p.currentStreak;
          session.questions.forEach((q, i) => {
            const answer = session.answers[i];
            if (answer === null) return;
            p.totalQuestionsAnswered += 1;
            p.questionsToday += 1;
            const correct = answer === q.correctIndex;
            if (correct) {
              p.totalCorrect += 1;
              streak += 1;
              if (streak > p.longestStreak) p.longestStreak = streak;
            } else {
              streak = 0;
            }
            const cat = q.category as Category;
            const catStat = { ...p.categoryStats[cat] };
            catStat.total += 1;
            if (correct) catStat.correct += 1;
            p.categoryStats = { ...p.categoryStats, [cat]: catStat };
          });
          p.currentStreak = streak;
          return { progress: p };
        }),

      recordMockTest: (result) =>
        set((state) => ({
          progress: {
            ...state.progress,
            mockTestHistory: [result, ...state.progress.mockTestHistory].slice(0, 20),
          },
        })),

      toggleBookmark: (questionId) =>
        set((state) => {
          const ids = state.progress.bookmarkedIds;
          const next = ids.includes(questionId)
            ? ids.filter((id) => id !== questionId)
            : [...ids, questionId];
          return { progress: { ...state.progress, bookmarkedIds: next } };
        }),

      replaceProgress: (progress) => set({ progress }),

      resetProgress: () => set({ progress: defaultProgress() }),
    }),
    {
      name: 'progress-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
