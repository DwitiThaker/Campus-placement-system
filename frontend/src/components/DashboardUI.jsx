import { motion, AnimatePresence } from "framer-motion";
// import { createPortal } from "react-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { getMyAIData } from "../api/extractionAPI";

const LS_PLACED = "portal_placed_students";
const LS_JOBS = "portal_jobs";

const D = {
  pageBg: (dm) =>
    dm
      ? "linear-gradient(160deg,#0a0f1e 0%,#0d1f1a 50%,#091510 100%)"
      : "linear-gradient(160deg,#eef2ff 0%,#f0fdf4 60%,#ecfdf5 100%)",
  cardBg: (dm) => (dm ? "rgba(10,31,26,0.85)" : "#ffffff"),
  inputBg: (dm) => (dm ? "rgba(10,31,26,0.7)" : "#ffffff"),
  textPri: (dm) => (dm ? "#d1fae5" : "#064e3b"),
  textSec: (dm) => (dm ? "#6ee7b7" : "#6b7280"),
  textMuted: (dm) => (dm ? "#4a7c6e" : "#9ca3af"),
  border: (dm) => (dm ? "rgba(16,185,129,0.2)" : "#d1fae5"),
  border2: (dm) => (dm ? "rgba(255,255,255,0.06)" : "#f0fdf4"),
  headerBg: (dm) =>
    dm
      ? "linear-gradient(135deg,#1e1b4b 0%,#065f46 100%)"
      : "linear-gradient(135deg,#4f46e5 0%,#10b981 100%)",
};

function parseApiError(detail, fallback = "An error occurred") {
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => e.msg || JSON.stringify(e)).join(", ");
  if (typeof detail === "object")
    return detail.msg || detail.message || JSON.stringify(detail);
  return String(detail);
}

const lsGet = (key, def) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch {
    return def;
  }
};

const Icon = ({ d, size = 18, color = "currentColor", strokeWidth = 1.7 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const Icons = {
  sun: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z",
  moon: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  briefcase:
    "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2",
  calendar: "M3 9h18M3 15h18M9 3v18M15 3v18M3 3h18v18H3z",
  mic: "M12 2a3 3 0 013 3v7a3 3 0 01-6 0V5a3 3 0 013-3zM19 10v2a7 7 0 01-14 0v-2M12 19v3M8 22h8",
  trophy:
    "M6 9H4a2 2 0 00-2 2v1a4 4 0 004 4h1m8-7h2a2 2 0 012 2v1a4 4 0 01-4 4h-1M9 21h6M12 17v4M8 3h8l-1 6H9L8 3z",
  close: "M18 6L6 18M6 6l12 12",
  lightning: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
  mapPin:
    "M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z M12 10m-3 0a3 3 0 106 0 3 3 0 10-6 0",
  dollar: "M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  camera:
    "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  check: "M20 6L9 17l-5-5",
  clock: "M12 22a10 10 0 110-20 10 10 0 010 20zM12 6v6l4 2",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  chartBar: "M18 20V10M12 20V4M6 20v-6",
  plus: "M12 5v14M5 12h14",
  alumni:
    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  jobs: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  refresh:
    "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  warning:
    "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  info: "M12 22a10 10 0 110-20 10 10 0 010 20zM12 8h.01M12 12v4",
};

// ── NAV items — ATS Checker removed ──────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard", id: "section-dashboard", icon: Icons.chartBar },
  { label: "Job Listings", id: "section-jobs", icon: Icons.jobs },
  {
    label: "My Applications",
    id: "section-applications",
    icon: Icons.briefcase,
  },
  { label: "My Events", id: "section-interviews", icon: Icons.mic },
  { label: "Placed Students", id: "section-placed", icon: Icons.trophy },
  { label: "Announcements", id: "section-announcements", icon: Icons.bell }
];

const APP_STATUS = {
  applied: {
    label: "⏳ Applied",
    bg: "#dbeafe",
    color: "#1e40af",
    dot: "#3b82f6",
  },
  shortlisted: {
    label: "✅ Shortlisted",
    bg: "#d1fae5",
    color: "#065f46",
    dot: "#10b981",
  },
  test_scheduled: {
    label: "Test Scheduled",
    bg: "#fef3c7",
    color: "#92400e",
    dot: "#f59e0b",
  },
  interviewed: {
    label: "Interviewed",
    bg: "#fef3c7",
    color: "#92400e",
    dot: "#f59e0b",
  },
  offered: {
    label: "Offer Received",
    bg: "#dcfce7",
    color: "#14532d",
    dot: "#22c55e",
  },
  accepted: {
    label: "Accepted",
    bg: "#dcfce7",
    color: "#14532d",
    dot: "#22c55e",
  },
  rejected: {
    label: "❌ Rejected",
    bg: "#f3f4f6",
    color: "#6b7280",
    dot: "#9ca3af",
  },
};

function Card({ children, darkMode, style = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: D.cardBg(darkMode),
        borderRadius: 18,
        padding: "20px 22px",
        border: `1px solid ${D.border(darkMode)}`,
        boxShadow: darkMode
          ? "0 2px 20px rgba(0,0,0,0.4)"
          : "0 2px 16px rgba(99,102,241,0.06)",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({ text, darkMode }) {
  return (
    <motion.h2
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        fontSize: 17,
        fontWeight: 700,
        color: darkMode ? "#6ee7b7" : "#064e3b",
        margin: "28px 0 12px",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 4,
          height: 18,
          background: "linear-gradient(180deg,#6366f1,#10b981)",
          borderRadius: 4,
        }}
      />
      {text}
    </motion.h2>
  );
}

function Spinner({ color = "#10b981" }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        border: `3px solid ${color}30`,
        borderTopColor: color,
        margin: "0 auto",
      }}
    />
  );
}

function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const bg =
    type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#6366f1";
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: -20, x: "-50%" }}
      style={{
        position: "fixed",
        top: 20,
        left: "50%",
        background: bg,
        color: "#fff",
        padding: "12px 24px",
        borderRadius: 14,
        fontWeight: 600,
        fontSize: 14,
        zIndex: 9999,
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Icon
        d={type === "success" ? Icons.check : Icons.warning}
        size={16}
        color="#fff"
        strokeWidth={2.5}
      />
      {String(message)}
    </motion.div>
  );
}

function StatCard({ title, value, iconPath, color, darkMode, delay = 0 }) {
  const pal = {
    indigo: {
      l: { bg: "#eef2ff", ac: "#6366f1", tx: "#3730a3" },
      d: { bg: "#1e1b4b", ac: "#818cf8", tx: "#c7d2fe" },
    },
    sky: {
      l: { bg: "#e0f2fe", ac: "#0ea5e9", tx: "#0369a1" },
      d: { bg: "#0c2340", ac: "#38bdf8", tx: "#7dd3fc" },
    },
    emerald: {
      l: { bg: "#d1fae5", ac: "#10b981", tx: "#065f46" },
      d: { bg: "#064e3b", ac: "#34d399", tx: "#6ee7b7" },
    },
    amber: {
      l: { bg: "#fef3c7", ac: "#f59e0b", tx: "#92400e" },
      d: { bg: "#2d1a00", ac: "#fbbf24", tx: "#fcd34d" },
    },
    rose: {
      l: { bg: "#ffe4e6", ac: "#f43f5e", tx: "#9f1239" },
      d: { bg: "#2d0a0a", ac: "#fb7185", tx: "#fda4af" },
    },
    violet: {
      l: { bg: "#ede9fe", ac: "#8b5cf6", tx: "#5b21b6" },
      d: { bg: "#1a0d2e", ac: "#a78bfa", tx: "#c4b5fd" },
    },
  };
  const c = (pal[color] || pal.indigo)[darkMode ? "d" : "l"];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, boxShadow: `0 12px 32px ${c.ac}30` }}
      style={{
        background: c.bg,
        borderRadius: 16,
        padding: "18px 14px",
        textAlign: "center",
        border: `1.5px solid ${c.ac}28`,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: `${c.ac}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 10px",
        }}
      >
        <Icon d={iconPath} size={20} color={c.ac} strokeWidth={1.8} />
      </div>
      <div
        style={{ fontSize: 26, fontWeight: 800, color: c.ac, lineHeight: 1 }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: c.tx, fontWeight: 600, marginTop: 4 }}>
        {title}
      </div>
    </motion.div>
  );
}

function TopBar({
  darkMode,
  setDarkMode,
  notifications,
  markAllRead,
  markOneRead,
  deleteNotif,
  notifLoading,
  activeSection,
  onLogout,
}) {
  const [showNotif, setShowNotif] = useState(false);
  const unread = notifications.filter((n) => !n.is_read).length;

  const scrollTo = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setShowNotif(false);
  };

  // Map notification type to icon
  const getIcon = (type) => {
    if (!type) return Icons.bell;
    if (type.includes("shortlisted")) return Icons.check;
    if (type.includes("rejected")) return Icons.close;
    if (type.includes("offer")) return Icons.trophy;
    if (type.includes("test") || type.includes("interview")) return Icons.calendar;
    if (type.includes("wall")) return Icons.trophy;
    if (type.includes("application")) return Icons.send;
    if (type.includes("opportunity")) return Icons.briefcase;
    return Icons.bell;
  };

  return (
    <header
      style={{
        background: D.headerBg(darkMode),
        boxShadow: "0 4px 24px rgba(79,70,229,0.25)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 32px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <motion.div
            whileHover={{ scale: 1.08 }}
            style={{
              width: 50, height: 50, borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "2px solid rgba(255,255,255,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 800, color: "#fff",
              fontFamily: "'Georgia',serif", flexShrink: 0,
            }}
          >
            IU
          </motion.div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 19, fontFamily: "'Georgia',serif", letterSpacing: 0.3, lineHeight: 1.2 }}>
              Indus University
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase" }}>
              Placement Portal
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setDarkMode(!darkMode)}
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "6px 14px", color: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}
          >
            <Icon d={darkMode ? Icons.sun : Icons.moon} size={14} color="#fff" />
            {darkMode ? "Light" : "Dark"}
          </motion.button>

          {/* ── BELL ── */}
          <div style={{ position: "relative" }}>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowNotif(!showNotif)}
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Icon d={Icons.bell} size={16} color="#fff" />
            </motion.button>

            {unread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{ position: "absolute", top: -3, right: -3, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 17, height: 17, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}
              >
                {unread}
              </motion.span>
            )}

            <AnimatePresence>
              {showNotif && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  style={{ position: "absolute", right: 0, top: 46, width: 340, background: D.cardBg(darkMode), borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", border: `1px solid ${D.border(darkMode)}`, overflow: "hidden", zIndex: 200, maxHeight: 420, display: "flex", flexDirection: "column" }}
                >
                  {/* Header */}
                  <div style={{ padding: "12px 16px", borderBottom: `1px solid ${D.border(darkMode)}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: D.textPri(darkMode) }}>
                      Notifications {unread > 0 && <span style={{ background: "#ef4444", color: "#fff", borderRadius: 20, padding: "1px 7px", fontSize: 10, marginLeft: 6 }}>{unread}</span>}
                    </span>
                    <button
                      onClick={markAllRead}
                      style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                    >
                      Mark all read
                    </button>
                  </div>

                  {/* Body */}
                  <div style={{ overflowY: "auto", flex: 1 }}>
                    {notifLoading ? (
                      <div style={{ padding: 20, textAlign: "center", color: D.textMuted(darkMode), fontSize: 13 }}>Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div style={{ padding: "28px 20px", textAlign: "center", color: D.textMuted(darkMode), fontSize: 13 }}>
                        <Icon d={Icons.bell} size={28} color={D.textMuted(darkMode)} />
                        <div style={{ marginTop: 8 }}>No notifications yet</div>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => !n.is_read && markOneRead(n.id)}
                          style={{ padding: "11px 16px", borderBottom: `1px solid ${D.border2(darkMode)}`, background: n.is_read ? "transparent" : darkMode ? "rgba(16,185,129,0.08)" : "#f0fdf4", display: "flex", alignItems: "flex-start", gap: 10, cursor: n.is_read ? "default" : "pointer" }}
                        >
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: darkMode ? "rgba(16,185,129,0.15)" : "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                            <Icon d={getIcon(n.type)} size={15} color="#10b981" />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: D.textPri(darkMode), marginBottom: 2 }}>
                              {n.title}
                            </div>
                            <div style={{ fontSize: 12, color: D.textSec(darkMode), lineHeight: 1.4 }}>
                              {n.message}
                            </div>
                            <div style={{ fontSize: 10, color: D.textMuted(darkMode), marginTop: 4 }}>
                              {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
                            {!n.is_read && (
                              <span style={{ width: 7, height: 7, background: "#6366f1", borderRadius: "50%" }} />
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteNotif(n.id); }}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: 2, opacity: 0.5 }}
                            >
                              <Icon d={Icons.close} size={11} color={D.textMuted(darkMode)} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onLogout}
            style={{ background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 20, padding: "6px 14px", color: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}
          >
            <Icon d={Icons.logout} size={13} color="#fff" /> Logout
          </motion.button>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", gap: 2, padding: "4px 28px", overflowX: "auto" }}>
        {NAV_ITEMS.map(({ label, id, icon }) => {
          const isActive = activeSection === id;
          return (
            <motion.button
              key={id}
              onClick={() => scrollTo(id)}
              whileHover={{ background: "rgba(255,255,255,0.12)" }}
              style={{ background: isActive ? "rgba(255,255,255,0.18)" : "transparent", border: "none", borderBottom: isActive ? "2.5px solid #fff" : "2.5px solid transparent", color: isActive ? "#fff" : "rgba(255,255,255,0.65)", padding: "8px 14px", borderRadius: isActive ? "8px 8px 0 0" : 8, cursor: "pointer", fontSize: 12, fontWeight: isActive ? 700 : 400, whiteSpace: "nowrap", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 5 }}
            >
              <Icon d={icon} size={13} color={isActive ? "#fff" : "rgba(255,255,255,0.65)"} />
              {label}
            </motion.button>
          );
        })}
      </nav>
    </header>
  );
}




