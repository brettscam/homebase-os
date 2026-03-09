import { BRAND } from "@/styles/brand";
import { SCHEDULE_PHASES, SCHEDULE_WEEKS } from "@/data/mockData";

export default function MiniSchedule() {
  return (
    <div
      className="fs-hover-lift"
      style={{
        background: BRAND.white,
        borderRadius: 14,
        border: `1px solid ${BRAND.border}`,
        padding: "20px 22px",
        animation: "fs-fade-up 0.5s ease 0.5s both",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary }}>Sunset Ridge Timeline</div>
          <div style={{ fontSize: 12, color: BRAND.textTertiary, fontWeight: 500, marginTop: 2 }}>
            JOB-2026-0038 · 12 week build · May 1 start
          </div>
        </div>
      </div>

      {/* Week headers */}
      <div style={{ display: "flex", marginLeft: 100, marginBottom: 6 }}>
        {SCHEDULE_WEEKS.map((w) => (
          <div
            key={w}
            style={{
              flex: 1,
              fontSize: 10,
              fontWeight: 600,
              color: BRAND.textTertiary,
              textAlign: "center",
            }}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Gantt rows */}
      <div style={{ position: "relative" }}>
        {SCHEDULE_PHASES.map((phase, i) => (
          <div
            key={phase.name}
            style={{
              display: "flex",
              alignItems: "center",
              height: 32,
              marginBottom: 4,
              animation: `fs-slide-in 0.35s ease ${0.55 + i * 0.04}s both`,
            }}
          >
            <div
              style={{
                width: 100,
                fontSize: 11,
                fontWeight: 600,
                color: BRAND.textSecondary,
                paddingRight: 12,
                textAlign: "right",
                flexShrink: 0,
              }}
            >
              {phase.name}
            </div>
            <div style={{ flex: 1, position: "relative", height: "100%" }}>
              <div
                style={{
                  position: "absolute",
                  left: `${phase.start}%`,
                  width: `${phase.width}%`,
                  top: 6,
                  height: 20,
                  borderRadius: 6,
                  background: phase.color + "22",
                  border: `1.5px solid ${phase.color}55`,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 8,
                  animation: `fs-bar-grow 0.6s ease ${0.6 + i * 0.05}s both`,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: i < 3 ? `${Math.min(100, ((35 - phase.start) / phase.width) * 100)}%` : "0%",
                    background: phase.color + "44",
                    borderRadius: "6px 0 0 6px",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
