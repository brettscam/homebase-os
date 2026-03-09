import { BRAND } from "@/styles/brand";
import { Icons } from "@/components/icons/Icons";

export default function MetricCard({ data, index }) {
  return (
    <div
      className="fs-hover-lift"
      style={{
        background: BRAND.white,
        borderRadius: 14,
        padding: "20px 22px",
        border: `1px solid ${BRAND.border}`,
        flex: 1,
        minWidth: 0,
        animation: `fs-fade-up 0.4s ease ${index * 0.08}s both`,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: BRAND.textTertiary,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 8,
        }}
      >
        {data.label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: BRAND.textPrimary, letterSpacing: -0.5 }}>
          {data.value}
        </span>
        {data.change && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              fontSize: 12,
              fontWeight: 600,
              color: data.trend === "up" ? BRAND.green : BRAND.textTertiary,
            }}
          >
            {data.trend === "up" && <Icons.ArrowUp size={12} color={BRAND.green} />}
            {data.change}
          </span>
        )}
        {data.sub && (
          <span style={{ fontSize: 12, color: BRAND.textTertiary, fontWeight: 500 }}>{data.sub}</span>
        )}
      </div>
    </div>
  );
}
