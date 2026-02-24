import { notFound } from "next/navigation";
import PracticeClient from "@/components/PracticeClient";
import { canonicalizeSubject } from "@/lib/subjects";
import { getSubjectPool } from "@/lib/questions";

interface PageProps {
  params: Promise<{
    subject: string;
  }>;
}

export default async function Practice2026Page({ params }: PageProps) {
  const { subject: subjectParam } = await params;
  const subject = canonicalizeSubject(subjectParam);
  if (!subject) {
    notFound();
  }

  const pool = getSubjectPool(subject, [2026], [1, 2, 3]);

  return (
    <PracticeClient
      subject={subject}
      pool={pool.questions}
      warnings={pool.warnings}
      wrongNoteScope="y2026"
      headingSuffix=" (2026 전용)"
    />
  );
}
