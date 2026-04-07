import { useQuizStore } from '../../src/store/quizStore';
import type { AnyQuestion } from '../../src/types';

function makeQuestion(id: string, correctIndex = 0): AnyQuestion {
  return {
    id,
    category: 'alertness',
    question: `Question ${id}`,
    options: ['Correct', 'Wrong A', 'Wrong B', 'Wrong C'],
    correctIndex,
    explanation: 'Because.',
  };
}

const Q = [makeQuestion('q1', 0), makeQuestion('q2', 2), makeQuestion('q3', 1)];

// Reset store state before each test so tests are isolated.
beforeEach(() => {
  useQuizStore.getState().reset();
});

describe('startQuiz', () => {
  it('initialises a session with the given questions', () => {
    useQuizStore.getState().startQuiz(Q, 'alertness');
    const { session } = useQuizStore.getState();
    expect(session).not.toBeNull();
    expect(session!.questions).toHaveLength(3);
    expect(session!.category).toBe('alertness');
    expect(session!.score).toBe(0);
  });

  it('sets answers array to all nulls', () => {
    useQuizStore.getState().startQuiz(Q, 'alertness');
    const { session } = useQuizStore.getState();
    expect(session!.answers).toEqual([null, null, null]);
  });

  it('resets currentIndex and showingResult', () => {
    useQuizStore.getState().startQuiz(Q, 'alertness');
    const state = useQuizStore.getState();
    expect(state.currentIndex).toBe(0);
    expect(state.showingResult).toBe(false);
  });
});

describe('answerQuestion', () => {
  beforeEach(() => {
    useQuizStore.getState().startQuiz(Q, 'alertness');
  });

  it('records the answer at the current index', () => {
    useQuizStore.getState().answerQuestion(0); // correct for q1
    expect(useQuizStore.getState().session!.answers[0]).toBe(0);
  });

  it('increments score on a correct answer', () => {
    useQuizStore.getState().answerQuestion(0); // correct (correctIndex=0)
    expect(useQuizStore.getState().session!.score).toBe(1);
  });

  it('does not increment score on an incorrect answer', () => {
    useQuizStore.getState().answerQuestion(1); // wrong (correctIndex=0)
    expect(useQuizStore.getState().session!.score).toBe(0);
  });

  it('sets showingResult to true', () => {
    useQuizStore.getState().answerQuestion(0);
    expect(useQuizStore.getState().showingResult).toBe(true);
  });

  it('accumulates score across multiple questions', () => {
    // Answer q1 correctly, then move to q2 and answer correctly.
    useQuizStore.getState().answerQuestion(0); // q1 correct
    useQuizStore.getState().nextQuestion();
    useQuizStore.getState().answerQuestion(2); // q2 correct (correctIndex=2)
    expect(useQuizStore.getState().session!.score).toBe(2);
  });
});

describe('nextQuestion', () => {
  beforeEach(() => {
    useQuizStore.getState().startQuiz(Q, 'alertness');
  });

  it('advances currentIndex', () => {
    useQuizStore.getState().nextQuestion();
    expect(useQuizStore.getState().currentIndex).toBe(1);
  });

  it('clears showingResult', () => {
    useQuizStore.getState().answerQuestion(0);
    useQuizStore.getState().nextQuestion();
    expect(useQuizStore.getState().showingResult).toBe(false);
  });

  it('does not advance past the last question', () => {
    useQuizStore.getState().nextQuestion();
    useQuizStore.getState().nextQuestion();
    useQuizStore.getState().nextQuestion(); // already at last
    expect(useQuizStore.getState().currentIndex).toBe(2);
  });
});

describe('skipQuestion', () => {
  beforeEach(() => {
    useQuizStore.getState().startQuiz(Q, 'alertness');
  });

  it('leaves the answer as null', () => {
    useQuizStore.getState().skipQuestion();
    expect(useQuizStore.getState().session!.answers[0]).toBeNull();
  });

  it('advances to the next question', () => {
    useQuizStore.getState().skipQuestion();
    expect(useQuizStore.getState().currentIndex).toBe(1);
  });
});

describe('flagQuestion', () => {
  beforeEach(() => {
    useQuizStore.getState().startQuiz(Q, 'alertness');
  });

  it('adds an index to flaggedIndices', () => {
    useQuizStore.getState().flagQuestion(1);
    expect(useQuizStore.getState().flaggedIndices.has(1)).toBe(true);
  });

  it('toggles — flagging twice removes the flag', () => {
    useQuizStore.getState().flagQuestion(1);
    useQuizStore.getState().flagQuestion(1);
    expect(useQuizStore.getState().flaggedIndices.has(1)).toBe(false);
  });
});

describe('goToQuestion', () => {
  beforeEach(() => {
    useQuizStore.getState().startQuiz(Q, 'alertness');
  });

  it('jumps directly to any question index', () => {
    useQuizStore.getState().goToQuestion(2);
    expect(useQuizStore.getState().currentIndex).toBe(2);
  });

  it('clears showingResult', () => {
    useQuizStore.getState().answerQuestion(0);
    useQuizStore.getState().goToQuestion(0);
    expect(useQuizStore.getState().showingResult).toBe(false);
  });
});

describe('endSession', () => {
  it('returns the completed session with a completedAt timestamp', () => {
    useQuizStore.getState().startQuiz(Q, 'alertness');
    const before = Date.now();
    const completed = useQuizStore.getState().endSession();
    const after = Date.now();
    expect(completed.completedAt).toBeGreaterThanOrEqual(before);
    expect(completed.completedAt).toBeLessThanOrEqual(after);
  });

  it('throws when called with no active session', () => {
    expect(() => useQuizStore.getState().endSession()).toThrow('No active session');
  });
});

describe('reset', () => {
  it('clears all session state', () => {
    useQuizStore.getState().startQuiz(Q, 'alertness');
    useQuizStore.getState().reset();
    const state = useQuizStore.getState();
    expect(state.session).toBeNull();
    expect(state.currentIndex).toBe(0);
    expect(state.flaggedIndices.size).toBe(0);
    expect(state.showingResult).toBe(false);
  });
});
