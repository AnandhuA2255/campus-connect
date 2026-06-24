"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import CertificateModal from "../components/CertificateModal";

interface Certificate {
  id: string;
  title: string;
  description: string;
  issuer: string;
  issueDate: string;
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
  points: number;
  nationalRank: number | null;
  department?: string | null;
  certificates: Certificate[];
  badges: UserBadge[];
}

export default function AchievementsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [openCert, setOpenCert] = useState<Certificate | null>(null);
  const [isAutoDownload, setIsAutoDownload] = useState(false);

  const fetchAchievements = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error("Error loading achievements", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleShare = () => {
    if (!user) return;
    const shareUrl = `${window.location.origin}/portfolio/${user.id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
      });
  };

  if (loading && !user) {
    return (
      <DashboardLayout title="Achievements">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  const certificates = user?.certificates || [];
  const userBadges = user?.badges || [];
  const totalPoints = user?.points || 0;
  const rank = user?.nationalRank || 42;

  return (
    <DashboardLayout title="Achievements">
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        
        {/* Title / Description */}
        <div>
          <h2 style={{ fontSize: "28px", fontWeight: 700, color: "var(--on-surface)", marginBottom: "4px" }}>Student Achievements</h2>
          <p style={{ fontSize: "14px", color: "var(--on-surface-variant)" }}>Track your academic progress and institutional recognitions.</p>
        </div>

        {/* High level stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
          {[
            { label: "Total Certificates", value: certificates.length, sub: "Verified Credentials", icon: "card_membership", bg: "rgba(0, 74, 198, 0.08)", color: "var(--primary)" },
            { label: "Earned Badges", value: userBadges.length, sub: "Milestone Icons", icon: "verified", bg: "rgba(106, 30, 219, 0.08)", color: "var(--tertiary)" },
            { label: "National Rank", value: `#${rank}`, sub: "Overall Standing", icon: "public", bg: "rgba(0, 108, 73, 0.08)", color: "var(--secondary)" },
            { label: "Skill Points", value: totalPoints.toLocaleString(), sub: "Participation Score", icon: "auto_awesome", bg: "var(--surface-container-high)", color: "var(--primary-container)" },
          ].map((stat, i) => (
            <div key={i} className="glass-tile hover-lift" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span className="material-symbols-outlined" style={{ padding: "8px", borderRadius: "12px", backgroundColor: stat.bg, color: stat.color, fontSize: "24px" }}>
                  {stat.icon}
                </span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--secondary)" }}>
                  {stat.sub}
                </span>
              </div>
              <h3 style={{ fontSize: "28px", fontWeight: 800, color: "var(--on-surface)", marginBottom: "4px" }}>{stat.value}</h3>
              <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", fontWeight: 500 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }} className="achieve-columns-lg-cols">

          {/* Left Column: Certificates and Skill Badges */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            
            {/* Verified Certificates */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Verified Certificates</h3>
              </div>

              {certificates.length === 0 ? (
                <div className="glass-tile" style={{ padding: "40px", textAlign: "center", color: "var(--on-surface-variant)" }}>
                  <p>You have not earned any certificates yet. Complete workshops to earn them!</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
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

            {/* Badges Panel */}
            <div className="glass-tile" style={{ padding: "28px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>Earned Milestones</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(135px, 1fr))", gap: "16px" }}>
                {userBadges.map((ub) => (
                  <div key={ub.badge.name} style={{
                    padding: "20px 12px", borderRadius: "20px",
                    background: "rgba(106, 30, 219, 0.06)", border: "1px solid rgba(106, 30, 219, 0.15)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", textAlign: "center"
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "var(--tertiary)" }}>
                      {ub.badge.icon}
                    </span>
                    <div style={{ fontSize: "13px", fontWeight: 700 }}>{ub.badge.name}</div>
                    <div style={{ fontSize: "10px", color: "var(--on-surface-variant)" }}>
                      Unlocked {new Date(ub.unlockedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Share Achievements FAB */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="mobile-sticky-adjust">
            <div className="glass-tile" style={{ padding: "28px", textAlign: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--primary)" }}>share</span>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginTop: "12px", marginBottom: "8px" }}>Share Your Credentials</h3>
              <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", lineHeight: 1.6, marginBottom: "20px" }}>
                Generate a public shareable portfolio link to showcase your verified achievements to recruiters and peers.
              </p>
              <button 
                onClick={handleShare}
                className="btn-primary" 
                style={{ width: "100%", justifyContent: "center", padding: "12px" }}
              >
                <span className="material-symbols-outlined">{copied ? "done" : "link"}</span>
                {copied ? "Link Copied!" : "Copy Share Link"}
              </button>
            </div>
          </div>

        </div>

      </div>
      {openCert && (
        <CertificateModal
          open={!!openCert}
          onClose={() => { setOpenCert(null); setIsAutoDownload(false); }}
          studentName={user?.name || "Student"}
          eventTitle={openCert.title.replace("Course Completion: ", "")}
          category={openCert.description || "Academic"}
          date={new Date(openCert.issueDate).toLocaleDateString()}
          location={user?.department || "Computer Science"}
          issuer={openCert.issuer}
          issueDate={openCert.issueDate}
          certificateId={openCert.id}
          autoDownload={isAutoDownload}
        />
      )}
    </DashboardLayout>
  );
}
