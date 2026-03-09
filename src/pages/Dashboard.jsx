import { BRAND } from "@/styles/brand";
import { METRICS } from "@/data/mockData";
import MetricCard from "@/components/dashboard/MetricCard";
import PipelineKanban from "@/components/dashboard/PipelineKanban";
import TodayJobs from "@/components/dashboard/TodayJobs";
import MiniSchedule from "@/components/dashboard/MiniSchedule";

export default function Dashboard() {
  return (
    <div style={{ flex: 1, padding: 28, overflowY: "auto" }}>
      <div style={{ marginBottom: 24, animation: "fs-fade-up 0.3s ease both" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: BRAND.textPrimary, letterSpacing: -0.3 }}>
          Good morning, Smithers
        </div>
        <div style={{ fontSize: 13, color: BRAND.textTertiary, fontWeight: 500, marginTop: 4 }}>
          Monday, March 9, 2026 · 3 active crews today · 7 milestones this week
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        {METRICS.map((m, i) => (
          <MetricCard key={m.label} data={m} index={i} />
        ))}
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <PipelineKanban />
        <TodayJobs />
      </div>

      <MiniSchedule />
    </div>
  );
}
