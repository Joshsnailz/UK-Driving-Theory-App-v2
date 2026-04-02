export type Category =
  | 'alertness'
  | 'attitude'
  | 'safety-margins'
  | 'hazard-awareness'
  | 'vulnerable-road-users'
  | 'vehicle-safety'
  | 'motorway-rules'
  | 'rules-of-the-road'
  | 'road-traffic-signs'
  | 'documents'
  | 'accidents'
  | 'vehicle-loading';

export interface Question {
  id: string;
  category: Category;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  imageUri?: string;
  dvsaRef?: string;
}

export interface HazardQuestion {
  id: string;
  imageUri: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hazardType: 'developing' | 'junction' | 'pedestrian' | 'weather';
}

export interface QuizSession {
  id: string;
  startedAt: number;
  completedAt?: number;
  category: Category | 'mixed' | 'mock' | 'hazard';
  questions: Question[];
  answers: (number | null)[];
  score: number;
  totalQuestions: number;
}

export interface MockTestResult {
  id: string;
  date: number;
  score: number;
  passed: boolean;
  duration: number;
  categoryBreakdown: Record<Category, { correct: number; total: number }>;
}

export interface UserProgress {
  totalQuestionsAnswered: number;
  totalCorrect: number;
  currentStreak: number;
  longestStreak: number;
  bookmarkedIds: string[];
  categoryStats: Record<Category, { correct: number; total: number }>;
  mockTestHistory: MockTestResult[];
  lastPracticeDate?: number;
  dailyGoal: number;
  questionsToday: number;
  todayDate: string;
}

export type RootStackParamList = {
  Main: undefined;
  Quiz: { category: Category | 'mixed'; quizLength: number };
  MockTest: undefined;
  Hazard: undefined;
  Result: { session: QuizSession; isMockTest?: boolean; mockResult?: MockTestResult };
  Review: { session: QuizSession };
  TopicList: undefined;
};

export type BottomTabParamList = {
  HomeTab: undefined;
  MockTestTab: undefined;
  ProgressTab: undefined;
  SettingsTab: undefined;
};
