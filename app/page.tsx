import HomeDashboard from "@/components/HomeDashboard";
import { getSubjectCounts, getSubjectCountsForYears } from "@/lib/questions";

export default function HomePage() {
  const counts = getSubjectCounts();
  const counts2026 = getSubjectCountsForYears([2026]);
  return <HomeDashboard counts={counts} counts2026={counts2026} />;
}
