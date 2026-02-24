"use client";

import Link from "next/link";
import { SUBJECTS } from "@/lib/subjects";
import { CanonicalSubject } from "@/lib/types";
import { clearAllLocalData } from "@/lib/storage";

interface HomeDashboardProps {
  counts: Record<CanonicalSubject, number>;
}

export default function HomeDashboard({ counts }: HomeDashboardProps) {
  return (
    <main id="main-content" className="container">
      <header className="hero">
        <h1>필기 반복 훈련</h1>
        <p>과목별로 연습, 시험, 오답노트를 바로 시작할 수 있습니다.</p>
      </header>

      <section className="subject-grid">
        {SUBJECTS.map((subject) => (
          <article key={subject.slug} className="subject-card">
            <h2>{subject.name}</h2>
            <p className="muted">출제 풀: {counts[subject.slug]}문항</p>
            <div className="button-row">
              <Link className="button" href={`/practice/${subject.slug}`}>
                연습 시작
              </Link>
              <Link className="button button-secondary" href={`/exam/${subject.slug}`}>
                시험 시작
              </Link>
              <Link className="button button-ghost" href={`/wrong-note/${subject.slug}`}>
                오답노트
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="danger-zone">
        <h3>학습 데이터 초기화</h3>
        <p className="muted">로컬 저장소 데이터(진행 기록/오답노트)를 현재 기기에서 삭제합니다.</p>
        <button
          className="button button-danger"
          type="button"
          onClick={() => {
            const confirmed = window.confirm("로컬 학습 데이터를 정말 모두 삭제할까요?");
            if (!confirmed) {
              return;
            }
            clearAllLocalData();
            window.alert("로컬 학습 데이터가 초기화되었습니다.");
          }}
        >
          전체 초기화
        </button>
      </section>
    </main>
  );
}
