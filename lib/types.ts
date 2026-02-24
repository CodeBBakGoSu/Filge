export type CanonicalSubject =
  | "sw_design"
  | "sw_engineering"
  | "db_engineering"
  | "is_management"
  | "language_application";

export type QuizMode = "practice" | "exam" | "wrong-note";

export interface SubjectMeta {
  slug: CanonicalSubject;
  name: string;
  aliases: string[];
}

export interface QuestionChoice {
  no: number;
  text: string;
}

export interface RawQuestion {
  no: number;
  topic?: string;
  question: string;
  choices: QuestionChoice[];
  answer: {
    choiceNo: number;
  };
  explanation?: string;
}

export interface QuestionFile {
  meta?: {
    exam?: {
      year?: number;
      session?: number;
    };
    subject?: {
      code?: string;
    };
  };
  questions?: RawQuestion[];
}

export interface NormalizedQuestion {
  id: string;
  sourceFile: string;
  subject: CanonicalSubject;
  year: number;
  session: number;
  no: number;
  topic?: string;
  question: string;
  choices: QuestionChoice[];
  correctChoiceNo: number;
  explanation: string;
}

export interface PoolWarning {
  type: "missing_year" | "small_pool" | "meta_mismatch";
  message: string;
}

export interface SubjectPool {
  subject: CanonicalSubject;
  questions: NormalizedQuestion[];
  warnings: PoolWarning[];
}

export interface ProgressBySubject {
  practiceAnswered: number;
  practiceCorrect: number;
  examAttempts: number;
  examQuestions: number;
  examCorrect: number;
}

export type WrongNoteScope = "all" | "y2026";
