import fs from "node:fs";
import path from "node:path";
import { canonicalizeSubject, SUBJECT_MAP, SUBJECTS } from "@/lib/subjects";
import {
  CanonicalSubject,
  NormalizedQuestion,
  PoolWarning,
  QuestionFile,
  RawQuestion,
  SubjectPool,
} from "@/lib/types";

const QUESTION_DIR = path.join(process.cwd(), "question");
const FILE_PATTERN = /^(\d{2})-(\d+)-([a-z_]+)\.json$/;

interface ParsedFilename {
  year: number;
  session: number;
  subjectFromFilename: CanonicalSubject | null;
}

function parseFilename(fileName: string): ParsedFilename | null {
  const baseName = path.basename(fileName);
  const matched = baseName.match(FILE_PATTERN);
  if (!matched) {
    return null;
  }
  const yy = Number(matched[1]);
  const session = Number(matched[2]);
  const rawSubject = matched[3];

  return {
    year: yy >= 90 ? 1900 + yy : 2000 + yy,
    session,
    subjectFromFilename: canonicalizeSubject(rawSubject),
  };
}

function safeReadJson(filePath: string): QuestionFile | null {
  try {
    const text = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(text) as QuestionFile;
  } catch {
    return null;
  }
}

function normalizeQuestion(
  raw: RawQuestion,
  fileName: string,
  subject: CanonicalSubject,
  year: number,
  session: number
): NormalizedQuestion | null {
  if (!raw?.question || !Array.isArray(raw.choices) || !raw.answer?.choiceNo) {
    return null;
  }

  return {
    id: `${subject}-${year}-${session}-${raw.no}`,
    sourceFile: fileName,
    subject,
    year,
    session,
    no: raw.no,
    topic: raw.topic,
    question: raw.question,
    choices: raw.choices,
    correctChoiceNo: raw.answer.choiceNo,
    explanation: raw.explanation ?? "해설이 제공되지 않은 문항입니다.",
  };
}

export function listQuestionFiles(): string[] {
  if (!fs.existsSync(QUESTION_DIR)) {
    return [];
  }
  const files: string[] = [];
  const stack = [QUESTION_DIR];

  while (stack.length > 0) {
    const dir = stack.pop();
    if (!dir) {
      continue;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith(".json")) {
        files.push(path.relative(QUESTION_DIR, fullPath));
      }
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
}

export function getSubjectPool(
  subject: CanonicalSubject,
  years: number[] = [2024, 2025],
  sessions: number[] = [1, 2, 3]
): SubjectPool {
  const warnings: PoolWarning[] = [];
  const files = listQuestionFiles();
  const questions: NormalizedQuestion[] = [];

  const expectedPairs = new Set<string>();
  for (const year of years) {
    for (const session of sessions) {
      expectedPairs.add(`${year}-${session}`);
    }
  }

  const observedPairs = new Set<string>();

  for (const fileName of files) {
    const parsedFilename = parseFilename(fileName);
    if (!parsedFilename) {
      continue;
    }

    const filePath = path.join(QUESTION_DIR, fileName);
    const json = safeReadJson(filePath);
    if (!json) {
      continue;
    }

    const subjectFromMeta = canonicalizeSubject(json.meta?.subject?.code);
    const resolvedSubject = parsedFilename.subjectFromFilename ?? subjectFromMeta;

    if (!resolvedSubject || resolvedSubject !== subject) {
      continue;
    }

    const year = parsedFilename.year;
    const session = parsedFilename.session;

    if (!years.includes(year) || !sessions.includes(session)) {
      continue;
    }

    observedPairs.add(`${year}-${session}`);

    const metaYear = json.meta?.exam?.year;
    const metaSession = json.meta?.exam?.session;
    if (metaYear !== undefined && metaSession !== undefined) {
      if (metaYear !== year || metaSession !== session) {
        warnings.push({
          type: "meta_mismatch",
          message: `${fileName}: meta(${metaYear}-${metaSession})와 파일명(${year}-${session}) 불일치. 파일명 기준으로 처리함.`,
        });
      }
    }

    for (const raw of json.questions ?? []) {
      const normalized = normalizeQuestion(raw, fileName, subject, year, session);
      if (normalized) {
        questions.push(normalized);
      }
    }
  }

  for (const pair of expectedPairs) {
    if (!observedPairs.has(pair)) {
      const [year, session] = pair.split("-");
      warnings.push({
        type: "missing_year",
        message: `${SUBJECT_MAP[subject].name}: ${year}년 ${session}회차 파일이 없어 가능한 데이터만 사용합니다.`,
      });
    }
  }

  if (questions.length < 20) {
    warnings.push({
      type: "small_pool",
      message: `${SUBJECT_MAP[subject].name}: 문제 풀이 풀 크기가 ${questions.length}문항이라 시험이 20문항보다 적게 출제될 수 있습니다.`,
    });
  }

  return {
    subject,
    questions,
    warnings,
  };
}

export function getSubjectCounts(): Record<CanonicalSubject, number> {
  const result = {} as Record<CanonicalSubject, number>;

  for (const subject of SUBJECTS) {
    result[subject.slug] = getSubjectPool(subject.slug).questions.length;
  }

  return result;
}
