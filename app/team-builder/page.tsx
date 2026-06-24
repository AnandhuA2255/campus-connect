"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";

interface TeamMember {
  initials: string;
  color: string;
  name: string;
}

interface TeamSuggestion {
  id: string;
  name: string;
  match: number;
  project: string;
  open: number;
  skills: string[];
  members: TeamMember[];
}

interface Invitation {
  id: string;
  type: "received" | "sent";
  from: string | null;
  to: string | null;
  team: string;
  teamId: string;
  status: string;
  time: string;
}

const ALL_POSSIBLE_SKILLS = [
  "React", "TypeScript", "Python", "TensorFlow", "Figma",
  "Node.js", "SQL", "Docker", "Arduino", "C++",
  "PCB Design", "Robotics", "Data Science", "ML", "Tableau",
  "UI/UX", "Illustrator", "Public Speaking", "Project Management", "Statistics"
];

export default function TeamBuilderPage() {
  const [skills, setSkills] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<TeamSuggestion[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSkillSelect, setShowAddSkillSelect] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null); // teamId being requested
  const [sentTeams, setSentTeams] = useState<Set<string>>(new Set()); // teams already requested
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [inviteTab, setInviteTab] = useState<"received" | "sent">("received");

  const fetchTeamBuilderData = async () => {
    try {
      const [profileRes, matchRes, invRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/teams/match"),
        fetch("/api/teams/invitations"),
      ]);

      const profileData = await profileRes.json();
      if (profileData.user?.skills) {
        setSkills(profileData.user.skills.map((us: any) => us.skill.name));
      }

      const matchData = await matchRes.json();
      if (matchData.suggestions) setSuggestions(matchData.suggestions);

      const invData = await invRes.json();
      if (invData.invitations) {
        setInvitations(invData.invitations);
        // Track teams user already sent a request to
        const alreadySent = new Set<string>(
          invData.invitations
            .filter((i: Invitation) => i.type === "sent" && i.status === "PENDING")
            .map((i: Invitation) => i.teamId)
        );
        setSentTeams(alreadySent);
      }
    } catch (err) {
      console.error("Error loading team builder data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeamBuilderData(); }, []);

  const handleAddSkill = async (newSkill: string) => {
    if (!newSkill) return;
    const updated = [...skills, newSkill];
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: updated }),
      });
      if (res.ok) {
        setToast({ message: `Added skill: ${newSkill}! Recalculating matches...`, type: "success" });
        await fetchTeamBuilderData();
      } else {
        setToast({ message: "Failed to update skills", type: "error" });
      }
    } catch {
      setToast({ message: "Network error occurred", type: "error" });
    } finally {
      setShowAddSkillSelect(false);
      setLoading(false);
    }
  };

  const handleRemoveSkill = async (removedSkill: string) => {
    const updated = skills.filter(s => s !== removedSkill);
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: updated }),
      });
      if (res.ok) {
        setToast({ message: `Removed skill: ${removedSkill}`, type: "success" });
        await fetchTeamBuilderData();
      } else {
        setToast({ message: "Failed to update skills", type: "error" });
      }
    } catch {
      setToast({ message: "Network error occurred", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Real "Send Join Request" handler
  const handleSendRequest = async (team: TeamSuggestion) => {
    setSendingRequest(team.id);
    try {
      const res = await fetch("/api/teams/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: team.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: `Join request sent to ${team.name}! 🎉`, type: "success" });
        setSentTeams(prev => new Set([...prev, team.id]));
        setInviteTab("sent");
        await fetchTeamBuilderData();
      } else {
        setToast({ message: data.error || "Failed to send request", type: "error" });
      }
    } catch {
      setToast({ message: "Network error occurred", type: "error" });
    } finally {
      setSendingRequest(null);
    }
  };

  // ✅ Accept / Decline received invitation
  const handleRespondInvite = async (invitationId: string, status: "ACCEPTED" | "DECLINED") => {
    try {
      const res = await fetch("/api/teams/invitations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, status }),
      });
      if (res.ok) {
        setToast({ message: `Invitation ${status === "ACCEPTED" ? "accepted" : "declined"}!`, type: "success" });
        await fetchTeamBuilderData();
      } else {
        const data = await res.json();
        setToast({ message: data.error || "Action failed", type: "error" });
      }
    } catch {
      setToast({ message: "Network error occurred", type: "error" });
    }
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const availableSkills = ALL_POSSIBLE_SKILLS.filter(s => !skills.includes(s));
  const receivedInvitations = invitations.filter(i => i.type === "received");
  const sentRequests = invitations.filter(i => i.type === "sent");

  if (loading && suggestions.length === 0) {
    return (
      <DashboardLayout title="Team Builder">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  const statusColors: Record<string, { bg: string; color: string }> = {
    PENDING: { bg: "rgba(230,126,34,0.12)", color: "#e67e22" },
    ACCEPTED: { bg: "rgba(0,108,73,0.12)", color: "var(--secondary)" },
    DECLINED: { bg: "rgba(186,26,26,0.12)", color: "var(--error)" },
  };

  return (
    <DashboardLayout title="Team Builder">
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px",
          backgroundColor: toast.type === "success" ? "rgba(0,108,73,0.95)" : "rgba(186,26,26,0.95)",
          color: "white", padding: "16px 24px", borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)", zIndex: 1000,
          display: "flex", alignItems: "center", gap: "10px", backdropFilter: "blur(8px)",
          animation: "fadeInUp 0.3s ease",
        }}>
          <span className="material-symbols-outlined">{toast.type === "success" ? "check_circle" : "error"}</span>
          <span style={{ fontSize: "14px", fontWeight: 600 }}>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>AI Team Matching</h2>
        <p style={{ fontSize: "15px", color: "var(--on-surface-variant)" }}>
          Find the perfect teammates for your next hackathon or project based on complementary skills.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "32px" }} className="video-card-md-row">

        {/* Left: Skills + Team Suggestions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

          {/* Skill Profile */}
          <div className="glass-tile" style={{ padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>Your Skill Profile</h3>
                <p style={{ fontSize: "13px", color: "var(--on-surface-variant)" }}>Skills used to match you with teams</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(106,30,219,0.1)", borderRadius: "12px", padding: "8px 16px" }}>
                <span className="material-symbols-outlined filled" style={{ fontSize: "20px", color: "var(--tertiary)" }}>psychology</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--tertiary)" }}>AI Matching Active</span>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
              {skills.map(skill => (
                <span key={skill} style={{
                  padding: "6px 16px", borderRadius: "9999px",
                  background: "var(--primary-container)", color: "var(--on-primary-container)",
                  fontSize: "13px", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: "6px",
                }}>
                  {skill}
                  <span onClick={() => handleRemoveSkill(skill)} style={{ fontSize: "16px", opacity: 0.7, cursor: "pointer", lineHeight: 1 }}>×</span>
                </span>
              ))}

              {!showAddSkillSelect ? (
                <button
                  onClick={() => setShowAddSkillSelect(true)}
                  style={{
                    padding: "6px 16px", borderRadius: "9999px",
                    background: "transparent", border: "1.5px dashed var(--outline-variant)",
                    color: "var(--on-surface-variant)", fontSize: "13px", fontWeight: 600,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span>
                  Add Skill
                </button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <select
                    onChange={e => handleAddSkill(e.target.value)}
                    defaultValue=""
                    className="input-field"
                    style={{ padding: "6px 12px", borderRadius: "16px", fontSize: "13px", fontWeight: 600, height: "auto" }}
                  >
                    <option value="" disabled>Select Skill...</option>
                    {availableSkills.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => setShowAddSkillSelect(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "var(--error)", fontWeight: 600 }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Teams */}
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>Recommended Teams</h3>

            {suggestions.length === 0 ? (
              <div className="glass-tile" style={{ padding: "40px", textAlign: "center", color: "var(--on-surface-variant)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "48px", display: "block", marginBottom: "12px" }}>group_off</span>
                <p style={{ fontWeight: 600 }}>No matching teams found.</p>
                <p style={{ fontSize: "13px", marginTop: "4px" }}>Add more skills to get matched with teams.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {suggestions.map(team => {
                  const alreadySent = sentTeams.has(team.id);
                  const isSending = sendingRequest === team.id;
                  const isAlreadyMember = team.members.some(m => m.name === "You");

                  return (
                    <div key={team.id} className="glass-tile hover-lift" style={{ padding: "24px", display: "flex", gap: "24px", alignItems: "flex-start" }}>
                      {/* Radial Match Score */}
                      <div style={{ position: "relative", width: "72px", height: "72px", flexShrink: 0 }}>
                        <svg style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }} viewBox="0 0 72 72" width="72" height="72">
                          <circle cx="36" cy="36" r="30" fill="none" stroke="var(--surface-container)" strokeWidth="6" />
                          <circle
                            cx="36" cy="36" r="30" fill="none"
                            stroke={team.match >= 80 ? "url(#gradHigh)" : "url(#grad)"}
                            strokeWidth="6" strokeLinecap="round"
                            strokeDasharray={`${(team.match / 100) * 188.5} 188.5`}
                          />
                          <defs>
                            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="var(--primary)" />
                              <stop offset="100%" stopColor="var(--tertiary)" />
                            </linearGradient>
                            <linearGradient id="gradHigh" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="var(--primary)" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontWeight: 800, fontSize: "15px", color: team.match >= 80 ? "var(--secondary)" : "var(--primary)" }}>{team.match}%</span>
                        </div>
                      </div>

                      {/* Team Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <div>
                            <h4 style={{ fontWeight: 700, fontSize: "16px", color: "var(--on-surface)" }}>{team.name}</h4>
                            <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", marginTop: "2px" }}>{team.project}</p>
                          </div>
                          <span style={{
                            padding: "4px 12px", borderRadius: "9999px",
                            background: team.open > 0 ? "rgba(0,108,73,0.1)" : "rgba(186,26,26,0.1)",
                            color: team.open > 0 ? "var(--secondary)" : "var(--error)",
                            fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap",
                          }}>
                            {team.open > 0 ? `${team.open} spot${team.open > 1 ? "s" : ""} open` : "Full"}
                          </span>
                        </div>

                        {/* Members */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                          <div style={{ display: "flex" }}>
                            {team.members.map((m, i) => (
                              <div key={m.name} title={m.name} style={{
                                width: "32px", height: "32px", borderRadius: "50%",
                                background: m.color, display: "flex", alignItems: "center",
                                justifyContent: "center", color: "white", fontWeight: 700,
                                fontSize: "11px", border: "2px solid var(--surface-container-lowest)",
                                marginLeft: i === 0 ? 0 : "-8px",
                              }}>
                                {m.initials}
                              </div>
                            ))}
                          </div>
                          <span style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>
                            {team.members.length} member{team.members.length > 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Skills needed */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                          {team.skills.map(skill => (
                            <span key={skill} className="chip chip-purple" style={{ fontSize: "11px" }}>{skill}</span>
                          ))}
                        </div>

                        {/* Action Button */}
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          {alreadySent ? (
                            <div style={{
                              display: "flex", alignItems: "center", gap: "8px",
                              padding: "8px 20px", borderRadius: "12px",
                              background: "rgba(0,74,198,0.08)", border: "1px solid rgba(0,74,198,0.2)",
                              color: "var(--primary)", fontSize: "13px", fontWeight: 600,
                            }}>
                              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>schedule</span>
                              Request Pending
                            </div>
                          ) : team.open === 0 ? (
                            <div style={{
                              padding: "8px 20px", borderRadius: "12px",
                              background: "var(--surface-container)", color: "var(--on-surface-variant)",
                              fontSize: "13px", fontWeight: 600,
                            }}>
                              Team Full
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSendRequest(team)}
                              disabled={isSending}
                              className="btn-primary"
                              style={{ padding: "8px 20px", fontSize: "13px", opacity: isSending ? 0.7 : 1 }}
                            >
                              {isSending ? (
                                <>
                                  <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>send</span>
                                  Send Request
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Invitations Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="glass-tile" style={{ padding: "24px" }}>
            {/* Panel Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "var(--tertiary)" }}>mail</span>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Team Invitations</h3>
              {receivedInvitations.filter(i => i.status === "PENDING").length > 0 && (
                <span style={{
                  marginLeft: "auto", background: "var(--error)", color: "white",
                  borderRadius: "9999px", padding: "2px 8px", fontSize: "11px", fontWeight: 700,
                }}>
                  {receivedInvitations.filter(i => i.status === "PENDING").length} new
                </span>
              )}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", background: "var(--surface-container)", borderRadius: "10px", padding: "3px", marginBottom: "16px" }}>
              {(["received", "sent"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setInviteTab(tab)}
                  style={{
                    flex: 1, padding: "7px", border: "none", borderRadius: "8px",
                    fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                    background: inviteTab === tab ? "var(--surface-container-lowest)" : "transparent",
                    color: inviteTab === tab ? "var(--primary)" : "var(--on-surface-variant)",
                    boxShadow: inviteTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {tab === "received" ? "📬 Received" : "📤 Sent"}
                  {tab === "received" && receivedInvitations.length > 0 && (
                    <span style={{ marginLeft: "4px", opacity: 0.7 }}>({receivedInvitations.length})</span>
                  )}
                  {tab === "sent" && sentRequests.length > 0 && (
                    <span style={{ marginLeft: "4px", opacity: 0.7 }}>({sentRequests.length})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Received Tab */}
            {inviteTab === "received" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {receivedInvitations.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "var(--on-surface-variant)" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "40px", display: "block", marginBottom: "8px" }}>inbox</span>
                    <p style={{ fontSize: "13px" }}>No invitations received yet.</p>
                  </div>
                ) : (
                  receivedInvitations.map(inv => {
                    const sc = statusColors[inv.status] || statusColors.PENDING;
                    return (
                      <div key={inv.id} style={{
                        padding: "16px", borderRadius: "16px",
                        background: "var(--surface-container-low)",
                        border: `1px solid ${inv.status === "PENDING" ? "rgba(230,126,34,0.2)" : "var(--outline-variant)"}`,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                              <div style={{
                                width: "28px", height: "28px", borderRadius: "50%",
                                background: "linear-gradient(135deg, var(--primary), var(--tertiary))",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "white", fontSize: "10px", fontWeight: 800,
                              }}>
                                {(inv.from || "?").substring(0, 2).toUpperCase()}
                              </div>
                              <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--on-surface)" }}>{inv.from}</p>
                            </div>
                            <p style={{ fontSize: "11px", color: "var(--on-surface-variant)", paddingLeft: "36px" }}>
                              Invited to join <strong style={{ color: "var(--on-surface)" }}>{inv.team}</strong>
                            </p>
                          </div>
                          <span style={{
                            fontSize: "9px", fontWeight: 700, textTransform: "uppercase",
                            padding: "3px 8px", borderRadius: "6px",
                            background: sc.bg, color: sc.color, whiteSpace: "nowrap",
                          }}>
                            {inv.status}
                          </span>
                        </div>

                        {inv.status === "PENDING" && (
                          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                            <button
                              onClick={() => handleRespondInvite(inv.id, "ACCEPTED")}
                              className="btn-primary"
                              style={{ flex: 1, padding: "8px 12px", fontSize: "12px", borderRadius: "10px", justifyContent: "center" }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>check</span>
                              Accept
                            </button>
                            <button
                              onClick={() => handleRespondInvite(inv.id, "DECLINED")}
                              style={{
                                flex: 1, padding: "8px 12px", fontSize: "12px", borderRadius: "10px",
                                background: "var(--surface-container)", border: "1px solid var(--outline-variant)",
                                cursor: "pointer", fontWeight: 600, color: "var(--on-surface-variant)",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>close</span>
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Sent Tab */}
            {inviteTab === "sent" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {sentRequests.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "var(--on-surface-variant)" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "40px", display: "block", marginBottom: "8px" }}>outbox</span>
                    <p style={{ fontSize: "13px" }}>No join requests sent yet.</p>
                    <p style={{ fontSize: "12px", marginTop: "4px" }}>Click "Send Request" on a team to apply.</p>
                  </div>
                ) : (
                  sentRequests.map(inv => {
                    const sc = statusColors[inv.status] || statusColors.PENDING;
                    return (
                      <div key={inv.id} style={{
                        padding: "16px", borderRadius: "16px",
                        background: "var(--surface-container-low)",
                        border: `1px solid ${inv.status === "PENDING" ? "rgba(0,74,198,0.2)" : "var(--outline-variant)"}`,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--on-surface)" }}>{inv.team}</p>
                            <p style={{ fontSize: "11px", color: "var(--on-surface-variant)", marginTop: "2px" }}>
                              {inv.status === "PENDING" ? "Awaiting response from team lead" :
                                inv.status === "ACCEPTED" ? "✅ Request accepted! You joined the team." :
                                  "❌ Request was declined."}
                            </p>
                          </div>
                          <span style={{
                            fontSize: "9px", fontWeight: 700, textTransform: "uppercase",
                            padding: "3px 8px", borderRadius: "6px",
                            background: sc.bg, color: sc.color, whiteSpace: "nowrap",
                          }}>
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="glass-tile" style={{ padding: "20px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px", color: "var(--on-surface)" }}>Your Activity</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Skills listed", value: skills.length, icon: "star", color: "var(--tertiary)" },
                { label: "Requests sent", value: sentRequests.length, icon: "send", color: "var(--primary)" },
                { label: "Invitations received", value: receivedInvitations.length, icon: "mail", color: "#e67e22" },
              ].map(stat => (
                <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px", color: stat.color }}>{stat.icon}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>{stat.label}</p>
                  </div>
                  <span style={{ fontSize: "18px", fontWeight: 800, color: stat.color }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
