import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BRAND } from "@/styles/brand";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import Dashboard from "@/pages/Dashboard";

function AppLayout() {
  const [activeNav, setActiveNav] = useState(0);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: BRAND.surface,
        fontFamily: "'Nunito', system-ui, -apple-system, sans-serif",
      }}
    >
      <Sidebar activeNav={activeNav} onNav={setActiveNav} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopBar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pipeline" element={<PlaceholderPage title="Pipeline" />} />
          <Route path="/jobs" element={<PlaceholderPage title="Jobs" />} />
          <Route path="/contacts" element={<PlaceholderPage title="Contacts" />} />
          <Route path="/schedule" element={<PlaceholderPage title="Schedule" />} />
          <Route path="/timeline" element={<PlaceholderPage title="Timeline" />} />
        </Routes>
      </div>
    </div>
  );
}

function PlaceholderPage({ title }) {
  return (
    <div style={{ flex: 1, padding: 28, animation: "fs-fade-up 0.3s ease both" }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: BRAND.textPrimary, letterSpacing: -0.3 }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: BRAND.textTertiary, fontWeight: 500, marginTop: 4 }}>
        Coming soon
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
