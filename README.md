# Filge

정보처리기사 필기 문제를 과목별로 반복 학습하는 Next.js 웹앱입니다.

## 주요 기능
- 연습 모드: 문제/선택지 랜덤, 즉시 채점, 해설 표시
- 시험 모드: 마지막 제출 시 일괄 채점
- 오답노트: 연습에서 틀린 문제 저장/복습
- 데이터 저장: DB 없이 브라우저 localStorage 사용

## 실행 방법
```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속.

## 데이터 검증
```bash
npm run validate:questions
```

## 빌드
```bash
npm run build
```
