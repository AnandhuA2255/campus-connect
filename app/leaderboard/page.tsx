"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";

interface TopStudent {
  rank: number;
  name: string;
  dept: string;
  points: number;
  badges: number;
  events: number;
  skillScore: number;
  skillCount: number;
  avatar: string;
  isCurrentUser: boolean;
}

const podiumColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
const podiumHeights = [180, 140, 110];
const podiumOrder = [1, 0, 2]; // Silver (Rank 2), Gold (Rank 1), Bronze (Rank 3)

function getSkillTier(skillScore: number) {
  if (skillScore >= 800) return { label: "Expert", emoji: "🏆", color: "#FFD700" };
  if (skillScore >= 500) return { label: "Advanced", emoji: "🚀", color: "var(--tertiary)" };
  if (skillScore >= 200) return { label: "Intermediate", emoji: "⚡", color: "var(--primary)" };
  return { label: "Beginner", emoji: "🌱", color: "var(--secondary)" };
}

export default function LeaderboardPage() {
  const [students, setStudents] = useState<TopStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overall");

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (data.topStudents) {
        setStudents(data.topStudents);
      }
    } catch (err) {
      console.error("Error fetching leaderboard standings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Leaderboard">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  // podium mapping: we need at least 3 students, or fallback mock entries
  const fallbackPodium: TopStudent[] = [
    { rank: 1, name: "Priya Sharma", dept: "Computer Science", points: 2840, badges: 12, events: 28, skillScore: 840, skillCount: 12, avatar: "PS", isCurrentUser: false },
    { rank: 2, name: "Rahul Mehta", dept: "Electronics Eng.", points: 2680, badges: 10, events: 25, skillScore: 680, skillCount: 10, avatar: "RM", isCurrentUser: false },
    { rank: 3, name: "Ananya Krishnan", dept: "Data Science", points: 2510, badges: 9, events: 22, skillScore: 510, skillCount: 9, avatar: "AK", isCurrentUser: false }
  ];

  const topThree = students.slice(0, 3);
  while (topThree.length < 3) {
    topThree.push(fallbackPodium[topThree.length]);
  }

  return (
    <DashboardLayout title="Leaderboard">
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <h2 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "8px", letterSpacing: "-0.01em" }}>
          🏆 Student Leaderboard
        </h2>
        <p style={{ fontSize: "15px", color: "var(--on-surface-variant)" }}>
          Top performers based on events attended, badges earned, and participation points
        </p>
      </div>

      {/* Podium - Top 3 */}
      <div
        className="glass-tile"
        style={{
          padding: "40px 32px 0",
          marginBottom: "32px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: "16px",
          overflow: "hidden",
          minHeight: "300px",
          background: "linear-gradient(180deg, rgba(248,249,255,0.9) 0%, rgba(220,233,255,0.5) 100%)",
        }}
      >
        {podiumOrder.map((indexOrder) => {
          const student = topThree[indexOrder];
          return (
            <div key={student.rank} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              {/* Avatar Bubble */}
              <div style={{ position: "relative" }}>
                <div style={{
                  width: indexOrder === 0 ? "72px" : "60px",
                  height: indexOrder === 0 ? "72px" : "60px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${podiumColors[indexOrder]}, ${podiumColors[indexOrder]}aa)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 800,
                  fontSize: indexOrder === 0 ? "24px" : "18px",
                  boxShadow: `0 4px 20px ${podiumColors[indexOrder]}40`,
                  border: `3px solid ${podiumColors[indexOrder]}`,
                }}>
                  {student.avatar}
                </div>
                <div style={{
                  position: "absolute",
                  bottom: "-6px",
                  right: "-6px",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: podiumColors[indexOrder],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "white",
                  border: "2px solid white",
                }}>
                  {student.rank}
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: 700, fontSize: indexOrder === 0 ? "15px" : "13px" }}>{student.name}</p>
                <p style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>{student.points.toLocaleString()} pts</p>
              </div>

              {/* Podium Pedestal Block */}
              <div style={{
                width: "120px",
                height: `${podiumHeights[indexOrder]}px`,
                background: `linear-gradient(180deg, ${podiumColors[indexOrder]}30, ${podiumColors[indexOrder]}15)`,
                border: `2px solid ${podiumColors[indexOrder]}40`,
                borderRadius: "12px 12px 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <span style={{ fontSize: "28px" }}>
                  {indexOrder === 0 ? "🥇" : indexOrder === 1 ? "🥈" : "🥉"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        {["Overall", "This Month", "This Week", "Skill Rank"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 20px",
              borderRadius: "9999px",
              background: activeTab === tab ? "var(--primary)" : "transparent",
              color: activeTab === tab ? "white" : "var(--on-surface-variant)",
              border: `1px solid ${activeTab === tab ? "var(--primary)" : "var(--outline-variant)"}`,
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {tab === "Skill Rank" && <span style={{ fontSize: "14px" }}>⚡</span>}
            {tab}
          </button>
        ))}
      </div>

      {/* Rankings Table */}
      <div className="glass-tile" style={{ padding: "8px", overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: activeTab === "Skill Rank" ? "60px 1fr 130px 100px 120px" : "60px 1fr 120px 100px 100px 120px",
          padding: "12px 20px",
          fontSize: "11px",
          fontWeight: 700,
          color: "var(--on-surface-variant)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          borderBottom: "1px solid var(--outline-variant)",
        }}>
          <span>Rank</span>
          <span>Student</span>
          {activeTab === "Skill Rank" ? (
            <>
              <span style={{ textAlign: "center" }}>Skill Score</span>
              <span style={{ textAlign: "center" }}>Skills</span>
              <span style={{ textAlign: "right" }}>Tier</span>
            </>
          ) : (
            <>
              <span style={{ textAlign: "center" }}>Points</span>
              <span style={{ textAlign: "center" }}>Badges</span>
              <span style={{ textAlign: "center" }}>Events</span>
              <span style={{ textAlign: "right" }}>Progress</span>
            </>
          )}
        </div>

        {/* Rows */}
        {(activeTab === "Skill Rank"
          ? [...students].sort((a, b) => (b.skillScore || 0) - (a.skillScore || 0))
          : students
        ).map((student, displayIdx) => {
          const tier = getSkillTier(student.skillScore || 0);
          const displayRank = activeTab === "Skill Rank" ? displayIdx + 1 : student.rank;
          return (
            <div
              key={`${student.rank}-${activeTab}`}
              className="leaderboard-row"
              style={{
                display: "grid",
                gridTemplateColumns: activeTab === "Skill Rank" ? "60px 1fr 130px 100px 120px" : "60px 1fr 120px 100px 100px 120px",
                padding: "12px 20px",
                borderRadius: "12px",
                background: student.isCurrentUser ? "rgba(0,74,198,0.05)" : "transparent",
                border: student.isCurrentUser ? "1px solid rgba(0,74,198,0.1)" : "1px solid transparent",
                margin: "4px 0",
              }}
            >
              {/* Rank */}
              <div style={{ display: "flex", alignItems: "center" }}>
                {displayRank <= 3 ? (
                  <span style={{ fontSize: "20px" }}>
                    {displayRank === 1 ? "🥇" : displayRank === 2 ? "🥈" : "🥉"}
                  </span>
                ) : (
                  <span style={{ fontWeight: 700, fontSize: "16px", color: "var(--on-surface-variant)" }}>
                    #{displayRank}
                  </span>
                )}
              </div>

              {/* Student */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: student.isCurrentUser
                    ? "linear-gradient(135deg, var(--primary), var(--tertiary))"
                    : "linear-gradient(135deg, var(--surface-container-high), var(--surface-container-highest))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: student.isCurrentUser ? "white" : "var(--on-surface-variant)",
                  fontWeight: 700, fontSize: "14px",
                }}>
                  {student.avatar}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "14px", color: "var(--on-surface)" }}>
                    {student.name}
                    {student.isCurrentUser && (
                      <span style={{ fontSize: "10px", background: "var(--primary)", color: "white", padding: "2px 6px", borderRadius: "9999px", marginLeft: "8px", fontWeight: 600 }}>You</span>
                    )}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>{student.dept}</p>
                </div>
              </div>

              {activeTab === "Skill Rank" ? (
                <>
                  {/* Skill Score */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--tertiary)" }}>
                      {(student.skillScore || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Skill Count */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--on-surface)" }}>
                      {student.skillCount || 0}
                    </span>
                  </div>

                  {/* Tier Badge */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                    <span style={{
                      fontSize: "11px", fontWeight: 700,
                      padding: "4px 10px", borderRadius: "9999px",
                      background: `${tier.color}20`,
                      color: tier.color,
                      border: `1px solid ${tier.color}40`,
                      whiteSpace: "nowrap",
                    }}>
                      {tier.emoji} {tier.label}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {/* Points */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--primary)" }}>
                      {student.points.toLocaleString()}
                    </span>
                  </div>

                  {/* Badges */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                    <span className="material-symbols-outlined filled" style={{ fontSize: "16px", color: "#FFD700" }}>workspace_premium</span>
                    <span style={{ fontWeight: 600, fontSize: "14px" }}>{student.badges}</span>
                  </div>

                  {/* Events */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: "14px" }}>{student.events}</span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div className="progress-bar" style={{ height: "6px" }}>
                        <div
                          className="progress-fill"
                          style={{ width: `${students[0]?.points ? (student.points / students[0].points) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
