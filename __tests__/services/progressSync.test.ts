// progressSync imports Firebase at module level. Stub it out so the pure
// mergeProgress function can be tested in a Node environment without native modules.
jest.mock('../../src/services/firebase', () => ({
  auth: {},
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({ doc: jest.fn() })),
  })),
}));
jest.mock('../../src/store/progressStore', () => ({
  useProgressStore: { getState: jest.fn(), subscribe: jest.fn() },
}));

import { mergeProgress } from '../../src/services/progressSync';
import { buildEmptyCategoryStats } from '../../src/data/categories';
import type { UserProgress } from '../../src/types';

// mergeProgress is a pure function — no Firebase needed.

function makeProgress(overrides: Partial<UserProgress> = {}): UserProgress {
  return {
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    currentStreak: 0,
    longestStreak: 0,
    bookmarkedIds: [],
    categoryStats: buildEmptyCategoryStats(),
    mockTestHistory: [],
    dailyGoal: 10,
    questionsToday: 0,
    todayDate: '2024-01-01',
    ...overrides,
  };
}

describe('mergeProgress', () => {
  describe('counters take the maximum', () => {
    it('picks the higher totalQuestionsAnswered', () => {
      const local = makeProgress({ totalQuestionsAnswered: 100 });
      const remote = makeProgress({ totalQuestionsAnswered: 150 });
      expect(mergeProgress(local, remote).totalQuestionsAnswered).toBe(150);
    });

    it('picks the higher totalCorrect', () => {
      const local = makeProgress({ totalCorrect: 80 });
      const remote = makeProgress({ totalCorrect: 60 });
      expect(mergeProgress(local, remote).totalCorrect).toBe(80);
    });

    it('picks the higher currentStreak', () => {
      const local = makeProgress({ currentStreak: 5 });
      const remote = makeProgress({ currentStreak: 12 });
      expect(mergeProgress(local, remote).currentStreak).toBe(12);
    });

    it('picks the higher longestStreak', () => {
      const local = makeProgress({ longestStreak: 30 });
      const remote = makeProgress({ longestStreak: 25 });
      expect(mergeProgress(local, remote).longestStreak).toBe(30);
    });
  });

  describe('category stats take the maximum per field', () => {
    it('merges correct and total independently', () => {
      const local = makeProgress();
      const remote = makeProgress();
      local.categoryStats.alertness = { correct: 10, total: 15 };
      remote.categoryStats.alertness = { correct: 8, total: 20 };

      const merged = mergeProgress(local, remote);
      expect(merged.categoryStats.alertness).toEqual({ correct: 10, total: 20 });
    });

    it('handles a category missing on one side', () => {
      const local = makeProgress();
      const remote = makeProgress();
      // Simulate a category not yet present on remote (defaults to 0)
      local.categoryStats['road-traffic-signs'] = { correct: 5, total: 7 };

      const merged = mergeProgress(local, remote);
      expect(merged.categoryStats['road-traffic-signs'].correct).toBe(5);
      expect(merged.categoryStats['road-traffic-signs'].total).toBe(7);
    });
  });

  describe('bookmarkedIds are unioned', () => {
    it('combines bookmarks from both sides without duplicates', () => {
      const local = makeProgress({ bookmarkedIds: ['q1', 'q2'] });
      const remote = makeProgress({ bookmarkedIds: ['q2', 'q3'] });
      const merged = mergeProgress(local, remote);
      expect(merged.bookmarkedIds.sort()).toEqual(['q1', 'q2', 'q3']);
    });

    it('returns empty array when both sides have no bookmarks', () => {
      const merged = mergeProgress(makeProgress(), makeProgress());
      expect(merged.bookmarkedIds).toEqual([]);
    });
  });

  describe('mockTestHistory deduplication', () => {
    const mockResult = (id: string, date: number, score: number) => ({
      id,
      date,
      score,
      passed: score >= 43,
      duration: 3000,
      categoryBreakdown: buildEmptyCategoryStats(),
    });

    it('deduplicates by id, keeping one copy', () => {
      const shared = mockResult('test-1', 1000, 45);
      const local = makeProgress({ mockTestHistory: [shared] });
      const remote = makeProgress({ mockTestHistory: [shared] });
      const merged = mergeProgress(local, remote);
      expect(merged.mockTestHistory.filter((r) => r.id === 'test-1')).toHaveLength(1);
    });

    it('combines unique results from both sides', () => {
      const local = makeProgress({ mockTestHistory: [mockResult('test-1', 2000, 45)] });
      const remote = makeProgress({ mockTestHistory: [mockResult('test-2', 1000, 40)] });
      const merged = mergeProgress(local, remote);
      expect(merged.mockTestHistory).toHaveLength(2);
    });

    it('sorts history newest-first', () => {
      const local = makeProgress({
        mockTestHistory: [mockResult('old', 1000, 44), mockResult('new', 3000, 45)],
      });
      const merged = mergeProgress(local, makeProgress());
      expect(merged.mockTestHistory[0].id).toBe('new');
      expect(merged.mockTestHistory[1].id).toBe('old');
    });

    it('caps history at 20 entries', () => {
      const history = Array.from({ length: 25 }, (_, i) =>
        mockResult(`test-${i}`, i * 1000, 44),
      );
      const local = makeProgress({ mockTestHistory: history });
      const merged = mergeProgress(local, makeProgress());
      expect(merged.mockTestHistory).toHaveLength(20);
    });
  });

  describe('questionsToday handling', () => {
    it('takes max questionsToday when both sides share todayDate', () => {
      const local = makeProgress({ questionsToday: 5, todayDate: '2024-06-01' });
      const remote = makeProgress({ questionsToday: 8, todayDate: '2024-06-01' });
      expect(mergeProgress(local, remote).questionsToday).toBe(8);
    });

    it('keeps local questionsToday when dates differ (local is authoritative for today)', () => {
      const local = makeProgress({ questionsToday: 3, todayDate: '2024-06-02' });
      const remote = makeProgress({ questionsToday: 10, todayDate: '2024-06-01' });
      expect(mergeProgress(local, remote).questionsToday).toBe(3);
    });
  });

  describe('lastPracticeDate', () => {
    it('picks the more recent lastPracticeDate', () => {
      const local = makeProgress({ lastPracticeDate: 1000 });
      const remote = makeProgress({ lastPracticeDate: 2000 });
      expect(mergeProgress(local, remote).lastPracticeDate).toBe(2000);
    });

    it('handles both sides having no lastPracticeDate', () => {
      const merged = mergeProgress(makeProgress(), makeProgress());
      expect(merged.lastPracticeDate).toBeUndefined();
    });
  });

  describe('local wins for non-mergeable fields', () => {
    it('always uses local dailyGoal', () => {
      const local = makeProgress({ dailyGoal: 20 });
      const remote = makeProgress({ dailyGoal: 50 });
      expect(mergeProgress(local, remote).dailyGoal).toBe(20);
    });

    it('always uses local todayDate', () => {
      const local = makeProgress({ todayDate: '2024-06-02' });
      const remote = makeProgress({ todayDate: '2024-06-01' });
      expect(mergeProgress(local, remote).todayDate).toBe('2024-06-02');
    });
  });

  it('is idempotent — merging with itself returns equivalent data', () => {
    const progress = makeProgress({
      totalQuestionsAnswered: 50,
      totalCorrect: 40,
      bookmarkedIds: ['q1', 'q2'],
    });
    const merged = mergeProgress(progress, progress);
    expect(merged.totalQuestionsAnswered).toBe(50);
    expect(merged.totalCorrect).toBe(40);
    expect(merged.bookmarkedIds.sort()).toEqual(['q1', 'q2']);
  });
});
