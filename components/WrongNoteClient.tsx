"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SUBJECT_MAP } from "@/lib/subjects";
import { buildRenderedQuestions, RenderedQuestion } from "@/lib/quiz";
import {
  clearWrongNotes,
  getWrongNotes,
  recordPracticeAnswer,
  removeWrongNote,
} from "@/lib/storage";
import { CanonicalSubject, NormalizedQuestion, PoolWarning } from "@/lib/types";
import { Alerts } from "@/components/Alerts";

interface WrongNoteClientProps {
  subject: CanonicalSubject;
  pool: NormalizedQuestion[];
  warnings: PoolWarning[];
}

export default function WrongNoteClient({ subject, pool, warnings }: WrongNoteClientProps) {
  const [version, setVersion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [wrongNoteIds, setWrongNoteIds] = useState<string[] | null>(null);
  const [quiz, setQuiz] = useState<RenderedQuestion[] | null>(null);

  useEffect(() => {
    setWrongNoteIds(getWrongNotes(subject));
  }, [subject, version]);

  const wrongPool = useMemo(
    () => pool.filter((question) => (wrongNoteIds ?? []).includes(question.id)),
    [pool, wrongNoteIds]
  );

  useEffect(() => {
    if (wrongNoteIds === null) {
      setQuiz(null);
      return;
    }
    setQuiz(buildRenderedQuestions(wrongPool, wrongPool.length));
    setAnswers({});
  }, [wrongPool, wrongNoteIds]);

  if (quiz === null) {
    return (
      <main id="main-content" className="container">
        <header className="page-header">
          <h1>{SUBJECT_MAP[subject].name} 오답노트</h1>
          <Link href="/">홈으로</Link>
        </header>
        <Alerts warnings={warnings} />
        <p>오답노트를 불러오는 중입니다…</p>
      </main>
    );
  }

  if (!quiz.length) {
    return (
      <main id="main-content" className="container">
        <header className="page-header">
          <h1>{SUBJECT_MAP[subject].name} 오답노트</h1>
          <Link href="/">홈으로</Link>
        </header>
        <Alerts warnings={warnings} />
        <p>저장된 오답이 없습니다. 연습 모드에서 틀린 문제가 여기에 모입니다.</p>
      </main>
    );
  }

  return (
    <main id="main-content" className="container">
      <header className="page-header">
        <div>
          <h1>{SUBJECT_MAP[subject].name} 오답노트</h1>
          <p className="muted">{quiz.length}문항</p>
        </div>
        <div className="button-row">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => {
              const confirmed = window.confirm("이 과목의 오답노트를 모두 삭제할까요?");
              if (!confirmed) {
                return;
              }
              clearWrongNotes(subject);
              setVersion((prev) => prev + 1);
            }}
          >
            과목 전체 삭제
          </button>
          <Link className="button button-ghost" href="/">
            홈
          </Link>
        </div>
      </header>

      <Alerts warnings={warnings} />

      <section className="quiz-list">
        {quiz.map((question, idx) => {
          const selected = answers[question.id];
          const answered = selected !== undefined;
          const correct = selected === question.correctChoiceNo;

          return (
            <article key={question.id} className="quiz-card">
              <p className="badge">
                {idx + 1}. {question.meta.year}년 {question.meta.session}회 {question.meta.no}번
              </p>
              <h2>{question.prompt}</h2>
              <ul className="choice-list">
                {question.choices.map((choice) => {
                  const chosen = selected === choice.originalNo;
                  const right = question.correctChoiceNo === choice.originalNo;
                  const cls = chosen
                    ? chosen && right
                      ? "choice choice-correct"
                      : "choice choice-wrong"
                    : answered && right
                    ? "choice choice-correct"
                    : "choice";

                  return (
                    <li key={choice.id}>
                      <button
                        type="button"
                        className={cls}
                        disabled={answered}
                        onClick={() => {
                          const isCorrect = choice.originalNo === question.correctChoiceNo;
                          setAnswers((prev) => ({ ...prev, [question.id]: choice.originalNo }));
                          recordPracticeAnswer(subject, isCorrect);
                        }}
                      >
                        {choice.text}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {answered ? (
                <article className="explanation">
                  <p>{correct ? "정답입니다." : "오답입니다."}</p>
                  <p>{question.explanation}</p>
                </article>
              ) : null}

              <button
                type="button"
                className="button button-ghost"
                onClick={() => {
                  const confirmed = window.confirm("이 문제를 오답노트에서 삭제할까요?");
                  if (!confirmed) {
                    return;
                  }
                  removeWrongNote(subject, question.id);
                  setVersion((prev) => prev + 1);
                }}
              >
                이 문제 오답노트에서 삭제
              </button>
            </article>
          );
        })}
      </section>
    </main>
  );
}
