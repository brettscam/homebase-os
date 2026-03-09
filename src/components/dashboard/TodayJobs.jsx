import { BRAND } from "@/styles/brand";
import { Icons } from "@/components/icons/Icons";
import { TODAY_JOBS } from "@/data/mockData";

export default function TodayJobs() {
  return (
    <div
      className="fs-hover-lift"
      style={{
        background: BRAND.white,
        borderRadius: 14,
        border: `1px solid ${BRAND.border}`,
        padding: "20px 22px",
        animation: "fs-fade-up 0.5s ease 0.4s both",
        flex: 1,
        minWidth: 300,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary }}>Today's Jobs</div>
          <div style={{ fontSize: 12, color: BRAND.textTertiary, fontWeight: 500, marginTop: 2 }}>
            March 9, 2026
          </div>
        </div>
        <div
          className="fs-view-btn"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          <Icons.MoreH size={16} />
        </div>
      </div>

      {TODAY_JOBS.map((job, i) => (
        <div
          key={job.id}
          className="fs-hover-lift"
          style={{
            padding: "14px 16px",
            borderRadius: 12,
            border: `1px solid ${BRAND.border}`,
            marginBottom: i < TODAY_JOBS.length - 1 ? 10 : 0,
            cursor: "pointer",
            animation: `fs-slide-in 0.4s ease ${0.5 + i * 0.08}s both`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.blue }}>{job.id}</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: job.status === "On Track" ? BRAND.green : BRAND.red,
                background: job.status === "On Track" ? BRAND.greenSoft : BRAND.redSoft,
                padding: "2px 8px",
                borderRadius: 6,
              }}
            >
              {job.status}
            </span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.textPrimary, marginBottom: 3 }}>{job.name}</div>
          <div style={{ fontSize: 12, color: BRAND.textTertiary, fontWeight: 500, marginBottom: 10 }}>
            {job.site} · {job.crew}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                flex: 1,
                height: 6,
                background: BRAND.surface,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${job.progress}%`,
                  background:
                    job.status === "Delayed"
                      ? `linear-gradient(90deg, ${BRAND.red}, ${BRAND.amber})`
                      : `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.blueMuted})`,
                  borderRadius: 3,
                  animation: `fs-bar-grow 0.8s ease ${0.6 + i * 0.1}s both`,
                }}
              />
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: BRAND.textSecondary,
                minWidth: 30,
                textAlign: "right",
              }}
            >
              {job.progress}%
            </span>
          </div>
          <div style={{ fontSize: 11, color: BRAND.textTertiary, fontWeight: 500, marginTop: 6 }}>
            Phase: {job.phase}
          </div>
        </div>
      ))}
    </div>
  );
}
