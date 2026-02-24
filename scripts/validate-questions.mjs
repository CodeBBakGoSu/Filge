import fs from "node:fs";
import path from "node:path";

const QUESTION_DIR = path.join(process.cwd(), "question");
const FILE_PATTERN = /^(\d{2})-(\d+)-([a-z_]+)\.json$/;

const SUBJECT_ALIAS = {
  sw_design: "sw_design",
  sw_engineering: "sw_engineering",
  sw_dev: "sw_engineering",
  db_engineering: "db_engineering",
  db_build: "db_engineering",
  is_management: "is_management",
  is_mgmt: "is_management",
  language_application: "language_application",
  pl_use: "language_application",
};

function canonicalize(value) {
  if (!value) return null;
  return SUBJECT_ALIAS[String(value).toLowerCase()] ?? null;
}

function loadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function listQuestionFiles(rootDir) {
  const files = [];
  const stack = [rootDir];

  while (stack.length > 0) {
    const dir = stack.pop();
    if (!dir) continue;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith(".json")) {
        files.push(path.relative(rootDir, fullPath));
      }
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
}

function main() {
  if (!fs.existsSync(QUESTION_DIR)) {
    console.error("question 디렉토리가 없습니다.");
    process.exit(1);
  }

  const files = listQuestionFiles(QUESTION_DIR);
  let errorCount = 0;

  for (const file of files) {
    const baseName = path.basename(file);
    const matched = baseName.match(FILE_PATTERN);
    if (!matched) {
      console.error(`[INVALID_FILENAME] ${file}`);
      errorCount += 1;
      continue;
    }

    const year = Number(matched[1]) >= 90 ? 1900 + Number(matched[1]) : 2000 + Number(matched[1]);
    const session = Number(matched[2]);
    const subjectFromFile = canonicalize(matched[3]);

    const json = loadJson(path.join(QUESTION_DIR, file));
    if (!json) {
      console.error(`[PARSE_FAIL] ${file}`);
      errorCount += 1;
      continue;
    }

    const metaYear = json?.meta?.exam?.year;
    const metaSession = json?.meta?.exam?.session;
    const metaSubject = canonicalize(json?.meta?.subject?.code);

    if (metaYear !== undefined && metaYear !== year) {
      console.error(`[META_YEAR_MISMATCH] ${file}: meta=${metaYear} filename=${year}`);
      errorCount += 1;
    }

    if (metaSession !== undefined && metaSession !== session) {
      console.error(`[META_SESSION_MISMATCH] ${file}: meta=${metaSession} filename=${session}`);
      errorCount += 1;
    }

    if (!subjectFromFile) {
      console.error(`[SUBJECT_UNKNOWN_FILE] ${file}`);
      errorCount += 1;
    }

    if (metaSubject && subjectFromFile && metaSubject !== subjectFromFile) {
      console.error(
        `[SUBJECT_MISMATCH] ${file}: meta=${metaSubject} filename=${subjectFromFile}`
      );
      errorCount += 1;
    }

    const questions = json?.questions;
    if (!Array.isArray(questions)) {
      console.error(`[QUESTIONS_NOT_ARRAY] ${file}`);
      errorCount += 1;
      continue;
    }

    questions.forEach((q, idx) => {
      if (!q?.question || !Array.isArray(q?.choices) || typeof q?.answer?.choiceNo !== "number") {
        console.error(`[QUESTION_SHAPE_INVALID] ${file} #${idx + 1}`);
        errorCount += 1;
        return;
      }

      const choiceNos = new Set(q.choices.map((choice) => choice.no));
      if (!choiceNos.has(q.answer.choiceNo)) {
        console.error(`[ANSWER_NOT_IN_CHOICES] ${file} #${idx + 1}`);
        errorCount += 1;
      }
    });
  }

  if (errorCount > 0) {
    console.error(`검증 실패: ${errorCount}건`);
    process.exit(1);
  }

  console.log(`검증 성공: ${files.length}개 파일`);
}

main();