function JobCard({ job, darkMode, onApply }) {

  console.log("📦 Full Job Data:", job);
  console.log("🏢 company_logo:", job.company_logo);
  console.log("🌐 company_url:", job.company_url);
  console.log("📄 jd_url:", job.jd_url);
  console.log("✅ additional_criteria:", job.additional_criteria);
  console.log("🎯 eligibility:", job.eligibility);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const [applying, setApplying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isClosed = job.status !== "active" || new Date(job.application_deadline) < new Date();
  const hasApplied = job.has_applied;
  const isInelig = !job.is_eligible;

  const handleApply = async () => {
    if (isClosed || hasApplied || isInelig || applying) return;
    setApplying(true);
    try {
      await onApply(job.id);
    } finally {
      setApplying(false);
    }
  };

  const renderAction = () => {
    if (isClosed)
      return (
        <div
          style={{
            flex: 1, padding: "9px", borderRadius: 10,
            background: darkMode ? "rgba(156,163,175,0.15)" : "#f3f4f6",
            color: D.textMuted(darkMode), fontSize: 13, fontWeight: 600,
            textAlign: "center", pointerEvents: "auto",
          }}
        >
          Closed
        </div>
      );
    if (hasApplied)
      return (
        <div
          style={{
            flex: 1, padding: "9px", borderRadius: 10,
            background: darkMode ? "rgba(16,185,129,0.15)" : "#d1fae5",
            color: darkMode ? "#6ee7b7" : "#065f46", fontSize: 13,
            fontWeight: 700, textAlign: "center", display: "flex",
            alignItems: "center", justifyContent: "center", gap: 6,
            pointerEvents: "auto",
          }}
        >
          <Icon d={Icons.check} size={13} color={darkMode ? "#6ee7b7" : "#065f46"} strokeWidth={2.5} /> Applied
        </div>
      );
    if (isInelig)
      return (
        <div
          style={{
            flex: 1, padding: "9px", borderRadius: 10,
            background: darkMode ? "rgba(239,68,68,0.1)" : "#fee2e2",
            color: darkMode ? "#fca5a5" : "#7f1d1d", fontSize: 12,
            fontWeight: 500, textAlign: "center",
          }}
        >
          {job.ineligible_reason || "Not eligible"}
        </div>
      );
    return (
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleApply}
        disabled={applying}
        style={{
          flex: 1, background: "linear-gradient(135deg,#4f46e5,#10b981)",
          color: "#fff", border: "none", borderRadius: 10, padding: "9px",
          fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex",
          alignItems: "center", justifyContent: "center", gap: 6,
        }}
      >
        {applying ? (
          <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff" }} /> Applying...</>
        ) : (
          <><Icon d={Icons.send} size={13} color="#fff" /> Apply Now</>
        )}
      </motion.button>
    );
  };

  return (
    <>
      <motion.div
        whileHover={{
          y: -3,
          boxShadow: darkMode ? "0 8px 28px rgba(0,0,0,0.4)" : "0 8px 28px rgba(16,185,129,0.12)",
        }}
        style={{ background: D.cardBg(darkMode), borderRadius: 18, overflow: "hidden", border: `1px solid ${D.border(darkMode)}` }}
      >
        <div style={{ height: 5, background: isClosed ? "#9ca3af" : "linear-gradient(90deg,#4f46e5,#10b981)" }} />
        <div style={{ padding: "16px 18px" }}>

          {/* Header with Logo */}
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            {job.company_logo ? (
              <img
                src={job.company_logo}
                alt={`${job.company_name} logo`}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 10,
                  objectFit: "contain",
                  background: darkMode ? "rgba(255,255,255,0.05)" : "#fff",
                  border: `1px solid ${D.border(darkMode)}`,
                  padding: 4,
                  flexShrink: 0
                }}
              />
            ) : null}
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 10,
              background: darkMode ? "rgba(99,102,241,0.15)" : "#eef2ff",
              border: `1px solid ${D.border(darkMode)}`,
              display: job.company_logo ? "none" : "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6366f1",
              fontWeight: 800,
              fontSize: 20,
              flexShrink: 0
            }}>
              {String(job.company_name || job.title || "?")[0].toUpperCase()}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: D.textPri(darkMode) }}>
                  {String(job.title || "")}
                </div>
                <span style={{
                  background: isClosed ? (darkMode ? "rgba(156,163,175,0.15)" : "#f3f4f6") : (darkMode ? "rgba(16,185,129,0.2)" : "#d1fae5"),
                  color: isClosed ? D.textMuted(darkMode) : (darkMode ? "#6ee7b7" : "#065f46"),
                  padding: "3px 9px",
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {isClosed ? "Closed" : "Active"}
                </span>
              </div>
              {job.company_name && (
                job.company_url ? (
                  <a
                    href={job.company_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      fontSize: 12,
                      color: "#10b981",
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                      cursor: "pointer",
                    }}
                  >
                    {String(job.company_name)}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>
                  </a>
                ) : (
                  <div style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>
                    {String(job.company_name)}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Quick Info Chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {job.location && (
              <span style={{ background: darkMode ? "rgba(16,185,129,0.1)" : "#d1fae5", color: darkMode ? "#6ee7b7" : "#065f46", padding: "3px 10px", borderRadius: 20, fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                <Icon d={Icons.mapPin} size={10} color={darkMode ? "#6ee7b7" : "#065f46"} /> {String(job.location)}
              </span>
            )}
            {job.ctc_lpa && (
              <span style={{ background: darkMode ? "rgba(99,102,241,0.12)" : "#eef2ff", color: darkMode ? "#c7d2fe" : "#4338ca", padding: "3px 10px", borderRadius: 20, fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                <Icon d={Icons.dollar} size={10} color={darkMode ? "#c7d2fe" : "#4338ca"} /> ₹{String(job.ctc_lpa)} LPA
              </span>
            )}
            {job.application_deadline && (
              <span style={{ background: darkMode ? "rgba(239,68,68,0.12)" : "#fee2e2", color: darkMode ? "#fca5a5" : "#7f1d1d", padding: "3px 10px", borderRadius: 20, fontSize: 11 }}>
                Due: {new Date(job.application_deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            )}
          </div>

          {/* Description Preview */}
          {job.description && (
            <p style={{ fontSize: 12, color: D.textSec(darkMode), marginBottom: 12, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {String(job.description)}
            </p>
          )}

          {/* Eligibility Preview */}
          {(job.additional_criteria || job.eligibility) && (
            <div style={{ marginBottom: 12, padding: "8px 12px", background: darkMode ? "rgba(99,102,241,0.08)" : "#eef2ff", borderRadius: 8, border: `1px solid ${D.border(darkMode)}` }}>
              <div style={{ fontSize: 11, color: D.textSec(darkMode), display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                <strong>Eligibility:</strong> {job.additional_criteria || `CGPA ≥ ${job.eligibility?.min_cgpa || 'N/A'}, Backlogs ≤ ${job.eligibility?.max_backlogs ?? 'N/A'}`}
              </div>
            </div>
          )}

          {renderAction()}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsExpanded(true)}
            style={{
              width: "100%",
              marginTop: 8,
              padding: "8px",
              borderRadius: 10,
              border: `1px solid ${D.border(darkMode)}`,
              background: "transparent",
              color: D.textSec(darkMode),
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5
            }}
          >
            View Full Details →
          </motion.button>
        </div>
      </motion.div>

      {/* EXPANDED MODAL */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsExpanded(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: D.cardBg(darkMode),
                borderRadius: 20,
                border: `1px solid ${D.border(darkMode)}`,
                width: "100%",
                maxWidth: "900px",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                zIndex: 100000
              }}
            >
              {/* Modal Header */}
              <div style={{
                position: "sticky",
                top: 0,
                background: D.cardBg(darkMode),
                borderBottom: `1px solid ${D.border(darkMode)}`,
                padding: "20px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                zIndex: 10
              }}>
                <div style={{ flex: 1, display: "flex", gap: 16, alignItems: "center" }}>
                  {job.company_logo ? (
                    <img
                      src={job.company_logo}
                      alt="Logo"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 12,
                        objectFit: "contain",
                        background: darkMode ? "rgba(255,255,255,0.1)" : "#fff",
                        border: `1px solid ${D.border(darkMode)}`,
                        padding: 4
                      }}
                    />
                  ) : null}
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: 12,
                    background: darkMode ? "rgba(99,102,241,0.15)" : "#eef2ff",
                    border: `1px solid ${D.border(darkMode)}`,
                    display: job.company_logo ? "none" : "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#6366f1",
                    fontWeight: 800,
                    fontSize: 24
                  }}>
                    {String(job.company_name || job.title || "?")[0].toUpperCase()}
                  </div>

                  <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: D.textPri(darkMode), margin: "0 0 8px 0" }}>
                      {String(job.title || "")}
                    </h1>
                    {job.company_name && (
                      job.company_url ? (
                        <a
                          href={job.company_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            fontSize: 16,
                            color: "#10b981",
                            fontWeight: 600,
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            cursor: "pointer",
                          }}
                        >
                          {String(job.company_name)}
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>
                        </a>
                      ) : (
                        <div style={{ fontSize: 16, color: "#10b981", fontWeight: 600 }}>
                          {String(job.company_name)}
                        </div>
                      )
                    )}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsExpanded(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: D.textSec(darkMode),
                    cursor: "pointer",
                    fontSize: 28,
                    padding: 0,
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ✕
                </motion.button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: "24px" }}>

                {/* Key Info Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
                  {job.ctc_lpa && (
                    <div style={{ padding: "12px 14px", background: darkMode ? "rgba(99,102,241,0.08)" : "#eef2ff", borderRadius: 10, border: `1px solid ${D.border(darkMode)}` }}>
                      <div style={{ fontSize: 11, color: D.textMuted(darkMode), fontWeight: 600, marginBottom: 4 }}>💰 CTC</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: D.textPri(darkMode) }}>₹{String(job.ctc_lpa)} LPA</div>
                    </div>
                  )}
                  {job.location && (
                    <div style={{ padding: "12px 14px", background: darkMode ? "rgba(16,185,129,0.08)" : "#d1fae5", borderRadius: 10, border: `1px solid ${D.border(darkMode)}` }}>
                      <div style={{ fontSize: 11, color: D.textMuted(darkMode), fontWeight: 600, marginBottom: 4 }}>📍 Location</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: D.textPri(darkMode) }}>{String(job.location)}</div>
                    </div>
                  )}
                  {job.application_deadline && (
                    <div style={{ padding: "12px 14px", background: darkMode ? "rgba(239,68,68,0.08)" : "#fee2e2", borderRadius: 10, border: `1px solid ${D.border(darkMode)}` }}>
                      <div style={{ fontSize: 11, color: D.textMuted(darkMode), fontWeight: 600, marginBottom: 4 }}>⏰ Deadline</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: D.textPri(darkMode) }}>
                        {new Date(job.application_deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Company Website — now embedded in company name heading */}

                {/* JD PDF Download */}
                {job.jd_url && (
                  <div style={{ marginBottom: 20 }}>
                    <a
                      href={job.jd_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: darkMode ? "rgba(245,158,11,0.15)" : "#fef3c7",
                        color: darkMode ? "#fcd34d" : "#d97706",
                        padding: "12px 18px",
                        borderRadius: 10,
                        textDecoration: "none",
                        fontWeight: 600,
                        fontSize: 14,
                        border: `1px solid ${darkMode ? "rgba(245,158,11,0.3)" : "#fde68a"}`,
                        transition: "all 0.2s"
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* ✅ CHANGE THIS ICON AND TEXT */}
                      <Icon d={Icons.upload} size={18} color="currentColor" />
                      📄 View JD
                    </a>
                  </div>
                )}


                {/* Job Description */}
                {job.description && (
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: D.textPri(darkMode), marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                      📋 Role Overview
                    </h2>
                    <div style={{
                      fontSize: 14,
                      color: D.textSec(darkMode),
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                      background: darkMode ? "rgba(16,185,129,0.05)" : "#f0fdf4",
                      padding: "16px 20px",
                      borderRadius: 12,
                      border: `1px solid ${D.border(darkMode)}`
                    }}>
                      {String(job.description)}
                    </div>
                  </div>
                )}

                {/* Eligibility Rules */}
                {(job.additional_criteria || job.eligibility) && (
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: D.textPri(darkMode), marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      ✅ Eligibility Rules for this Company
                    </h2>

                    {/* Additional Criteria (text) */}
                    {job.additional_criteria && (
                      <div style={{
                        fontSize: 14,
                        color: D.textSec(darkMode),
                        lineHeight: 1.7,
                        whiteSpace: "pre-wrap",
                        background: darkMode ? "rgba(99,102,241,0.08)" : "#eef2ff",
                        padding: "16px 20px",
                        borderRadius: 12,
                        border: `1.5px solid ${darkMode ? "rgba(99,102,241,0.3)" : "#c7d2fe"}`,
                        fontWeight: 500,
                        marginBottom: 12
                      }}>
                        {String(job.additional_criteria)}
                      </div>
                    )}

                    {/* Structured Eligibility */}
                    {job.eligibility && (
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: 12
                      }}>
                        {job.eligibility.min_cgpa && (
                          <div style={{
                            padding: "12px 14px",
                            background: darkMode ? "rgba(16,185,129,0.08)" : "#d1fae5",
                            borderRadius: 10,
                            border: `1px solid ${D.border(darkMode)}`
                          }}>
                            <div style={{ fontSize: 11, color: D.textMuted(darkMode), fontWeight: 600, marginBottom: 4 }}>
                              Minimum CGPA
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: D.textPri(darkMode) }}>
                              {job.eligibility.min_cgpa}
                            </div>
                          </div>
                        )}

                        {job.eligibility.max_backlogs !== null && job.eligibility.max_backlogs !== undefined && (
                          <div style={{
                            padding: "12px 14px",
                            background: darkMode ? "rgba(239,68,68,0.08)" : "#fee2e2",
                            borderRadius: 10,
                            border: `1px solid ${D.border(darkMode)}`
                          }}>
                            <div style={{ fontSize: 11, color: D.textMuted(darkMode), fontWeight: 600, marginBottom: 4 }}>
                              Max Active Backlogs
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: D.textPri(darkMode) }}>
                              {job.eligibility.max_backlogs}
                            </div>
                          </div>
                        )}

                        {job.eligibility.no_prior_offer && (
                          <div style={{
                            padding: "12px 14px",
                            background: darkMode ? "rgba(99,102,241,0.08)" : "#eef2ff",
                            borderRadius: 10,
                            border: `1px solid ${D.border(darkMode)}`,
                            gridColumn: "1 / -1"
                          }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#ef4444" }}>
                              ⚠️ No prior placement offers allowed
                            </div>
                          </div>
                        )}

                        {job.eligibility.allowed_depts && job.eligibility.allowed_depts.length > 0 && (
                          <div style={{
                            padding: "12px 14px",
                            background: darkMode ? "rgba(99,102,241,0.08)" : "#eef2ff",
                            borderRadius: 10,
                            border: `1px solid ${D.border(darkMode)}`,
                            gridColumn: "1 / -1"
                          }}>
                            <div style={{ fontSize: 11, color: D.textMuted(darkMode), fontWeight: 600, marginBottom: 6 }}>
                              Eligible Departments
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {job.eligibility.allowed_depts.map((dept, idx) => (
                                <span key={idx} style={{
                                  background: darkMode ? "rgba(16,185,129,0.15)" : "#d1fae5",
                                  color: darkMode ? "#6ee7b7" : "#065f46",
                                  padding: "4px 10px",
                                  borderRadius: 16,
                                  fontSize: 12,
                                  fontWeight: 600
                                }}>
                                  {dept}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {job.eligibility.allowed_batches && job.eligibility.allowed_batches.length > 0 && (
                          <div style={{
                            padding: "12px 14px",
                            background: darkMode ? "rgba(99,102,241,0.08)" : "#eef2ff",
                            borderRadius: 10,
                            border: `1px solid ${D.border(darkMode)}`,
                            gridColumn: "1 / -1"
                          }}>
                            <div style={{ fontSize: 11, color: D.textMuted(darkMode), fontWeight: 600, marginBottom: 6 }}>
                              Eligible Batches
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {job.eligibility.allowed_batches.map((batch, idx) => (
                                <span key={idx} style={{
                                  background: darkMode ? "rgba(16,185,129,0.15)" : "#d1fae5",
                                  color: darkMode ? "#6ee7b7" : "#065f46",
                                  padding: "4px 10px",
                                  borderRadius: 16,
                                  fontSize: 12,
                                  fontWeight: 600
                                }}>
                                  {batch}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: 12, borderTop: `1px solid ${D.border(darkMode)}`, paddingTop: 20, marginTop: 20 }}>
                  {renderAction()}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsExpanded(false)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 10,
                      border: `1px solid ${D.border(darkMode)}`,
                      background: "transparent",
                      color: D.textSec(darkMode),
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 600
                    }}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


function ApplicationRow({ app, darkMode }) {
  const cfg = APP_STATUS[app.status] || {
    label: String(app.status || "Unknown"),
    bg: "#f3f4f6",
    color: "#374151",
    dot: "#9ca3af",
  };
  return (
    <motion.div
      whileHover={{ x: 3 }}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 14px",
        borderRadius: 12,
        marginBottom: 8,
        background: darkMode ? "rgba(16,185,129,0.05)" : "#f9faff",
        border: `1px solid ${D.border(darkMode)}`,
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: darkMode ? "rgba(16,185,129,0.15)" : "#d1fae5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 15,
            color: "#10b981",
          }}
        >
          {String(app.opportunity_company || app.opportunity_title || "?")[0]}
        </div>
        <div>
          <div
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: D.textPri(darkMode),
            }}
          >
            {String(app.opportunity_title || "")}
          </div>
          <div style={{ fontSize: 12, color: D.textSec(darkMode) }}>
            {app.opportunity_company && (
              <span>{String(app.opportunity_company)} · </span>
            )}
            {app.opportunity_ctc_lpa && (
              <span>₹{String(app.opportunity_ctc_lpa)} LPA · </span>
            )}
            <span>
              {new Date(app.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
        </div>
      </div>
      <span
        style={{
          background: cfg.bg,
          color: cfg.color,
          padding: "4px 12px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: cfg.dot,
            display: "inline-block",
          }}
        />
        {cfg.label}
      </span>
    </motion.div>
  );
}



function EventCard({ event, darkMode }) {
  const [countdown, setCountdown] = useState("");
  const date = event.event_datetime;
  const isTest = event.event_type === "test";

  useEffect(() => {
    const tick = () => {
      const diff = new Date(date) - new Date();
      if (diff <= 0) return setCountdown("Today / Completed");
      const d = Math.floor(diff / 86400000),
        h = Math.floor((diff % 86400000) / 3600000),
        m = Math.floor((diff % 3600000) / 60000);
      setCountdown(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [date]);

  const isPast = new Date(date) < new Date();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      style={{
        background: darkMode
          ? "linear-gradient(135deg,rgba(6,95,70,0.4),rgba(16,185,129,0.15))"
          : "linear-gradient(135deg,#f0fdf4,#d1fae5)",
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${D.border(darkMode)}`,
        opacity: isPast ? 0.75 : 1,
      }}
    >
      {/* Type bar */}
      <div style={{ height: 4, background: isTest ? "linear-gradient(90deg,#f59e0b,#d97706)" : "linear-gradient(90deg,#6366f1,#8b5cf6)" }} />
      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: D.textPri(darkMode), marginBottom: 2 }}>
              {event.title || (isTest ? "Online Test" : "Interview")}
            </div>
            {event.opportunity_company && (
              <div style={{ fontSize: 12, color: "#10b981", fontWeight: 600, marginBottom: 2 }}>{event.opportunity_company}</div>
            )}
            <div style={{ fontSize: 12, color: D.textSec(darkMode) }}>{event.opportunity_title || ""}</div>
          </div>
          <span style={{
            flexShrink: 0, marginLeft: 8,
            background: isTest ? (darkMode ? "rgba(245,158,11,0.2)" : "#fef3c7") : (darkMode ? "rgba(99,102,241,0.2)" : "#eef2ff"),
            color: isTest ? (darkMode ? "#fcd34d" : "#92400e") : (darkMode ? "#c7d2fe" : "#4338ca"),
            borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 5
          }}>
            <Icon d={isTest ? Icons.calendar : Icons.mic} size={10} color={isTest ? (darkMode ? "#fcd34d" : "#92400e") : (darkMode ? "#c7d2fe" : "#4338ca")} strokeWidth={2} />
            {isTest ? "Test" : "Interview"}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon d={Icons.calendar} size={13} color={D.textSec(darkMode)} />
            <span style={{ fontSize: 13, color: D.textSec(darkMode) }}>
              {new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              {" · "}
              {new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          {event.location && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon d={Icons.mapPin} size={13} color={D.textSec(darkMode)} />
              <span style={{ fontSize: 12, color: D.textSec(darkMode) }}>{event.location}</span>
            </div>
          )}
          {event.duration_minutes && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon d={Icons.clock} size={12} color={D.textSec(darkMode)} />
              <span style={{ fontSize: 12, color: D.textSec(darkMode) }}>Duration: {event.duration_minutes} min</span>
            </div>
          )}
        </div>

        {event.description && (
          <p style={{ fontSize: 12, color: D.textSec(darkMode), lineHeight: 1.5, marginBottom: 10, background: darkMode ? "rgba(16,185,129,0.05)" : "rgba(16,185,129,0.06)", padding: "8px 10px", borderRadius: 8, border: `1px solid ${D.border(darkMode)}` }}>
            {event.description}
          </p>
        )}

        <div style={{
          background: isPast ? (darkMode ? "rgba(156,163,175,0.1)" : "#f3f4f6") : (darkMode ? "rgba(16,185,129,0.15)" : "#d1fae5"),
          borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8,
        }}>
          <Icon d={Icons.clock} size={14} color={isPast ? D.textMuted(darkMode) : (darkMode ? "#6ee7b7" : "#065f46")} />
          <span style={{ fontWeight: 700, color: isPast ? D.textMuted(darkMode) : (darkMode ? "#6ee7b7" : "#065f46"), fontSize: 13 }}>
            {isPast ? "Completed" : countdown}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function LogoutModal({ onConfirm, onCancel, darkMode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.85, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: D.cardBg(darkMode),
          borderRadius: 22,
          padding: "32px 36px",
          width: "100%",
          maxWidth: 380,
          textAlign: "center",
          border: `1px solid ${D.border(darkMode)}`,
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "rgba(239,68,68,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <Icon d={Icons.logout} size={26} color="#ef4444" strokeWidth={2} />
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: D.textPri(darkMode),
            marginBottom: 8,
          }}
        >
          Logout?
        </div>
        <div
          style={{ fontSize: 14, color: D.textSec(darkMode), marginBottom: 24 }}
        >
          Are you sure you want to logout?
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: 12,
              border: `1px solid ${D.border(darkMode)}`,
              background: "transparent",
              color: D.textPri(darkMode),
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Cancel
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg,#ef4444,#dc2626)",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
            }}
          >
            <Icon d={Icons.logout} size={14} color="#fff" /> Yes, Logout
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [profilePic, setProfilePic] = useState(null);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: "", last_name: "", roll_no: "", department_id: "",
    branch: "", graduation_year: "", cgpa: "", active_backlogs: "",
    total_backlogs: "", tenth_percentage: "", twelfth_percentage: "",
    linkedin_url: "", github_url: "", portfolio_url: ""
  });
  const [jobSearchQuery, setJobSearchQuery] = useState("");
  const [appSearchQuery, setAppSearchQuery] = useState("");
  const [eventSearchQuery, setEventSearchQuery] = useState("");



  const handleOpenEditProfile = async () => {
    try {
      const res = await API.get("/student/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const d = res.data;

      setEditForm({
        first_name: d.first_name || "",
        last_name: d.last_name || "",
        roll_no: d.roll_no || "",
        department_id: d.department_id || "",
        branch: d.branch || "",
        graduation_year: d.graduation_year || "",
        cgpa: d.cgpa || "",
        active_backlogs: d.active_backlogs || "",
        total_backlogs: d.total_backlogs || "",
        tenth_percentage: d.tenth_percentage || "",
        twelfth_percentage: d.twelfth_percentage || "",
        linkedin_url: d.linkedin_url || "",
        github_url: d.github_url || "",
        portfolio_url: d.portfolio_url || ""
      });

      setShowEditProfile(true);

    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };

  const [editSaving, setEditSaving] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [currentResumeUrl, setCurrentResumeUrl] = useState("");
  const BRANCH_OPTIONS = ["AE", "CE", "CSE", "EE", "IT", "ME", "MT", "ICT", "BBA", "BBA (Hons)", "B.Com", "MBA"];
  const [activeSection, setActiveSection] = useState("section-dashboard");
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const student = {
    name: localStorage.getItem("name") || "Student",
    email: localStorage.getItem("email") || "student@indusuni.ac.in",
    branch: "B.Tech CSE | 2025 Batch",
    avatar: profilePic,
  };

  // ── AI-Extracted Data ──
  const [aiData, setAiData] = useState(null);
  const [aiDataLoading, setAiDataLoading] = useState(false);

  const fetchAIData = useCallback(async () => {
    setAiDataLoading(true);
    try {
      const data = await getMyAIData();
      setAiData(data);
    } catch (err) {
      console.log("No AI data yet:", err?.response?.status);
      setAiData(null);
    } finally {
      setAiDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAIData();
  }, [fetchAIData]);

  const showToast = (msg, type = "success") =>
    setToast({ message: String(msg), type, id: Date.now() });

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleProfilePicChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      showToast("Only image files allowed", "error");
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      showToast("Image must be under 2MB", "error");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", f);
      const res = await API.patch("/student/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfilePic(res.data.profile_photo_url);
      showToast("Profile photo updated!", "success");
    } catch (err) {
      const d = err.response?.data?.detail;
      showToast(typeof d === "string" ? d : "Photo upload failed", "error");
    }
  };

  // REPLACE WITH THIS:
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await API.get("/notifications/?limit=30");
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  const markAllRead = async () => {
    try {
      await API.patch("/notifications/read-all");
      setNotifications((p) => p.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all read", err);
    }
  };

  const markOneRead = async (id) => {
    try {
      await API.patch("/notifications/read", { notification_ids: [id] });
      setNotifications((p) =>
        p.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  const deleteNotif = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications((p) => p.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const id = setInterval(fetchNotifications, 30000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  useEffect(() => {
    const observers = NAV_ITEMS.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.15 },
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState("");
  const [jobFilter, setJobFilter] = useState("all"); // all | active | closed
  const [jobSort, setJobSort] = useState("deadline");  // deadline | ctc | posted
  const [jobPage, setJobPage] = useState(1);
  const JOBS_PER_PAGE = 6;

  const fetchJobs = useCallback(async () => {
    setJobsLoading(true);
    setJobsError("");
    try {
      const res = await API.get("/student/opportunities");
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const cached = lsGet(LS_JOBS, []);
      if (cached.length) {
        setJobs(cached);
        setJobsError("");
      } else {
        const d = err.response?.data?.detail;
        setJobsError(parseApiError(d, "Failed to load job listings"));
      }
    } finally {
      setJobsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    const id = setInterval(() => {
      const cached = lsGet(LS_JOBS, null);
      if (cached) setJobs(cached);
    }, 10000);
    return () => clearInterval(id);
  }, []);

  const handleApply = async (opportunityId) => {
    try {
      await API.post(`/opportunities/${opportunityId}/apply`, {});
      setJobs((prev) =>
        prev.map((j) =>
          j.id === opportunityId ? { ...j, has_applied: true } : j,
        ),
      );
      const job = jobs.find((j) => j.id === opportunityId);
      showToast(
        `Applied to ${job?.title || "opportunity"} successfully!`,
        "success",
      );
      fetchMyApplications();
    } catch (err) {
      const d = err.response?.data?.detail;
      showToast(parseApiError(d, "Failed to apply"), "error");
    }
  };

  const [myApplications, setMyApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState("");

  const fetchMyApplications = useCallback(async () => {
    setAppsLoading(true);
    setAppsError("");
    try {
      const res = await API.get("/applications/me");
      setMyApplications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const d = err.response?.data?.detail;
      setAppsError(parseApiError(d, "Failed to load applications"));
    } finally {
      setAppsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyApplications();
  }, [fetchMyApplications]);

  const fetchMyEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError("");
    try {
      // Get my applications, then fetch events for each shortlisted/test_scheduled/interviewed opp
      const appsRes = await API.get("/applications/me");
      const apps = Array.isArray(appsRes.data) ? appsRes.data : [];

      // Only fetch events for opportunities where student is shortlisted or further along
      const relevantStatuses = ["shortlisted", "test_scheduled", "interviewed", "offered", "accepted"];
      const relevantApps = apps.filter((a) => relevantStatuses.includes(a.status));

      if (relevantApps.length === 0) {
        setMyEvents([]);
        setEventsLoading(false);
        return;
      }

      // Fetch events for each relevant opportunity
      const eventsNested = await Promise.all(
        relevantApps.map(async (app) => {
          try {
            const res = await API.get(`/events/${app.opportunity_id}`);
            if (Array.isArray(res.data)) {
              return res.data.map((ev) => ({
                ...ev,
                opportunity_title: app.opportunity_title,
                opportunity_company: app.company_name,
              }));
            }
            return [];
          } catch {
            return [];
          }
        })
      );

      const allEvents = eventsNested.flat().sort(
        (a, b) => new Date(a.event_datetime) - new Date(b.event_datetime)
      );
      setMyEvents(allEvents);
    } catch (err) {
      const d = err.response?.data?.detail;
      setEventsError(parseApiError(d, "Failed to load events"));
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  const [placedStudents, setPlacedStudents] = useState([]);
  const [wallOfFameLoading, setWallOfFameLoading] = useState(false);
  const [wallOfFameError, setWallOfFameError] = useState("");

  const fetchWallOfFame = useCallback(async () => {
    setWallOfFameLoading(true);
    setWallOfFameError("");
    try {
      const res = await API.get("/wall-of-fame");
      setPlacedStudents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const cached = lsGet(LS_PLACED, []);
      if (cached.length) {
        setPlacedStudents(cached);
        setWallOfFameError("");
      } else {
        const d = err.response?.data?.detail;
        setWallOfFameError(parseApiError(d, "Failed to load wall of fame"));
      }
    } finally {
      setWallOfFameLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallOfFame();
  }, [fetchWallOfFame]);
  const openEditProfile = async () => {
    try {
      const res = await API.get("/student/profile");
      const p = res.data;
      setEditForm({
        first_name: p.first_name || "",
        last_name: p.last_name || "",
        roll_no: p.roll_no || "",
        department_id: p.department_id || "",
        branch: p.branch || "",
        graduation_year: p.graduation_year?.toString() || "",
        cgpa: p.cgpa?.toString() || "",
        active_backlogs: p.active_backlogs?.toString() || "",
        total_backlogs: p.total_backlogs?.toString() || "",
        tenth_percentage: p.tenth_percentage?.toString() || "",
        twelfth_percentage: p.twelfth_percentage?.toString() || "",
        linkedin_url: p.linkedin_url || "",
        github_url: p.github_url || "",
        portfolio_url: p.portfolio_url || "",
      });
      setCurrentResumeUrl(p.resume_url || "");
    } catch {
      // prefill with whatever we have
    }
    setResumeFile(null);
    setShowEditProfile(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    setEditSaving(true);
    try {
      const raw = editForm;
      const payload = {};

      if (raw.first_name?.trim()) payload.first_name = raw.first_name.trim();
      if (raw.last_name?.trim()) payload.last_name = raw.last_name.trim();
      if (raw.roll_no?.trim()) payload.roll_no = raw.roll_no.trim();
      if (raw.department_id?.trim()) payload.department_id = raw.department_id.trim();
      if (raw.branch) payload.branch = raw.branch;
      if (raw.graduation_year) payload.graduation_year = Number(raw.graduation_year);
      if (raw.cgpa) {
        const cgpa = Number(raw.cgpa);
        if (cgpa < 1 || cgpa > 10) { showToast("CGPA must be between 1 and 10", "error"); setEditSaving(false); return; }
        payload.cgpa = cgpa;
      }
      if (raw.active_backlogs !== "") payload.active_backlogs = Number(raw.active_backlogs);
      if (raw.total_backlogs !== "") payload.total_backlogs = Number(raw.total_backlogs);
      if (raw.tenth_percentage) payload.tenth_percentage = Number(raw.tenth_percentage);
      if (raw.twelfth_percentage) payload.twelfth_percentage = Number(raw.twelfth_percentage);
      if (raw.linkedin_url?.trim()) payload.linkedin_url = raw.linkedin_url.trim();
      if (raw.github_url?.trim()) payload.github_url = raw.github_url.trim();
      if (raw.portfolio_url?.trim()) payload.portfolio_url = raw.portfolio_url.trim();

      // ── Upload new resume if one was selected ──
      if (resumeFile) {
        setResumeUploading(true);
        try {
          const fd = new FormData();
          fd.append("file", resumeFile);
          const uploadRes = await API.post("/upload/resume", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const newUrl = uploadRes.data.resume_url || uploadRes.data.url || "";
          if (newUrl) {
            payload.resume_url = newUrl;
            setCurrentResumeUrl(newUrl);
          }
        } catch (uploadErr) {
          const d = uploadErr.response?.data?.detail;
          showToast(parseApiError(d, "Resume upload failed"), "error");
          setEditSaving(false);
          setResumeUploading(false);
          return;
        } finally {
          setResumeUploading(false);
        }
      }

      if (Object.keys(payload).length === 0) {
        showToast("No changes to save", "error");
        setEditSaving(false);
        return;
      }

      await API.patch("/student/profile", payload);
      showToast("Profile updated successfully!", "success");
      setResumeFile(null);
      setShowEditProfile(false);
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(
        Array.isArray(detail) ? detail.map(e => e.msg).join(" · ") : detail || "Update failed",
        "error"
      );
    } finally {
      setEditSaving(false);
    }
  };
  const profileCompletion = Math.min(
    20 + (profilePic ? 20 : 0),
    100,
  );

  const statsApplied = myApplications.length;
  const statsActive = myApplications.filter(
    (a) => !["offered", "accepted", "rejected"].includes(a.status),
  ).length;
  const statsOffers = myApplications.filter(
    (a) => a.status === "offered" || a.status === "accepted",
  ).length;
  const statsShortlisted = myApplications.filter(
    (a) => a.status === "shortlisted",
  ).length;
  const statsInterviewed = myApplications.filter(
    (a) => a.status === "interviewed" || a.status === "test_scheduled",
  ).length;
  const statsRejected = myApplications.filter(
    (a) => a.status === "rejected",
  ).length;

  // ── MY EVENTS (fetched from API using shortlisted applications) ──────────
  const [myEvents, setMyEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState("");

  // ── ANNOUNCEMENTS (conversations from coordinator) ────────────────────────
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementsError, setAnnouncementsError] = useState("");

  const fetchAnnouncements = useCallback(async () => {
    setAnnouncementsLoading(true);
    setAnnouncementsError("");
    try {
      const res = await API.get("/announcements/");
      setAnnouncements(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const d = err.response?.data?.detail;
      setAnnouncementsError(parseApiError(d, "Failed to load announcements"));
    } finally {
      setAnnouncementsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const APIError = ({ message, onRetry }) => (
    <div
      style={{
        padding: "14px 18px",
        background: darkMode ? "rgba(239,68,68,0.12)" : "#fee2e2",
        borderRadius: 12,
        color: darkMode ? "#fca5a5" : "#7f1d1d",
        fontSize: 13,
        marginBottom: 12,
        border: "1px solid rgba(239,68,68,0.3)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Icon
        d={Icons.warning}
        size={16}
        color={darkMode ? "#fca5a5" : "#ef4444"}
      />
      <span style={{ flex: 1 }}>{String(message)}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: "none",
            border: "none",
            color: "#6366f1",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          Retry
        </button>
      )}
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: D.pageBg(darkMode),
        fontFamily: "'Outfit','Segoe UI',sans-serif",
        color: D.textPri(darkMode),
        transition: "background 0.35s, color 0.35s",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');`}</style>
      <AnimatePresence>
        {toast && (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <TopBar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        notifications={notifications}
        markAllRead={markAllRead}
        markOneRead={markOneRead}
        deleteNotif={deleteNotif}
        notifLoading={notifLoading}
        activeSection={activeSection}
        onLogout={() => setShowLogout(true)}
      />

      <AnimatePresence>
        {showLogout && (
          <LogoutModal
            darkMode={darkMode}
            onConfirm={handleLogout}
            onCancel={() => setShowLogout(false)}
          />
        )}
      </AnimatePresence>

      <main
        style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px 60px" }}
      >
        {/* ── DASHBOARD ── */}

        <div id="section-dashboard">
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: darkMode
                ? "linear-gradient(135deg,rgba(79,70,229,0.6),rgba(6,95,70,0.5))"
                : "linear-gradient(135deg,#4f46e5,#10b981)",
              borderRadius: 22,
              padding: "26px 32px",
              marginBottom: 28,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: -50,
                top: -50,
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 60,
                bottom: -70,
                width: 220,
                height: 220,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.04)",
              }}
            />
            <div style={{ position: "relative" }}>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: 4,
                }}
              >
                Welcome back 👋
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#fff",
                  marginBottom: 6,
                }}
              >
                {String(student.name)}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.75)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Icon d={Icons.user} size={13} color="rgba(255,255,255,0.6)" />
                {student.branch} <span style={{ opacity: 0.4 }}>·</span>{" "}
                {student.email}
              </div>
            </div>
            <div style={{ position: "relative" }}>
              {profilePic ? (
                <motion.img
                  key={profilePic}
                  whileHover={{ scale: 1.06 }}
                  src={profilePic}
                  alt="Profile"
                  onClick={() => setShowMenu(!showMenu)}
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: "50%",
                    border: "3px solid rgba(255,255,255,0.45)",
                    cursor: "pointer",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <motion.div
                  whileHover={{ scale: 1.06 }}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: "50%",
                    border: "3px dashed rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    background: "rgba(255,255,255,0.1)",
                  }}
                >
                  <Icon
                    d={Icons.camera}
                    size={18}
                    color="rgba(255,255,255,0.8)"
                  />
                  <span
                    style={{
                      fontSize: 8,
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: 600,
                      textAlign: "center",
                      lineHeight: 1.2,
                    }}
                  >
                    Upload Photo
                  </span>
                </motion.div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleProfilePicChange}
              />
              <AnimatePresence>
                {showMenu && profilePic && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 70,
                      width: 210,
                      background: D.cardBg(darkMode),
                      borderRadius: 14,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                      border: `1px solid ${D.border(darkMode)}`,
                      overflow: "hidden",
                      zIndex: 200,
                    }}
                  >
                    <button
                      onClick={() => fileInputRef.current.click()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        padding: "12px 16px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 13,
                        color: "#6366f1",
                        fontWeight: 600,
                      }}
                    >
                      <Icon d={Icons.camera} size={15} color="#6366f1" /> Change
                      Photo
                    </button>
                    <div
                      style={{ height: 1, background: D.border(darkMode) }}
                    />
                    <button
                      onClick={() => setShowLogout(true)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        padding: "12px 16px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 13,
                        color: "#ef4444",
                        fontWeight: 600,
                      }}
                    >
                      <Icon d={Icons.logout} size={15} color="#ef4444" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          {/* FIND THE STAT CARD GRID AND PASTE THIS ABOVE IT */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
              gap: 14,
              marginBottom: 8,
            }}
          >
            <StatCard
              title="Applied"
              value={statsApplied}
              iconPath={Icons.send}
              color="indigo"
              darkMode={darkMode}
              delay={0}
            />
            <StatCard
              title="Active"
              value={statsActive}
              iconPath={Icons.lightning}
              color="sky"
              darkMode={darkMode}
              delay={0.08}
            />
            <StatCard
              title="Shortlisted"
              value={statsShortlisted}
              iconPath={Icons.briefcase}
              color="violet"
              darkMode={darkMode}
              delay={0.16}
            />
            <StatCard
              title="Interviewed"
              value={statsInterviewed}
              iconPath={Icons.mic}
              color="amber"
              darkMode={darkMode}
              delay={0.24}
            />
            <StatCard
              title="Offers"
              value={statsOffers}
              iconPath={Icons.trophy}
              color="emerald"
              darkMode={darkMode}
              delay={0.32}
            />
            <StatCard
              title="Rejected"
              value={statsRejected}
              iconPath={Icons.close}
              color="rose"
              darkMode={darkMode}
              delay={0.4}
            />
          </div>

          <div
            style={{
              marginTop: 20,
            }}
          >
            <div>
              <SectionTitle text="Profile Snapshot" darkMode={darkMode} />
              <Card darkMode={darkMode}>
                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  {profilePic ? (
                    <img
                      src={profilePic}
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: "50%",
                        border: "2px solid #10b981",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                      alt="avatar"
                    />
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: "50%",
                        border: "2px dashed #10b981",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        cursor: "pointer",
                        background: "rgba(16,185,129,0.06)",
                      }}
                    >
                      <Icon d={Icons.camera} size={16} color="#10b981" />
                      <span
                        style={{
                          fontSize: 8,
                          color: "#10b981",
                          fontWeight: 600,
                          marginTop: 2,
                        }}
                      >
                        Upload
                      </span>
                    </div>
                  )}
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: D.textPri(darkMode),
                      }}
                    >
                      {String(student.name)}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: D.textSec(darkMode),
                        marginBottom: 2,
                      }}
                    >
                      {student.branch}
                    </div>
                    <div style={{ fontSize: 12, color: D.textSec(darkMode) }}>
                      {student.email}
                    </div>
                  </div>
                </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 14,
                      padding: "12px 14px",
                      borderRadius: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: darkMode
                        ? "rgba(16,185,129,0.12)"
                        : "#ecfdf5",
                      border: `1px solid ${darkMode ? "rgba(16,185,129,0.25)" : "#a7f3d0"}`,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: D.textPri(darkMode),
                        }}
                      >
                        Profile Status
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: D.textSec(darkMode),
                        }}
                      >
                        Ready for placements 🚀
                      </div>
                    </div>

                    <div
                      style={{
                        background: "linear-gradient(135deg,#10b981,#059669)",
                        color: "#fff",
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Icon d={Icons.check} size={13} color="#fff" strokeWidth={2.5} />
                      Verified
                    </div>
                  </motion.div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {currentResumeUrl ? (
                      <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href={currentResumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          background: "linear-gradient(90deg,#10b981,#059669)",
                          color: "#fff",
                          border: "none",
                          borderRadius: 10,
                          padding: "10px",
                          fontWeight: 700,
                          cursor: "pointer",
                          fontSize: 13,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 7,
                          textDecoration: "none",
                        }}
                      >
                        <Icon d={Icons.download} size={15} color="#fff" /> View Resume
                      </motion.a>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={openEditProfile}
                        style={{
                          flex: 1,
                          background: darkMode ? "rgba(16,185,129,0.15)" : "#d1fae5",
                          color: darkMode ? "#6ee7b7" : "#065f46",
                          border: `1px solid ${D.border(darkMode)}`,
                          borderRadius: 10,
                          padding: "10px",
                          fontWeight: 700,
                          cursor: "pointer",
                          fontSize: 13,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 7,
                        }}
                      >
                        <Icon d={Icons.upload} size={15} color={darkMode ? "#6ee7b7" : "#065f46"} /> Upload Resume
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={openEditProfile}
                      style={{
                        flex: 1,
                        background: "linear-gradient(90deg,#6366f1,#4f46e5)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        padding: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                      }}
                    >
                      <Icon d={Icons.user} size={15} color="#fff" /> Edit Profile
                    </motion.button>
                  </div>
                </Card>
            </div>

            {/* 🎯 Extracted Profile Data */}
            <div style={{ marginTop: 24 }}>
              <SectionTitle text="Your AI-Extracted Profile" darkMode={darkMode} />
              {aiDataLoading ? (
                <Card darkMode={darkMode}>
                  <div style={{ textAlign: "center", padding: 24, color: D.textMuted(darkMode), fontSize: 13 }}>
                    <Spinner /> Loading AI data...
                  </div>
                </Card>
              ) : !aiData ? (
                <Card darkMode={darkMode}>
                  <div style={{ textAlign: "center", padding: 24, color: D.textMuted(darkMode), fontSize: 13 }}>
                    No AI-extracted data yet. Upload your resume to get started! 🚀
                  </div>
                </Card>
              ) : (
                <>
                  {/* Summary */}
                  {aiData.summary && (
                    <Card darkMode={darkMode}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: darkMode ? "rgba(245,158,11,0.15)" : "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon d={Icons.user} size={18} color="#f59e0b" />
                        </div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: D.textPri(darkMode) }}>AI Summary</h3>
                      </div>
                      <div style={{ fontSize: 13, color: D.textSec(darkMode), lineHeight: 1.6 }}>
                        {aiData.summary}
                      </div>
                    </Card>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, marginTop: 16 }}>
                    {/* Skills Card */}
                    <Card darkMode={darkMode}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: darkMode ? "rgba(139,92,246,0.15)" : "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon d={Icons.lightning} size={18} color="#8b5cf6" />
                        </div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: D.textPri(darkMode) }}>Skills</h3>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {aiData.skills && aiData.skills.length > 0 ? (
                          aiData.skills.slice(0, 12).map((skill, i) => (
                            <motion.span
                              key={i}
                              whileHover={{ scale: 1.05 }}
                              style={{
                                background: darkMode ? "rgba(139,92,246,0.2)" : "#ede9fe",
                                color: darkMode ? "#d8b4fe" : "#7c3aed",
                                padding: "5px 10px",
                                borderRadius: 12,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                border: `1px solid ${darkMode ? "rgba(139,92,246,0.3)" : "#ddd6fe"}`
                              }}
                            >
                              {String(skill)}
                            </motion.span>
                          ))
                        ) : (
                          <div style={{ fontSize: 12, color: D.textMuted(darkMode) }}>No skills extracted</div>
                        )}
                      </div>
                    </Card>

                    {/* Projects Card */}
                    <Card darkMode={darkMode}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: darkMode ? "rgba(59,130,246,0.15)" : "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon d={Icons.briefcase} size={18} color="#3b82f6" />
                        </div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: D.textPri(darkMode) }}>Projects</h3>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {aiData.projects && aiData.projects.length > 0 ? (
                          aiData.projects.slice(0, 4).map((proj, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              style={{
                                padding: "8px 12px",
                                background: darkMode ? "rgba(59,130,246,0.08)" : "#eff6ff",
                                borderRadius: 8,
                                fontSize: 12,
                                color: D.textSec(darkMode),
                                borderLeft: "3px solid #3b82f6"
                              }}
                            >
                              <div style={{ fontWeight: 700, marginBottom: 2 }}>{proj.title || "Untitled"}</div>
                              <div style={{ fontSize: 11, opacity: 0.8 }}>{proj.description?.substring(0, 80) || ""}...</div>
                              {proj.tech_stack && proj.tech_stack.length > 0 && (
                                <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                                  {proj.tech_stack.map((t, j) => (
                                    <span key={j} style={{ fontSize: 10, background: darkMode ? "rgba(59,130,246,0.2)" : "#dbeafe", padding: "2px 6px", borderRadius: 6, color: darkMode ? "#93c5fd" : "#1d4ed8" }}>{t}</span>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          ))
                        ) : (
                          <div style={{ fontSize: 12, color: D.textMuted(darkMode) }}>No projects extracted</div>
                        )}
                      </div>
                    </Card>

                    {/* Experience Card */}
                    <Card darkMode={darkMode}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: darkMode ? "rgba(16,185,129,0.15)" : "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon d={Icons.send} size={18} color="#10b981" />
                        </div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: D.textPri(darkMode) }}>Experience</h3>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {aiData.experience && aiData.experience.length > 0 ? (
                          aiData.experience.slice(0, 4).map((exp, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              style={{
                                padding: "8px 12px",
                                background: darkMode ? "rgba(16,185,129,0.08)" : "#ecfdf5",
                                borderRadius: 8,
                                fontSize: 12,
                                color: D.textSec(darkMode),
                                borderLeft: "3px solid #10b981"
                              }}
                            >
                              <div style={{ fontWeight: 700 }}>{exp.role || "Role"} @ {exp.company || "Company"}</div>
                              <div style={{ fontSize: 11, opacity: 0.7 }}>{exp.duration || ""}</div>
                            </motion.div>
                          ))
                        ) : (
                          <div style={{ fontSize: 12, color: D.textMuted(darkMode) }}>No experience extracted</div>
                        )}
                      </div>
                    </Card>

                    {/* Certifications Card */}
                    <Card darkMode={darkMode}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: darkMode ? "rgba(245,158,11,0.15)" : "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon d={Icons.trophy} size={18} color="#f59e0b" />
                        </div>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: D.textPri(darkMode) }}>Certifications</h3>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {aiData.certifications && aiData.certifications.length > 0 ? (
                          aiData.certifications.map((cert, i) => (
                            <div key={i} style={{ padding: "6px 10px", background: darkMode ? "rgba(245,158,11,0.08)" : "#fffbeb", borderRadius: 8, fontSize: 12, color: D.textSec(darkMode), borderLeft: "3px solid #f59e0b" }}>
                              <span style={{ fontWeight: 700 }}>{cert.name || "Certificate"}</span>
                              {cert.issuer && <span style={{ opacity: 0.7 }}> — {cert.issuer}</span>}
                              {cert.year && <span style={{ opacity: 0.5 }}> ({cert.year})</span>}
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: 12, color: D.textMuted(darkMode) }}>No certifications extracted</div>
                        )}
                      </div>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── JOB LISTINGS ── */}
        <div id="section-jobs" style={{ scrollMarginTop: 90 }}>
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <SectionTitle text="Job Listings" darkMode={darkMode} />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { fetchJobs(); setJobPage(1); }}
              style={{ background: "none", border: `1px solid ${D.border(darkMode)}`, borderRadius: 10, padding: "6px 12px", color: D.textSec(darkMode), cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}
            >
              <Icon d={Icons.refresh} size={13} color={D.textSec(darkMode)} /> Refresh
            </motion.button>
          </div>
          {/* Job Search Bar */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ position: "relative", maxWidth: 420 }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: D.textMuted(darkMode), pointerEvents: "none" }}>
                <Icon d={Icons.search} size={16} />
              </span>
              <input
                type="text"
                placeholder="Search jobs by company..."
                value={jobSearchQuery}
                onChange={(e) => { setJobSearchQuery(e.target.value); setJobPage(1); }}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 38px",
                  borderRadius: 12,
                  border: `1px solid ${D.border(darkMode)}`,
                  background: D.inputBg(darkMode),
                  color: D.textPri(darkMode),
                  fontSize: 13,
                  outline: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Filter tabs + Sort — only when jobs exist */}
          {!jobsLoading && !jobsError && jobs.length > 0 && (() => {
            const now = new Date();
            const isActive = (j) => j.status === "active" && new Date(j.application_deadline) > now;
            const isClosed = (j) => !isActive(j);

            const filtered = jobs.filter(j => {
              const matchesTab = jobFilter === "all" ? true : jobFilter === "active" ? isActive(j) : isClosed(j);
              const matchesSearch = jobSearchQuery.trim() === "" ? true :
                j.company_name?.toLowerCase().includes(jobSearchQuery.toLowerCase());
              return matchesTab && matchesSearch;
            });

            const sorted = [...filtered].sort((a, b) => {
              if (jobSort === "deadline") return new Date(a.application_deadline) - new Date(b.application_deadline);
              if (jobSort === "ctc") return (parseFloat(b.ctc_lpa) || 0) - (parseFloat(a.ctc_lpa) || 0);
              if (jobSort === "posted") return new Date(b.created_at || 0) - new Date(a.created_at || 0);
              return 0;
            });

            const totalPages = Math.ceil(sorted.length / JOBS_PER_PAGE);
            const safePage = Math.min(jobPage, Math.max(1, totalPages));
            const start = (safePage - 1) * JOBS_PER_PAGE;
            const paginated = sorted.slice(start, start + JOBS_PER_PAGE);

            const TABS = [
              { key: "all", label: "All", count: jobs.length },
              { key: "active", label: "Active", count: jobs.filter(isActive).length },
              { key: "closed", label: "Closed", count: jobs.filter(isClosed).length },
            ];

            return (
              <>
                {/* Filter + Sort toolbar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                  {/* Filter tabs */}
                  <div style={{ display: "flex", gap: 6 }}>
                    {TABS.map(t => {
                      const active = jobFilter === t.key;
                      return (
                        <motion.button
                          key={t.key}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => { setJobFilter(t.key); setJobPage(1); }}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 20,
                            border: "none",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: active ? 700 : 500,
                            background: active
                              ? "linear-gradient(135deg,#4f46e5,#10b981)"
                              : darkMode ? "rgba(255,255,255,0.06)" : "#f3f4f6",
                            color: active ? "#fff" : D.textSec(darkMode),
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          {t.label}
                          <span style={{
                            background: active ? "rgba(255,255,255,0.25)" : darkMode ? "rgba(255,255,255,0.1)" : "#e5e7eb",
                            color: active ? "#fff" : D.textMuted(darkMode),
                            borderRadius: 20,
                            padding: "1px 7px",
                            fontSize: 10,
                            fontWeight: 700,
                          }}>{t.count}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Sort dropdown */}
                  <select
                    value={jobSort}
                    onChange={e => { setJobSort(e.target.value); setJobPage(1); }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 10,
                      border: `1px solid ${D.border(darkMode)}`,
                      background: D.inputBg(darkMode),
                      color: D.textSec(darkMode),
                      fontSize: 12,
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option value="deadline">Sort: Deadline</option>
                    <option value="ctc">Sort: CTC (High to Low)</option>
                    <option value="posted">Sort: Recently Posted</option>
                  </select>
                </div>

                {/* Count indicator */}
                <div style={{ fontSize: 12, color: D.textMuted(darkMode), marginBottom: 12 }}>
                  📊 Showing {sorted.length === 0 ? "0" : `${start + 1}–${Math.min(start + JOBS_PER_PAGE, sorted.length)}`} of {sorted.length} opportunit{sorted.length === 1 ? "y" : "ies"}
                </div>

                {/* Job grid */}
                {sorted.length === 0 ? (
                  <Card darkMode={darkMode}>
                    <div style={{ textAlign: "center", padding: "24px", color: D.textMuted(darkMode), fontSize: 13 }}>
                      No {jobFilter !== "all" ? jobFilter : ""} job listings found.
                    </div>
                  </Card>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
                    {paginated.map(job => (
                      <JobCard key={job.id} job={job} darkMode={darkMode} onApply={handleApply} />
                    ))}
                  </div>
                )}

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 20 }}>
                    {/* Previous */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setJobPage(p => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 10,
                        border: `1px solid ${D.border(darkMode)}`,
                        background: "transparent",
                        color: safePage === 1 ? D.textMuted(darkMode) : D.textSec(darkMode),
                        cursor: safePage === 1 ? "not-allowed" : "pointer",
                        fontSize: 13,
                        opacity: safePage === 1 ? 0.4 : 1,
                      }}
                    >
                      « Prev
                    </motion.button>

                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pg => (
                      <motion.button
                        key={pg}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setJobPage(pg)}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 9,
                          border: "none",
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: pg === safePage ? 800 : 500,
                          background: pg === safePage
                            ? "linear-gradient(135deg,#4f46e5,#10b981)"
                            : darkMode ? "rgba(255,255,255,0.06)" : "#f3f4f6",
                          color: pg === safePage ? "#fff" : D.textSec(darkMode),
                          boxShadow: pg === safePage ? "0 4px 12px rgba(79,70,229,0.3)" : "none",
                        }}
                      >
                        {pg}
                      </motion.button>
                    ))}

                    {/* Next */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setJobPage(p => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 10,
                        border: `1px solid ${D.border(darkMode)}`,
                        background: "transparent",
                        color: safePage === totalPages ? D.textMuted(darkMode) : D.textSec(darkMode),
                        cursor: safePage === totalPages ? "not-allowed" : "pointer",
                        fontSize: 13,
                        opacity: safePage === totalPages ? 0.4 : 1,
                      }}
                    >
                      Next »
                    </motion.button>
                  </div>
                )}
              </>
            );
          })()}

          {/* Loading / error states */}
          {jobsLoading && (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spinner />
              <div style={{ marginTop: 12, color: D.textSec(darkMode), fontSize: 13 }}>Loading job listings...</div>
            </div>
          )}
          {jobsError && <APIError message={jobsError} onRetry={fetchJobs} />}
          {!jobsLoading && !jobsError && jobs.length === 0 && (
            <Card darkMode={darkMode}>
              <div style={{ textAlign: "center", padding: "24px", color: D.textMuted(darkMode), fontSize: 13 }}>
                No job listings available right now.
              </div>
            </Card>
          )}
        </div>

        {/* ── MY APPLICATIONS ── */}
        <div id="section-applications" style={{ scrollMarginTop: 90 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <SectionTitle text="My Applications" darkMode={darkMode} />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={fetchMyApplications}
              style={{
                background: "none",
                border: `1px solid ${D.border(darkMode)}`,
                borderRadius: 10,
                padding: "6px 12px",
                color: D.textSec(darkMode),
                cursor: "pointer",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Icon d={Icons.refresh} size={13} color={D.textSec(darkMode)} />{" "}
              Refresh
            </motion.button>
          </div>
          {/* Applications Search Bar */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ position: "relative", maxWidth: 420 }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: D.textMuted(darkMode), pointerEvents: "none" }}>
                <Icon d={Icons.search} size={16} />
              </span>
              <input
                type="text"
                placeholder="Search applications by company..."
                value={appSearchQuery}
                onChange={(e) => setAppSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 38px",
                  borderRadius: 12,
                  border: `1px solid ${D.border(darkMode)}`,
                  background: D.inputBg(darkMode),
                  color: D.textPri(darkMode),
                  fontSize: 13,
                  outline: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
          <Card darkMode={darkMode}>
            {appsLoading ? (
              <div style={{ textAlign: "center", padding: 32 }}>
                <Spinner />
              </div>
            ) : appsError ? (
              <APIError message={appsError} onRetry={fetchMyApplications} />
            ) : myApplications.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "28px",
                  color: D.textMuted(darkMode),
                  fontSize: 13,
                }}
              >
                No applications yet. Apply to jobs in the Job Listings section!
              </div>
            ) : (
              myApplications
                .filter(app =>
                  appSearchQuery.trim() === "" ? true :
                    app.opportunity_company?.toLowerCase().includes(appSearchQuery.toLowerCase())
                )
                .map((app) => (
                  <ApplicationRow key={app.id} app={app} darkMode={darkMode} />
                ))
            )}
          </Card>
        </div>

        {/* ── INTERVIEWS / EVENTS ── */}
        <div id="section-interviews" style={{ scrollMarginTop: 90 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <SectionTitle text="My Upcoming Events" darkMode={darkMode} />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={fetchMyEvents}
              style={{ background: "none", border: `1px solid ${D.border(darkMode)}`, borderRadius: 10, padding: "6px 12px", color: D.textSec(darkMode), cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}
            >
              <Icon d={Icons.refresh} size={13} color={D.textSec(darkMode)} strokeWidth={1.7} /> Refresh
            </motion.button>
          </div>
          {/* Events Search Bar */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ position: "relative", maxWidth: 420 }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: D.textMuted(darkMode), pointerEvents: "none" }}>
                <Icon d={Icons.search} size={16} />
              </span>
              <input
                type="text"
                placeholder="Search events by company..."
                value={eventSearchQuery}
                onChange={(e) => setEventSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 38px",
                  borderRadius: 12,
                  border: `1px solid ${D.border(darkMode)}`,
                  background: D.inputBg(darkMode),
                  color: D.textPri(darkMode),
                  fontSize: 13,
                  outline: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Info banner */}
          <div style={{ marginBottom: 14, padding: "10px 16px", background: darkMode ? "rgba(99,102,241,0.1)" : "#eef2ff", borderRadius: 12, fontSize: 12, color: darkMode ? "#c7d2fe" : "#4338ca", border: `1px solid ${darkMode ? "rgba(99,102,241,0.2)" : "#c7d2fe"}`, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon d={Icons.calendar} size={14} color={darkMode ? "#c7d2fe" : "#4338ca"} strokeWidth={1.7} />
            Events are shown for opportunities where you are shortlisted or further in the process.
          </div>

          {eventsLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spinner />
              <div style={{ marginTop: 12, color: D.textSec(darkMode), fontSize: 13 }}>Loading events...</div>
            </div>
          ) : eventsError ? (
            <div style={{ padding: "14px 18px", background: darkMode ? "rgba(239,68,68,0.12)" : "#fee2e2", borderRadius: 12, color: darkMode ? "#fca5a5" : "#7f1d1d", fontSize: 13, border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Icon d={Icons.warning} size={16} color={darkMode ? "#fca5a5" : "#ef4444"} strokeWidth={1.7} />
              <span style={{ flex: 1 }}>{eventsError}</span>
              <button onClick={fetchMyEvents} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Retry</button>
            </div>
          ) : myEvents.length === 0 ? (
            <Card darkMode={darkMode}>
              <div style={{ textAlign: "center", padding: "28px 20px" }}>
                <div style={{ width: 54, height: 54, borderRadius: "50%", background: darkMode ? "rgba(99,102,241,0.15)" : "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <Icon d={Icons.calendar} size={26} color="#6366f1" strokeWidth={1.5} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: D.textPri(darkMode), marginBottom: 6 }}>No events scheduled yet</div>
                <div style={{ fontSize: 13, color: D.textSec(darkMode) }}>
                  Events will appear here once you are shortlisted and the placement coordinator schedules tests or interviews.
                </div>
              </div>
            </Card>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
              {myEvents
                .filter(ev =>
                  eventSearchQuery.trim() === "" ? true :
                    ev.opportunity_company?.toLowerCase().includes(eventSearchQuery.toLowerCase())
                )
                .map((event) => (
                  <EventCard key={event.id} event={event} darkMode={darkMode} />
                ))}
            </div>
          )}
        </div>

        {/* ── PLACED STUDENTS ── */}
        <div id="section-placed" style={{ scrollMarginTop: 90 }}>
          <SectionTitle
            text="🏆 Wall of Fame"
            darkMode={darkMode}
          />
          <div
            style={{
              marginBottom: 16,
              padding: "12px 18px",
              background: darkMode
                ? "rgba(16,185,129,0.08)"
                : "linear-gradient(135deg,#ecfdf5,#d1fae5)",
              borderRadius: 14,
              fontSize: 13,
              color: D.textSec(darkMode),
              border: `1px solid ${D.border(darkMode)}`,
            }}
          >
            🎉 Celebrating our achievers — updated live by Placement Cell.
          </div>
          {wallOfFameLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spinner />
              <div
                style={{
                  marginTop: 12,
                  color: D.textSec(darkMode),
                  fontSize: 13,
                }}
              >
                Loading wall of fame...
              </div>
            </div>
          ) : wallOfFameError ? (
            <APIError
              message={wallOfFameError}
              onRetry={fetchWallOfFame}
            />
          ) : placedStudents.length === 0 ? (
            <Card darkMode={darkMode}>
              <div style={{ textAlign: "center", padding: 32 }}>
                No placed students yet.
              </div>
            </Card>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
                gap: 20,
              }}
            >
              {placedStudents.map((s, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(16,185,129,0.18)" }}
                  style={{
                    background: darkMode
                      ? "linear-gradient(160deg,#0f172a,#111827)"
                      : "#f8fafc",
                    borderRadius: 20,
                    overflow: "hidden",
                    border: `1px solid ${D.border(darkMode)}`,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1/1",
                      position: "relative",
                    }}
                  >
                    <img
                      src={s.student_photo_url || "https://i.pravatar.cc/100?img=default"}
                      alt="student"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.4), transparent)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 14,
                        right: 14,
                        background:
                          "linear-gradient(135deg,#10b981,#059669)",
                        color: "#fff",
                        fontSize: 12,
                        padding: "6px 16px",
                        borderRadius: 20,
                        fontWeight: 700,
                      }}
                    >
                      🎉 Placed
                    </div>
                  </div>
                  <div style={{ padding: 14, textAlign: "center" }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: darkMode ? "#d1fae5" : "#064e3b", marginBottom: 2 }}>
                      {s.student_name}
                    </div>
                    <div style={{ fontSize: 13, color: "#10b981", fontWeight: 600, marginBottom: 2 }}>
                      {s.company_name}
                    </div>
                    <div style={{ fontSize: 12, color: darkMode ? "#9ca3af" : "#6b7280", marginBottom: 10 }}>
                      {s.role}{s.ctc_lpa ? ` · ₹${s.ctc_lpa} LPA` : ""}
                    </div>
                    <div style={{ padding: "10px 12px", background: darkMode ? "rgba(16,185,129,0.1)" : "#ecfdf5", borderRadius: 12, fontSize: 12, fontStyle: "italic", color: darkMode ? "#6ee7b7" : "#065f46" }}>
                      🎉 {s.greeting}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* ── ANNOUNCEMENTS ── */}
        <div id="section-announcements" style={{ scrollMarginTop: 90 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <SectionTitle text="📢 Announcements" darkMode={darkMode} />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={fetchAnnouncements}
              style={{
                background: "none",
                border: `1px solid ${D.border(darkMode)}`,
                borderRadius: 10,
                padding: "6px 12px",
                color: D.textSec(darkMode),
                cursor: "pointer",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Icon d={Icons.refresh} size={13} color={D.textSec(darkMode)} />{" "}
              Refresh
            </motion.button>
          </div>

          {announcementsLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spinner />
              <div style={{ marginTop: 12, color: D.textSec(darkMode), fontSize: 13 }}>
                Loading announcements...
              </div>
            </div>
          ) : announcementsError ? (
            <APIError message={announcementsError} onRetry={fetchAnnouncements} />
          ) : announcements.length === 0 ? (
            <Card darkMode={darkMode}>
              <div style={{ textAlign: "center", padding: 32, color: D.textMuted(darkMode), fontSize: 13 }}>
                <Icon d={Icons.bell} size={28} color={D.textMuted(darkMode)} />
                <div style={{ marginTop: 8 }}>No announcements yet</div>
              </div>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {announcements.map((announcement) => (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: announcement.is_pinned
                      ? darkMode
                        ? "linear-gradient(135deg,rgba(245,158,11,0.08),rgba(59,130,246,0.05))"
                        : "linear-gradient(135deg,#fef3c7,#dbeafe)"
                      : D.cardBg(darkMode),
                    borderRadius: 16,
                    border: `1px solid ${announcement.is_pinned
                      ? darkMode
                        ? "rgba(245,158,11,0.3)"
                        : "#fde68a"
                      : D.border(darkMode)
                      }`,
                    padding: "18px 20px",
                    boxShadow: announcement.is_pinned
                      ? darkMode
                        ? "0 4px 16px rgba(245,158,11,0.15)"
                        : "0 4px 12px rgba(245,158,11,0.1)"
                      : "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    {/* Icon/Pin indicator */}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: announcement.is_pinned
                          ? darkMode
                            ? "rgba(245,158,11,0.15)"
                            : "rgba(245,158,11,0.1)"
                          : darkMode
                            ? "rgba(16,185,129,0.15)"
                            : "#d1fae5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                        d={announcement.is_pinned ? Icons.warning : Icons.bell}
                        size={18}
                        color={announcement.is_pinned ? "#f59e0b" : "#10b981"}
                        strokeWidth={1.8}
                      />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: D.textPri(darkMode),
                          }}
                        >
                          {String(announcement.title || "")}
                        </span>
                        {announcement.is_pinned && (
                          <span
                            style={{
                              background: "#f59e0b",
                              color: "#fff",
                              padding: "2px 8px",
                              borderRadius: 12,
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: "uppercase",
                            }}
                          >
                            📌 Pinned
                          </span>
                        )}
                      </div>

                      <p
                        style={{
                          fontSize: 13,
                          color: D.textSec(darkMode),
                          lineHeight: 1.6,
                          marginBottom: 8,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {String(announcement.message || announcement.display_message || "")}
                      </p>

                      {announcement.mentioned_students &&
                        announcement.mentioned_students.length > 0 && (
                          <div style={{ marginBottom: 10 }}>
                            <div
                              style={{
                                fontSize: 11,
                                color: D.textMuted(darkMode),
                                fontWeight: 600,
                                marginBottom: 6,
                                textTransform: "uppercase",
                              }}
                            >
                              👤 Mentioned Students:
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 6,
                              }}
                            >
                              {announcement.mentioned_students.map((student) => (
                                <span
                                  key={student.student_id}
                                  style={{
                                    background: darkMode
                                      ? "rgba(16,185,129,0.1)"
                                      : "#d1fae5",
                                    color: darkMode ? "#6ee7b7" : "#065f46",
                                    padding: "4px 10px",
                                    borderRadius: 16,
                                    fontSize: 12,
                                    fontWeight: 600,
                                  }}
                                >
                                  {String(student.student_name)} ({student.roll_no})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: 10,
                          paddingTop: 10,
                          borderTop: `1px solid ${D.border(darkMode)}`,
                          fontSize: 12,
                          color: D.textMuted(darkMode),
                        }}
                      >
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <span>
                            📅{" "}
                            {String(
                              new Date(announcement.created_at).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            )}
                          </span>
                          {announcement.coordinator_name && (
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              👨‍💼 {String(announcement.coordinator_name)}
                            </span>
                          )}
                        </div>
                        {announcement.announcement_type && (
                          <span
                            style={{
                              background: darkMode
                                ? "rgba(99,102,241,0.1)"
                                : "#eef2ff",
                              color: darkMode ? "#c7d2fe" : "#4338ca",
                              padding: "2px 8px",
                              borderRadius: 12,
                              fontWeight: 600,
                            }}
                          >
                            {String(announcement.announcement_type)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 48,
            padding: "20px 0",
            borderTop: `1px solid ${D.border(darkMode)}`,
            fontSize: 12,
            color: D.textMuted(darkMode),
          }}
        >
          © {new Date().getFullYear()} Indus University Placement Portal · All
          rights reserved
        </div>
      </main>
      {/* ── EDIT PROFILE DRAWER ── */}
      <AnimatePresence>
        {showEditProfile && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleOpenEditProfile}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 600 }}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(480px, 100vw)", background: D.cardBg(darkMode), zIndex: 700, display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,0.25)" }}
            >
              {/* Drawer Header */}
              <div style={{ padding: "20px 24px", borderBottom: `1px solid ${D.border(darkMode)}`, background: "linear-gradient(135deg,#4f46e5,#10b981)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <div>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>Edit Profile</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 }}>Update your academic & personal details</div>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowEditProfile(false)}
                  style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
                  <Icon d={Icons.close} size={16} color="#fff" />
                </motion.button>
              </div>

              {/* Drawer Body */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

                {/* Personal Info */}
                <div style={{ fontSize: 12, fontWeight: 700, color: darkMode ? "#6ee7b7" : "#065f46", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Personal Info</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  {[["first_name", "First Name"], ["last_name", "Last Name"]].map(([n, l]) => (
                    <div key={n}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: D.textSec(darkMode), display: "block", marginBottom: 4 }}>{l} *</label>
                      <input name={n} value={editForm[n]} onChange={handleEditFormChange}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: `1px solid ${D.border(darkMode)}`, background: D.inputBg(darkMode), color: D.textPri(darkMode), fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: D.textSec(darkMode), display: "block", marginBottom: 4 }}>Roll Number *</label>
                    <input name="roll_no" value={editForm.roll_no} onChange={handleEditFormChange}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: `1px solid ${D.border(darkMode)}`, background: D.inputBg(darkMode), color: D.textPri(darkMode), fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: D.textSec(darkMode), display: "block", marginBottom: 4 }}>Department</label>
                    <input name="department_id" value={editForm.department_id} onChange={handleEditFormChange}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: `1px solid ${D.border(darkMode)}`, background: D.inputBg(darkMode), color: D.textPri(darkMode), fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: D.textSec(darkMode), display: "block", marginBottom: 4 }}>Branch *</label>
                    <select name="branch" value={editForm.branch} onChange={handleEditFormChange}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: `1px solid ${D.border(darkMode)}`, background: D.inputBg(darkMode), color: D.textPri(darkMode), fontSize: 13, outline: "none", boxSizing: "border-box" }}>
                      <option value="">Select Branch</option>
                      {BRANCH_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: D.textSec(darkMode), display: "block", marginBottom: 4 }}>Graduation Year</label>
                    <input name="graduation_year" type="number" min="2000" max="2030" value={editForm.graduation_year} onChange={handleEditFormChange}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: `1px solid ${D.border(darkMode)}`, background: D.inputBg(darkMode), color: D.textPri(darkMode), fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>

                {/* Academic */}
                <div style={{ fontSize: 12, fontWeight: 700, color: darkMode ? "#6ee7b7" : "#065f46", margin: "16px 0 10px", textTransform: "uppercase", letterSpacing: 1 }}>Academic</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                  {[["cgpa", "CGPA", "number", "0.01", "1", "10"], ["tenth_percentage", "10th %", "number", "0.01", "0", "100"], ["twelfth_percentage", "12th %", "number", "0.01", "0", "100"]].map(([n, l, t, s, mn, mx]) => (
                    <div key={n}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: D.textSec(darkMode), display: "block", marginBottom: 4 }}>{l}</label>
                      <input name={n} type={t} step={s} min={mn} max={mx} value={editForm[n]} onChange={handleEditFormChange}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: `1px solid ${D.border(darkMode)}`, background: D.inputBg(darkMode), color: D.textPri(darkMode), fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  {[["active_backlogs", "Active Backlogs"], ["total_backlogs", "Total Backlogs"]].map(([n, l]) => (
                    <div key={n}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: D.textSec(darkMode), display: "block", marginBottom: 4 }}>{l}</label>
                      <input name={n} type="number" min="0" value={editForm[n]} onChange={handleEditFormChange}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: `1px solid ${D.border(darkMode)}`, background: D.inputBg(darkMode), color: D.textPri(darkMode), fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>

                {/* Resume */}
                <div style={{ fontSize: 12, fontWeight: 700, color: darkMode ? "#6ee7b7" : "#065f46", margin: "16px 0 10px", textTransform: "uppercase", letterSpacing: 1 }}>Resume</div>
                <div style={{ marginBottom: 16 }}>
                  {/* Current resume indicator */}
                  {currentResumeUrl && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "8px 12px", background: darkMode ? "rgba(16,185,129,0.08)" : "#f0fdf4", borderRadius: 9, border: `1px solid ${D.border(darkMode)}` }}>
                      <Icon d={Icons.check} size={14} color="#10b981" strokeWidth={2.5} />
                      <span style={{ fontSize: 12, color: darkMode ? "#6ee7b7" : "#065f46", fontWeight: 600, flex: 1 }}>Resume uploaded</span>
                      <a href={currentResumeUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 11, color: "#6366f1", fontWeight: 700, textDecoration: "none" }}
                      >View ↗</a>
                    </div>
                  )}
                  {/* File picker */}
                  <label style={{ fontSize: 11, fontWeight: 600, color: D.textSec(darkMode), display: "block", marginBottom: 6 }}>
                    {currentResumeUrl ? "Add Updated Resume (PDF, max 5MB)" : "Upload Resume * (PDF, max 5MB)"}
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="resume-upload-input"
                      type="file"
                      accept=".pdf,application/pdf"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const f = e.target.files[0];
                        if (!f) return;
                        if (f.type !== "application/pdf") { showToast("Only PDF files allowed", "error"); e.target.value = ""; return; }
                        if (f.size > 5 * 1024 * 1024) { showToast("File must be under 5MB", "error"); e.target.value = ""; return; }
                        setResumeFile(f);
                      }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      onClick={() => document.getElementById("resume-upload-input").click()}
                      type="button"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 9,
                        border: `1.5px dashed ${resumeFile ? "#10b981" : D.border(darkMode)}`,
                        background: resumeFile
                          ? darkMode ? "rgba(16,185,129,0.08)" : "#f0fdf4"
                          : darkMode ? "rgba(255,255,255,0.03)" : "#fafafa",
                        color: resumeFile ? (darkMode ? "#6ee7b7" : "#065f46") : D.textSec(darkMode),
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        transition: "all 0.2s",
                        boxSizing: "border-box",
                      }}
                    >
                      <Icon d={resumeFile ? Icons.check : Icons.upload} size={15}
                        color={resumeFile ? "#10b981" : D.textMuted(darkMode)} strokeWidth={resumeFile ? 2.5 : 1.7} />
                      {resumeFile ? `✅ ${resumeFile.name}` : "Click to select PDF file"}
                    </motion.button>
                    {resumeFile && (
                      <button
                        onClick={() => setResumeFile(null)}
                        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4, opacity: 0.6 }}
                        title="Remove selected file"
                      >
                        <Icon d={Icons.close} size={12} color={D.textMuted(darkMode)} />
                      </button>
                    )}
                  </div>
                  {resumeUploading && (
                    <div style={{ fontSize: 12, color: "#6366f1", marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        style={{ width: 11, height: 11, borderRadius: "50%", border: "2px solid rgba(99,102,241,0.3)", borderTopColor: "#6366f1" }} />
                      Uploading resume...
                    </div>
                  )}
                </div>

                {/* Links */}
                <div style={{ fontSize: 12, fontWeight: 700, color: darkMode ? "#6ee7b7" : "#065f46", margin: "16px 0 10px", textTransform: "uppercase", letterSpacing: 1 }}>Links</div>
                {[["linkedin_url", "LinkedIn URL"], ["github_url", "GitHub URL"], ["portfolio_url", "Portfolio URL"]].map(([n, l]) => (
                  <div key={n} style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: D.textSec(darkMode), display: "block", marginBottom: 4 }}>{l}</label>
                    <input name={n} type="url" value={editForm[n]} onChange={handleEditFormChange}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: `1px solid ${D.border(darkMode)}`, background: D.inputBg(darkMode), color: D.textPri(darkMode), fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>

              {/* Drawer Footer */}
              <div style={{ padding: "16px 24px", borderTop: `1px solid ${D.border(darkMode)}`, display: "flex", gap: 10, flexShrink: 0 }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowEditProfile(false)}
                  style={{ flex: 1, padding: "11px", borderRadius: 11, border: `1px solid ${D.border(darkMode)}`, background: "transparent", color: D.textPri(darkMode), fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
                  Cancel
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleEditSubmit} disabled={editSaving}
                  style={{ flex: 2, padding: "11px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#4f46e5,#10b981)", color: "#fff", fontWeight: 700, cursor: editSaving ? "not-allowed" : "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: editSaving ? 0.7 : 1 }}>
                  {editSaving ? (
                    <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff" }} /> Saving...</>
                  ) : (
                    <><Icon d={Icons.check} size={15} color="#fff" strokeWidth={2.5} /> Save Changes</>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}