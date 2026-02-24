import { CanonicalSubject, SubjectMeta } from "@/lib/types";

export const SUBJECTS: SubjectMeta[] = [
  {
    slug: "sw_design",
    name: "소프트웨어 설계",
    aliases: ["SW_DESIGN", "sw_design"],
  },
  {
    slug: "sw_engineering",
    name: "소프트웨어 개발",
    aliases: ["SW_ENGINEERING", "SW_DEV", "sw_engineering", "sw_dev"],
  },
  {
    slug: "db_engineering",
    name: "데이터베이스 구축",
    aliases: ["DB_ENGINEERING", "DB_BUILD", "db_engineering", "db_build"],
  },
  {
    slug: "is_management",
    name: "정보시스템 구축관리",
    aliases: ["IS_MANAGEMENT", "IS_MGMT", "is_management", "is_mgmt"],
  },
  {
    slug: "language_application",
    name: "프로그래밍 언어 활용",
    aliases: [
      "LANGUAGE_APPLICATION",
      "PL_USE",
      "language_application",
      "pl_use",
    ],
  },
];

export const SUBJECT_MAP: Record<CanonicalSubject, SubjectMeta> = SUBJECTS.reduce(
  (acc, subject) => {
    acc[subject.slug] = subject;
    return acc;
  },
  {} as Record<CanonicalSubject, SubjectMeta>
);

const aliasMap = new Map<string, CanonicalSubject>();
for (const subject of SUBJECTS) {
  aliasMap.set(subject.slug.toLowerCase(), subject.slug);
  for (const alias of subject.aliases) {
    aliasMap.set(alias.toLowerCase(), subject.slug);
  }
}

export function canonicalizeSubject(input: string | undefined): CanonicalSubject | null {
  if (!input) {
    return null;
  }
  return aliasMap.get(input.toLowerCase()) ?? null;
}
