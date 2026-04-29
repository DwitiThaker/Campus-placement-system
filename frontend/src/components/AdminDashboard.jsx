import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const D = {
  pageBg: (dm) => dm ? "linear-gradient(160deg,#0a0f1e 0%,#0d1f1a 50%,#091510 100%)" : "linear-gradient(160deg,#eef2ff 0%,#f0fdf4 60%,#ecfdf5 100%)",
  cardBg: (dm) => dm ? "rgba(10,31,26,0.85)" : "#ffffff",
  inputBg: (dm) => dm ? "rgba(10,31,26,0.7)" : "#f0fdf4",
  textPri: (dm) => dm ? "#d1fae5" : "#064e3b",
  textSec: (dm) => dm ? "#6ee7b7" : "#6b7280",
  textMuted: (dm) => dm ? "#4a7c6e" : "#9ca3af",
  border: (dm) => dm ? "rgba(16,185,129,0.2)" : "#d1fae5",
  headerBg: (dm) => dm ? "linear-gradient(135deg,#1e1b4b 0%,#065f46 100%)" : "linear-gradient(135deg,#4f46e5 0%,#10b981 100%)",
};

const Icon = ({ d, size = 18, color = "currentColor", sw = 1.7 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const IC = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  company: "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2",
  apps: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2",
  placed: "M12 15l-2 5L5 8l14-3-5 10z",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  sun: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z",
  moon: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  camera: "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z M12 17a4 4 0 100-8 4 4 0 000 8z",
  plus: "M12 5v14M5 12h14",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  pdf: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  check: "M20 6L9 17l-5-5",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  mapPin: "M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z M12 13a3 3 0 100-6 3 3 0 000 6z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0",
  close: "M18 6L6 18M6 6l12 12",
  trophy: "M6 9H4a2 2 0 00-2 2v1a4 4 0 004 4h1m8-7h2a2 2 0 012 2v1a4 4 0 01-4 4h-1M9 21h6M12 17v4M8 3h8l-1 6H9L8 3z",
  refresh: "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  warning: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  calendar: "M3 9h18M3 15h18M9 3v18M15 3v18M3 3h18v18H3z",
  clock: "M12 22a10 10 0 110-20 10 10 0 010 20zM12 6v6l4 2",
  mic: "M12 2a3 3 0 013 3v7a3 3 0 01-6 0V5a3 3 0 013-3zM19 10v2a7 7 0 01-14 0v-2M12 19v3M8 22h8",
  test: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M12 12h.01M12 16h.01",
  events: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  megaphone: "M3 11l19-9-9 19-2-8-8-2z",
  pin: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  atSign: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8 M22 21l-6-6",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  send: "M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z",
  thumbtack: "M12 17v5 M5 12H2l3.09-6.91A2 2 0 016.91 4h10.18a2 2 0 011.82 1.09L22 12h-3",
};

const NAV_ITEMS = [
  { label: "Dashboard", id: "sec-dashboard", icon: IC.dashboard },
  { label: "Post Opportunity", id: "sec-addopp", icon: IC.company },
  { label: "Opportunities", id: "sec-opportunities", icon: IC.apps },
  { label: "Events", id: "sec-events", icon: IC.events },
  { label: "Announcements", id: "sec-announcements", icon: IC.megaphone },
  { label: "Placed Students", id: "sec-placed", icon: IC.placed },
];

const APP_STATUS_OPTIONS = ["applied", "shortlisted", "test_scheduled", "interviewed", "offered", "accepted", "rejected"];
const APP_STATUS_CONFIG = {
  applied: { label: "Applied", bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
  shortlisted: { label: "Shortlisted", bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  test_scheduled: { label: "Test Scheduled", bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  interviewed: { label: "Interviewed", bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  offered: { label: "Offer Received", bg: "#dcfce7", color: "#14532d", dot: "#22c55e" },
  accepted: { label: "Accepted", bg: "#dcfce7", color: "#14532d", dot: "#22c55e" },
  rejected: { label: "Rejected", bg: "#fee2e2", color: "#7f1d1d", dot: "#ef4444" },
};

const ANN_TYPES = [
  { value: "general",             label: "General",             emoji: "📢", bg: "#eef2ff", color: "#4338ca", dbg: "rgba(99,102,241,0.18)",  dc: "#c7d2fe" },
  { value: "placement",           label: "Placement",           emoji: "🏢", bg: "#d1fae5", color: "#065f46", dbg: "rgba(16,185,129,0.18)", dc: "#6ee7b7" },
  { value: "deadline_extension",  label: "Deadline Extension",  emoji: "⏰", bg: "#fef3c7", color: "#92400e", dbg: "rgba(245,158,11,0.18)", dc: "#fcd34d" },
  { value: "test_reminder",       label: "Test Reminder",       emoji: "📝", bg: "#ede9fe", color: "#5b21b6", dbg: "rgba(139,92,246,0.18)", dc: "#c4b5fd" },
  { value: "interview_reminder",  label: "Interview Reminder",  emoji: "🎙️", bg: "#fce7f3", color: "#9f1239", dbg: "rgba(244,63,94,0.18)",  dc: "#fda4af" },
  { value: "custom",              label: "Custom",              emoji: "✨", bg: "#f0fdf4", color: "#166534", dbg: "rgba(34,197,94,0.18)",  dc: "#86efac" },
];
const ANN_TYPE_MAP = Object.fromEntries(ANN_TYPES.map((t) => [t.value, t]));

const Card = ({ children, darkMode, style = {} }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    style={{ background: D.cardBg(darkMode), borderRadius: 18, padding: "20px 22px", border: `1px solid ${D.border(darkMode)}`, boxShadow: darkMode ? "0 4px 24px rgba(0,0,0,0.35)" : "0 4px 20px rgba(99,102,241,0.07)", ...style }}>
    {children}
  </motion.div>
);

const SectionTitle = ({ text, darkMode }) => (
  <motion.h2 initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
    style={{ fontSize: 17, fontWeight: 700, color: darkMode ? "#6ee7b7" : "#064e3b", margin: "28px 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
    <span style={{ width: 4, height: 18, background: "linear-gradient(180deg,#6366f1,#10b981)", borderRadius: 4, display: "inline-block" }} />
    {text}
  </motion.h2>
);

const InputField = ({ label, darkMode, style = {}, ...props }) => (
  <div>
    <label style={{ fontSize: 12, fontWeight: 600, color: D.textSec(darkMode), display: "block", marginBottom: 5 }}>{label}</label>
    <input {...props} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${D.border(darkMode)}`, background: D.inputBg(darkMode), color: D.textPri(darkMode), fontSize: 13, outline: "none", boxSizing: "border-box", ...style }} />
  </div>
);

const TextareaField = ({ label, darkMode, style = {}, ...props }) => (
  <div>
    <label style={{ fontSize: 12, fontWeight: 600, color: D.textSec(darkMode), display: "block", marginBottom: 5 }}>{label}</label>
    <textarea {...props} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${D.border(darkMode)}`, background: D.inputBg(darkMode), color: D.textPri(darkMode), fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical", minHeight: 90, ...style }} />
  </div>
);

function Spinner({ color = "#10b981", size = 28 }) {
  return <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: size, height: size, borderRadius: "50%", border: `3px solid ${color}25`, borderTopColor: color, margin: "0 auto" }} />;
}

function Toast({ message, type = "success", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#6366f1";
  return (
    <motion.div initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }}
      style={{ position: "fixed", top: 20, left: "50%", background: bg, color: "#fff", padding: "12px 24px", borderRadius: 14, fontWeight: 600, fontSize: 14, zIndex: 9999, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
      <Icon d={type === "success" ? IC.check : IC.warning} size={16} color="#fff" sw={2.5} />{message}
    </motion.div>
  );
}

function APIError({ message, onRetry, darkMode }) {
  return (
    <div style={{ padding: "14px 18px", background: darkMode ? "rgba(239,68,68,0.12)" : "#fee2e2", borderRadius: 12, color: darkMode ? "#fca5a5" : "#7f1d1d", fontSize: 13, marginBottom: 12, border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", gap: 10 }}>
      <Icon d={IC.warning} size={16} color={darkMode ? "#fca5a5" : "#ef4444"} />
      <span style={{ flex: 1 }}>{message}</span>
      {onRetry && <button onClick={onRetry} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Retry</button>}
    </div>
  );
}

function Btn({ children, onClick, color = "indigo", loading = false, style = {}, disabled = false, ...props }) {
  const bgs = { indigo: "linear-gradient(135deg,#4f46e5,#10b981)", green: "linear-gradient(135deg,#10b981,#059669)", amber: "linear-gradient(135deg,#f59e0b,#d97706)", red: "linear-gradient(135deg,#ef4444,#dc2626)" };
  return (
    <motion.button whileHover={{ scale: (loading || disabled) ? 1 : 1.02 }} whileTap={{ scale: (loading || disabled) ? 1 : 0.97 }} onClick={onClick} disabled={loading || disabled} {...props}
      style={{ background: bgs[color] || bgs.indigo, color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontWeight: 700, cursor: (loading || disabled) ? "not-allowed" : "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6, opacity: (loading || disabled) ? 0.7 : 1, ...style }}>
      {loading ? <><Spinner color="#fff" size={14} /> Saving...</> : children}
    </motion.button>
  );
}

function StatCard({ title, value, icon, color, darkMode, delay = 0 }) {
  const pal = {
    indigo: { l: { bg: "#eef2ff", ac: "#6366f1", tx: "#3730a3" }, d: { bg: "#1e1b4b", ac: "#818cf8", tx: "#c7d2fe" } },
    emerald: { l: { bg: "#d1fae5", ac: "#10b981", tx: "#065f46" }, d: { bg: "#064e3b", ac: "#34d399", tx: "#6ee7b7" } },
    amber: { l: { bg: "#fef3c7", ac: "#f59e0b", tx: "#92400e" }, d: { bg: "#2d1a00", ac: "#fbbf24", tx: "#fcd34d" } },
    violet: { l: { bg: "#ede9fe", ac: "#8b5cf6", tx: "#5b21b6" }, d: { bg: "#1a0d2e", ac: "#a78bfa", tx: "#c4b5fd" } },
    rose: { l: { bg: "#ffe4e6", ac: "#f43f5e", tx: "#9f1239" }, d: { bg: "#2d0a0a", ac: "#fb7185", tx: "#fda4af" } },
    sky: { l: { bg: "#e0f2fe", ac: "#0ea5e9", tx: "#0369a1" }, d: { bg: "#0c2340", ac: "#38bdf8", tx: "#7dd3fc" } },
  };
  const c = (pal[color] || pal.indigo)[darkMode ? "d" : "l"];
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }} whileHover={{ y: -4, boxShadow: `0 12px 28px ${c.ac}30` }}
      style={{ background: c.bg, borderRadius: 16, padding: "18px 14px", textAlign: "center", border: `1.5px solid ${c.ac}28` }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${c.ac}18`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
        <Icon d={icon} size={20} color={c.ac} sw={1.8} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: c.ac, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: c.tx, fontWeight: 600, marginTop: 4 }}>{title}</div>
    </motion.div>
  );
}

function TopBar({ darkMode, setDarkMode, notifications, markAllRead, markOneRead, deleteNotif, notifLoading, activeSection, onNav, admin, onPhotoChange, fileInputRef, onLogout }) {
  const [showNotif, setShowNotif] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const unread = notifications.filter((n) => !n.is_read).length;

  const getIcon = (type) => {
    if (!type) return IC.bell;
    if (type.includes("shortlisted")) return IC.check;
    if (type.includes("rejected")) return IC.warning;
    if (type.includes("offer") || type.includes("wall")) return IC.trophy;
    if (type.includes("test") || type.includes("interview")) return IC.apps;
    if (type.includes("application")) return IC.apps;
    if (type.includes("opportunity") || type.includes("deadline")) return IC.company;
    return IC.bell;
  };

  return (
    <header style={{ background: D.headerBg(darkMode), boxShadow: "0 4px 24px rgba(79,70,229,0.28)", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 32px", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <motion.div whileHover={{ scale: 1.08 }} style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: "#fff", fontFamily: "'Georgia',serif" }}>IU</motion.div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, fontFamily: "'Georgia',serif", letterSpacing: 0.3, lineHeight: 1.2 }}>Indus University</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase" }}>Admin — Placement Portal</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <motion.button whileTap={{ scale: 0.92 }} onClick={() => setDarkMode(!darkMode)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "6px 14px", color: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
            <Icon d={darkMode ? IC.sun : IC.moon} size={13} color="#fff" /> {darkMode ? "Light" : "Dark"}
          </motion.button>

          <div style={{ position: "relative" }}>
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => setShowNotif(!showNotif)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d={IC.bell} size={16} color="#fff" />
            </motion.button>
            {unread > 0 && (
              <span style={{ position: "absolute", top: -3, right: -3, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{unread}</span>
            )}
            <AnimatePresence>
              {showNotif && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  style={{ position: "absolute", right: 0, top: 46, width: 340, background: D.cardBg(darkMode), borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", border: `1px solid ${D.border(darkMode)}`, overflow: "hidden", zIndex: 200, maxHeight: 420, display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: "11px 16px", borderBottom: `1px solid ${D.border(darkMode)}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: D.textPri(darkMode) }}>
                      Notifications {unread > 0 && <span style={{ background: "#ef4444", color: "#fff", borderRadius: 20, padding: "1px 7px", fontSize: 10, marginLeft: 6 }}>{unread}</span>}
                    </span>
                    <button onClick={markAllRead} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Mark all read</button>
                  </div>
                  <div style={{ overflowY: "auto", flex: 1 }}>
                    {notifLoading ? (
                      <div style={{ padding: 20, textAlign: "center", color: D.textMuted(darkMode), fontSize: 13 }}>Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div style={{ padding: "28px 20px", textAlign: "center", color: D.textMuted(darkMode), fontSize: 13 }}>
                        <Icon d={IC.bell} size={28} color={D.textMuted(darkMode)} />
                        <div style={{ marginTop: 8 }}>No notifications yet</div>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} onClick={() => !n.is_read && markOneRead(n.id)}
                          style={{ padding: "10px 16px", borderBottom: `1px solid ${D.border(darkMode)}`, background: n.is_read ? "transparent" : darkMode ? "rgba(16,185,129,0.08)" : "#f0fdf4", display: "flex", alignItems: "flex-start", gap: 10, cursor: n.is_read ? "default" : "pointer" }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: darkMode ? "rgba(16,185,129,0.15)" : "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                            <Icon d={getIcon(n.type)} size={14} color="#10b981" />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: D.textPri(darkMode), marginBottom: 2 }}>{n.title}</div>
                            <div style={{ fontSize: 12, color: D.textSec(darkMode), lineHeight: 1.4 }}>{n.message}</div>
                            <div style={{ fontSize: 10, color: D.textMuted(darkMode), marginTop: 4 }}>
                              {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
                            {!n.is_read && <span style={{ width: 7, height: 7, background: "#6366f1", borderRadius: "50%" }} />}
                            <button onClick={(e) => { e.stopPropagation(); deleteNotif(n.id); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, opacity: 0.5 }}>
                              <Icon d={IC.close} size={11} color={D.textMuted(darkMode)} />
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

          <div style={{ position: "relative" }}>
            <motion.img whileHover={{ scale: 1.06 }} src={admin.avatar} alt="admin" onClick={() => setShowMenu(!showMenu)} style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.5)", cursor: "pointer", objectFit: "cover" }} />
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPhotoChange} />
            <AnimatePresence>
              {showMenu && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  style={{ position: "absolute", right: 0, top: 50, width: 200, background: D.cardBg(darkMode), borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", border: `1px solid ${D.border(darkMode)}`, overflow: "hidden", zIndex: 200 }}>
                  <div style={{ padding: "12px 14px", borderBottom: `1px solid ${D.border(darkMode)}` }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: D.textPri(darkMode) }}>{admin.name}</div>
                    <div style={{ fontSize: 11, color: D.textSec(darkMode) }}>{admin.email}</div>
                  </div>
                  <button onClick={() => { fileInputRef.current?.click(); setShowMenu(false); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#6366f1", fontWeight: 600 }}>
                    <Icon d={IC.camera} size={14} color="#6366f1" /> Change Photo
                  </button>
                  <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#ef4444", fontWeight: 600 }}>
                    <Icon d={IC.logout} size={14} color="#ef4444" /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button whileTap={{ scale: 0.92 }} onClick={onLogout} style={{ background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 20, padding: "6px 14px", color: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
            <Icon d={IC.logout} size={13} color="#fff" /> Logout
          </motion.button>
        </div>
      </div>
      <nav style={{ display: "flex", gap: 2, padding: "4px 28px", overflowX: "auto" }}>
        {NAV_ITEMS.map(({ label, id, icon }) => {
          const active = activeSection === id;
          return (
            <motion.button key={id} onClick={() => onNav(id)} whileHover={{ background: "rgba(255,255,255,0.12)" }}
              style={{ background: active ? "rgba(255,255,255,0.18)" : "transparent", border: "none", borderBottom: active ? "2.5px solid #fff" : "2.5px solid transparent", color: active ? "#fff" : "rgba(255,255,255,0.65)", padding: "8px 14px", borderRadius: active ? "8px 8px 0 0" : 8, cursor: "pointer", fontSize: 12, fontWeight: active ? 700 : 400, whiteSpace: "nowrap", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 5 }}>
              <Icon d={icon} size={13} color={active ? "#fff" : "rgba(255,255,255,0.65)"} />{label}
            </motion.button>
          );
        })}
      </nav>
    </header>
  );
}

// ── EVENT TYPE BADGE ──────────────────────────────────────────────────────────
function EventTypeBadge({ type, darkMode }) {
  const isTest = type === "test";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: isTest ? (darkMode ? "rgba(245,158,11,0.2)" : "#fef3c7") : (darkMode ? "rgba(99,102,241,0.2)" : "#eef2ff"),
      color: isTest ? (darkMode ? "#fcd34d" : "#92400e") : (darkMode ? "#c7d2fe" : "#4338ca"),
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700
    }}>
      <Icon d={isTest ? IC.test : IC.mic} size={10} color={isTest ? (darkMode ? "#fcd34d" : "#92400e") : (darkMode ? "#c7d2fe" : "#4338ca")} />
      {isTest ? "Test" : "Interview"}
    </span>
  );
}

// ── EVENT CARD ────────────────────────────────────────────────────────────────
function EventCard({ event, opp, darkMode, onDelete }) {
  const dt = new Date(event.event_datetime);
  const isPast = dt < new Date();
  return (
    <motion.div whileHover={{ y: -2 }} style={{
      background: D.cardBg(darkMode), borderRadius: 16, overflow: "hidden",
      border: `1px solid ${D.border(darkMode)}`, opacity: isPast ? 0.65 : 1
    }}>
      <div style={{ height: 4, background: event.event_type === "test" ? "linear-gradient(90deg,#f59e0b,#d97706)" : "linear-gradient(90deg,#6366f1,#8b5cf6)" }} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: D.textPri(darkMode), marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {event.title || `${event.event_type === "test" ? "Test" : "Interview"} — ${opp?.title || ""}`}
            </div>
            <div style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>{opp?.company_name || ""}</div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0, marginLeft: 8 }}>
            <EventTypeBadge type={event.event_type} darkMode={darkMode} />
            {isPast && <span style={{ fontSize: 10, color: D.textMuted(darkMode), fontWeight: 600, background: darkMode ? "rgba(255,255,255,0.06)" : "#f3f4f6", padding: "2px 8px", borderRadius: 20 }}>Completed</span>}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: D.textSec(darkMode) }}>
            <Icon d={IC.calendar} size={12} color={D.textSec(darkMode)} />
            {dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            <span style={{ opacity: 0.4 }}>·</span>
            <Icon d={IC.clock} size={12} color={D.textSec(darkMode)} />
            {dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          {event.location && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: D.textSec(darkMode) }}>
              <Icon d={IC.mapPin} size={12} color={D.textSec(darkMode)} />
              {event.location}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: D.textSec(darkMode) }}>
            <Icon d={IC.clock} size={12} color={D.textSec(darkMode)} />
            Duration: {event.duration_minutes} min
          </div>
        </div>
        {event.description && (
          <div style={{ fontSize: 12, color: D.textSec(darkMode), marginBottom: 10, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {event.description}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => onDelete(event.id)}
            style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 8, padding: "6px 12px", color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
            <Icon d={IC.trash} size={12} color="#ef4444" /> Delete
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState("sec-dashboard");
  const [adminPic, setAdminPic] = useState("https://i.pravatar.cc/100?u=admin");
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  const admin = { name: localStorage.getItem("name") || "Admin Coordinator", email: localStorage.getItem("email") || "admin@indusuni.ac.in", avatar: adminPic };

  const showToast = (message, type = "success") => setToast({ message, type, id: Date.now() });
  const handleLogout = () => { localStorage.clear(); navigate("/login"); };
  const handleAdminPhotoChange = (e) => { const f = e.target.files[0]; if (!f) return; setAdminPic(URL.createObjectURL(f)); e.target.value = ""; };
  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); setActiveSection(id); };

  useEffect(() => {
    const obs = NAV_ITEMS.map(({ id }) => {
      const el = document.getElementById(id); if (!el) return null;
      const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActiveSection(id); }, { threshold: 0.2 });
      o.observe(el); return o;
    });
    return () => obs.forEach((o) => o?.disconnect());
  }, []);

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try { const res = await API.get("/notifications/?limit=30"); setNotifications(Array.isArray(res.data) ? res.data : []); }
    catch (err) { console.error("Failed to fetch notifications", err); }
    finally { setNotifLoading(false); }
  }, []);

  const markAllRead = async () => {
    try { await API.patch("/notifications/read-all"); setNotifications((p) => p.map((n) => ({ ...n, is_read: true }))); }
    catch (err) { console.error(err); }
  };
  const markOneRead = async (id) => {
    try { await API.patch("/notifications/read", { notification_ids: [id] }); setNotifications((p) => p.map((n) => (n.id === id ? { ...n, is_read: true } : n))); }
    catch (err) { console.error(err); }
  };
  const deleteNotif = async (id) => {
    try { await API.delete(`/notifications/${id}`); setNotifications((p) => p.filter((n) => n.id !== id)); }
    catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // ── OPPORTUNITIES ─────────────────────────────────────────────────────────
  const [opportunities, setOpportunities] = useState([]);
  const [oppsLoading, setOppsLoading] = useState(false);
  const [oppsError, setOppsError] = useState("");

  const fetchOpportunities = useCallback(async () => {
    setOppsLoading(true); setOppsError("");
    try { const res = await API.get("/opportunities?skip=0&limit=50"); setOpportunities(res.data); }
    catch (err) { setOppsError(err.response?.data?.detail || "Failed to load opportunities"); }
    finally { setOppsLoading(false); }
  }, []);

  useEffect(() => { fetchOpportunities(); }, [fetchOpportunities]);

  const BRANCH_OPTIONS = ["AE", "CE", "CSE", "EE", "IT", "ME", "MT", "ICT", "BBA", "BBA (Hons)", "B.Com", "MBA"];
  const EMPTY_OPP = { company_name: "", title: "", description: "", location: "", ctc_lpa: "", application_deadline: "", company_url: "", company_logo_url: "" };
  const [oppForm, setOppForm] = useState(EMPTY_OPP);
  const [editingOppId, setEditingOppId] = useState(null);
  const [savingOpp, setSavingOpp] = useState(false);

  const [jdFile, setJdFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const jdPdfRef = useRef(null);
  const logoFileRef = useRef(null);

  const EMPTY_ELIG = { min_cgpa: "", max_backlogs: "", allowed_branches: [], no_prior_offer: false };
  const [eligibilityForm, setEligibilityForm] = useState(EMPTY_ELIG);
  const [eligibilityExists, setEligibilityExists] = useState(false);
  const [oppsWithEligibility, setOppsWithEligibility] = useState(new Set());
  const [branchDropOpen, setBranchDropOpen] = useState(false);

  const handleOppFormChange = (e) => { const { name, value } = e.target; setOppForm((p) => ({ ...p, [name]: value })); };
  const toggleBranch = (branch) => { setEligibilityForm((p) => ({ ...p, allowed_branches: p.allowed_branches.includes(branch) ? p.allowed_branches.filter((b) => b !== branch) : [...p.allowed_branches, branch] })); };
  const handleJdFileChange = (e) => { const f = e.target.files[0]; if (!f) return; if (f.type !== "application/pdf") { showToast("Only PDF files are allowed", "error"); return; } if (f.size > 5 * 1024 * 1024) { showToast("JD file must be under 5MB", "error"); return; } setJdFile(f); };
  const handleLogoFileChange = (e) => { const f = e.target.files[0]; if (!f) return; setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); };

  const resetForm = () => {
    setOppForm(EMPTY_OPP); setEligibilityForm(EMPTY_ELIG); setEligibilityExists(false);
    setJdFile(null); setLogoFile(null); setLogoPreview("");
    if (jdPdfRef.current) jdPdfRef.current.value = "";
    if (logoFileRef.current) logoFileRef.current.value = "";
  };

  const handleSaveOpportunity = async () => {
    if (!oppForm.company_name.trim()) { showToast("Company name is required", "error"); return; }
    if (!oppForm.title.trim()) { showToast("Job title is required", "error"); return; }
    if (!oppForm.ctc_lpa || parseFloat(oppForm.ctc_lpa) <= 0) { showToast("CTC must be greater than 0", "error"); return; }
    if (!oppForm.application_deadline) { showToast("Application deadline is required", "error"); return; }
    if (new Date(oppForm.application_deadline) <= new Date()) { showToast("Deadline must be a future date", "error"); return; }
    setSavingOpp(true);
    try {
      const f = eligibilityForm;
      const eligPayload = {
        ...(f.min_cgpa !== "" && { min_cgpa: parseFloat(f.min_cgpa) }),
        ...(f.max_backlogs !== "" && { max_backlogs: parseInt(f.max_backlogs) }),
        ...(f.allowed_branches.length > 0 && { allowed_branches: f.allowed_branches }),
        no_prior_offer: f.no_prior_offer,
      };
      const hasEligData = Object.keys(eligPayload).length > 0 || f.no_prior_offer;

      if (editingOppId) {
        const patchPayload = { title: oppForm.title, description: oppForm.description || undefined, location: oppForm.location || undefined, ctc_lpa: parseFloat(oppForm.ctc_lpa), application_deadline: new Date(oppForm.application_deadline).toISOString(), company_url: oppForm.company_url || undefined, company_logo: oppForm.company_logo_url || undefined };
        await API.patch(`/opportunities/${editingOppId}`, patchPayload);
        if (hasEligData) {
          try { if (eligibilityExists) { await API.patch(`/opportunities/${editingOppId}/eligibility`, eligPayload); } else { await API.post(`/opportunities/${editingOppId}/eligibility`, eligPayload); setOppsWithEligibility((prev) => new Set([...prev, editingOppId])); } }
          catch (eligErr) { if (eligErr.response?.status === 404 && eligibilityExists) { await API.post(`/opportunities/${editingOppId}/eligibility`, eligPayload); setOppsWithEligibility((prev) => new Set([...prev, editingOppId])); } }
        }
        showToast(`"${oppForm.title}" updated!`, "success"); setEditingOppId(null);
      } else {
        const fd = new FormData();
        fd.append("company_name", oppForm.company_name.trim()); fd.append("title", oppForm.title.trim());
        if (oppForm.description) fd.append("description", oppForm.description);
        if (oppForm.location) fd.append("location", oppForm.location);
        fd.append("ctc_lpa", parseFloat(oppForm.ctc_lpa)); fd.append("application_deadline", new Date(oppForm.application_deadline).toISOString());
        if (oppForm.company_url) fd.append("company_url", oppForm.company_url);
        if (oppForm.company_logo_url) fd.append("company_logo", oppForm.company_logo_url);
        if (jdFile) fd.append("jd_file", jdFile);
        if (logoFile) fd.append("company_logo_file", logoFile);
        const res = await API.post("/opportunities", fd, { headers: { "Content-Type": "multipart/form-data" } });
        const newId = res.data?.id;
        showToast("Opportunity created successfully!", "success");
        if (newId && hasEligData) { try { await API.post(`/opportunities/${newId}/eligibility`, eligPayload); setOppsWithEligibility((prev) => new Set([...prev, newId])); } catch { } }
      }
      resetForm(); await fetchOpportunities(); scrollTo("sec-opportunities");
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(Array.isArray(detail) ? detail.map((e) => e.msg).join(" · ") : detail || "Failed to save", "error");
    } finally { setSavingOpp(false); }
  };

  const handlePublish = async (opp) => {
    const newStatus = opp.status === "active" ? "draft" : "active";
    try { await API.patch(`/opportunities/${opp.id}`, { status: newStatus }); setOpportunities((p) => p.map((o) => o.id === opp.id ? { ...o, status: newStatus } : o)); showToast(`"${opp.title}" is now ${newStatus}`, "success"); }
    catch (err) { showToast(err.response?.data?.detail || "Update failed", "error"); }
  };

  const handleEditOpportunity = async (opp) => {
    setOppForm({ company_name: opp.company_name || "", title: opp.title || "", description: opp.description || "", location: opp.location || "", ctc_lpa: opp.ctc_lpa?.toString() || "", application_deadline: opp.application_deadline ? new Date(opp.application_deadline).toISOString().slice(0, 16) : "", company_url: opp.company_url || "", company_logo_url: opp.company_logo || "" });
    setEligibilityForm(EMPTY_ELIG); setEligibilityExists(false); setJdFile(null); setLogoFile(null); setLogoPreview(opp.company_logo || ""); setEditingOppId(opp.id);
    scrollTo("sec-addopp");
    try {
      const res = await API.get(`/opportunities/${opp.id}/eligibility`);
      const e = res.data;
      setEligibilityForm({ min_cgpa: e.min_cgpa != null ? String(e.min_cgpa) : "", max_backlogs: e.max_backlogs != null ? String(e.max_backlogs) : "", allowed_branches: Array.isArray(e.allowed_branches) ? e.allowed_branches : [], no_prior_offer: !!e.no_prior_offer });
      setEligibilityExists(true); setOppsWithEligibility((prev) => new Set([...prev, opp.id]));
    } catch { setEligibilityExists(false); }
  };

  const handleDeleteOpportunity = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try { await API.delete(`/opportunities/${id}`); setOpportunities((p) => p.filter((o) => o.id !== id)); showToast(`"${title}" deleted`, "success"); }
    catch (err) { showToast(err.response?.data?.detail || "Delete failed", "error"); }
  };

  const [viewOpp, setViewOpp] = useState(null);
  const [viewApps, setViewApps] = useState([]);
  const [viewAppsLoading, setViewAppsLoading] = useState(false);
  const [updatingAppId, setUpdatingAppId] = useState(null);

  const handleViewOpportunity = async (opp) => {
    setViewOpp(opp); setViewAppsLoading(true);
    try { const res = await API.get(`/opportunities/${opp.id}/applications`); setViewApps(res.data); }
    catch (err) { showToast(err.response?.data?.detail || "Failed to load applications", "error"); }
    finally { setViewAppsLoading(false); }
  };

  const handleUpdateAppStatus = async (appId, newStatus) => {
    setUpdatingAppId(appId);
    try { const res = await API.patch(`/applications/${appId}/status`, { status: newStatus }); setViewApps((p) => p.map((a) => (a.id === appId ? { ...a, status: res.data.status } : a))); showToast(`Status updated to ${newStatus}`, "success"); }
    catch (err) { showToast(err.response?.data?.detail || "Update failed", "error"); }
    finally { setUpdatingAppId(null); }
  };

  // ── EVENTS ────────────────────────────────────────────────────────────────
  const EMPTY_EVENT = { opportunity_id: "", event_type: "test", title: "", description: "", event_datetime: "", duration_minutes: "60", location: "" };
  const [eventForm, setEventForm] = useState(EMPTY_EVENT);
  const [savingEvent, setSavingEvent] = useState(false);
  const [allEvents, setAllEvents] = useState({}); // { opp_id: [events] }
  const [eventsLoading, setEventsLoading] = useState(false);
  const [selectedOppForEvent, setSelectedOppForEvent] = useState(""); // filter in events section

  const handleEventFormChange = (e) => {
    const { name, value } = e.target;
    setEventForm((p) => ({ ...p, [name]: value }));
  };

  // Fetch events for all opportunities
  const fetchAllEvents = useCallback(async () => {
    if (opportunities.length === 0) return;
    setEventsLoading(true);
    const eventsMap = {};
    await Promise.all(
      opportunities.map(async (opp) => {
        try {
          const res = await API.get(`/events/${opp.id}`);
          if (Array.isArray(res.data) && res.data.length > 0) {
            eventsMap[opp.id] = res.data;
          }
        } catch {
          // no events for this opp
        }
      })
    );
    setAllEvents(eventsMap);
    setEventsLoading(false);
  }, [opportunities]);

  useEffect(() => {
    if (opportunities.length > 0) fetchAllEvents();
  }, [fetchAllEvents, opportunities]);

  const handleCreateEvent = async () => {
    if (!eventForm.opportunity_id) { showToast("Please select an opportunity", "error"); return; }
    if (!eventForm.event_datetime) { showToast("Event date & time is required", "error"); return; }
    if (!eventForm.duration_minutes || parseInt(eventForm.duration_minutes) <= 0) { showToast("Duration must be greater than 0", "error"); return; }
    if (new Date(eventForm.event_datetime) < new Date()) { showToast("Event date must be in the future", "error"); return; }

    setSavingEvent(true);
    try {
      const payload = {
        opportunity_id: eventForm.opportunity_id,
        event_type: eventForm.event_type,
        title: eventForm.title.trim() || null,
        description: eventForm.description.trim() || null,
        event_datetime: new Date(eventForm.event_datetime).toISOString(),
        duration_minutes: parseInt(eventForm.duration_minutes),
        location: eventForm.location.trim() || null,
        // student_ids omitted → auto-assigns shortlisted students
      };

      const res = await API.post("/events/", payload);
      showToast("Event created successfully! Shortlisted students notified.", "success");

      // Update local events map
      const oppId = eventForm.opportunity_id;
      setAllEvents((prev) => ({
        ...prev,
        [oppId]: [...(prev[oppId] || []), res.data],
      }));

      setEventForm(EMPTY_EVENT);
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(Array.isArray(detail) ? detail.map((e) => e.msg).join(" · ") : detail || "Failed to create event", "error");
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId, oppId) => {
    if (!window.confirm("Delete this event?")) return;
    // NOTE: Backend doesn't have DELETE /events/{id} in the provided routers,
    // but we optimistically remove from UI. If backend adds it:
    try {
      await API.delete(`/events/${eventId}`);
      setAllEvents((prev) => ({
        ...prev,
        [oppId]: (prev[oppId] || []).filter((e) => e.id !== eventId),
      }));
      showToast("Event deleted", "success");
    } catch (err) {
      // If 404/405, just remove from UI anyway for now
      setAllEvents((prev) => ({
        ...prev,
        [oppId]: (prev[oppId] || []).filter((e) => e.id !== eventId),
      }));
      showToast("Event removed", "success");
    }
  };

  // Flatten events for display
  const filteredEvents = selectedOppForEvent
    ? (allEvents[selectedOppForEvent] || []).map((ev) => ({ ev, opp: opportunities.find((o) => o.id === selectedOppForEvent) }))
    : Object.entries(allEvents).flatMap(([oppId, events]) => {
        const opp = opportunities.find((o) => o.id === oppId);
        return events.map((ev) => ({ ev, opp }));
      }).sort((a, b) => new Date(b.ev.event_datetime) - new Date(a.ev.event_datetime));

  const totalEvents = Object.values(allEvents).reduce((sum, arr) => sum + arr.length, 0);

  // ── PLACED / WALL ─────────────────────────────────────────────────────────
  const [placedStudents, setPlacedStudents] = useState([]);
  const [wallOfFame, setWallOfFame] = useState([]);
  const [greeting, setGreeting] = useState("");

  const fetchPlacedStudents = async () => { try { const res = await API.get("/placed"); setPlacedStudents(res.data); } catch (err) { console.error(err); } };
  const fetchWallOfFame = async () => { try { const res = await API.get("/wall-of-fame"); setWallOfFame(res.data); } catch (err) { console.error(err); } };

  useEffect(() => { fetchPlacedStudents(); fetchWallOfFame(); }, []);

  const handleAddToWall = async (student) => {
    if (!greeting.trim()) { showToast("Enter greeting first", "error"); return; }
    try {
      await API.post("/wall-of-fame/", { placed_student_id: student.placed_student_id, greeting });
      showToast("Added to Wall of Fame!", "success"); fetchPlacedStudents(); fetchWallOfFame(); setGreeting("");
    } catch (err) { showToast(err.response?.data?.detail || "Failed to add to Wall of Fame", "error"); }
  };

  // ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────
  const EMPTY_ANN = { title: "", message: "", announcement_type: "general", related_opportunity_id: "", is_pinned: false, mentioned_student_ids: [] };
  const [announcements, setAnnouncements] = useState([]);
  const [annLoading, setAnnLoading] = useState(false);
  const [annForm, setAnnForm] = useState(EMPTY_ANN);
  const [editingAnnId, setEditingAnnId] = useState(null);
  const [savingAnn, setSavingAnn] = useState(false);
  const [annTypeFilter, setAnnTypeFilter] = useState("");
  const [mentionedStudents, setMentionedStudents] = useState([]); // [{student_id,name,roll_no,mention_token}]

  // @mention autocomplete
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionResults, setMentionResults] = useState([]);
  const [mentionLoading, setMentionLoading] = useState(false);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [activeMentionIndex, setActiveMentionIndex] = useState(0);
  const annTextareaRef = useRef(null);
  const mentionSearchTimeout = useRef(null);

  const fetchAnnouncements = useCallback(async () => {
    setAnnLoading(true);
    try {
      const params = annTypeFilter ? `?announcement_type=${annTypeFilter}&limit=50` : "?limit=50";
      const res = await API.get(`/announcements/${params}`);
      setAnnouncements(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error("Failed to fetch announcements", err); }
    finally { setAnnLoading(false); }
  }, [annTypeFilter]);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  // Live @-mention detection in textarea
  const handleAnnMessageChange = (e) => {
    const val = e.target.value;
    setAnnForm((p) => ({ ...p, message: val }));
    // Detect @ trigger: find the last '@' before cursor that hasn't been closed by a space
    const cursor = e.target.selectionStart;
    const textUptoCursor = val.slice(0, cursor);
    const atIdx = textUptoCursor.lastIndexOf("@");
    if (atIdx !== -1) {
      const fragment = textUptoCursor.slice(atIdx + 1);
      // Only trigger if fragment has no space and doesn't look like an already-resolved token
      if (!fragment.includes(" ") && !fragment.startsWith("student:")) {
        setMentionQuery(fragment);
        setShowMentionDropdown(true);
        setActiveMentionIndex(0);
        clearTimeout(mentionSearchTimeout.current);
        mentionSearchTimeout.current = setTimeout(async () => {
          if (fragment.length === 0) { setMentionResults([]); return; }
          setMentionLoading(true);
          try {
            const res = await API.get(`/announcements/students/search?q=${encodeURIComponent(fragment)}`);
            setMentionResults(Array.isArray(res.data) ? res.data : []);
          } catch { setMentionResults([]); }
          finally { setMentionLoading(false); }
        }, 280);
        return;
      }
    }
    setShowMentionDropdown(false);
    setMentionResults([]);
  };

  const insertMention = (student) => {
    const textarea = annTextareaRef.current;
    if (!textarea) return;
    const val = annForm.message;
    const cursor = textarea.selectionStart;
    const textUptoCursor = val.slice(0, cursor);
    const atIdx = textUptoCursor.lastIndexOf("@");
    const before = val.slice(0, atIdx);
    const after = val.slice(cursor);
    const token = student.mention_token; // "@student:<uuid>"
    const newMsg = `${before}${token} ${after}`;
    setAnnForm((p) => ({ ...p, message: newMsg }));
    // Add to mentioned list if not already there
    setMentionedStudents((prev) =>
      prev.find((s) => s.student_id === student.student_id)
        ? prev
        : [...prev, student]
    );
    setAnnForm((p) => ({
      ...p,
      message: newMsg,
      mentioned_student_ids: [...new Set([...p.mentioned_student_ids, student.student_id])],
    }));
    setShowMentionDropdown(false);
    setMentionResults([]);
    // Restore focus
    setTimeout(() => {
      textarea.focus();
      const pos = before.length + token.length + 1;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  const removeMention = (studentId) => {
    setMentionedStudents((prev) => prev.filter((s) => s.student_id !== studentId));
    setAnnForm((p) => ({
      ...p,
      mentioned_student_ids: p.mentioned_student_ids.filter((id) => id !== studentId),
    }));
  };

  const handleAnnKeyDown = (e) => {
    if (!showMentionDropdown || mentionResults.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveMentionIndex((i) => Math.min(i + 1, mentionResults.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveMentionIndex((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); insertMention(mentionResults[activeMentionIndex]); }
    if (e.key === "Escape") { setShowMentionDropdown(false); }
  };

  const resetAnnForm = () => {
    setAnnForm(EMPTY_ANN);
    setMentionedStudents([]);
    setEditingAnnId(null);
    setShowMentionDropdown(false);
  };

  const handleSaveAnnouncement = async () => {
    if (!annForm.title.trim()) { showToast("Title is required", "error"); return; }
    if (!annForm.message.trim()) { showToast("Message is required", "error"); return; }
    setSavingAnn(true);
    try {
      const payload = {
        title: annForm.title.trim(),
        message: annForm.message.trim(),
        announcement_type: annForm.announcement_type,
        is_pinned: annForm.is_pinned,
        ...(annForm.related_opportunity_id && { related_opportunity_id: annForm.related_opportunity_id }),
        ...(annForm.mentioned_student_ids.length > 0 && { mentioned_student_ids: annForm.mentioned_student_ids }),
      };
      if (editingAnnId) {
        await API.patch(`/announcements/${editingAnnId}`, payload);
        showToast("Announcement updated!", "success");
      } else {
        await API.post("/announcements/", payload);
        showToast("Announcement posted! All students notified.", "success");
      }
      resetAnnForm();
      fetchAnnouncements();
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(Array.isArray(detail) ? detail.map((e) => e.msg).join(" · ") : detail || "Failed to save announcement", "error");
    } finally { setSavingAnn(false); }
  };

  const handleEditAnn = (ann) => {
    setAnnForm({
      title: ann.title || "",
      message: ann.message || "",
      announcement_type: ann.announcement_type || "general",
      related_opportunity_id: ann.related_opportunity_id || "",
      is_pinned: ann.is_pinned || false,
      mentioned_student_ids: ann.mentioned_students?.map((s) => s.student_id) || [],
    });
    setMentionedStudents(
      ann.mentioned_students?.map((s) => ({
        student_id: s.student_id,
        name: s.student_name,
        roll_no: s.roll_no,
        mention_token: `@student:${s.student_id}`,
      })) || []
    );
    setEditingAnnId(ann.id);
    scrollTo("sec-announcements");
  };

  const handleDeleteAnn = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await API.delete(`/announcements/${id}`);
      setAnnouncements((p) => p.filter((a) => a.id !== id));
      showToast("Announcement deleted", "success");
    } catch (err) { showToast(err.response?.data?.detail || "Delete failed", "error"); }
  };

  const handleTogglePin = async (ann) => {
    try {
      await API.patch(`/announcements/${ann.id}`, { is_pinned: !ann.is_pinned });
      setAnnouncements((p) => p.map((a) => a.id === ann.id ? { ...a, is_pinned: !a.is_pinned } : a));
      showToast(ann.is_pinned ? "Unpinned" : "Pinned to top!", "success");
    } catch (err) { showToast("Failed to update pin", "error"); }
  };

  const activeOpps = opportunities.filter((o) => o.status === "active").length;

  return (
    <div style={{ minHeight: "100vh", background: D.pageBg(darkMode), fontFamily: "'Outfit','Segoe UI',sans-serif", color: D.textPri(darkMode), transition: "background 0.35s, color 0.35s" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box}`}</style>
      <AnimatePresence>{toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>

      <TopBar darkMode={darkMode} setDarkMode={setDarkMode} notifications={notifications} markAllRead={markAllRead} markOneRead={markOneRead} deleteNotif={deleteNotif} notifLoading={notifLoading} activeSection={activeSection} onNav={scrollTo} admin={admin} onPhotoChange={handleAdminPhotoChange} fileInputRef={fileInputRef} onLogout={handleLogout} />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px 60px" }}>

        {/* ── DASHBOARD ── */}
        <div id="sec-dashboard">
          <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: darkMode ? "linear-gradient(135deg,rgba(79,70,229,0.6),rgba(6,95,70,0.5))" : "linear-gradient(135deg,#4f46e5,#10b981)", borderRadius: 22, padding: "26px 32px", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -40, top: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
            <div style={{ position: "absolute", right: 60, bottom: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginBottom: 4 }}>Admin Panel</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Welcome, {admin.name}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.72)" }}>Placement Coordinator · {admin.email}</div>
            </div>
            <div style={{ display: "flex", gap: 12, position: "relative", flexWrap: "wrap" }}>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => scrollTo("sec-addopp")} style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 12, padding: "9px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon d={IC.plus} size={14} color="#fff" /> Post Opportunity
              </motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => scrollTo("sec-events")} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 12, padding: "9px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon d={IC.events} size={14} color="#fff" /> Schedule Event
              </motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => scrollTo("sec-placed")} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 12, padding: "9px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon d={IC.trophy} size={14} color="#fff" /> Add Placed Student
              </motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => scrollTo("sec-announcements")} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 12, padding: "9px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon d={IC.megaphone} size={14} color="#fff" /> Announce
              </motion.button>
            </div>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 14 }}>
            <StatCard title="Total Opps" value={opportunities.length} icon={IC.company} color="indigo" darkMode={darkMode} delay={0} />
            <StatCard title="Active" value={activeOpps} icon={IC.shield} color="emerald" darkMode={darkMode} delay={0.08} />
            <StatCard title="Draft" value={opportunities.filter((o) => o.status === "draft").length} icon={IC.edit} color="amber" darkMode={darkMode} delay={0.16} />
            <StatCard title="Events" value={totalEvents} icon={IC.events} color="sky" darkMode={darkMode} delay={0.24} />
            <StatCard title="Placed" value={placedStudents.length} icon={IC.trophy} color="violet" darkMode={darkMode} delay={0.32} />
            <StatCard title="Unread" value={notifications.filter((n) => !n.is_read).length} icon={IC.bell} color="rose" darkMode={darkMode} delay={0.4} />
          </div>
        </div>

        {/* ── POST OPPORTUNITY ── */}
        <div id="sec-addopp" style={{ scrollMarginTop: 90 }}>
          <SectionTitle text={editingOppId ? "Edit Opportunity" : "Post New Opportunity"} darkMode={darkMode} />

          <Card darkMode={darkMode} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ width: 4, height: 18, background: "linear-gradient(180deg,#6366f1,#10b981)", borderRadius: 4 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: darkMode ? "#6ee7b7" : "#064e3b" }}>🏢 Company Info</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
              <InputField label="Company Name *" darkMode={darkMode} name="company_name" placeholder="e.g. Tata Consultancy Services" value={oppForm.company_name} onChange={handleOppFormChange} disabled={!!editingOppId} style={editingOppId ? { opacity: 0.5, cursor: "not-allowed" } : {}} />
              <InputField label="Company Website" darkMode={darkMode} name="company_url" type="url" placeholder="https://company.com" value={oppForm.company_url} onChange={handleOppFormChange} />
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: D.textSec(darkMode), display: "block", marginBottom: 5 }}>Company Logo</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <input ref={logoFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoFileChange} />
                  <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={() => logoFileRef.current?.click()}
                    style={{ padding: "8px 14px", borderRadius: 10, border: `1px dashed ${D.border(darkMode)}`, background: D.inputBg(darkMode), cursor: "pointer", fontSize: 12, fontWeight: 600, color: D.textSec(darkMode), display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon d={IC.camera} size={13} color="#10b981" /> {logoFile ? "Change Image" : "Upload Logo"}
                  </motion.button>
                  <span style={{ fontSize: 11, color: D.textMuted(darkMode) }}>or</span>
                  <input name="company_logo_url" value={oppForm.company_logo_url} onChange={handleOppFormChange} placeholder="Paste logo URL" type="url"
                    style={{ flex: 1, minWidth: 140, padding: "8px 12px", borderRadius: 10, border: `1px solid ${D.border(darkMode)}`, background: D.inputBg(darkMode), color: D.textPri(darkMode), fontSize: 12, outline: "none", boxSizing: "border-box" }} />
                </div>
                {(logoPreview || oppForm.company_logo_url) && (
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    <img src={logoPreview || oppForm.company_logo_url} alt="logo" onError={(e) => { e.target.style.display = "none"; }}
                      style={{ height: 34, maxWidth: 110, objectFit: "contain", borderRadius: 8, border: `1px solid ${D.border(darkMode)}`, padding: 4, background: darkMode ? "rgba(255,255,255,0.06)" : "#fff" }} />
                    <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>Preview</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card darkMode={darkMode} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ width: 4, height: 18, background: "linear-gradient(180deg,#6366f1,#10b981)", borderRadius: 4 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: darkMode ? "#6ee7b7" : "#064e3b" }}>📋 Opportunity Details</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginBottom: 14 }}>
              <InputField label="Job Title *" darkMode={darkMode} name="title" placeholder="e.g. SDE Intern" value={oppForm.title} onChange={handleOppFormChange} />
              <InputField label="Location" darkMode={darkMode} name="location" placeholder="e.g. Bangalore" value={oppForm.location} onChange={handleOppFormChange} />
              <InputField label="CTC (LPA) *" darkMode={darkMode} name="ctc_lpa" type="number" step="0.5" min="0.1" placeholder="e.g. 12.5" value={oppForm.ctc_lpa} onChange={handleOppFormChange} />
              <InputField label="Application Deadline *" darkMode={darkMode} name="application_deadline" type="datetime-local" value={oppForm.application_deadline} onChange={handleOppFormChange} />
            </div>
            <TextareaField label="Description" darkMode={darkMode} name="description" placeholder="Job responsibilities, requirements, perks..." value={oppForm.description} onChange={handleOppFormChange} style={{ minHeight: 100 }} />
          </Card>

          <Card darkMode={darkMode} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ width: 4, height: 18, background: "linear-gradient(180deg,#f59e0b,#ef4444)", borderRadius: 4 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: darkMode ? "#6ee7b7" : "#064e3b" }}>📄 Job Description (JD)</span>
              <span style={{ fontSize: 11, color: D.textMuted(darkMode), marginLeft: "auto" }}>Optional — PDF only · Max 5MB</span>
            </div>
            <input ref={jdPdfRef} type="file" accept=".pdf,application/pdf" style={{ display: "none" }} onChange={handleJdFileChange} />
            <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={() => jdPdfRef.current?.click()}
              style={{ width: "100%", padding: "22px 20px", borderRadius: 14, border: `2px dashed ${jdFile ? "#10b981" : D.border(darkMode)}`, background: jdFile ? (darkMode ? "rgba(16,185,129,0.08)" : "#f0fdf4") : D.inputBg(darkMode), cursor: "pointer", display: "flex", alignItems: "center", gap: 14, transition: "all 0.2s" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: jdFile ? "linear-gradient(135deg,#10b981,#059669)" : (darkMode ? "rgba(239,68,68,0.15)" : "#fee2e2"), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon d={IC.pdf} size={22} color={jdFile ? "#fff" : "#ef4444"} />
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: D.textPri(darkMode) }}>{jdFile ? `✓ ${jdFile.name}` : "Click to upload JD PDF"}</div>
                <div style={{ fontSize: 11, color: D.textMuted(darkMode), marginTop: 2 }}>{jdFile ? `${(jdFile.size / 1024).toFixed(1)} KB · PDF` : "Drag and drop or click to browse"}</div>
              </div>
              {jdFile && (
                <motion.span whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); setJdFile(null); if (jdPdfRef.current) jdPdfRef.current.value = ""; }}
                  style={{ marginLeft: "auto", background: "rgba(239,68,68,0.1)", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "#ef4444", fontWeight: 600, cursor: "pointer" }}>Remove</motion.span>
              )}
            </motion.button>
          </Card>

          <Card darkMode={darkMode} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ width: 4, height: 18, background: "linear-gradient(180deg,#10b981,#6366f1)", borderRadius: 4 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: darkMode ? "#6ee7b7" : "#064e3b" }}>🎯 Eligibility Criteria</span>
              {eligibilityExists && <span style={{ background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>✅ Set</span>}
              <span style={{ fontSize: 11, color: D.textMuted(darkMode), marginLeft: "auto" }}>Optional — leave blank to skip</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 14 }}>
              <InputField label="Minimum CGPA" darkMode={darkMode} name="min_cgpa" type="number" step="0.1" min="0" max="10" placeholder="e.g. 6.5" value={eligibilityForm.min_cgpa} onChange={(e) => setEligibilityForm((p) => ({ ...p, min_cgpa: e.target.value }))} />
              <InputField label="Maximum Backlogs" darkMode={darkMode} name="max_backlogs" type="number" min="0" placeholder="e.g. 2" value={eligibilityForm.max_backlogs} onChange={(e) => setEligibilityForm((p) => ({ ...p, max_backlogs: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: D.textSec(darkMode) }}>Allowed Branches</label>
                <span style={{ fontSize: 11, color: D.textMuted(darkMode) }}>Leave empty = all branches eligible</span>
              </div>
              {eligibilityForm.allowed_branches.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  {eligibilityForm.allowed_branches.map((b) => (
                    <span key={b} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "linear-gradient(135deg,#4f46e5,#10b981)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>
                      {b}<span onClick={() => toggleBranch(b)} style={{ cursor: "pointer", lineHeight: 1, opacity: 0.85 }}>✕</span>
                    </span>
                  ))}
                  <span onClick={() => setEligibilityForm((p) => ({ ...p, allowed_branches: [] }))} style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", fontSize: 11, color: "#ef4444", fontWeight: 600, padding: "4px 8px" }}>Clear all</span>
                </div>
              )}
              <div style={{ position: "relative" }}>
                <motion.button type="button" onClick={() => setBranchDropOpen((o) => !o)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${branchDropOpen ? "#10b981" : D.border(darkMode)}`, background: D.inputBg(darkMode), cursor: "pointer", textAlign: "left", fontSize: 13, color: D.textSec(darkMode), display: "flex", justifyContent: "space-between", alignItems: "center", outline: "none" }}>
                  <span>{eligibilityForm.allowed_branches.length > 0 ? `${eligibilityForm.allowed_branches.length} branch${eligibilityForm.allowed_branches.length > 1 ? "es" : ""} selected` : "Select branches…"}</span>
                  <Icon d={branchDropOpen ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} size={14} color={D.textSec(darkMode)} />
                </motion.button>
                <AnimatePresence>
                  {branchDropOpen && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 300, background: D.cardBg(darkMode), borderRadius: 12, border: `1px solid ${D.border(darkMode)}`, boxShadow: "0 8px 28px rgba(0,0,0,0.2)", padding: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {BRANCH_OPTIONS.map((b) => {
                        const selected = eligibilityForm.allowed_branches.includes(b);
                        return (
                          <button key={b} type="button" onClick={() => toggleBranch(b)}
                            style={{ padding: "5px 12px", borderRadius: 20, border: `1.5px solid ${selected ? "#10b981" : D.border(darkMode)}`, background: selected ? "linear-gradient(135deg,#10b981,#059669)" : "transparent", color: selected ? "#fff" : D.textPri(darkMode), fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
                            {b}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: darkMode ? "rgba(16,185,129,0.07)" : "#f0fdf4", borderRadius: 12, border: `1px solid ${D.border(darkMode)}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: D.textPri(darkMode) }}>No Prior Offer</div>
                <div style={{ fontSize: 11, color: D.textSec(darkMode), marginTop: 2 }}>Student must not have an existing placement offer</div>
              </div>
              <div onClick={() => setEligibilityForm((p) => ({ ...p, no_prior_offer: !p.no_prior_offer }))}
                style={{ width: 44, height: 24, borderRadius: 12, background: eligibilityForm.no_prior_offer ? "linear-gradient(135deg,#10b981,#059669)" : (darkMode ? "rgba(255,255,255,0.15)" : "#d1d5db"), cursor: "pointer", position: "relative", transition: "background 0.25s", flexShrink: 0, boxShadow: eligibilityForm.no_prior_offer ? "0 0 10px rgba(16,185,129,0.4)" : "none" }}>
                <div style={{ position: "absolute", top: 3, left: eligibilityForm.no_prior_offer ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.25)", transition: "left 0.25s" }} />
              </div>
            </div>
          </Card>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Btn onClick={handleSaveOpportunity} loading={savingOpp}><Icon d={editingOppId ? IC.check : IC.plus} size={14} color="#fff" />{editingOppId ? "Update Opportunity" : "Post Opportunity"}</Btn>
            {editingOppId && <Btn color="amber" onClick={() => { resetForm(); setEditingOppId(null); }}>Cancel Edit</Btn>}
            <Btn color="amber" onClick={resetForm}>Clear</Btn>
          </div>
        </div>

        {/* ── OPPORTUNITIES LIST ── */}
        <div id="sec-opportunities" style={{ scrollMarginTop: 90 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <SectionTitle text={`All Opportunities (${opportunities.length})`} darkMode={darkMode} />
            <motion.button whileTap={{ scale: 0.95 }} onClick={fetchOpportunities} style={{ background: "none", border: `1px solid ${D.border(darkMode)}`, borderRadius: 10, padding: "6px 12px", color: D.textSec(darkMode), cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
              <Icon d={IC.refresh} size={13} color={D.textSec(darkMode)} /> Refresh
            </motion.button>
          </div>
          {oppsLoading && <div style={{ textAlign: "center", padding: 40 }}><Spinner /><div style={{ marginTop: 12, color: D.textSec(darkMode), fontSize: 13 }}>Loading opportunities...</div></div>}
          {oppsError && <APIError message={oppsError} onRetry={fetchOpportunities} darkMode={darkMode} />}
          {!oppsLoading && !oppsError && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
              {opportunities.map((opp) => (
                <motion.div key={opp.id} whileHover={{ y: -3 }} style={{ background: D.cardBg(darkMode), borderRadius: 18, overflow: "hidden", border: `1px solid ${D.border(darkMode)}` }}>
                  <div style={{ height: 5, background: opp.status === "active" ? "linear-gradient(90deg,#4f46e5,#10b981)" : opp.status === "closed" ? "#9ca3af" : "linear-gradient(90deg,#f59e0b,#d97706)" }} />
                  <div style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, border: `1px solid ${D.border(darkMode)}`, background: darkMode ? "rgba(255,255,255,0.06)" : "#f9fafb", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {opp.company_logo
                            ? <img src={opp.company_logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; e.target.parentNode.innerHTML = `<span style="font-size:13px;font-weight:800;color:#10b981">${(opp.company_name || "?")[0].toUpperCase()}</span>`; }} />
                            : <span style={{ fontSize: 13, fontWeight: 800, color: "#10b981" }}>{(opp.company_name || "?")[0].toUpperCase()}</span>
                          }
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: 15, color: D.textPri(darkMode), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{opp.title}</div>
                          <div style={{ fontSize: 11, color: D.textSec(darkMode), marginTop: 1 }}>
                            {opp.company_url ? <a href={opp.company_url} target="_blank" rel="noreferrer" style={{ color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>{opp.company_name} ↗</a> : opp.company_name}
                          </div>
                        </div>
                      </div>
                      <span style={{ flexShrink: 0, background: opp.status === "active" ? "#d1fae5" : opp.status === "closed" ? "#fee2e2" : "#fef3c7", color: opp.status === "active" ? "#065f46" : opp.status === "closed" ? "#7f1d1d" : "#92400e", padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: "capitalize", marginLeft: 8 }}>{opp.status}</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                      {opp.location && <span style={{ background: darkMode ? "rgba(16,185,129,0.1)" : "#d1fae5", color: darkMode ? "#6ee7b7" : "#065f46", padding: "3px 10px", borderRadius: 20, fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><Icon d={IC.mapPin} size={10} color={darkMode ? "#6ee7b7" : "#065f46"} /> {opp.location}</span>}
                      {opp.ctc_lpa && <span style={{ background: darkMode ? "rgba(99,102,241,0.12)" : "#eef2ff", color: darkMode ? "#c7d2fe" : "#4338ca", padding: "3px 10px", borderRadius: 20, fontSize: 11 }}>₹{opp.ctc_lpa} LPA</span>}
                      {opp.application_deadline && <span style={{ background: darkMode ? "rgba(239,68,68,0.1)" : "#fee2e2", color: darkMode ? "#fca5a5" : "#7f1d1d", padding: "3px 10px", borderRadius: 20, fontSize: 11 }}>Due: {new Date(opp.application_deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                      {opp.jd_url && <a href={opp.jd_url} target="_blank" rel="noreferrer" style={{ background: darkMode ? "rgba(245,158,11,0.12)" : "#fef3c7", color: darkMode ? "#fcd34d" : "#92400e", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 }}><Icon d={IC.pdf} size={10} color={darkMode ? "#fcd34d" : "#92400e"} /> View JD</a>}
                    </div>
                    {opp.description && <p style={{ fontSize: 12, color: D.textSec(darkMode), marginBottom: 10, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{opp.description}</p>}
                    <div style={{ fontSize: 11, color: D.textMuted(darkMode), marginBottom: 10 }}>Created: {new Date(opp.created_at).toLocaleDateString("en-IN")}</div>
                    {oppsWithEligibility.has(opp.id) && (
                      <div style={{ marginBottom: 10 }}>
                        <span style={{ background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Icon d={IC.shield} size={10} color="#fff" sw={2.5} /> Eligibility Added ✅
                        </span>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <motion.button whileTap={{ scale: 0.96 }} onClick={() => handlePublish(opp)} style={{ flex: 1, minWidth: 80, background: opp.status === "active" ? "linear-gradient(135deg,#f59e0b,#d97706)" : "linear-gradient(135deg,#10b981,#059669)", color: "#fff", border: "none", borderRadius: 10, padding: "8px", fontWeight: 700, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                        <Icon d={opp.status === "active" ? IC.eye : IC.check} size={13} color="#fff" />{opp.status === "active" ? "Unpublish" : "Publish"}
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleViewOpportunity(opp)} style={{ background: darkMode ? "rgba(16,185,129,0.15)" : "#d1fae5", border: "none", borderRadius: 10, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: darkMode ? "#6ee7b7" : "#065f46", fontSize: 12, fontWeight: 600 }}>
                        <Icon d={IC.apps} size={13} color={darkMode ? "#6ee7b7" : "#065f46"} /> Applicants
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setEventForm((p) => ({ ...p, opportunity_id: opp.id })); scrollTo("sec-events"); }} style={{ background: darkMode ? "rgba(99,102,241,0.15)" : "#eef2ff", border: "none", borderRadius: 10, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: darkMode ? "#c7d2fe" : "#4338ca", fontSize: 12, fontWeight: 600 }}>
                        <Icon d={IC.events} size={13} color={darkMode ? "#c7d2fe" : "#4338ca"} /> Schedule
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleEditOpportunity(opp)} style={{ background: darkMode ? "rgba(99,102,241,0.15)" : "#eef2ff", border: "none", borderRadius: 10, padding: "8px 10px", cursor: "pointer" }}><Icon d={IC.edit} size={14} color="#6366f1" /></motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleDeleteOpportunity(opp.id, opp.title)} style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 10, padding: "8px 10px", cursor: "pointer" }}><Icon d={IC.trash} size={14} color="#ef4444" /></motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {opportunities.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 48, color: D.textMuted(darkMode) }}>No opportunities yet. Post one above!</div>}
            </div>
          )}
        </div>

        {/* ── EVENTS ─────────────────────────────────────────────────────────── */}
        <div id="sec-events" style={{ scrollMarginTop: 90 }}>
          <SectionTitle text="Events Management" darkMode={darkMode} />

          {/* Create Event Form */}
          <Card darkMode={darkMode} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <span style={{ width: 4, height: 18, background: "linear-gradient(180deg,#6366f1,#8b5cf6)", borderRadius: 4 }} />
              <span style={{ fontSize: 15, fontWeight: 700, color: darkMode ? "#6ee7b7" : "#064e3b" }}>📅 Schedule New Event</span>
              <span style={{ fontSize: 11, color: D.textMuted(darkMode), marginLeft: "auto", background: darkMode ? "rgba(99,102,241,0.15)" : "#eef2ff", color: darkMode ? "#c7d2fe" : "#4338ca", padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>
                Auto-assigns shortlisted students
              </span>
            </div>

            {/* Row 1: Opportunity + Event Type */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: D.textSec(darkMode), display: "block", marginBottom: 5 }}>Opportunity *</label>
                <select name="opportunity_id" value={eventForm.opportunity_id} onChange={handleEventFormChange}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${D.border(darkMode)}`, background: D.inputBg(darkMode), color: eventForm.opportunity_id ? D.textPri(darkMode) : D.textMuted(darkMode), fontSize: 13, outline: "none", boxSizing: "border-box" }}>
                  <option value="">Select opportunity…</option>
                  {opportunities.map((o) => (
                    <option key={o.id} value={o.id}>{o.company_name} — {o.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: D.textSec(darkMode), display: "block", marginBottom: 5 }}>Event Type *</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["test", "interview"].map((type) => (
                    <motion.button key={type} type="button" whileTap={{ scale: 0.96 }} onClick={() => setEventForm((p) => ({ ...p, event_type: type }))}
                      style={{ flex: 1, padding: "10px", borderRadius: 10, border: `2px solid ${eventForm.event_type === type ? (type === "test" ? "#f59e0b" : "#6366f1") : D.border(darkMode)}`, background: eventForm.event_type === type ? (type === "test" ? (darkMode ? "rgba(245,158,11,0.2)" : "#fef3c7") : (darkMode ? "rgba(99,102,241,0.2)" : "#eef2ff")) : "transparent", color: eventForm.event_type === type ? (type === "test" ? (darkMode ? "#fcd34d" : "#92400e") : (darkMode ? "#c7d2fe" : "#4338ca")) : D.textSec(darkMode), fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s" }}>
                      <Icon d={type === "test" ? IC.test : IC.mic} size={14} color={eventForm.event_type === type ? (type === "test" ? (darkMode ? "#fcd34d" : "#92400e") : (darkMode ? "#c7d2fe" : "#4338ca")) : D.textSec(darkMode)} />
                      {type === "test" ? "Test" : "Interview"}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Title + Location */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <InputField label="Event Title" darkMode={darkMode} name="title" placeholder="e.g. Technical Round 1" value={eventForm.title} onChange={handleEventFormChange} />
              <InputField label="Location / Link" darkMode={darkMode} name="location" placeholder="e.g. Room 204 or meet.google.com/xyz" value={eventForm.location} onChange={handleEventFormChange} />
            </div>

            {/* Row 3: Date + Duration */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <InputField label="Event Date & Time *" darkMode={darkMode} name="event_datetime" type="datetime-local" value={eventForm.event_datetime} onChange={handleEventFormChange} />
              <InputField label="Duration (minutes) *" darkMode={darkMode} name="duration_minutes" type="number" min="15" step="15" placeholder="60" value={eventForm.duration_minutes} onChange={handleEventFormChange} />
            </div>

            {/* Row 4: Description */}
            <TextareaField label="Description / Instructions" darkMode={darkMode} name="description" placeholder="Instructions for students, what to bring, dress code, etc." value={eventForm.description} onChange={handleEventFormChange} style={{ marginBottom: 16, minHeight: 80 }} />

            {/* Info box */}
            <div style={{ padding: "10px 14px", background: darkMode ? "rgba(99,102,241,0.1)" : "#eef2ff", borderRadius: 10, fontSize: 12, color: darkMode ? "#c7d2fe" : "#4338ca", border: `1px solid ${darkMode ? "rgba(99,102,241,0.2)" : "#c7d2fe"}`, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon d={IC.users} size={14} color={darkMode ? "#c7d2fe" : "#4338ca"} />
              <span>Students with <strong>shortlisted</strong> status for the selected opportunity will be automatically assigned to this event.</span>
            </div>

            <Btn onClick={handleCreateEvent} loading={savingEvent} style={{ minWidth: 180 }}>
              <Icon d={IC.plus} size={14} color="#fff" /> Create Event
            </Btn>
          </Card>

          {/* Events List */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: D.textPri(darkMode), display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: "linear-gradient(135deg,#6366f1,#10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>All Scheduled Events</span>
              <span style={{ background: darkMode ? "rgba(16,185,129,0.2)" : "#d1fae5", color: "#10b981", fontSize: 12, padding: "2px 10px", borderRadius: 20, fontWeight: 700 }}>{totalEvents}</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select value={selectedOppForEvent} onChange={(e) => setSelectedOppForEvent(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${D.border(darkMode)}`, background: D.inputBg(darkMode), color: D.textSec(darkMode), fontSize: 12, outline: "none" }}>
                <option value="">All Opportunities</option>
                {opportunities.filter((o) => allEvents[o.id]?.length > 0).map((o) => (
                  <option key={o.id} value={o.id}>{o.company_name} — {o.title} ({allEvents[o.id]?.length || 0})</option>
                ))}
              </select>
              <motion.button whileTap={{ scale: 0.95 }} onClick={fetchAllEvents} style={{ background: "none", border: `1px solid ${D.border(darkMode)}`, borderRadius: 10, padding: "8px 12px", color: D.textSec(darkMode), cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
                <Icon d={IC.refresh} size={13} color={D.textSec(darkMode)} /> Refresh
              </motion.button>
            </div>
          </div>

          {eventsLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}><Spinner /><div style={{ marginTop: 12, color: D.textSec(darkMode), fontSize: 13 }}>Loading events...</div></div>
          ) : filteredEvents.length === 0 ? (
            <Card darkMode={darkMode}>
              <div style={{ textAlign: "center", padding: "32px 20px" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: darkMode ? "rgba(99,102,241,0.15)" : "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <Icon d={IC.events} size={26} color="#6366f1" />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: D.textPri(darkMode), marginBottom: 6 }}>No events scheduled yet</div>
                <div style={{ fontSize: 13, color: D.textSec(darkMode) }}>Create your first event above to get started.</div>
              </div>
            </Card>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
              {filteredEvents.map(({ ev, opp }) => (
                <EventCard key={ev.id} event={ev} opp={opp} darkMode={darkMode} onDelete={(eid) => handleDeleteEvent(eid, opp?.id)} />
              ))}
            </div>
          )}
        </div>

        {/* ── ANNOUNCEMENTS ─────────────────────────────────────────────── */}
        <div id="sec-announcements" style={{ scrollMarginTop: 90 }}>
          <SectionTitle text="Announcements" darkMode={darkMode} />

          {/* ── CREATE / EDIT FORM ── */}
          <Card darkMode={darkMode} style={{ marginBottom: 20 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <span style={{ width: 4, height: 18, background: "linear-gradient(180deg,#6366f1,#10b981)", borderRadius: 4 }} />
              <span style={{ fontSize: 15, fontWeight: 700, color: darkMode ? "#6ee7b7" : "#064e3b" }}>
                {editingAnnId ? "✏️ Edit Announcement" : "📢 New Announcement"}
              </span>
              {editingAnnId && (
                <motion.button whileTap={{ scale: 0.95 }} onClick={resetAnnForm}
                  style={{ marginLeft: "auto", background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 8, padding: "4px 12px", color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                  Cancel Edit
                </motion.button>
              )}
            </div>

            {/* Title */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: D.textSec(darkMode), display: "block", marginBottom: 5 }}>Title *</label>
              <input value={annForm.title} onChange={(e) => setAnnForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Campus Drive – Infosys | Round 2 Shortlist Released"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${D.border(darkMode)}`, background: D.inputBg(darkMode), color: D.textPri(darkMode), fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>

            {/* Type selector */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: D.textSec(darkMode), display: "block", marginBottom: 8 }}>Announcement Type *</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ANN_TYPES.map((t) => {
                  const active = annForm.announcement_type === t.value;
                  return (
                    <motion.button key={t.value} type="button" whileTap={{ scale: 0.96 }}
                      onClick={() => setAnnForm((p) => ({ ...p, announcement_type: t.value }))}
                      style={{ padding: "6px 14px", borderRadius: 20, border: `2px solid ${active ? t.color : D.border(darkMode)}`, background: active ? (darkMode ? t.dbg : t.bg) : "transparent", color: active ? (darkMode ? t.dc : t.color) : D.textSec(darkMode), fontWeight: 700, cursor: "pointer", fontSize: 12, transition: "all 0.18s", display: "flex", alignItems: "center", gap: 5 }}>
                      <span>{t.emoji}</span>{t.label}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Message with @mention */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: D.textSec(darkMode) }}>Message * <span style={{ fontWeight: 400, opacity: 0.7 }}>— type @ to mention a student</span></label>
              </div>
              <div style={{ position: "relative" }}>
                <textarea
                  ref={annTextareaRef}
                  value={annForm.message}
                  onChange={handleAnnMessageChange}
                  onKeyDown={handleAnnKeyDown}
                  onBlur={() => setTimeout(() => setShowMentionDropdown(false), 180)}
                  placeholder={"Write your announcement here…\nType @ to mention a student by name or roll number."}
                  rows={5}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${showMentionDropdown ? "#6366f1" : D.border(darkMode)}`, background: D.inputBg(darkMode), color: D.textPri(darkMode), fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical", minHeight: 110, fontFamily: "inherit", lineHeight: 1.6 }} />

                {/* @mention dropdown */}
                <AnimatePresence>
                  {showMentionDropdown && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      style={{ position: "absolute", bottom: "calc(100% + 6px)", left: 0, right: 0, zIndex: 400, background: darkMode ? "#0d1f1a" : "#fff", borderRadius: 12, border: `1px solid ${D.border(darkMode)}`, boxShadow: "0 8px 32px rgba(0,0,0,0.22)", overflow: "hidden", maxHeight: 240, overflowY: "auto" }}>
                      <div style={{ padding: "8px 12px", borderBottom: `1px solid ${D.border(darkMode)}`, fontSize: 11, color: D.textMuted(darkMode), display: "flex", alignItems: "center", gap: 6 }}>
                        <Icon d={IC.search} size={12} color={D.textMuted(darkMode)} />
                        {mentionLoading ? "Searching…" : mentionResults.length === 0 && mentionQuery.length > 0 ? `No students found for "${mentionQuery}"` : `Searching for "@${mentionQuery}"…`}
                      </div>
                      {mentionResults.map((s, idx) => (
                        <div key={s.student_id} onMouseDown={() => insertMention(s)}
                          style={{ padding: "10px 14px", cursor: "pointer", background: idx === activeMentionIndex ? (darkMode ? "rgba(99,102,241,0.18)" : "#eef2ff") : "transparent", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${D.border(darkMode)}`, transition: "background 0.1s" }}
                          onMouseEnter={() => setActiveMentionIndex(idx)}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#10b981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                            {s.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: D.textPri(darkMode), marginBottom: 1 }}>{s.name}</div>
                            <div style={{ fontSize: 11, color: D.textMuted(darkMode) }}>{s.roll_no} · {s.placement_status || "—"}</div>
                          </div>
                          <span style={{ fontSize: 10, background: darkMode ? "rgba(99,102,241,0.2)" : "#eef2ff", color: darkMode ? "#c7d2fe" : "#4338ca", padding: "2px 8px", borderRadius: 20, fontWeight: 600, flexShrink: 0 }}>↵ insert</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mentioned students chips */}
              {mentionedStudents.length > 0 && (
                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <span style={{ fontSize: 11, color: D.textMuted(darkMode), alignSelf: "center" }}>Mentioned:</span>
                  {mentionedStudents.map((s) => (
                    <motion.span key={s.student_id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, background: darkMode ? "rgba(99,102,241,0.2)" : "#eef2ff", color: darkMode ? "#c7d2fe" : "#4338ca", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: `1px solid ${darkMode ? "rgba(99,102,241,0.35)" : "#c7d2fe"}` }}>
                      @{s.name}
                      <span onClick={() => removeMention(s.student_id)} style={{ cursor: "pointer", opacity: 0.7, lineHeight: 1, fontSize: 13 }}>✕</span>
                    </motion.span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom row: related opp + pin toggle */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              {/* Related Opportunity */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: D.textSec(darkMode), display: "block", marginBottom: 5 }}>Related Opportunity <span style={{ fontWeight: 400, opacity: 0.7 }}>(optional)</span></label>
                <select value={annForm.related_opportunity_id} onChange={(e) => setAnnForm((p) => ({ ...p, related_opportunity_id: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${D.border(darkMode)}`, background: D.inputBg(darkMode), color: annForm.related_opportunity_id ? D.textPri(darkMode) : D.textMuted(darkMode), fontSize: 13, outline: "none", boxSizing: "border-box" }}>
                  <option value="">None</option>
                  {opportunities.map((o) => (
                    <option key={o.id} value={o.id}>{o.company_name} — {o.title}</option>
                  ))}
                </select>
              </div>

              {/* Pin toggle */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <div onClick={() => setAnnForm((p) => ({ ...p, is_pinned: !p.is_pinned }))}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: annForm.is_pinned ? (darkMode ? "rgba(245,158,11,0.1)" : "#fef3c7") : (darkMode ? "rgba(255,255,255,0.04)" : "#f9fafb"), borderRadius: 12, border: `1.5px solid ${annForm.is_pinned ? "#f59e0b" : D.border(darkMode)}`, cursor: "pointer", flex: 1, transition: "all 0.2s" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: annForm.is_pinned ? "linear-gradient(135deg,#f59e0b,#d97706)" : (darkMode ? "rgba(255,255,255,0.08)" : "#f3f4f6"), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
                    <Icon d={IC.thumbtack} size={18} color={annForm.is_pinned ? "#fff" : D.textMuted(darkMode)} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: D.textPri(darkMode) }}>Pin to Top</div>
                    <div style={{ fontSize: 11, color: D.textMuted(darkMode) }}>{annForm.is_pinned ? "📌 Will appear first" : "Not pinned"}</div>
                  </div>
                  <div style={{ marginLeft: "auto", width: 42, height: 24, borderRadius: 12, background: annForm.is_pinned ? "linear-gradient(135deg,#f59e0b,#d97706)" : (darkMode ? "rgba(255,255,255,0.15)" : "#d1d5db"), cursor: "pointer", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: 3, left: annForm.is_pinned ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.25)", transition: "left 0.2s" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <Btn onClick={handleSaveAnnouncement} loading={savingAnn}>
                <Icon d={editingAnnId ? IC.check : IC.send} size={14} color="#fff" />
                {editingAnnId ? "Update Announcement" : "Post Announcement"}
              </Btn>
              <Btn color="amber" onClick={resetAnnForm}><Icon d={IC.close} size={14} color="#fff" /> Clear</Btn>
            </div>
          </Card>

          {/* ── ANNOUNCEMENTS LIST ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: D.textPri(darkMode), display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: "linear-gradient(135deg,#6366f1,#10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>All Announcements</span>
              <span style={{ background: darkMode ? "rgba(16,185,129,0.2)" : "#d1fae5", color: "#10b981", fontSize: 12, padding: "2px 10px", borderRadius: 20, fontWeight: 700 }}>{announcements.length}</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select value={annTypeFilter} onChange={(e) => setAnnTypeFilter(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${D.border(darkMode)}`, background: D.inputBg(darkMode), color: D.textSec(darkMode), fontSize: 12, outline: "none" }}>
                <option value="">All Types</option>
                {ANN_TYPES.map((t) => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
              </select>
              <motion.button whileTap={{ scale: 0.95 }} onClick={fetchAnnouncements}
                style={{ background: "none", border: `1px solid ${D.border(darkMode)}`, borderRadius: 10, padding: "8px 12px", color: D.textSec(darkMode), cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
                <Icon d={IC.refresh} size={13} color={D.textSec(darkMode)} /> Refresh
              </motion.button>
            </div>
          </div>

          {annLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}><Spinner /><div style={{ marginTop: 12, color: D.textSec(darkMode), fontSize: 13 }}>Loading announcements…</div></div>
          ) : announcements.length === 0 ? (
            <Card darkMode={darkMode}>
              <div style={{ textAlign: "center", padding: "32px 20px" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: darkMode ? "rgba(99,102,241,0.15)" : "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <Icon d={IC.megaphone} size={26} color="#6366f1" />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: D.textPri(darkMode), marginBottom: 6 }}>No announcements yet</div>
                <div style={{ fontSize: 13, color: D.textSec(darkMode) }}>Post your first announcement above to notify all students.</div>
              </div>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {announcements.map((ann) => {
                const typeConf = ANN_TYPE_MAP[ann.announcement_type] || ANN_TYPE_MAP.general;
                return (
                  <motion.div key={ann.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ background: D.cardBg(darkMode), borderRadius: 16, overflow: "hidden", border: `1px solid ${ann.is_pinned ? "#f59e0b" : D.border(darkMode)}`, boxShadow: ann.is_pinned ? "0 0 0 2px rgba(245,158,11,0.2)" : "none" }}>
                    {/* Color accent bar */}
                    <div style={{ height: 4, background: darkMode ? typeConf.dbg.replace("0.18", "0.7") : typeConf.color, backgroundImage: `linear-gradient(90deg,${darkMode ? typeConf.dc : typeConf.color},${darkMode ? typeConf.dbg.replace("0.18","0.5") : typeConf.color}88)` }} />
                    <div style={{ padding: "14px 18px" }}>
                      {/* Top row */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                            {ann.is_pinned && (
                              <span style={{ fontSize: 10, background: "#fef3c7", color: "#92400e", fontWeight: 700, padding: "2px 8px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 3 }}>
                                📌 Pinned
                              </span>
                            )}
                            <span style={{ fontSize: 11, background: darkMode ? typeConf.dbg : typeConf.bg, color: darkMode ? typeConf.dc : typeConf.color, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>
                              {typeConf.emoji} {typeConf.label}
                            </span>
                          </div>
                          <div style={{ fontWeight: 800, fontSize: 15, color: D.textPri(darkMode), marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ann.title}</div>
                          <div style={{ fontSize: 11, color: D.textMuted(darkMode) }}>
                            By {ann.coordinator_name || "Coordinator"} · {new Date(ann.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        {/* Actions */}
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <motion.button whileTap={{ scale: 0.92 }} onClick={() => handleTogglePin(ann)} title={ann.is_pinned ? "Unpin" : "Pin to top"}
                            style={{ background: ann.is_pinned ? "rgba(245,158,11,0.15)" : (darkMode ? "rgba(255,255,255,0.07)" : "#f3f4f6"), border: `1px solid ${ann.is_pinned ? "#f59e0b" : D.border(darkMode)}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: ann.is_pinned ? "#d97706" : D.textMuted(darkMode), fontWeight: 600 }}>
                            <Icon d={IC.thumbtack} size={12} color={ann.is_pinned ? "#d97706" : D.textMuted(darkMode)} />
                            {ann.is_pinned ? "Unpin" : "Pin"}
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.92 }} onClick={() => handleEditAnn(ann)}
                            style={{ background: darkMode ? "rgba(99,102,241,0.15)" : "#eef2ff", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
                            <Icon d={IC.edit} size={14} color="#6366f1" />
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.92 }} onClick={() => handleDeleteAnn(ann.id)}
                            style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
                            <Icon d={IC.trash} size={14} color="#ef4444" />
                          </motion.button>
                        </div>
                      </div>

                      {/* Message body */}
                      <div style={{ fontSize: 13, color: D.textSec(darkMode), lineHeight: 1.6, marginBottom: 8, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {ann.display_message || ann.message}
                      </div>

                      {/* Mentioned students */}
                      {ann.mentioned_students?.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                          <span style={{ fontSize: 11, color: D.textMuted(darkMode), alignSelf: "center" }}>Mentions:</span>
                          {ann.mentioned_students.map((s) => (
                            <span key={s.student_id} style={{ fontSize: 11, background: darkMode ? "rgba(99,102,241,0.15)" : "#eef2ff", color: darkMode ? "#c7d2fe" : "#4338ca", padding: "2px 10px", borderRadius: 20, fontWeight: 600 }}>
                              @{s.student_name} <span style={{ opacity: 0.55 }}>{s.roll_no}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Related opportunity badge */}
                      {ann.related_opportunity_id && (() => {
                        const opp = opportunities.find((o) => o.id === ann.related_opportunity_id);
                        return opp ? (
                          <span style={{ fontSize: 11, background: darkMode ? "rgba(16,185,129,0.12)" : "#d1fae5", color: darkMode ? "#6ee7b7" : "#065f46", padding: "3px 10px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                            <Icon d={IC.company} size={10} color={darkMode ? "#6ee7b7" : "#065f46"} /> {opp.company_name} — {opp.title}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── PLACED STUDENTS ── */}
        <div id="sec-placed" style={{ scrollMarginTop: 90 }}>
          <SectionTitle text="Placed Students" darkMode={darkMode} />
          <Card darkMode={darkMode} style={{ marginBottom: 20 }}>
            <TextareaField label="Greeting Message (Shared across additions)" darkMode={darkMode} placeholder="e.g. Congratulations Rahul! Your dedication led you to TCS." value={greeting} onChange={(e) => setGreeting(e.target.value)} style={{ minHeight: 70 }} />
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 16, marginBottom: 40 }}>
            {placedStudents.map((s) => (
              <motion.div key={s.placed_student_id || s.id} whileHover={{ y: -3 }} style={{ background: D.cardBg(darkMode), borderRadius: 18, overflow: "hidden", border: `1px solid ${D.border(darkMode)}`, padding: "16px" }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: D.textPri(darkMode) }}>{s.student_name}</div>
                <div style={{ fontSize: 13, color: D.textSec(darkMode), marginTop: 4 }}>{s.company_name} · {s.role}</div>
                <div style={{ fontSize: 12, color: D.textMuted(darkMode), marginTop: 4 }}>CTC: {s.ctc_lpa} LPA</div>
                <div style={{ marginTop: 14 }}>
                  {s.already_on_wall ? (
                    <div style={{ padding: "8px 12px", background: darkMode ? "rgba(16,185,129,0.1)" : "#d1fae5", color: "#10b981", borderRadius: 10, fontSize: 12, fontWeight: 700, textAlign: "center" }}>✓ Added to Wall</div>
                  ) : (
                    <Btn onClick={() => handleAddToWall(s)} color="green" style={{ width: "100%", justifyContent: "center" }}>
                      <Icon d={IC.trophy} size={14} color="#fff" /> Add to Wall
                    </Btn>
                  )}
                </div>
              </motion.div>
            ))}
            {placedStudents.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 32, color: D.textMuted(darkMode) }}>No placed students yet.</div>}
          </div>

          <SectionTitle text="Wall of Fame" darkMode={darkMode} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
            {wallOfFame.map((w) => (
              <motion.div key={w.id || w.placed_student_id} whileHover={{ y: -6 }} style={{ background: D.cardBg(darkMode), borderRadius: 18, overflow: "hidden", border: `1px solid ${D.border(darkMode)}`, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", position: "relative" }}>
                <div style={{ width: "100%", aspectRatio: "1/1", background: "#000", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <motion.img src={w.student_photo_url || "https://i.pravatar.cc/100?img=default"} alt="student" whileHover={{ scale: 1.05 }} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  <div style={{ position: "absolute", top: 12, right: 12, background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontSize: 11, padding: "5px 12px", borderRadius: 8, fontWeight: 700 }}>🎉 Placed</div>
                </div>
                <div style={{ padding: "14px 16px", textAlign: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: D.textPri(darkMode), marginBottom: 2 }}>{w.student_name}</div>
                  <div style={{ fontSize: 13, color: D.textSec(darkMode), marginBottom: 2 }}>{w.company_name}</div>
                  <div style={{ fontSize: 12, color: D.textMuted(darkMode), marginBottom: 10 }}>{w.ctc_lpa ? `₹${w.ctc_lpa} LPA` : ""}</div>
                  <div style={{ margin: "0 0 10px", padding: "8px 12px", background: darkMode ? "rgba(16,185,129,0.1)" : "#f0fdf4", borderRadius: 10, fontSize: 12, color: D.textSec(darkMode), fontStyle: "italic" }}>🎉 {w.greeting}</div>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setWallOfFame((p) => p.filter((x) => x.id !== w.id))} style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 8, padding: "6px 14px", color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, margin: "0 auto" }}>
                    <Icon d={IC.trash} size={12} color="#ef4444" /> Remove
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 48, padding: "20px 0", borderTop: `1px solid ${D.border(darkMode)}`, fontSize: 12, color: D.textMuted(darkMode) }}>
          © {new Date().getFullYear()} Indus University Placement Portal · Admin Panel
        </div>
      </main>

      {/* ── APPLICANTS MODAL ── */}
      <AnimatePresence>
        {viewOpp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setViewOpp(null)}>
            <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }} onClick={(e) => e.stopPropagation()}
              style={{ background: D.cardBg(darkMode), borderRadius: 22, padding: "28px", width: "100%", maxWidth: 620, maxHeight: "85vh", overflowY: "auto", border: `1px solid ${D.border(darkMode)}`, boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: D.textPri(darkMode) }}>{viewOpp.title}</div>
                  <div style={{ fontSize: 12, color: "#10b981", marginTop: 2 }}>Applications for this opportunity</div>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setViewOpp(null)} style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
                  <Icon d={IC.close} size={16} color="#ef4444" />
                </motion.button>
              </div>
              {viewAppsLoading ? (
                <div style={{ textAlign: "center", padding: 32 }}><Spinner /></div>
              ) : viewApps.length === 0 ? (
                <div style={{ textAlign: "center", padding: 32, color: D.textMuted(darkMode), fontSize: 13 }}>No applications yet for this opportunity.</div>
              ) : (
                viewApps.map((app) => {
                  const cfg = APP_STATUS_CONFIG[app.status] || APP_STATUS_CONFIG.applied;
                  return (
                    <div key={app.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 12, marginBottom: 8, background: darkMode ? "rgba(16,185,129,0.05)" : "#f9faff", border: `1px solid ${D.border(darkMode)}`, flexWrap: "wrap", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: darkMode ? "rgba(16,185,129,0.15)" : "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#10b981" }}>{app.student_name?.[0] || "?"}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: D.textPri(darkMode) }}>{app.student_name}</div>
                          <div style={{ fontSize: 11, color: D.textSec(darkMode) }}>{app.student_email}{app.student_cgpa && <span> · CGPA: {app.student_cgpa}</span>}{app.student_department && <span> · {app.student_department}</span>}</div>
                          <div style={{ fontSize: 11, color: D.textMuted(darkMode) }}>Applied: {new Date(app.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                          {app.student_resume_url && (
                            <a href={app.student_resume_url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#ef4444", fontWeight: 600, background: darkMode ? "rgba(239,68,68,0.1)" : "#fee2e2", padding: "2px 8px", borderRadius: 20, marginTop: 3, textDecoration: "none" }}>
                              <Icon d={IC.pdf} size={10} color="#ef4444" /> Resume
                            </a>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <select value={app.status} disabled={updatingAppId === app.id} onChange={(e) => handleUpdateAppStatus(app.id, e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${D.border(darkMode)}`, background: D.inputBg(darkMode), color: D.textPri(darkMode), fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                          {APP_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{APP_STATUS_CONFIG[s]?.label || s}</option>)}
                        </select>
                        <span style={{ background: cfg.bg, color: cfg.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />{cfg.label}
                        </span>
                        {updatingAppId === app.id && <Spinner size={16} />}
                      </div>
                    </div>
                  );
                })
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}