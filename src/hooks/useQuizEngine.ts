import { questions as allQuestions, questionsForCategory } from '../content/questions';
import type { Category, Question } from '../types';
import { shuffle } from '../utils/shuffle';
import { weightedSelectMockQuestions } from '../utils/weightedSelect';

export function useQuizEngine() {
  const selectQuestions = (category: Category | 'mixed', count: number): Question[] => {
    const pool = questionsForCategory(category);
    return shuffle([...pool]).slice(0, count);
  };

  const selectMockTestQuestions = (): Question[] => {
    return weightedSelectMockQuestions([...allQuestions]);
  };

  return { selectQuestions, selectMockTestQuestions };
}
