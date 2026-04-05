import type { Ionicons } from "@expo/vector-icons";

export type IoniconName = keyof typeof Ionicons.glyphMap;

export type Category =
  | "alertness"
  | "attitude"
  | "safety-margins"
  | "hazard-awareness"
  | "vulnerable-road-users"
  | "vehicle-safety"
  | "motorway-rules"
  | "rules-of-the-road"
  | "road-traffic-signs"
  | "documents"
  | "accidents"
  | "vehicle-loading";

/** A multiple-choice theory question. */
export interface Question {
  id: string;
  category: Category;
  question: string;
  options: readonly string[];
  correctIndex: number;
  explanation: string;
  /** Optional bundled or remote image (e.g. a road sign). */
  imageUri?: string;
  /** DVSA topic reference, if known. */
  dvsaRef?: string;
  /** Highway Code rule numbers that justify the correct answer. */
  highwayCodeRules?: readonly number[];
  /** Traffic-sign id this question depicts (links to the sign library). */
  signId?: string;
}

export interface HazardQuestion {
  id: string;
  /** Hazard items always belong to the hazard-awareness topic for stats. */
  category: "hazard-awareness";
  imageUri: string;
  question: string;
  options: readonly string[];
  correctIndex: number;
  explanation: string;
  hazardType: "developing" | "junction" | "pedestrian" | "weather";
}

export type AnyQuestion = Question | HazardQuestion;

export interface QuizSession {
  id: string;
  startedAt: number;
  completedAt?: number;
  category: Category | "mixed" | "mock" | "hazard";
  questions: AnyQuestion[];
  answers: (number | null)[];
  score: number;
  totalQuestions: number;
}

export type CategoryStats = Record<
  Category,
  { correct: number; total: number }
>;

export interface MockTestResult {
  id: string;
  date: number;
  score: number;
  passed: boolean;
  duration: number;
  categoryBreakdown: CategoryStats;
}

export interface UserProgress {
  totalQuestionsAnswered: number;
  totalCorrect: number;
  currentStreak: number;
  longestStreak: number;
  bookmarkedIds: string[];
  categoryStats: CategoryStats;
  mockTestHistory: MockTestResult[];
  lastPracticeDate?: number;
  dailyGoal: number;
  questionsToday: number;
  todayDate: string;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Content (Highway Code / Traffic signs)
 * ─────────────────────────────────────────────────────────────────────── */

export interface HighwayCodeSection {
  id: string;
  title: string;
  ruleStart: number;
  ruleEnd: number;
  summary: string;
}

export interface HighwayCodeRule {
  rule: number;
  sectionId: string;
  text: string;
  /** Statutory references quoted by the rule (e.g. "RTA 1988 sect 36"). */
  lawRefs?: readonly string[];
  imageRefs?: readonly string[];
}

export type SignGroup =
  | "warning"
  | "regulatory"
  | "speed"
  | "low_bridge"
  | "level_crossing"
  | "tram"
  | "bus_cycle"
  | "pedestrian_zone"
  | "parking"
  | "road_markings"
  | "traffic_calming"
  | "motorway"
  | "direction"
  | "cyclist_pedestrian"
  | "information"
  | "traffic_signals"
  | "tidal_flow"
  | "crossings"
  | "roadworks"
  | "miscellaneous";

export interface TrafficSign {
  id: string; // e.g. "tsrgd-601-1"
  tsrgd: string; // e.g. "601.1"  (TSRGD reference number)
  group: SignGroup;
  name: string;
  meaning: string;
  image: string; // key into SIGN_IMAGES
  folder: string; // e.g. "regulatory_signs"
  highwayCodeRules?: number[];
}

/* ──────────────────────────────────────────────────────────────────────────
 * Navigation
 * ─────────────────────────────────────────────────────────────────────── */

export type RootStackParamList = {
  Main: undefined;
  Quiz: { category: Category | "mixed"; quizLength: number };
  MockTest: undefined;
  Hazard: undefined;
  Result: {
    session: QuizSession;
    isMockTest?: boolean;
    mockResult?: MockTestResult;
  };
  Review: { session: QuizSession };
  TopicList: undefined;
  HighwayCodeSection: { sectionId: string; rule?: number };
  SignDetail: { signId: string };
  SignIn: undefined;
  PhoneAuth: undefined;
  Account: undefined;
  Paywall: { feature?: "mock" | "hazard" | "adfree" } | undefined;
  Legal: { doc?: "overview" | "privacy" | "terms" } | undefined;
};

export type BottomTabParamList = {
  HomeTab: undefined;
  LearnTab: undefined;
  MockTestTab: undefined;
  ProgressTab: undefined;
  SettingsTab: undefined;
};

export type LearnStackParamList = {
  LearnHome: undefined;
  HighwayCodeList: undefined;
  HighwayCodeSection: { sectionId: string; rule?: number };
  SignLibrary: { group?: SignGroup } | undefined;
  SignDetail: { signId: string };
};
