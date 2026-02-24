import HomeDashboard from "@/components/HomeDashboard";
import { getSubjectCounts } from "@/lib/questions";

export default function HomePage() {
  const counts = getSubjectCounts();
  return <HomeDashboard counts={counts} />;
}
