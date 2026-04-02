import { questions as allQuestions } from '../data/questions';
import { Category, Question } from '../types';
import { shuffle } from '../utils/shuffle';
import { weightedSelectMockQuestions } from '../utils/weightedSelect';

export function useQuizEngine() {
  const selectQuestions = (category: Category | 'mixed', count: number): Question[] => {
    const pool =
      category === 'mixed'
        ? allQuestions
        : allQuestions.filter((q) => q.category === category);
    return shuffle(pool).slice(0, count);
  };

  const selectMockTestQuestions = (): Question[] => {
    return weightedSelectMockQuestions(allQuestions);
  };

  return { selectQuestions, selectMockTestQuestions };
}
