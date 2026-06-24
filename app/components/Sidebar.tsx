"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/events", label: "Events Discovery", icon: "calendar_month" },
  { href: "/team-builder", label: "Team Builder", icon: "groups" },
  { href: "/leaderboard", label: "Leaderboard", icon: "military_tech" },
  { href: "/attendance", label: "Attendance Portal", icon: "qr_code_scanner" },
  { href: "/analytics", label: "Analytics", icon: "analytics" },
  { href: "/profile", label: "Profile", icon: "person" },
  { href: "/achievements", label: "Achievements", icon: "workspace_premium" },
  { href: "/settings", label: "Settings", icon: "settings" },
  { href: "/help", label: "Help & FAQ", icon: "help" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; avatarUrl?: string; department?: string } | null>(null);
  
  // Create Event Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventCategory, setEventCategory] = useState("Innovation");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventCapacity, setEventCapacity] = useState("100");
  const [eventAmount, setEventAmount] = useState("0");
  const [eventIsFree, setEventIsFree] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error("Error loading user details in sidebar", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSignOut = () => {
    // Delete the userId cookie
    document.cookie = "userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = "/";
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventLocation.trim() || !eventCapacity.trim()) {
      setError("Please fill in Event Title, Location, and Capacity.");
      return;
    }
    if (!eventIsFree && (!eventAmount.trim() || parseFloat(eventAmount) <= 0)) {
      setError("Please enter a valid amount greater than 0 for paid events.");
      return;
    }
    setError("");
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: eventTitle,
          description: eventDesc,
          category: eventCategory,
          date: eventDate,
          time: eventTime,
          location: eventLocation,
          venue: eventVenue,
          maxAttendees: eventCapacity,
          amount: eventIsFree ? 0 : parseFloat(eventAmount),
          isFree: eventIsFree,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        // Reset form
        setEventTitle("");
        setEventDesc("");
        setEventDate("");
        setEventTime("");
        setEventLocation("");
        setEventVenue("");
        setEventCapacity("100");
        setEventAmount("0");
        setEventIsFree(true);
        
        // Refresh the page to reload the events discovery list
        window.location.reload();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create event");
      }
    } catch (err) {
      setError("Network error occurred during event publication");
    } finally {
      setSubmitLoading(false);
    }
  };

  const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : "ST";

  return (
    <aside
      style={{
        width: "256px",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 40,
        borderRight: "1px solid rgba(255, 255, 255, 0.5)",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Sidebar background with backdrop blur to avoid creating a containing block for fixed modal */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -1,
          background: "rgba(248, 249, 255, 0.85)",
          backdropFilter: "blur(20px)",
        }}
      />
      {/* Brand Logo */}
      <div style={{ padding: "0 12px 28px", display: "flex", alignItems: "center", gap: "10px" }}>
        <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "var(--primary)" }}>
          bubble_chart
        </span>
        <span style={{ fontSize: "18px", fontWeight: 900, color: "var(--on-surface)", letterSpacing: "-0.01em" }}>
          CampusConnect
        </span>
      </div>

      {/* Nav Menu Items */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "var(--primary)" : "var(--on-surface-variant)",
                  background: isActive ? "rgba(0, 74, 198, 0.06)" : "transparent",
                  transition: "all 0.2s",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "20px",
                    color: isActive ? "var(--primary)" : "var(--on-surface-variant)",
                  }}
                >
                  {item.icon}
                </span>
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: "20px",
          borderTop: "1px solid rgba(195,198,215,0.3)",
        }}
      >
        {/* Create Event Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            background: "var(--tertiary)",
            color: "white",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "none",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(106,30,219,0.25)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>add</span>
          Create Event
        </button>

        {/* User Profile avatar summary */}
        <div
          style={{
            marginTop: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary), var(--tertiary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: "12px",
                flexShrink: 0,
                border: "2px solid white",
              }}
            >
              {initials}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontWeight: 700, fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name || "Student"}
              </p>
              <p style={{ fontSize: "11px", color: "var(--on-surface-variant)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.department || "Computer Science"}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign Out"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--on-surface-variant)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px",
              borderRadius: "4px",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>logout</span>
          </button>
        </div>
      </div>

      {/* Create Event Modal Dialog */}
      {showCreateModal && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          backdropFilter: "blur(4px)"
        }}>
          <form
            onSubmit={handleCreateEvent}
            className="glass-tile"
            style={{
              width: "100%", maxWidth: "480px", padding: "32px",
              display: "flex", flexDirection: "column", gap: "16px",
              position: "relative", animation: "modalIn 0.3s ease-out",
              textAlign: "left"
            }}
          >
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              style={{
                position: "absolute", top: "16px", right: "16px", background: "none",
                border: "none", cursor: "pointer", color: "var(--on-surface-variant)"
              }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px", color: "var(--on-surface)" }}>Create New Event</h3>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--on-surface-variant)", marginBottom: "4px" }}>Event Title*</label>
              <input
                type="text"
                placeholder="e.g. NextGen Web Hackathon"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                style={{ width: "100%", height: "40px", borderRadius: "10px", border: "1px solid var(--outline-variant)", padding: "0 12px", fontSize: "13px", outline: "none" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--on-surface-variant)", marginBottom: "4px" }}>Category*</label>
                <select
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value)}
                  style={{ width: "100%", height: "40px", borderRadius: "10px", border: "1px solid var(--outline-variant)", padding: "0 8px", fontSize: "13px", outline: "none", backgroundColor: "white" }}
                >
                  <option value="Innovation">Innovation</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Career">Career</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Sports">Sports</option>
                  <option value="Academic">Academic</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--on-surface-variant)", marginBottom: "4px" }}>Max Capacity*</label>
                <input
                  type="number"
                  min="5"
                  value={eventCapacity}
                  onChange={(e) => setEventCapacity(e.target.value)}
                  style={{ width: "100%", height: "40px", borderRadius: "10px", border: "1px solid var(--outline-variant)", padding: "0 12px", fontSize: "13px", outline: "none" }}
                />
              </div>
            </div>

            {/* Pricing Details */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", alignItems: "end" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--on-surface-variant)", marginBottom: "4px" }}>Event Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  disabled={eventIsFree}
                  value={eventIsFree ? "0" : eventAmount}
                  onChange={(e) => setEventAmount(e.target.value)}
                  style={{ width: "100%", height: "40px", borderRadius: "10px", border: "1px solid var(--outline-variant)", padding: "0 12px", fontSize: "13px", outline: "none", backgroundColor: eventIsFree ? "var(--surface-container-low)" : "white" }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "40px" }}>
                <input
                  type="checkbox"
                  id="event-free-checkbox"
                  checked={eventIsFree}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setEventIsFree(checked);
                    if (checked) setEventAmount("0");
                  }}
                  style={{ cursor: "pointer", width: "18px", height: "18px" }}
                />
                <label htmlFor="event-free-checkbox" style={{ fontSize: "13px", fontWeight: 600, color: "var(--on-surface-variant)", cursor: "pointer" }}>Free Event</label>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--on-surface-variant)", marginBottom: "4px" }}>Date</label>
                <input
                  type="text"
                  placeholder="e.g. Nov 12, 2026"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  style={{ width: "100%", height: "40px", borderRadius: "10px", border: "1px solid var(--outline-variant)", padding: "0 12px", fontSize: "13px", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--on-surface-variant)", marginBottom: "4px" }}>Time</label>
                <input
                  type="text"
                  placeholder="e.g. 10:00 AM - 04:00 PM"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  style={{ width: "100%", height: "40px", borderRadius: "10px", border: "1px solid var(--outline-variant)", padding: "0 12px", fontSize: "13px", outline: "none" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--on-surface-variant)", marginBottom: "4px" }}>Location*</label>
              <input
                type="text"
                placeholder="e.g. Innovation Hub, Block C"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                style={{ width: "100%", height: "40px", borderRadius: "10px", border: "1px solid var(--outline-variant)", padding: "0 12px", fontSize: "13px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--on-surface-variant)", marginBottom: "4px" }}>Venue</label>
              <input
                type="text"
                placeholder="e.g. Seminar Hall A, Ground Floor"
                value={eventVenue}
                onChange={(e) => setEventVenue(e.target.value)}
                style={{ width: "100%", height: "40px", borderRadius: "10px", border: "1px solid var(--outline-variant)", padding: "0 12px", fontSize: "13px", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--on-surface-variant)", marginBottom: "4px" }}>Description</label>
              <textarea
                placeholder="Describe the event, objectives, and prerequisites..."
                value={eventDesc}
                onChange={(e) => setEventDesc(e.target.value)}
                style={{ width: "100%", height: "80px", borderRadius: "10px", border: "1px solid var(--outline-variant)", padding: "12px", fontSize: "13px", outline: "none", resize: "none", fontFamily: "inherit" }}
              />
            </div>

            {error && <p style={{ color: "var(--error)", fontSize: "12px", fontWeight: 600 }}>{error}</p>}

            <button
              type="submit"
              disabled={submitLoading}
              className="btn-primary"
              style={{ width: "100%", height: "44px", justifyContent: "center", borderRadius: "12px", fontWeight: 700, cursor: "pointer", marginTop: "8px" }}
            >
              {submitLoading ? "Publishing event..." : "Publish Event"}
            </button>
          </form>
        </div>
      )}
    </aside>
  );
}
