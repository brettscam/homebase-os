import { BRAND } from "@/styles/brand";
import { Icons } from "@/components/icons/Icons";
import { NAV_ITEMS } from "@/data/mockData";

const NAV_ICONS = [Icons.Dashboard, Icons.Pipeline, Icons.Jobs, Icons.Contacts, Icons.Calendar, Icons.Timeline];

export default function Sidebar({ activeNav, onNav }) {
  return (
    <div
      style={{
        width: 232,
        minHeight: "100vh",
        background: BRAND.white,
        borderRight: `1px solid ${BRAND.border}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${BRAND.blue} 0%, #6EA8FE 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icons.Hardhat size={18} color={BRAND.white} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 18, color: BRAND.textPrimary, letterSpacing: -0.3 }}>
          FieldStack
        </span>
      </div>

      {/* Nav */}
      <nav style={{ padding: "4px 10px", flex: 1 }}>
        {NAV_ITEMS.map((item, i) => {
          const isActive = activeNav === i;
          const Icon = NAV_ICONS[i];
          return (
            <div
              key={item.label}
              className="fs-nav-item"
              onClick={() => onNav(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 10,
                cursor: "pointer",
                background: isActive ? BRAND.blueSoft : "transparent",
                marginBottom: 2,
                animation: `fs-slide-in 0.3s ease ${i * 0.04}s both`,
              }}
            >
              <Icon size={20} color={isActive ? BRAND.blue : BRAND.textSecondary} />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? BRAND.blue : BRAND.textSecondary,
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "12px 10px 16px", borderTop: `1px solid ${BRAND.border}` }}>
        <div
          className="fs-nav-item"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 12px",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          <Icons.Settings size={20} color={BRAND.textSecondary} />
          <span style={{ fontSize: 14, fontWeight: 500, color: BRAND.textSecondary }}>Settings</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 12px 4px" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${BRAND.green} 0%, ${BRAND.blue} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: BRAND.white,
            }}
          >
            SM
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary }}>Smithers</div>
            <div style={{ fontSize: 11, color: BRAND.textTertiary }}>Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
}
