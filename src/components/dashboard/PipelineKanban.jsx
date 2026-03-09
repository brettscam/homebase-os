import { BRAND } from "@/styles/brand";
import { Icons } from "@/components/icons/Icons";
import { PIPELINE_DATA } from "@/data/mockData";

export default function PipelineKanban() {
  return (
    <div
      className="fs-hover-lift"
      style={{
        background: BRAND.white,
        borderRadius: 14,
        border: `1px solid ${BRAND.border}`,
        padding: "20px 22px",
        animation: "fs-fade-up 0.5s ease 0.3s both",
        flex: 2,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary }}>Pipeline</div>
          <div style={{ fontSize: 12, color: BRAND.textTertiary, fontWeight: 500, marginTop: 2 }}>
            28 opportunities · $1.31M total
          </div>
        </div>
        <button
          style={{
            background: BRAND.surface,
            border: `1px solid ${BRAND.border}`,
            borderRadius: 8,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            color: BRAND.textSecondary,
            fontFamily: "inherit",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          All Stages <Icons.ChevronDown size={14} />
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
        {PIPELINE_DATA.map((stage, si) => (
          <div
            key={stage.stage}
            style={{
              flex: 1,
              minWidth: 180,
              animation: `fs-scale-in 0.35s ease ${0.35 + si * 0.07}s both`,
            }}
          >
            {/* Stage header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
                padding: "0 2px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: BRAND.textPrimary }}>{stage.stage}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: stage.color,
                    background: stage.softColor,
                    borderRadius: 6,
                    padding: "1px 7px",
                  }}
                >
                  {stage.count}
                </span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.textTertiary }}>{stage.value}</span>
            </div>

            {/* Cards */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                background: BRAND.surface,
                borderRadius: 10,
                padding: 8,
                minHeight: 120,
              }}
            >
              {stage.items.map((item, ii) => (
                <div
                  key={ii}
                  className="fs-hover-lift"
                  style={{
                    background: BRAND.white,
                    borderRadius: 10,
                    padding: "12px 14px",
                    border: `1px solid ${BRAND.border}`,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary, marginBottom: 4 }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: 11, color: BRAND.textTertiary, fontWeight: 500, marginBottom: 8 }}>
                    {item.company}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: BRAND.textPrimary }}>{item.value}</span>
                    {item.days > 0 && (
                      <span style={{ fontSize: 10, color: BRAND.textTertiary, fontWeight: 500 }}>
                        {item.days}d ago
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
