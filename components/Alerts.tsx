import { PoolWarning } from "@/lib/types";

interface AlertsProps {
  warnings: PoolWarning[];
}

export function Alerts({ warnings }: AlertsProps) {
  if (!warnings.length) {
    return null;
  }

  return (
    <section className="alerts" aria-live="polite">
      {warnings.map((warning, index) => (
        <p key={`${warning.type}-${index}`}>{warning.message}</p>
      ))}
    </section>
  );
}
