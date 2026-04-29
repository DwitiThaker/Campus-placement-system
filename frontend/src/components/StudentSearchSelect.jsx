import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";
import { IoClose, IoSearch, IoPerson } from "react-icons/io5";

const D = {
  cardBg: (dm) => (dm ? "rgba(10,31,26,0.85)" : "#ffffff"),
  inputBg: (dm) => (dm ? "rgba(10,31,26,0.7)" : "#f0fdf4"),
  textPri: (dm) => (dm ? "#d1fae5" : "#064e3b"),
  textSec: (dm) => (dm ? "#6ee7b7" : "#6b7280"),
  border: (dm) => (dm ? "rgba(16,185,129,0.2)" : "#d1fae5"),
};

export default function StudentSearchSelect({ 
  selectedStudents = [], 
  onSelectChange, 
  darkMode = false 
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const debounceTimer = useRef(null);

  const searchStudents = async (q) => {
    if (!q.trim() || q.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await API.get(`/students/search?query=${encodeURIComponent(q)}`);
      // Assuming res.data is an array of { id, full_name, email, department }
      setSuggestions(res.data || []);
    } catch (err) {
      console.error("Search failed:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (query) {
      debounceTimer.current = setTimeout(() => {
        searchStudents(query);
      }, 400);
    } else {
      setSuggestions([]);
    }
    return () => clearTimeout(debounceTimer.current);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (student) => {
    if (!selectedStudents.find(s => s.id === student.id)) {
      onSelectChange([...selectedStudents, student]);
    }
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleRemove = (id) => {
    onSelectChange(selectedStudents.filter(s => s.id !== id));
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: D.textSec(darkMode), display: "block", marginBottom: 8 }}>
        Target Students (Search by Email/Name)
      </label>
      
      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: 8, 
        padding: "8px 12px", 
        borderRadius: 12, 
        border: `1px solid ${D.border(darkMode)}`, 
        background: D.inputBg(darkMode),
        minHeight: 46,
        alignItems: "center"
      }}>
        <AnimatePresence>
          {selectedStudents.map(student => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                background: darkMode ? "rgba(16,185,129,0.2)" : "#d1fae5",
                color: darkMode ? "#6ee7b7" : "#065f46",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600
              }}
            >
              <span>{student.full_name || student.email}</span>
              <IoClose 
                size={14} 
                style={{ cursor: "pointer" }} 
                onClick={() => handleRemove(student.id)} 
              />
            </motion.div>
          ))}
        </AnimatePresence>

        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, minWidth: 120 }}>
          <IoSearch size={16} color={D.textSec(darkMode)} />
          <input
            type="text"
            placeholder={selectedStudents.length === 0 ? "Type email to search..." : ""}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: D.textPri(darkMode),
              fontSize: 13,
              padding: "4px 0"
            }}
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (query.length >= 2 || loading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: D.cardBg(darkMode),
              borderRadius: 12,
              marginTop: 6,
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              border: `1px solid ${D.border(darkMode)}`,
              maxHeight: 250,
              overflowY: "auto",
              zIndex: 1000
            }}
          >
            {loading ? (
              <div style={{ padding: 16, textAlign: "center", color: D.textSec(darkMode), fontSize: 13 }}>
                Searching...
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map(s => (
                <div
                  key={s.id}
                  onClick={() => handleSelect(s)}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    borderBottom: `1px solid ${D.border(darkMode)}`,
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? "rgba(255,255,255,0.05)" : "#f0fdf4"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: "50%", 
                    background: darkMode ? "rgba(16,185,129,0.2)" : "#d1fae5", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center"
                  }}>
                    <IoPerson size={14} color="#10b981" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: D.textPri(darkMode) }}>{s.full_name}</div>
                    <div style={{ fontSize: 11, color: D.textSec(darkMode) }}>{s.email} • {s.department}</div>
                  </div>
                </div>
              ))
            ) : query.length >= 2 ? (
              <div style={{ padding: 16, textAlign: "center", color: D.textSec(darkMode), fontSize: 13 }}>
                No students found for "{query}"
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
