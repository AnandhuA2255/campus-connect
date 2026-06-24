"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Link from "next/link";
import TicketModal from "../components/TicketModal";

interface Event {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  venue?: string;
  imageUrl: string;
  amount?: number;
  isFree?: boolean;
}

interface Registration {
  id: string;
  eventId: string;
  qrCodeString: string;
  attendedAt: string | null;
  name?: string;
  email?: string;
  mobile?: string;
  place?: string;
  year?: string;
  field?: string;
  transactionId?: string;
  event: Event;
}

interface Activity {
  id: string;
  icon: string;
  color: string;
  bgColor: string;
  text: string;
  createdAt: string;
}

interface Invitation {
  id: string;
  from: string;
  team: string;
  status: string;
  time: string;
}

interface User {
  id: string;
  name: string;
  points: number;
  nationalRank: number | null;
  collegeRank: number | null;
  registrations: Registration[];
  activities: Activity[];
  _count: {
    badges: number;
    certificates: number;
  };
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [activeQrModal, setActiveQrModal] = useState<{
    open: boolean;
    eventTitle: string;
    eventId: string;
    qrCode: string;
    attended: boolean;
    category: string;
    date: string;
    time: string;
    location: string;
    venue?: string;
    studentName: string;
    email?: string;
    mobile?: string;
    place?: string;
    year?: string;
    field?: string;
    transactionId?: string;
    amount?: number;
  } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchDashboardData = async () => {
    try {
      // Fetch user profile data
      const resUser = await fetch("/api/profile");
      const dataUser = await resUser.json();

      // Fetch pending invitations
      const resInv = await fetch("/api/teams/invitations");
      const dataInv = await resInv.json();

      if (dataUser.user) {
        // Calculate counts manually to reflect relations accurately
        const regs = dataUser.user.registrations || [];
        const certsCount = dataUser.user.certificates ? dataUser.user.certificates.length : 0;
        const badgesCount = dataUser.user.badges ? dataUser.user.badges.length : 0;

        setUser({
          ...dataUser.user,
          _count: {
            badges: badgesCount,
            certificates: certsCount,
          },
        });
      }
      if (dataInv.invitations) {
        setInvitations(dataInv.invitations.filter((i: any) => i.status === "PENDING"));
      }
    } catch (err) {
      console.error("Error loading dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCheckInSimulate = async (eventId: string, qrCode: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCodeString: qrCode }),
      });
      const data = await res.json();

      if (res.ok) {
        setToast({
          message: `Check-in successful! +50 pts awarded.${data.badgeUnlocked ? ` Unlocked Badge: ${data.badgeUnlocked.name}!` : ""}`,
          type: "success",
        });
        setActiveQrModal(null);
        fetchDashboardData(); // Refresh dashboard stats
      } else {
        setToast({ message: data.error || "Check-in failed", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Network error occurred during check-in", type: "error" });
    }
  };

  const handleRespondInvite = async (invitationId: string, status: "ACCEPTED" | "DECLINED") => {
    try {
      const res = await fetch("/api/teams/invitations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, status }),
      });
      const data = await res.json();

      if (res.ok) {
        setToast({
          message: `Invitation ${status.toLowerCase()} successfully!`,
          type: "success",
        });
        fetchDashboardData();
      } else {
        setToast({ message: data.error || "Action failed", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Network error occurred", type: "error" });
    }
  };

  // Close toast automatically
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <div className="spinner"></div>
          <p style={{ marginLeft: "12px", color: "var(--on-surface-variant)" }}>Loading CampusConnect Hub...</p>
        </div>
      </DashboardLayout>
    );
  }

  const upcomingRegistrations = user?.registrations || [];
  const recentActivities = user?.activities || [];

  return (
    <DashboardLayout>
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
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <span className="material-symbols-outlined">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          <span style={{ fontSize: "14px", fontWeight: 600 }}>{toast.message}</span>
        </div>
      )}

      {/* Welcome Header */}
      <header style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.01em" }}>
          Welcome back, {user?.name || "Alex"}! 👋
        </h2>
        <p style={{ fontSize: "16px", color: "var(--on-surface-variant)", maxWidth: "600px", lineHeight: 1.6 }}>
          Ready for your next event? You have {upcomingRegistrations.length} events registered and {invitations.length} pending team invitations.
        </p>
      </header>

      {/* Bento Grid Stats */}
      <section style={{ marginBottom: "48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
          
          {/* Left mini stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", gridColumn: "span 2" }}>
            {[
              { icon: "event_available", label: "Registered Events", value: upcomingRegistrations.length, color: "var(--primary)", bg: "rgba(0,74,198,0.08)" },
              { icon: "task_alt", label: "Attended Events", value: upcomingRegistrations.filter(r => r.attendedAt).length, color: "var(--secondary)", bg: "rgba(108,248,187,0.15)" },
              { icon: "stars", label: "Participation Points", value: user?.points || 0, suffix: "pts", color: "var(--tertiary)", bg: "rgba(131,67,244,0.1)" },
              { icon: "card_membership", label: "Certificates", value: user?._count.certificates || 0, color: "var(--primary)", bg: "rgba(0,74,198,0.08)" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass-tile stat-card hover-lift"
                style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "140px" }}
              >
                <div>
                  <div style={{ width: "40px", height: "40px", background: stat.bg, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                    <span className="material-symbols-outlined" style={{ color: stat.color, fontSize: "20px" }}>{stat.icon}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", fontWeight: 500 }}>{stat.label}</p>
                </div>
                <p style={{ fontSize: "36px", fontWeight: 800, color: stat.color, letterSpacing: "-0.02em", marginTop: "8px" }}>
                  {stat.value}
                  {stat.suffix && <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--on-surface-variant)", marginLeft: "4px" }}>{stat.suffix}</span>}
                </p>
              </div>
            ))}
          </div>

          {/* Current Badge */}
          <div className="glass-tile" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
            <p style={{ fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>workspace_premium</span>
              Current Badge
            </p>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <div style={{ width: "80px", height: "80px", position: "relative", marginBottom: "12px" }}>
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(135deg, var(--primary), var(--tertiary))",
                  borderRadius: "50%",
                }} />
                <div style={{
                  position: "absolute", inset: "6px",
                  background: "var(--surface)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <span className="material-symbols-outlined filled" style={{ fontSize: "36px", color: "var(--tertiary)" }}>
                    rocket_launch
                  </span>
                </div>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "16px" }}>Tech Enthusiast</h3>
              <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginTop: "4px" }}>Level 4 Achievement</p>
            </div>
            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(195,198,215,0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "8px" }}>
                <span>Progress to Gold</span>
                <span style={{ fontWeight: 600 }}>75%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "75%" }} />
              </div>
            </div>
          </div>

          {/* Standings */}
          <div className="glass-tile" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>emoji_events</span>
              Current Standings
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
              {[
                { label: "National Rank", value: `#${user?.nationalRank || "42"}`, subColor: "var(--secondary)", sub: "↑ 2", color: "var(--primary)" },
                { label: "College Rank", value: `#0${user?.collegeRank || "3"}`, sub: "of 1,240", color: "var(--tertiary)" },
              ].map((rank) => (
                <div key={rank.label} style={{ padding: "12px", borderRadius: "12px", background: "var(--surface-container)", border: "1px solid var(--glass-border)" }}>
                  <p style={{ fontSize: "10px", color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{rank.label}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "2px" }}>
                    <span style={{ fontSize: "28px", fontWeight: 800, color: rank.color, letterSpacing: "-0.02em" }}>{rank.value}</span>
                    <span style={{ fontSize: "11px", color: rank.subColor || "var(--on-surface-variant)", fontWeight: 600 }}>{rank.sub}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/leaderboard">
              <button style={{
                width: "100%", background: "none", border: "none", cursor: "pointer",
                color: "var(--primary)", fontWeight: 600, fontSize: "13px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                padding: "8px", borderRadius: "8px", transition: "background 0.2s",
              }}>
                View Leaderboard
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "32px" }} className="video-card-md-row">
        
        {/* Upcoming Registered Events */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 700 }}>My Upcoming Events</h3>
            <Link href="/events" style={{ fontSize: "13px", fontWeight: 700, color: "var(--primary)", textDecoration: "none" }}>
              Discover More
            </Link>
          </div>
          
          {upcomingRegistrations.length === 0 ? (
            <div className="glass-tile" style={{ padding: "40px", textAlign: "center", color: "var(--on-surface-variant)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--outline)" }}>event_busy</span>
              <p style={{ marginTop: "12px", fontSize: "15px", fontWeight: 600 }}>You are not registered for any upcoming events.</p>
              <Link href="/events" style={{ textDecoration: "none" }}>
                <button className="btn-primary" style={{ marginTop: "16px", marginInline: "auto" }}>Browse Events</button>
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {upcomingRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="glass-tile event-card"
                  style={{ overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                >
                  <div>
                    <div style={{ height: "140px", width: "100%", overflow: "hidden", position: "relative" }}>
                      <div
                        style={{
                          position: "absolute", inset: 0,
                          backgroundImage: `url('${reg.event.imageUrl}')`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          transition: "transform 0.5s ease",
                        }}
                        className="event-card-img"
                      />
                      <div style={{ position: "absolute", top: "12px", left: "12px" }}>
                        <span style={{
                          background: reg.attendedAt ? "rgba(0,108,73,0.95)" : "rgba(0,74,198,0.95)",
                          backdropFilter: "blur(8px)",
                          color: "white",
                          fontSize: "11px",
                          padding: "4px 10px",
                          borderRadius: "9999px",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>
                            {reg.attendedAt ? "check_circle" : "confirmation_number"}
                          </span>
                          {reg.attendedAt ? "Attended" : "Registered"}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: "20px 20px 10px" }}>
                      <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px" }}>{reg.event.title}</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                        {[
                          { icon: "calendar_today", text: reg.event.date },
                          { icon: "schedule", text: reg.event.time },
                          { icon: "location_on", text: reg.event.location },
                        ].map((info) => (
                          <div key={info.icon} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--on-surface-variant)" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>{info.icon}</span>
                            {info.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: "0 20px 20px" }}>
                    <button
                      onClick={() => setActiveQrModal({
                        open: true,
                        eventTitle: reg.event.title,
                        eventId: reg.eventId,
                        qrCode: reg.qrCodeString,
                        attended: !!reg.attendedAt,
                        category: reg.event.category,
                        date: reg.event.date,
                        time: reg.event.time,
                        location: reg.event.location,
                        venue: reg.event.venue,
                        studentName: reg.name || user?.name || "Student",
                        email: reg.email,
                        mobile: reg.mobile,
                        place: reg.place,
                        year: reg.year,
                        field: reg.field,
                        transactionId: reg.transactionId || undefined,
                        amount: reg.event.amount,
                      })}
                      className="btn-primary"
                      style={{ width: "100%", justifyContent: "center", padding: "10px", borderRadius: "10px" }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                        {reg.attendedAt ? "done" : "qr_code_2"}
                      </span>
                      {reg.attendedAt ? "View Pass details" : "View Check-in QR"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right side: Activities & Invitations */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          
          {/* Team Invitations */}
          {invitations.length > 0 && (
            <section>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>Team Invitations</h3>
              <div className="glass-tile" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {invitations.map((inv) => (
                  <div key={inv.id} style={{ display: "flex", flexDirection: "column", gap: "10px", paddingBottom: "12px", borderBottom: "1px solid var(--outline-variant)" }}>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 600 }}>Invite from {inv.from}</p>
                      <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginTop: "2px" }}>
                        To join <strong>{inv.team}</strong>
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleRespondInvite(inv.id, "ACCEPTED")}
                        className="btn-primary"
                        style={{ padding: "6px 12px", fontSize: "11px", borderRadius: "6px" }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespondInvite(inv.id, "DECLINED")}
                        style={{ padding: "6px 12px", fontSize: "11px", borderRadius: "6px", background: "var(--surface-container)", border: "none", cursor: "pointer", fontWeight: 600 }}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recent Activity */}
          <section>
            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>Recent Activity</h3>
            <div className="glass-tile" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {recentActivities.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", textAlign: "center" }}>No recent activities logged.</p>
              ) : (
                recentActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} style={{ display: "flex", gap: "12px" }}>
                    <div style={{
                      width: "36px", height: "36px", flexShrink: 0,
                      borderRadius: "50%", background: activity.bgColor || "rgba(0,74,198,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span className="material-symbols-outlined filled" style={{ fontSize: "16px", color: activity.color || "var(--primary)" }}>
                        {activity.icon || "info"}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "13px", lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: activity.text }} />
                      <p style={{ fontSize: "10px", color: "var(--on-surface-variant)", marginTop: "2px" }}>
                        {new Date(activity.createdAt).toLocaleDateString(undefined, { hour: "numeric", minute: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Ticket Slip Modal */}
      {activeQrModal && (
        <TicketModal
          open={activeQrModal.open}
          onClose={() => setActiveQrModal(null)}
          studentName={activeQrModal.studentName}
          email={activeQrModal.email}
          mobile={activeQrModal.mobile}
          place={activeQrModal.place}
          year={activeQrModal.year}
          field={activeQrModal.field}
          eventTitle={activeQrModal.eventTitle}
          category={activeQrModal.category}
          date={activeQrModal.date}
          time={activeQrModal.time}
          location={activeQrModal.location}
          venue={activeQrModal.venue}
          qrCode={activeQrModal.qrCode}
          attended={activeQrModal.attended}
          transactionId={activeQrModal.transactionId}
          amount={activeQrModal.amount}
          onSimulateScan={() => handleCheckInSimulate(activeQrModal.eventId, activeQrModal.qrCode)}
        />
      )}
    </DashboardLayout>
  );
}
