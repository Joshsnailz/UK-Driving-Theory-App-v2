import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  darkMode: boolean;
  dailyGoal: number;
  quizLength: 10 | 20 | 30;
  toggleDarkMode: () => void;
  setDailyGoal: (goal: number) => void;
  setQuizLength: (length: 10 | 20 | 30) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      darkMode: false,
      dailyGoal: 20,
      quizLength: 20,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      setDailyGoal: (goal) => set({ dailyGoal: goal }),
      setQuizLength: (length) => set({ quizLength: length }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
