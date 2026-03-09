import { BRAND } from "@/styles/brand";
import { Icons } from "@/components/icons/Icons";
import ViewSwitcher from "./ViewSwitcher";

export default function TopBar() {
  return (
    <div
      style={{
        height: 60,
        background: BRAND.white,
        borderBottom: `1px solid ${BRAND.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: BRAND.surface,
            borderRadius: 10,
            padding: "8px 16px",
            width: 320,
            border: `1px solid ${BRAND.border}`,
          }}
        >
          <Icons.Search size={16} color={BRAND.textTertiary} />
          <input
            placeholder="Search jobs, contacts, sites..."
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 13,
              fontFamily: "inherit",
              color: BRAND.textPrimary,
              width: "100%",
              fontWeight: 500,
            }}
          />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <ViewSwitcher />
        <div style={{ width: 1, height: 24, background: BRAND.border, margin: "0 10px" }} />
        <div
          className="fs-view-btn"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <Icons.Bell size={20} color={BRAND.textSecondary} />
          <div
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: BRAND.red,
              border: `2px solid ${BRAND.white}`,
            }}
          />
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: BRAND.blue,
            color: BRAND.white,
            border: "none",
            borderRadius: 10,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: "pointer",
            marginLeft: 8,
            boxShadow: `0 1px 3px ${BRAND.shadow}`,
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = BRAND.blueHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = BRAND.blue)}
        >
          <Icons.Plus size={16} color={BRAND.white} />
          New Job
        </button>
      </div>
    </div>
  );
}
