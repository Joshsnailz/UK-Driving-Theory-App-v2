import { useProgressStore } from '../store/progressStore';
import { Category } from '../types';

export function useProgress() {
  const { progress } = useProgressStore();

  const overallAccuracy =
    progress.totalQuestionsAnswered === 0
      ? 0
      : Math.round((progress.totalCorrect / progress.totalQuestionsAnswered) * 100);

  const weakCategories: Category[] = (Object.entries(progress.categoryStats) as [Category, { correct: number; total: number }][])
    .filter(([, stat]) => stat.total >= 5 && stat.correct / stat.total < 0.6)
    .map(([cat]) => cat);

  const today = new Date().toDateString();
  const questionsToday = progress.todayDate === today ? progress.questionsToday : 0;
  const goalMet = questionsToday >= progress.dailyGoal;

  return {
    overallAccuracy,
    weakCategories,
    questionsToday,
    goalMet,
    recentMockTests: progress.mockTestHistory.slice(0, 5),
  };
}
