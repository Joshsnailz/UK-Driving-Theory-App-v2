import { create } from 'zustand';
import { Question, QuizSession } from '../types';

interface QuizState {
  session: QuizSession | null;
  currentIndex: number;
  flaggedIndices: Set<number>;
  showingResult: boolean;
  startQuiz: (questions: Question[], category: QuizSession['category']) => void;
  answerQuestion: (answerIndex: number) => void;
  skipQuestion: () => void;
  flagQuestion: (index: number) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  showResult: () => void;
  endSession: () => QuizSession;
  reset: () => void;
}

export const useQuizStore = create<QuizState>()((set, get) => ({
  session: null,
  currentIndex: 0,
  flaggedIndices: new Set(),
  showingResult: false,

  startQuiz: (questions, category) =>
    set({
      session: {
        id: Date.now().toString(),
        startedAt: Date.now(),
        category,
        questions,
        answers: new Array(questions.length).fill(null),
        score: 0,
        totalQuestions: questions.length,
      },
      currentIndex: 0,
      flaggedIndices: new Set(),
      showingResult: false,
    }),

  answerQuestion: (answerIndex) =>
    set((state) => {
      if (!state.session) return state;
      const answers = [...state.session.answers];
      answers[state.currentIndex] = answerIndex;
      const score = answers.filter(
        (a, i) => a !== null && a === state.session!.questions[i].correctIndex
      ).length;
      return { session: { ...state.session, answers, score }, showingResult: true };
    }),

  skipQuestion: () =>
    set((state) => {
      if (!state.session) return state;
      const answers = [...state.session.answers];
      // leave as null
      const next = state.currentIndex + 1;
      return {
        session: { ...state.session, answers },
        currentIndex: Math.min(next, state.session.questions.length - 1),
        showingResult: false,
      };
    }),

  flagQuestion: (index) =>
    set((state) => {
      const flags = new Set(state.flaggedIndices);
      if (flags.has(index)) flags.delete(index);
      else flags.add(index);
      return { flaggedIndices: flags };
    }),

  goToQuestion: (index) => set({ currentIndex: index, showingResult: false }),

  nextQuestion: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, (state.session?.questions.length ?? 1) - 1),
      showingResult: false,
    })),

  showResult: () => set({ showingResult: true }),

  endSession: () => {
    const { session } = get();
    if (!session) throw new Error('No active session');
    const completed = { ...session, completedAt: Date.now() };
    set({ session: completed });
    return completed;
  },

  reset: () =>
    set({ session: null, currentIndex: 0, flaggedIndices: new Set(), showingResult: false }),
}));
