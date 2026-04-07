import { weightedSelectMockQuestions } from '../../src/utils/weightedSelect';
import { CATEGORY_CONFIG, ALL_CATEGORIES } from '../../src/data/categories';
import { MOCK_TEST } from '../../src/config/constants';
import type { Question, Category } from '../../src/types';

/** Build a pool of fake questions — `count` per category. */
function buildPool(countPerCategory = 10): Question[] {
  const questions: Question[] = [];
  for (const category of ALL_CATEGORIES) {
    for (let i = 0; i < countPerCategory; i++) {
      questions.push({
        id: `${category}-${i}`,
        category,
        question: `Question ${i} about ${category}`,
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 0,
        explanation: 'Because.',
      });
    }
  }
  return questions;
}

/** Total of all mockWeights in CATEGORY_CONFIG. */
const TOTAL_WEIGHT = Object.values(CATEGORY_CONFIG).reduce((s, c) => s + c.mockWeight, 0);

describe('weightedSelectMockQuestions', () => {
  it('always returns exactly QUESTION_COUNT questions', () => {
    const pool = buildPool(10);
    const result = weightedSelectMockQuestions(pool);
    expect(result).toHaveLength(MOCK_TEST.QUESTION_COUNT);
  });

  it('returns no duplicate question ids', () => {
    const pool = buildPool(10);
    const result = weightedSelectMockQuestions(pool);
    const ids = result.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all returned questions come from the input pool', () => {
    const pool = buildPool(10);
    const poolIds = new Set(pool.map((q) => q.id));
    const result = weightedSelectMockQuestions(pool);
    for (const q of result) {
      expect(poolIds.has(q.id)).toBe(true);
    }
  });

  it('respects category mockWeights when pool is large enough', () => {
    // With 50 questions per category, every weight is satisfiable.
    const pool = buildPool(50);
    const result = weightedSelectMockQuestions(pool);

    const countByCategory = new Map<Category, number>();
    for (const q of result) {
      countByCategory.set(q.category, (countByCategory.get(q.category) ?? 0) + 1);
    }

    for (const [category, config] of Object.entries(CATEGORY_CONFIG) as [Category, typeof CATEGORY_CONFIG[Category]][]) {
      const count = countByCategory.get(category) ?? 0;
      expect(count).toBeLessThanOrEqual(config.mockWeight);
    }
  });

  it('covers all categories when weights sum equals QUESTION_COUNT', () => {
    // mockWeights sum to 50, so every category should appear at least once.
    expect(TOTAL_WEIGHT).toBe(MOCK_TEST.QUESTION_COUNT);
    const pool = buildPool(50);
    const result = weightedSelectMockQuestions(pool);
    const categoriesPresent = new Set(result.map((q) => q.category));
    for (const category of ALL_CATEGORIES) {
      expect(categoriesPresent.has(category)).toBe(true);
    }
  });

  it('tops up to QUESTION_COUNT when a category has fewer questions than its weight', () => {
    // Give road-traffic-signs (weight 7) only 3 questions — should top up from others.
    const pool = buildPool(10).filter(
      (q) => q.category !== 'road-traffic-signs',
    );
    const sparse: Question[] = [
      { id: 'rts-0', category: 'road-traffic-signs', question: 'Q', options: ['A'], correctIndex: 0, explanation: '' },
      { id: 'rts-1', category: 'road-traffic-signs', question: 'Q', options: ['A'], correctIndex: 0, explanation: '' },
    ];
    const result = weightedSelectMockQuestions([...pool, ...sparse]);
    expect(result).toHaveLength(MOCK_TEST.QUESTION_COUNT);
  });

  it('returns at most available questions when pool is smaller than QUESTION_COUNT', () => {
    // Only 20 total questions — can't reach 50, should return what's available.
    const pool = buildPool(2); // 12 categories × 2 = 24 questions
    const result = weightedSelectMockQuestions(pool);
    expect(result.length).toBeLessThanOrEqual(MOCK_TEST.QUESTION_COUNT);
    expect(result.length).toBeLessThanOrEqual(pool.length);
  });
});
