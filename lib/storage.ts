import { CanonicalSubject, ProgressBySubject } from "@/lib/types";

const WRONG_NOTE_KEY = "filge.wrongnote.v1";
const PROGRESS_KEY = "filge.progress.v1";

type WrongNoteStore = Partial<Record<CanonicalSubject, string[]>>;
type ProgressStore = Partial<Record<CanonicalSubject, ProgressBySubject>>;

const EMPTY_PROGRESS: ProgressBySubject = {
  practiceAnswered: 0,
  practiceCorrect: 0,
  examAttempts: 0,
  examQuestions: 0,
  examCorrect: 0,
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getSafeStorage(): Storage | null {
  if (!isBrowser()) {
    return null;
  }

  const storageCandidate = (window as { localStorage?: unknown }).localStorage;
  if (
    !storageCandidate ||
    typeof storageCandidate !== "object" ||
    typeof (storageCandidate as Storage).getItem !== "function" ||
    typeof (storageCandidate as Storage).setItem !== "function" ||
    typeof (storageCandidate as Storage).removeItem !== "function"
  ) {
    return null;
  }

  return storageCandidate as Storage;
}

function loadJson<T>(key: string, fallback: T): T {
  const storage = getSafeStorage();
  if (!storage) {
    return fallback;
  }

  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, value: T): void {
  const storage = getSafeStorage();
  if (!storage) {
    return;
  }

  storage.setItem(key, JSON.stringify(value));
}

function getProgressForSubject(store: ProgressStore, subject: CanonicalSubject): ProgressBySubject {
  return store[subject] ?? { ...EMPTY_PROGRESS };
}

export function addWrongNote(subject: CanonicalSubject, questionId: string): void {
  const store = loadJson<WrongNoteStore>(WRONG_NOTE_KEY, {});
  const current = new Set(store[subject] ?? []);
  current.add(questionId);
  store[subject] = Array.from(current);
  saveJson(WRONG_NOTE_KEY, store);
}

export function getWrongNotes(subject: CanonicalSubject): string[] {
  const store = loadJson<WrongNoteStore>(WRONG_NOTE_KEY, {});
  return store[subject] ?? [];
}

export function removeWrongNote(subject: CanonicalSubject, questionId: string): void {
  const store = loadJson<WrongNoteStore>(WRONG_NOTE_KEY, {});
  store[subject] = (store[subject] ?? []).filter((id) => id !== questionId);
  saveJson(WRONG_NOTE_KEY, store);
}

export function clearWrongNotes(subject: CanonicalSubject): void {
  const store = loadJson<WrongNoteStore>(WRONG_NOTE_KEY, {});
  delete store[subject];
  saveJson(WRONG_NOTE_KEY, store);
}

export function clearAllLocalData(): void {
  const storage = getSafeStorage();
  if (!storage) {
    return;
  }
  storage.removeItem(WRONG_NOTE_KEY);
  storage.removeItem(PROGRESS_KEY);
}

export function recordPracticeAnswer(subject: CanonicalSubject, isCorrect: boolean): void {
  const store = loadJson<ProgressStore>(PROGRESS_KEY, {});
  const progress = getProgressForSubject(store, subject);
  progress.practiceAnswered += 1;
  if (isCorrect) {
    progress.practiceCorrect += 1;
  }
  store[subject] = progress;
  saveJson(PROGRESS_KEY, store);
}

export function recordExamAttempt(subject: CanonicalSubject, total: number, correct: number): void {
  const store = loadJson<ProgressStore>(PROGRESS_KEY, {});
  const progress = getProgressForSubject(store, subject);
  progress.examAttempts += 1;
  progress.examQuestions += total;
  progress.examCorrect += correct;
  store[subject] = progress;
  saveJson(PROGRESS_KEY, store);
}

export function getProgress(subject: CanonicalSubject): ProgressBySubject {
  const store = loadJson<ProgressStore>(PROGRESS_KEY, {});
  return getProgressForSubject(store, subject);
}
