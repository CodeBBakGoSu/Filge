import type { ReactNode } from "react";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "필기 반복 훈련",
  description: "정보처리기사 문제 반복 풀이 웹앱",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <style>{`
          body{margin:0;background:#f4f7f2;color:#1d2a22;font-family:"Pretendard Variable","Noto Sans KR","Apple SD Gothic Neo",sans-serif}
          a{color:inherit}
          .container{max-width:860px;margin:0 auto;padding:.9rem}
          .hero,.subject-card,.quiz-card,.result-box,.danger-zone,.alerts{background:#fff;border:1px solid #d8e0da;border-radius:14px;padding:1rem}
          .subject-grid,.quiz-list{display:grid;grid-template-columns:1fr;gap:.8rem;margin-top:.8rem}
          .button-row{display:flex;flex-wrap:wrap;gap:.5rem}
          .button{display:inline-flex;align-items:center;justify-content:center;border:1px solid transparent;border-radius:10px;background:#1d7a56;color:#fff;padding:.7rem .9rem;font-weight:700;text-decoration:none;min-height:44px}
          .button-secondary{background:#104734}
          .button-ghost{background:#eef4ef;color:#1d2a22;border-color:#d8e0da}
          .button-danger{background:#9f1b1b}
          .skip-link{position:absolute;left:.75rem;top:-3rem}
          .skip-link:focus-visible{top:.75rem}
        `}</style>
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          본문으로 건너뛰기
        </a>
        {children}
      </body>
    </html>
  );
}
