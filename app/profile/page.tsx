"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import CertificateModal from "../components/CertificateModal";

interface UserSkill {
  id: string;
  level: number;
  skill: {
    name: string;
    category: string;
  };
}

interface UserBadge {
  badge: {
    name: string;
    description: string;
    icon: string;
    requirement: string;
  };
  unlockedAt: string;
}

interface Certificate {
  id: string;
  title: string;
  description: string;
  issuer: string;
  issueDate: string;
}

interface Activity {
  id: string;
  icon: string;
  color: string;
  bgColor: string;
  text: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  points: number;
  nationalRank: number | null;
  collegeRank: number | null;
  college: string | null;
  department: string | null;
  graduationYear: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  skills: UserSkill[];
  badges: UserBadge[];
  certificates: Certificate[];
  activities: Activity[];
}

export default function StudentProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [openCert, setOpenCert] = useState<Certificate | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setBioInput(data.user.bio || "");
        setNameInput(data.user.name || "");
        setAvatarPreview(data.user.avatarUrl || null);
        setAvatarBase64(null);
      }
    } catch (err) {
      console.error("Error loading profile data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput,
          bio: bioInput,
          ...(avatarBase64 ? { avatarUrl: avatarBase64 } : {}),
        }),
      });

      if (res.ok) {
        setToast({ message: "Profile updated successfully!", type: "success" });
        setIsEditing(false);
        setAvatarBase64(null);
        fetchProfile();
      } else {
        setToast({ message: "Failed to update profile", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Network error occurred", type: "error" });
    } finally {
      setLoading(false);
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
      <DashboardLayout title="Student Profile">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  const profileName = user?.name || "Student";
  const userBio = user?.bio || "No biography provided yet.";
  const department = user?.department || "Computer Science";
  const points = user?.points || 0;
  const userSkills = user?.skills || [];
  const userBadges = user?.badges || [];
  const certificates = user?.certificates || [];
  const activities = user?.activities || [];

  return (
    <DashboardLayout title="Student Profile">
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: toast.type === "success" ? "rgba(0,108,73,0.95)" : "rgba(186,26,26,0.95)",
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

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        
        {/* Profile Header Card */}
        <div className="glass-tile" style={{ padding: "32px", position: "relative", overflow: "hidden", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "32px" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: "256px", height: "256px", background: "rgba(0, 74, 198, 0.04)", borderRadius: "50%", marginRight: "-80px", marginTop: "-80px", filter: "blur(40px)", pointerEvents: "none" }} />
          
          <div style={{ position: "relative", flexShrink: 0 }}>
            {/* Hidden file input */}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const result = ev.target?.result as string;
                  setAvatarPreview(result);
                  setAvatarBase64(result);
                };
                reader.readAsDataURL(file);
              }}
            />
            {/* Avatar circle */}
            <div
              onClick={() => isEditing && photoInputRef.current?.click()}
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                border: "4px solid white",
                boxShadow: "0 12px 32px rgba(37,99,235,0.12)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: avatarPreview ? "transparent" : "linear-gradient(135deg, var(--primary), var(--tertiary))",
                color: "white",
                fontSize: "48px",
                fontWeight: 800,
                cursor: isEditing ? "pointer" : "default",
                position: "relative",
              }}
            >
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                profileName.substring(0, 2).toUpperCase()
              )}
              {/* Camera overlay on hover in edit mode */}
              {isEditing && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.45)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  opacity: 0,
                  transition: "opacity 0.2s",
                  borderRadius: "50%",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "white" }}>photo_camera</span>
                  <span style={{ fontSize: "10px", color: "white", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>Change Photo</span>
                </div>
              )}
            </div>
            {/* Online indicator */}
            <div style={{ position: "absolute", bottom: "8px", right: "8px", backgroundColor: "#10b981", width: "24px", height: "24px", borderRadius: "50%", border: "3px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
            {/* Edit camera badge */}
            {isEditing && (
              <button
                onClick={() => photoInputRef.current?.click()}
                title="Upload photo"
                style={{
                  position: "absolute",
                  bottom: "6px",
                  left: "6px",
                  background: "var(--primary)",
                  border: "3px solid white",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,74,198,0.3)",
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "white" }}>add_a_photo</span>
              </button>
            )}
          </div>

          <div style={{ flex: 1, minWidth: "280px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
              {isEditing ? (
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--outline-variant)",
                    background: "var(--surface-container-low)",
                    color: "var(--on-surface)",
                  }}
                />
              ) : (
                <h2 style={{ fontSize: "32px", fontWeight: 800, color: "var(--on-surface)" }}>{profileName}</h2>
              )}
              <span className="chip" style={{ backgroundColor: "var(--surface-container-high)", color: "var(--on-surface-variant)", padding: "6px 16px" }}>
                Student ID: #2026CS{user?.id.substring(0, 4).toUpperCase()}
              </span>
            </div>
            
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--primary)" }}>
                Major: {department}
              </h3>
              {/* Skill Tier Badge */}
              {(() => {
                const skillScore = userSkills.reduce((sum, s) => sum + s.level, 0);
                const tier = skillScore >= 800
                  ? { label: "Expert", emoji: "🏆", bg: "rgba(255,215,0,0.12)", color: "#b8860b", border: "rgba(255,215,0,0.3)" }
                  : skillScore >= 500
                    ? { label: "Advanced", emoji: "🚀", bg: "rgba(106,30,219,0.1)", color: "var(--tertiary)", border: "rgba(106,30,219,0.2)" }
                    : skillScore >= 200
                      ? { label: "Intermediate", emoji: "⚡", bg: "rgba(0,74,198,0.1)", color: "var(--primary)", border: "rgba(0,74,198,0.2)" }
                      : { label: "Beginner", emoji: "🌱", bg: "rgba(0,108,73,0.1)", color: "var(--secondary)", border: "rgba(0,108,73,0.2)" };
                return (
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "5px 14px",
                    borderRadius: "9999px",
                    background: tier.bg,
                    color: tier.color,
                    border: `1px solid ${tier.border}`,
                    fontSize: "12px",
                    fontWeight: 700,
                  }}>
                    {tier.emoji} {tier.label} Skill Rank
                  </span>
                );
              })()}
            </div>
            
            {isEditing ? (
              <textarea 
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                style={{ width: "100%", height: "80px", padding: "12px", borderRadius: "12px", border: "1px solid var(--outline-variant)", background: "var(--surface-container-low)", fontFamily: "inherit", fontSize: "14px", color: "var(--on-surface)", outline: "none", resize: "none" }}
              />
            ) : (
              <p style={{ fontSize: "16px", lineHeight: "1.6", color: "var(--on-surface-variant)", maxWidth: "720px" }}>
                {userBio}
              </p>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button 
                onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                className="btn-primary" 
                style={{ padding: "10px 24px" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  {isEditing ? "save" : "edit"}
                </span>
                {isEditing ? "Save Profile" : "Edit Profile"}
              </button>
              {isEditing && (
                <button 
                  onClick={() => { setIsEditing(false); setNameInput(profileName); setBioInput(userBio); setAvatarPreview(user?.avatarUrl || null); setAvatarBase64(null); }}
                  className="btn-ghost" 
                  style={{ padding: "10px 24px" }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Grid content */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "32px" }} className="video-card-md-row">
          
          {/* Left Column: Skills & Badges */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            
            {/* Skills & Endorsements */}
            <div className="glass-tile" style={{ padding: "28px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Skills & Progress</h3>
              
              {userSkills.length === 0 ? (
                <p style={{ color: "var(--on-surface-variant)" }}>No skills added. Add skills in the Team Builder.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {userSkills.map((us) => (
                    <div key={us.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                        <span style={{ fontWeight: 600 }}>{us.skill.name}</span>
                        <span style={{ fontWeight: 700, color: "var(--primary)" }}>{us.level}%</span>
                      </div>
                      <div className="progress-bar" style={{ height: "8px" }}>
                        <div className="progress-fill" style={{ width: `${us.level}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Badges Panel */}
            <div className="glass-tile" style={{ padding: "28px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Earned Badges</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "16px" }}>
                {userBadges.map((ub) => (
                  <div
                    key={ub.badge.name}
                    onMouseEnter={() => setActiveTooltip(ub.badge.name)}
                    onMouseLeave={() => setActiveTooltip(null)}
                    style={{
                      padding: "16px 12px",
                      borderRadius: "16px",
                      backgroundColor: "rgba(0, 108, 73, 0.08)",
                      border: "1px solid rgba(0, 108, 73, 0.2)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      textAlign: "center",
                      position: "relative",
                      cursor: "help",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "36px", color: "var(--secondary)" }}>
                      {ub.badge.icon}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: 700 }}>{ub.badge.name}</span>
                    
                    {activeTooltip === ub.badge.name && (
                      <div style={{
                        position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)",
                        marginBottom: "8px", width: "180px", backgroundColor: "var(--surface-container-highest)",
                        color: "var(--on-surface)", padding: "10px", borderRadius: "8px",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.15)", fontSize: "11px", zIndex: 100
                      }}>
                        <strong>{ub.badge.name}</strong>: {ub.badge.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Timeline & Certificates */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            
            {/* Impact Metric Cards */}
            <div className="glass-tile" style={{ padding: "28px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>Impact Score</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "48px", fontWeight: 800, color: "var(--tertiary)" }}>{points}</span>
                <span style={{ fontSize: "14px", color: "var(--on-surface-variant)", fontWeight: 600 }}>Total Points</span>
              </div>
            </div>

            {/* Certifications Card */}
            <div className="glass-tile" style={{ padding: "28px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Certifications</h3>
              
              {certificates.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "var(--on-surface-variant)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "40px", display: "block", marginBottom: "8px" }}>workspace_premium</span>
                  <p style={{ fontSize: "13px" }}>No certificates earned yet.</p>
                  <p style={{ fontSize: "11px", marginTop: "4px" }}>Complete events to earn certificates.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {certificates.map((cert) => (
                    <div key={cert.id} style={{
                      padding: "16px",
                      border: "1px solid rgba(106,30,219,0.2)",
                      borderRadius: "16px",
                      background: "linear-gradient(135deg, rgba(0,74,198,0.03), rgba(106,30,219,0.03))",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}>
                      <div style={{
                        width: "44px", height: "44px", borderRadius: "12px",
                        background: "linear-gradient(135deg, #004AC6, #6A1EDB)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <span className="material-symbols-outlined" style={{ color: "white", fontSize: "22px" }}>workspace_premium</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--on-surface)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cert.title}</p>
                        <p style={{ fontSize: "11px", color: "var(--on-surface-variant)", marginTop: "2px" }}>{cert.issuer}</p>
                        <p style={{ fontSize: "10px", color: "var(--tertiary)", marginTop: "2px", fontWeight: 600 }}>
                          Issued: {new Date(cert.issueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <button
                        onClick={() => setOpenCert(cert)}
                        style={{
                          display: "flex", alignItems: "center", gap: "4px",
                          padding: "7px 14px", borderRadius: "10px",
                          background: "linear-gradient(135deg, #004AC6, #6A1EDB)",
                          color: "white", border: "none", cursor: "pointer",
                          fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap",
                          boxShadow: "0 2px 8px rgba(106,30,219,0.3)",
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>open_in_new</span>
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity History */}
            <div className="glass-tile" style={{ padding: "28px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Recent Activity</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {activities.slice(0, 3).map((act) => (
                  <div key={act.id} style={{ display: "flex", gap: "12px" }}>
                    <span className="material-symbols-outlined" style={{ color: act.color || "var(--primary)", fontSize: "18px" }}>
                      {act.icon}
                    </span>
                    <div>
                      <p style={{ fontSize: "12px", lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: act.text }} />
                      <p style={{ fontSize: "9px", color: "var(--on-surface-variant)", marginTop: "2px" }}>
                        {new Date(act.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Certificate Viewer Modal */}
      {openCert && (
        <CertificateModal
          open={!!openCert}
          onClose={() => setOpenCert(null)}
          studentName={profileName}
          eventTitle={openCert.title.replace("Course Completion: ", "")}
          category={openCert.description || "Academic"}
          date={new Date(openCert.issueDate).toLocaleDateString()}
          location={department}
          issuer={openCert.issuer}
          issueDate={openCert.issueDate}
          certificateId={openCert.id}
        />
      )}
    </DashboardLayout>
  );
}
