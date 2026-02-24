import { notFound } from "next/navigation";
import WrongNoteClient from "@/components/WrongNoteClient";
import { canonicalizeSubject } from "@/lib/subjects";
import { getSubjectPool } from "@/lib/questions";

interface PageProps {
  params: Promise<{
    subject: string;
  }>;
}

export default async function WrongNotePage({ params }: PageProps) {
  const { subject: subjectParam } = await params;
  const subject = canonicalizeSubject(subjectParam);
  if (!subject) {
    notFound();
  }

  const pool = getSubjectPool(subject);

  return <WrongNoteClient subject={subject} pool={pool.questions} warnings={pool.warnings} />;
}
