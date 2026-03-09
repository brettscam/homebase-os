import { useState } from "react";
import { BRAND } from "@/styles/brand";
import { Icons } from "@/components/icons/Icons";

const VIEWS = [
  { icon: Icons.Dashboard, label: "Dashboard" },
  { icon: Icons.Grid, label: "Grid" },
  { icon: Icons.Kanban, label: "Kanban" },
  { icon: Icons.Calendar, label: "Calendar" },
  { icon: Icons.Timeline, label: "Timeline" },
];

export default function ViewSwitcher() {
  const [active, setActive] = useState(0);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: BRAND.surface,
        borderRadius: 10,
        padding: 3,
        border: `1px solid ${BRAND.border}`,
      }}
    >
      {VIEWS.map((v, i) => (
        <div
          key={v.label}
          className="fs-view-btn"
          onClick={() => setActive(i)}
          title={v.label}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 30,
            borderRadius: 8,
            cursor: "pointer",
            background: active === i ? BRAND.white : "transparent",
            boxShadow: active === i ? `0 1px 3px ${BRAND.shadow}` : "none",
          }}
        >
          <v.icon size={16} color={active === i ? BRAND.blue : BRAND.textTertiary} />
        </div>
      ))}
    </div>
  );
}
