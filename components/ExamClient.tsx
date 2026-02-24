"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Alerts } from "@/components/Alerts";
import { SUBJECT_MAP } from "@/lib/subjects";
import { buildRenderedQuestions, RenderedQuestion } from "@/lib/quiz";
import { recordExamAttempt } from "@/lib/storage";
import { CanonicalSubject, NormalizedQuestion, PoolWarning } from "@/lib/types";

interface ExamClientProps {
  subject: CanonicalSubject;
  pool: NormalizedQuestion[];
  warnings: PoolWarning[];
}

export default function ExamClient({ subject, pool, warnings }: ExamClientProps) {
  const [seed, setSeed] = useState(0);
  const [quiz, setQuiz] = useState<RenderedQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setQuiz(buildRenderedQuestions(pool, 20));
    setAnswers({});
    setSubmitted(false);
  }, [pool, seed]);

  function resetExam() {
    setSeed((prev) => prev + 1);
  }

  if (quiz === null) {
    return (
      <main id="main-content" className="container">
        <header className="page-header">
          <h1>{SUBJECT_MAP[subject].name} 시험</h1>
          <Link href="/">홈으로</Link>
        </header>
        <Alerts warnings={warnings} />
        <p>문제를 불러오는 중입니다…</p>
      </main>
    );
  }

  if (!quiz.length) {
    return (
      <main id="main-content" className="container">
        <header className="page-header">
          <h1>{SUBJECT_MAP[subject].name} 시험</h1>
          <Link href="/">홈으로</Link>
        </header>
        <Alerts warnings={warnings} />
        <p>출제 가능한 문제가 없습니다. JSON 파일을 확인해 주세요.</p>
      </main>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const correctCount = quiz.filter((question) => answers[question.id] === question.correctChoiceNo).length;

  function submitExam() {
    if (submitted || !quiz) {
      return;
    }
    setSubmitted(true);
    recordExamAttempt(subject, quiz.length, correctCount);
  }

  return (
    <main id="main-content" className="container">
      <header className="page-header">
        <div>
          <h1>{SUBJECT_MAP[subject].name} 시험</h1>
          <p className="muted">
            답안 작성: {answeredCount}/{quiz.length}
          </p>
        </div>
        <div className="button-row">
          <button type="button" className="button button-secondary" onClick={resetExam}>
            다시 출제
          </button>
          <Link className="button button-ghost" href="/">
            홈
          </Link>
        </div>
      </header>

      <Alerts warnings={warnings} />

      {submitted ? (
        <section className="result-box" aria-live="polite">
          <h2>점수: {Math.round((correctCount / quiz.length) * 100)}점</h2>
          <p>
            정답 {correctCount} / {quiz.length}
          </p>
        </section>
      ) : null}

      <section className="quiz-list">
        {quiz.map((question, idx) => {
          const selected = answers[question.id];

          return (
            <article key={question.id} className="quiz-card">
              <p className="badge">
                {idx + 1}. {question.meta.year}년 {question.meta.session}회 {question.meta.no}번
              </p>
              <h2>{question.prompt}</h2>
              <ul className="choice-list">
                {question.choices.map((choice) => {
                  const chosen = selected === choice.originalNo;
                  const correct = question.correctChoiceNo === choice.originalNo;
                  const cls = submitted
                    ? chosen && correct
                      ? "choice choice-correct"
                      : chosen
                      ? "choice choice-wrong"
                      : correct
                      ? "choice choice-correct"
                      : "choice"
                    : chosen
                    ? "choice choice-selected"
                    : "choice";

                  return (
                    <li key={choice.id}>
                      <button
                        type="button"
                        className={cls}
                        disabled={submitted}
                        onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: choice.originalNo }))}
                      >
                        {choice.text}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {submitted ? (
                <details className="details">
                  <summary>해설 보기</summary>
                  <p>{question.explanation}</p>
                </details>
              ) : null}
            </article>
          );
        })}
      </section>

      <footer className="sticky-submit">
        <button type="button" className="button button-danger" onClick={submitExam} disabled={submitted}>
          {submitted ? "제출 완료" : "제출"}
        </button>
      </footer>
    </main>
  );
}
