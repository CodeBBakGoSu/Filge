"use client";

import Link from "next/link";
import { type PointerEvent, useEffect, useState } from "react";
import { SUBJECT_MAP } from "@/lib/subjects";
import { buildRenderedQuestions, RenderedQuestion } from "@/lib/quiz";
import { addWrongNote, recordPracticeAnswer } from "@/lib/storage";
import { CanonicalSubject, NormalizedQuestion, PoolWarning, WrongNoteScope } from "@/lib/types";
import { Alerts } from "@/components/Alerts";

interface PracticeClientProps {
  subject: CanonicalSubject;
  pool: NormalizedQuestion[];
  warnings: PoolWarning[];
  wrongNoteScope?: WrongNoteScope;
  headingSuffix?: string;
}

export default function PracticeClient({
  subject,
  pool,
  warnings,
  wrongNoteScope = "all",
  headingSuffix = "",
}: PracticeClientProps) {
  const [seed, setSeed] = useState(0);
  const [quiz, setQuiz] = useState<RenderedQuestion[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    const nextQuiz = buildRenderedQuestions(pool, 20);
    setQuiz(nextQuiz);
    setCurrentIndex(0);
    setAnswers({});
  }, [pool, seed]);

  function regenerate() {
    setSeed((prev) => prev + 1);
  }

  if (quiz === null) {
    return (
      <main id="main-content" className="container">
        <header className="page-header">
          <h1>
            {SUBJECT_MAP[subject].name} 연습{headingSuffix}
          </h1>
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
          <h1>
            {SUBJECT_MAP[subject].name} 연습{headingSuffix}
          </h1>
          <Link href="/">홈으로</Link>
        </header>
        <Alerts warnings={warnings} />
        <p>출제 가능한 문제가 없습니다. JSON 파일을 확인해 주세요.</p>
      </main>
    );
  }

  const current = quiz[currentIndex];
  const correctCount = quiz.filter((q) => {
    const selected = answers[q.id];
    return selected !== undefined && selected === q.correctChoiceNo;
  }).length;

  function selectAnswer(question: RenderedQuestion, choiceNo: number) {
    if (answers[question.id] !== undefined) {
      return;
    }

    const isCorrect = choiceNo === question.correctChoiceNo;
    setAnswers((prev) => ({ ...prev, [question.id]: choiceNo }));
    recordPracticeAnswer(subject, isCorrect);
    if (!isCorrect) {
      addWrongNote(subject, question.id, wrongNoteScope);
    }
  }

  function advanceByTap(event: PointerEvent<HTMLElement>) {
    if (!quiz) {
      return;
    }
    const target = event.target as HTMLElement;
    if (target.closest("button, a, summary")) {
      return;
    }
    const selectedChoice = answers[current.id];
    const answered = selectedChoice !== undefined;
    if (!answered || currentIndex >= quiz.length - 1) {
      return;
    }
    setCurrentIndex((idx) => Math.min(quiz.length - 1, idx + 1));
  }

  const selected = answers[current.id];
  const isAnswered = selected !== undefined;
  const isCorrect = selected === current.correctChoiceNo;

  return (
    <main id="main-content" className="container" onPointerUp={advanceByTap}>
      <header className="page-header">
        <div>
          <h1>
            {SUBJECT_MAP[subject].name} 연습{headingSuffix}
          </h1>
          <p className="muted">
            {currentIndex + 1}/{quiz.length} | 정답 {correctCount}
          </p>
        </div>
        <div className="button-row">
          <button type="button" className="button button-secondary" onClick={regenerate}>
            새 문제 세트
          </button>
          <Link className="button button-ghost" href="/">
            홈
          </Link>
        </div>
      </header>

      <Alerts warnings={warnings} />

      <section className="quiz-card">
        <p className="badge">
          {current.meta.year}년 {current.meta.session}회 {current.meta.no}번
        </p>
        <h2>{current.prompt}</h2>
        <ul className="choice-list">
          {current.choices.map((choice) => {
            const chosen = selected === choice.originalNo;
            const correct = current.correctChoiceNo === choice.originalNo;
            const cls = chosen
              ? chosen && correct
                ? "choice choice-correct"
                : "choice choice-wrong"
              : isAnswered && correct
              ? "choice choice-correct"
              : "choice";

            return (
              <li key={choice.id}>
                <button
                  type="button"
                  className={cls}
                  onClick={() => selectAnswer(current, choice.originalNo)}
                >
                  {choice.text}
                </button>
              </li>
            );
          })}
        </ul>

        {isAnswered ? (
          <article className="explanation" aria-live="polite">
            <p>{isCorrect ? "정답입니다." : "오답입니다."}</p>
            <p>{current.explanation}</p>
            {currentIndex < quiz.length - 1 ? <p className="muted">화면을 탭하면 다음 문제로 이동합니다.</p> : null}
          </article>
        ) : null}
      </section>

      <footer className="footer-nav">
        <button
          type="button"
          className="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
        >
          이전
        </button>
        <button
          type="button"
          className="button"
          disabled={currentIndex === quiz.length - 1}
          onClick={() => setCurrentIndex((idx) => Math.min(quiz.length - 1, idx + 1))}
        >
          다음
        </button>
      </footer>
    </main>
  );
}
