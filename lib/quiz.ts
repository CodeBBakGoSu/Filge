import { NormalizedQuestion } from "@/lib/types";

export interface RenderedChoice {
  id: string;
  originalNo: number;
  text: string;
}

export interface RenderedQuestion {
  id: string;
  prompt: string;
  topic?: string;
  explanation: string;
  correctChoiceNo: number;
  choices: RenderedChoice[];
  meta: {
    year: number;
    session: number;
    no: number;
  };
}

export function shuffle<T>(items: T[]): T[] {
  const copied = [...items];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

export function sampleWithoutReplacement<T>(items: T[], count: number): T[] {
  if (count >= items.length) {
    return shuffle(items);
  }
  return shuffle(items).slice(0, count);
}

export function buildRenderedQuestions(
  pool: NormalizedQuestion[],
  count = 20
): RenderedQuestion[] {
  return sampleWithoutReplacement(pool, count).map((q) => ({
    id: q.id,
    prompt: q.question,
    topic: q.topic,
    explanation: q.explanation,
    correctChoiceNo: q.correctChoiceNo,
    choices: shuffle(q.choices).map((choice) => ({
      id: `${q.id}-${choice.no}`,
      originalNo: choice.no,
      text: choice.text,
    })),
    meta: {
      year: q.year,
      session: q.session,
      no: q.no,
    },
  }));
}
