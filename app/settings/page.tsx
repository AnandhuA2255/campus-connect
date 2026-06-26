"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";

interface User {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  department: string | null;
  theme: string;
  highContrast: boolean;
  accentColor: string;
  notifyReminds: boolean;
  notifyInvites: boolean;
  notifyMilestones: boolean;
  skills: { id: string; level: number; skill: { name: string; category: string } }[];
}

const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "Data Science",
  "Artificial Intelligence",
  "Cybersecurity",
  "Business Administration",
  "Finance",
  "Marketing",
  "Human Resources",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Architecture",
  "Design",
];

function applyThemePreview(theme: string) {
  if (typeof window === "undefined") return;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = theme === "system" ? (prefersDark ? "dark" : "light") : theme;
  document.documentElement.setAttribute("data-theme", resolved);
  localStorage.setItem("cc-theme", theme);
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [major, setMajor] = useState("");
  const [theme, setTheme] = useState("system");
  const [reminders, setReminders] = useState(true);
  const [invites, setInvites] = useState(true);
  const [alerts, setAlerts] = useState(true);

  // Skills
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const [hasChanges, setHasChanges] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.user) {
        const u = data.user;
        setUser(u);
        setFullName(u.name || "");
        setEmail(u.email || "");
        setMajor(u.department || "");
        setTheme(u.theme || "system");
        setReminders(u.notifyReminds);
        setInvites(u.notifyInvites);
        setAlerts(u.notifyMilestones);
        setSkillTags(u.skills?.map((s: any) => s.skill.name) || []);
      }
    } catch (err) {
      console.error("Error fetching settings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleInputChange = (field: string, val: any) => {
    setHasChanges(true);
    if (field === "name") setFullName(val);
    if (field === "email") setEmail(val);
    if (field === "major") setMajor(val);
  };

  const handleToggle = (type: string) => {
    setHasChanges(true);
    if (type === "reminders") setReminders(!reminders);
    if (type === "invites") setInvites(!invites);
    if (type === "alerts") setAlerts(!alerts);
  };

  const handleThemeChange = (newTheme: string) => {
    setHasChanges(true);
    setTheme(newTheme);
    applyThemePreview(newTheme); // Instant preview
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skillTags.includes(trimmed)) {
      setSkillTags(prev => [...prev, trimmed]);
      setHasChanges(true);
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skill: string) => {
    setSkillTags(prev => prev.filter(s => s !== skill));
    setHasChanges(true);
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          department: major,
          theme: theme,
          notifyReminds: reminders,
          notifyInvites: invites,
          notifyMilestones: alerts,
          skills: skillTags,
        }),
      });

      if (res.ok) {
        setToast({ message: "Settings saved successfully!", type: "success" });
        setHasChanges(false);
        fetchSettings();
      } else {
        setToast({ message: "Failed to save settings", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Network error occurred", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (user) {
      setFullName(user.name || "");
      setEmail(user.email || "");
      setMajor(user.department || "");
      setTheme(user.theme || "system");
      setReminders(user.notifyReminds);
      setInvites(user.notifyInvites);
      setAlerts(user.notifyMilestones);
      setSkillTags(user.skills?.map((s: any) => s.skill.name) || []);
      applyThemePreview(user.theme || "system");
      setHasChanges(false);
      setToast({ message: "Changes discarded", type: "success" });
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (loading && !user) {
    return (
      <DashboardLayout title="Settings">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings">
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: toast.type === "success" ? "rgba(0, 108, 73, 0.95)" : "rgba(186, 26, 26, 0.95)",
            color: "white",
            padding: "16px 24px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backdropFilter: "blur(8px)",
          }}
        >
          <span className="material-symbols-outlined">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          <span style={{ fontSize: "14px", fontWeight: 600 }}>{toast.message}</span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "32px", paddingBottom: "80px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} className="profile-container-md-row">
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: 700, color: "var(--on-surface)", marginBottom: "4px" }}>Account Settings</h2>
            <p style={{ fontSize: "14px", color: "var(--on-surface-variant)" }}>Manage your student profile and global account preferences.</p>
          </div>
          <a
            href="/CampusConnect_Project_Report.pdf"
            download="CampusConnect_Project_Report.pdf"
            style={{ textDecoration: "none" }}
          >
            <button
              className="btn-secondary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0, 74, 198, 0.15)",
                whiteSpace: "nowrap"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>download</span>
              System Specification Report (PDF)
            </button>
          </a>
        </div>

        {/* Profile Section */}
        <div className="glass-tile" style={{ padding: "28px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "24px", color: "var(--on-surface)" }}>
            Profile Information
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "28px", alignItems: "center" }} className="profile-container-md-row">

            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: "128px", height: "128px", borderRadius: "50%", border: "4px solid var(--surface-container-lowest)", boxShadow: "0 8px 24px rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, var(--primary), var(--tertiary))", color: "white", fontSize: "40px", fontWeight: 800 }}>
                {fullName.substring(0, 2).toUpperCase()}
              </div>
            </div>

            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr", gap: "16px", width: "100%" }} className="profile-inputs-md-cols">
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--on-surface-variant)", marginBottom: "6px", paddingLeft: "4px" }}>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--on-surface-variant)", marginBottom: "6px", paddingLeft: "4px" }}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                  className="input-field"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--on-surface-variant)", marginBottom: "6px", paddingLeft: "4px" }}>Department / Major</label>
                <select
                  value={major}
                  onChange={(e) => { handleInputChange("major", e.target.value); }}
                  className="input-field"
                  style={{ cursor: "pointer" }}
                >
                  <option value="">— Select Department —</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="glass-tile" style={{ padding: "28px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--on-surface)" }}>Skills</h3>
          <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", marginBottom: "20px" }}>
            Add your skills. Type a skill name and press <strong>Enter</strong> or <strong>comma</strong> to add. Your ranking is determined by the number and level of your skills.
          </p>

          {/* Tag Display */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px", minHeight: "40px" }}>
            {skillTags.map(skill => (
              <div
                key={skill}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "9999px",
                  background: "linear-gradient(135deg, rgba(0,74,198,0.12), rgba(106,30,219,0.12))",
                  border: "1px solid rgba(0,74,198,0.2)",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--primary)",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>star</span>
                {skill}
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0 2px",
                    color: "var(--on-surface-variant)",
                    display: "flex",
                    alignItems: "center",
                    lineHeight: 1,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>close</span>
                </button>
              </div>
            ))}
            {skillTags.length === 0 && (
              <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", fontStyle: "italic" }}>No skills added yet...</p>
            )}
          </div>

          {/* Skill Input */}
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              type="text"
              placeholder="e.g. React, Python, Machine Learning..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              className="input-field"
              style={{ flex: 1 }}
            />
            <button
              onClick={handleAddSkill}
              className="btn-primary"
              style={{ padding: "10px 20px", whiteSpace: "nowrap" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
              Add Skill
            </button>
          </div>

          {/* Skill Rank Preview */}
          {skillTags.length > 0 && (
            <div style={{
              marginTop: "20px",
              padding: "12px 16px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(106,30,219,0.06), rgba(0,74,198,0.06))",
              border: "1px solid rgba(106,30,219,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}>
              <span className="material-symbols-outlined" style={{ color: "var(--tertiary)", fontSize: "24px" }}>
                {skillTags.length >= 8 ? "workspace_premium" : skillTags.length >= 5 ? "rocket_launch" : skillTags.length >= 3 ? "bolt" : "eco"}
              </span>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--on-surface)" }}>
                  Skill Rank:{" "}
                  <span style={{ color: "var(--tertiary)" }}>
                    {skillTags.length >= 8 ? "Expert 🏆" : skillTags.length >= 5 ? "Advanced 🚀" : skillTags.length >= 3 ? "Intermediate ⚡" : "Beginner 🌱"}
                  </span>
                </p>
                <p style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>
                  {skillTags.length} skill{skillTags.length !== 1 ? "s" : ""} added · {skillTags.length >= 8 ? "Keep it up, you're a top performer!" : `Add ${Math.max(0, 3 - skillTags.length)} more to reach Intermediate`}
                </p>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="profile-inputs-md-cols">

          {/* Appearance settings */}
          <div className="glass-tile" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--on-surface)" }}>Appearance</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { id: "light", label: "Light Mode", icon: "light_mode", desc: "Clean bright interface" },
                { id: "dark", label: "Dark Mode", icon: "dark_mode", desc: "Easy on the eyes" },
                { id: "system", label: "System Sync", icon: "desktop_windows", desc: "Follow OS preference" },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => handleThemeChange(opt.id)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                    borderRadius: "16px",
                    cursor: "pointer",
                    border: theme === opt.id ? "2px solid var(--primary)" : "1px solid var(--outline-variant)",
                    backgroundColor: theme === opt.id ? "rgba(0, 74, 198, 0.06)" : "transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "12px",
                      background: theme === opt.id ? "rgba(0,74,198,0.1)" : "var(--surface-container)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span className="material-symbols-outlined" style={{ color: theme === opt.id ? "var(--primary)" : "var(--on-surface-variant)" }}>
                        {opt.icon}
                      </span>
                    </div>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--on-surface)" }}>{opt.label}</p>
                      <p style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>{opt.desc}</p>
                    </div>
                  </div>
                  {theme === opt.id && (
                    <span className="material-symbols-outlined filled" style={{ color: "var(--primary)", fontSize: "22px" }}>
                      check_circle
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notification triggers */}
          <div className="glass-tile" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--on-surface)" }}>Notification Settings</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {[
                { id: "reminders", title: "Event Reminders", desc: "Alert me 24 hours before registered events", state: reminders },
                { id: "invites", title: "Teammate Requests", desc: "Notify me when a team invites me to collaborate", state: invites },
                { id: "alerts", title: "Milestone Awards", desc: "Email me when badges or certificates are issued", state: alerts },
              ].map((notif) => (
                <div key={notif.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ flex: 1, paddingRight: "16px" }}>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--on-surface)" }}>{notif.title}</p>
                    <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginTop: "2px" }}>{notif.desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(notif.id)}
                    className={`switch ${notif.state ? "active" : ""}`}
                  >
                    <div className="thumb" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Connected Integrations */}
        <div className="glass-tile" style={{ padding: "28px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", color: "var(--on-surface)" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>link</span>
            Connected Integrations
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderRadius: "20px", border: "1px solid var(--outline-variant)", backgroundColor: "var(--surface-container-lowest)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "48px", height: "48px", backgroundColor: "rgba(0, 119, 181, 0.1)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#0077B5" }}>
                  <svg style={{ width: "24px", height: "24px" }} fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                </div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--on-surface)" }}>LinkedIn</p>
                  <p style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>Connected</p>
                </div>
              </div>
              <button
                onClick={() => alert("Revoking LinkedIn Integration...")}
                style={{ background: "none", border: "none", color: "var(--error)", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
              >
                Revoke
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Sticky action bar */}
      {hasChanges && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          backgroundColor: "var(--surface-container-low)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid var(--outline-variant)", padding: "16px 32px",
          display: "flex", justifyContent: "flex-end", gap: "16px", zIndex: 100
        }}>
          <button onClick={handleDiscard} className="btn-ghost" style={{ padding: "10px 24px" }}>
            Discard Changes
          </button>
          <button onClick={handleSave} className="btn-primary" style={{ padding: "10px 24px" }}>
            Save Settings
          </button>
        </div>
      )}

    </DashboardLayout>
  );
}
