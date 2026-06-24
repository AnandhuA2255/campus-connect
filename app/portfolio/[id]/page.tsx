"use client";

import { useState, useEffect, use as reactUse } from "react";
import Link from "next/link";
import CertificateModal from "../../components/CertificateModal";

interface Certificate {
  id: string;
  title: string;
  description: string;
  issuer: string;
  issueDate: string;
}

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
  };
  unlockedAt: string;
}

interface User {
  id: string;
  name: string;
  bio: string | null;
  points: number;
  nationalRank: number | null;
  department: string | null;
  college: string | null;
  theme: string;
  certificates: Certificate[];
  badges: UserBadge[];
  skills: UserSkill[];
}

export default function PublicPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = reactUse(params);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [openCert, setOpenCert] = useState<Certificate | null>(null);
  const [isAutoDownload, setIsAutoDownload] = useState(false);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const res = await fetch(`/api/profile/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          
          // Apply their preferred theme on mount
          const userTheme = data.user.theme || "system";
          let resolvedTheme = userTheme;
          if (userTheme === "system") {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            resolvedTheme = prefersDark ? "dark" : "light";
          }
          document.documentElement.setAttribute("data-theme", resolvedTheme);
        }
      } catch (err) {
        console.error("Error loading public profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [userId]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "var(--surface)" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "var(--surface)", padding: "20px", textAlign: "center" }}>
        <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "var(--error)", marginBottom: "16px" }}>error</span>
        <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>Portfolio Not Found</h2>
        <p style={{ color: "var(--on-surface-variant)", marginBottom: "24px" }}>The requested student achievements link is invalid or has been removed.</p>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button className="btn-primary">Go to CampusConnect</button>
        </Link>
      </div>
    );
  }

  const certificates = user.certificates || [];
  const userBadges = user.badges || [];
  const totalPoints = user.points || 0;
  const rank = user.nationalRank || 42;

  // Initials for avatar
  const initials = user.name
    ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : "S";

  return (
    <div style={{ backgroundColor: "var(--surface)", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
        
        {/* Navigation Banner for Visitors */}
        <div className="glass-tile" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: "28px" }}>school</span>
            <span style={{ fontWeight: 800, fontSize: "16px", color: "var(--on-surface)" }}>CampusConnect Portfolio</span>
          </div>
          <Link href="/" style={{ textDecoration: "none" }}>
            <button className="btn-ghost" style={{ fontSize: "12px", padding: "8px 16px" }}>
              Join Platform
            </button>
          </Link>
        </div>

        {/* Profile Info Header */}
        <div className="glass-card" style={{ padding: "32px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "24px", position: "relative", overflow: "hidden" }}>
          {/* Header Accent */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, var(--primary) 0%, var(--tertiary) 100%)"
          }} />

          {/* Avatar */}
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "30px",
            fontWeight: 800,
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
          }}>
            {initials}
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--on-surface)", marginBottom: "4px" }}>
              {user.name}
            </h1>
            <p style={{ fontSize: "14px", color: "var(--primary)", fontWeight: 700, marginBottom: "8px" }}>
              {user.department || "General"} Student Portfolio
            </p>
            {user.bio && (
              <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", lineHeight: 1.5, maxWidth: "600px" }}>
                "{user.bio}"
              </p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          {[
            { label: "Verified Credentials", value: certificates.length, icon: "card_membership", bg: "rgba(0, 74, 198, 0.08)", color: "var(--primary)" },
            { label: "Milestone Badges", value: userBadges.length, icon: "verified", bg: "rgba(106, 30, 219, 0.08)", color: "var(--tertiary)" },
            { label: "National Rank", value: `#${rank}`, icon: "public", bg: "rgba(0, 108, 73, 0.08)", color: "var(--secondary)" },
            { label: "Skill Points", value: totalPoints.toLocaleString(), icon: "auto_awesome", bg: "var(--surface-container-high)", color: "var(--primary-container)" },
          ].map((stat, i) => (
            <div key={i} className="glass-tile hover-lift" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span className="material-symbols-outlined" style={{ padding: "8px", borderRadius: "10px", backgroundColor: stat.bg, color: stat.color, fontSize: "20px" }}>
                  {stat.icon}
                </span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--on-surface-variant)" }}>
                  Credential
                </span>
              </div>
              <h3 style={{ fontSize: "24px", fontWeight: 800, color: "var(--on-surface)", marginBottom: "4px" }}>{stat.value}</h3>
              <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", fontWeight: 500 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main Content Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "32px" }} className="achieve-columns-lg-cols">
          
          {/* Left Column: Certificates */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>Verified Certificates</h3>
              
              {certificates.length === 0 ? (
                <div className="glass-tile" style={{ padding: "40px", textAlign: "center", color: "var(--on-surface-variant)" }}>
                  <p>No verified certificates currently listed on this portfolio.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                  {certificates.map((cert) => (
                    <div key={cert.id} className="glass-tile hover-lift" style={{ borderRadius: "24px", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ height: "140px", position: "relative", backgroundColor: "var(--surface-container-high)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "64px", color: "var(--primary)" }}>history_edu</span>
                          <div style={{ position: "absolute", bottom: "12px", left: "12px" }}>
                            <span className="chip" style={{ backgroundColor: "var(--secondary)", color: "white", textTransform: "uppercase", fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em" }}>Verified</span>
                          </div>
                        </div>
                        <div style={{ padding: "20px" }}>
                          <h4 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>{cert.title}</h4>
                          <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>calendar_today</span>
                            Earned {new Date(cert.issueDate).toLocaleDateString()}
                          </p>
                          <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", lineHeight: 1.5 }}>{cert.description}</p>
                        </div>
                      </div>
                      <div style={{ padding: "0 20px 20px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <button onClick={() => { setIsAutoDownload(false); setOpenCert(cert); }} className="btn-primary" style={{ padding: "8px", fontSize: "12px", justifyContent: "center" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>visibility</span>
                            Details
                          </button>
                          <button onClick={() => { setIsAutoDownload(true); setOpenCert(cert); }} className="btn-ghost" style={{ padding: "8px", fontSize: "12px", justifyContent: "center", display: "flex", alignItems: "center", gap: "4px", fontWeight: 700 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>download</span>
                            PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Badges & Skills */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Badges Panel */}
            <div className="glass-tile" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Milestones</h3>
              {userBadges.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--on-surface-variant)" }}>No milestone badges earned yet.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "12px" }}>
                  {userBadges.map((ub) => (
                    <div key={ub.badge.name} style={{
                      padding: "16px 8px", borderRadius: "16px",
                      background: "rgba(106, 30, 219, 0.04)", border: "1px solid rgba(106, 30, 219, 0.1)",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", textAlign: "center"
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "var(--tertiary)" }}>
                        {ub.badge.icon}
                      </span>
                      <div style={{ fontSize: "11px", fontWeight: 700 }}>{ub.badge.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Skills Panel */}
            <div className="glass-tile" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Technical Skills</h3>
              {user.skills && user.skills.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {user.skills.map((us) => (
                    <span key={us.id} className="chip chip-purple" style={{ fontSize: "11px" }}>
                      {us.skill.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: "13px", color: "var(--on-surface-variant)" }}>No skills listed.</p>
              )}
            </div>

          </div>

        </div>

      </div>

      {openCert && (
        <CertificateModal
          open={!!openCert}
          onClose={() => { setOpenCert(null); setIsAutoDownload(false); }}
          studentName={user.name}
          eventTitle={openCert.title.replace("Course Completion: ", "")}
          category={openCert.description || "Academic"}
          date={new Date(openCert.issueDate).toLocaleDateString()}
          location={user.department || "Computer Science"}
          issuer={openCert.issuer}
          issueDate={new Date(openCert.issueDate).toLocaleDateString()}
          certificateId={openCert.id}
          autoDownload={isAutoDownload}
        />
      )}
    </div>
  );
}
