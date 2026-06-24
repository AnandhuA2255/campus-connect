"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";

interface ActiveEvent {
  id: string;
  title: string;
  category: string;
  registrations: number;
  capacity: number;
  status: string;
}

interface TrendDay {
  day: string;
  count: number;
}

interface Demographic {
  name: string;
  percentage: number;
}

interface AnalyticsData {
  metrics: {
    registrations: number;
    attendanceRate: string;
    engagement: string;
    certificates: number;
  };
  trends: TrendDay[];
  demographics: Demographic[];
  activeEvents: ActiveEvent[];
  sentiment: {
    score: string;
    ratio: {
      positive: number;
      neutral: number;
      negative: number;
    };
    tags: string[];
  };
}

export default function OrganizerAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      const resData = await res.json();
      if (resData) {
        setData(resData);
      }
    } catch (err) {
      console.error("Error loading analytics data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <DashboardLayout title="Analytics">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  const filteredEvents = data.activeEvents.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Innovation":
        return "var(--secondary)";
      case "Cultural":
        return "var(--tertiary)";
      case "Career":
        return "var(--primary)";
      default:
        return "var(--primary)";
    }
  };

  const getDemographicsColor = (index: number) => {
    const colors = ["var(--primary)", "var(--secondary)", "var(--tertiary)", "var(--outline-variant)"];
    return colors[index % colors.length];
  };

  return (
    <DashboardLayout title="Analytics">
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        
        {/* Title Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: 700, color: "var(--on-surface)", marginBottom: "4px" }}>Organizer Analytics</h2>
            <p style={{ fontSize: "14px", color: "var(--on-surface-variant)" }}>Comprehensive performance overview for all your campus initiatives.</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button 
              onClick={() => fetchAnalytics()}
              className="btn-ghost" 
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", fontSize: "13px" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>refresh</span>
              Sync Stats
            </button>
            <button 
              onClick={() => alert("Exporting PDF/CSV Report...")}
              className="btn-primary" 
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", fontSize: "13px" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>download</span>
              Export Report
            </button>
          </div>
        </div>

        {/* Top level stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
          {[
            { label: "Total Registrations", value: data.metrics.registrations.toLocaleString(), change: "+12.5%", icon: "person_add", color: "var(--primary)" },
            { label: "Attendance Rate", value: data.metrics.attendanceRate, change: "+3.2%", icon: "check_circle", color: "var(--secondary)" },
            { label: "Avg. Engagement Score", value: data.metrics.engagement, change: "+8.1%", icon: "monitoring", color: "var(--tertiary)" },
            { label: "Certificates Issued", value: data.metrics.certificates.toLocaleString(), change: "+22.0%", icon: "workspace_premium", color: "var(--tertiary)" },
          ].map((stat, i) => (
            <div key={i} className="glass-tile hover-lift" style={{ padding: "24px", position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span className="material-symbols-outlined" style={{ padding: "8px", borderRadius: "12px", backgroundColor: "rgba(37,99,235,0.06)", color: stat.color, fontSize: "22px" }}>
                  {stat.icon}
                </span>
                <span style={{ color: "var(--secondary)", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "2px" }}>
                  {stat.change}
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>trending_up</span>
                </span>
              </div>
              <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", fontWeight: 500 }}>{stat.label}</p>
              <p style={{ fontSize: "28px", fontWeight: 800, color: "var(--on-surface)", marginTop: "4px" }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }} className="charts-container-lg-cols">

          {/* Registration Trends */}
          <div className="glass-tile" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Registration Trends</h3>
              <span style={{ fontSize: "12px", color: "var(--on-surface-variant)", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--primary)" }} />
                Daily Signups
              </span>
            </div>
            
            {/* Interactive Simulated Line/Bar Chart */}
            <div style={{ height: "260px", position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 12px 24px" }}>
              
              {/* Y Axis Grid Lines */}
              <div style={{ position: "absolute", left: 0, right: 0, top: "0%", borderBottom: "1px dashed rgba(195,198,215,0.3)" }} />
              <div style={{ position: "absolute", left: 0, right: 0, top: "25%", borderBottom: "1px dashed rgba(195,198,215,0.3)" }} />
              <div style={{ position: "absolute", left: 0, right: 0, top: "50%", borderBottom: "1px dashed rgba(195,198,215,0.3)" }} />
              <div style={{ position: "absolute", left: 0, right: 0, top: "75%", borderBottom: "1px dashed rgba(195,198,215,0.3)" }} />
              
              {data.trends.map((trend, idx) => {
                const maxCount = Math.max(...data.trends.map((t) => t.count));
                const barHeight = maxCount > 0 ? (trend.count / maxCount) * 80 + 10 : 40; // Normalize height (10% - 90%)

                return (
                  <div 
                    key={trend.day} 
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                    style={{ 
                      flex: 1, 
                      margin: "0 8px", 
                      height: `${barHeight}%`, 
                      backgroundColor: hoveredBar === idx ? "rgba(0, 74, 198, 0.85)" : "rgba(37, 99, 235, 0.25)",
                      borderRadius: "8px 8px 0 0",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                      position: "relative"
                    }}
                  >
                    {hoveredBar === idx && (
                      <div style={{ 
                        position: "absolute", bottom: "110%", left: "50%", transform: "translateX(-50%)",
                        backgroundColor: "var(--inverse-surface)", color: "var(--inverse-on-surface)",
                        padding: "6px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 700,
                        whiteSpace: "nowrap", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                      }}>
                        {trend.count} signups
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* X Axis Labels */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: "0 10px", fontSize: "12px", color: "var(--on-surface-variant)", fontWeight: 500 }}>
                {data.trends.map(d => (
                  <span key={d.day}>{d.day}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Demographics circular breakdown */}
          <div className="glass-tile" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Demographics</h3>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "24px" }}>
              <div style={{ position: "relative", width: "160px", height: "160px", margin: "0 auto" }}>
                {/* Visual donut chart segments */}
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "16px solid var(--primary)", clipPath: "polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 0)" }} />
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "16px solid var(--secondary)", clipPath: "polygon(50% 50%, 0 0, 100% 0, 100% 30%)" }} />
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "16px solid var(--tertiary)", clipPath: "polygon(50% 50%, 100% 30%, 100% 50%)", opacity: 0.8 }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "22px", fontWeight: 800, color: "var(--on-surface)" }}>
                    {(data.metrics.registrations * 1.5).toFixed(0)}+
                  </span>
                  <span style={{ fontSize: "10px", color: "var(--on-surface-variant)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Students</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {data.demographics.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: getDemographicsColor(idx) }} />
                    <div>
                      <p style={{ fontSize: "11px", color: "var(--on-surface-variant)", fontWeight: 500 }}>{item.name}</p>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--on-surface)" }}>{item.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Table & AI Sentiment */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }} className="bottom-row-container-xl-cols">

          {/* Active Events Table */}
          <div className="glass-tile" style={{ padding: "28px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Active Events</h3>
              <input 
                type="text"
                placeholder="Filter events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  fontSize: "12px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--outline-variant)",
                  outline: "none",
                  background: "var(--surface-container-low)"
                }}
              />
            </div>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid rgba(195,198,215,0.3)", color: "var(--on-surface-variant)", fontSize: "13px", fontWeight: 600 }}>
                    <th style={{ padding: "12px 16px" }}>Event Name</th>
                    <th style={{ padding: "12px 16px" }}>Registrations</th>
                    <th style={{ padding: "12px 16px" }}>Capacity</th>
                    <th style={{ padding: "12px 16px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid rgba(195,198,215,0.15)", fontSize: "14px" }}>
                      <td style={{ padding: "16px", fontWeight: 600 }}>{event.title}</td>
                      <td style={{ padding: "16px" }}>{event.registrations} registered</td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span>{event.capacity} seats</span>
                          <div className="progress-bar" style={{ width: "80px", height: "6px" }}>
                            <div className="progress-fill" style={{ width: `${(event.registrations / event.capacity) * 100}%`, backgroundColor: getCategoryColor(event.category) }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span style={{ 
                          fontSize: "11px", fontWeight: 700, 
                          color: event.status === "Open" ? "var(--secondary)" : "var(--outline)",
                          backgroundColor: event.status === "Open" ? "rgba(0,108,73,0.06)" : "var(--surface-container-high)",
                          padding: "4px 10px", borderRadius: "9999px"
                        }}>
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Sentiment Analysis Card */}
          <div className="glass-tile" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--tertiary)" }}>psychology</span>
              AI Feedback Sentiment
            </h3>
            
            <div style={{ display: "flex", alignItems: "center", gap: "28px", flexWrap: "wrap" }}>
              <div style={{ position: "relative", width: "96px", height: "96px" }}>
                <svg viewBox="0 0 36 36" style={{ width: "96px", height: "96px", transform: "rotate(-90deg)" }}>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--surface-container)" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--secondary)" strokeDasharray={`${data.sentiment.ratio.positive}, 100`} strokeWidth="3" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "20px", fontWeight: 800 }}>{data.sentiment.score}</span>
                  <span style={{ fontSize: "9px", color: "var(--on-surface-variant)", fontWeight: 700 }}>of 10</span>
                </div>
              </div>
              
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { label: "Positive", val: `${data.sentiment.ratio.positive}%`, color: "var(--secondary)" },
                  { label: "Neutral", val: `${data.sentiment.ratio.neutral}%`, color: "var(--outline)" },
                  { label: "Negative", val: `${data.sentiment.ratio.negative}%`, color: "var(--error)" },
                ].map((s, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: s.color }} />
                      {s.label}
                    </span>
                    <span style={{ fontWeight: 700 }}>{s.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "12px" }}>
              <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Key Word Associations</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {data.sentiment.tags.map((tag) => (
                  <span key={tag} className="chip chip-purple" style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>trending_up</span>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
