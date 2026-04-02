import { Question, Category } from '../types';
import { CATEGORY_CONFIG } from '../data/categories';
import { shuffle } from './shuffle';

export function weightedSelectMockQuestions(questions: Question[]): Question[] {
  const total = 50;
  const result: Question[] = [];

  const byCategory = new Map<Category, Question[]>();
  for (const q of questions) {
    const list = byCategory.get(q.category) ?? [];
    list.push(q);
    byCategory.set(q.category, list);
  }

  for (const [category, config] of Object.entries(CATEGORY_CONFIG) as [Category, typeof CATEGORY_CONFIG[Category]][]) {
    const pool = shuffle(byCategory.get(category) ?? []);
    const count = Math.min(config.mockWeight, pool.length);
    result.push(...pool.slice(0, count));
  }

  // Top up to 50 if weights don't sum exactly due to missing questions
  const used = new Set(result.map((q) => q.id));
  const remaining = shuffle(questions.filter((q) => !used.has(q.id)));
  let i = 0;
  while (result.length < total && i < remaining.length) {
    result.push(remaining[i++]);
  }

  return shuffle(result).slice(0, total);
}
