"use client";

import { useState, useEffect, use as reactUse } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Link from "next/link";
import TicketModal from "../../components/TicketModal";
import RegisterModal from "../../components/RegisterModal";

interface Registration {
  userId: string;
  eventId: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  venue?: string;
  imageUrl: string;
  maxAttendees: number;
  registrations: Registration[];
  amount?: number;
  isFree?: boolean;
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = reactUse(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [studentProfile, setStudentProfile] = useState<{ name: string; email: string } | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [activeTicket, setActiveTicket] = useState<{
    open: boolean;
    studentName: string;
    email?: string;
    mobile?: string;
    place?: string;
    year?: string;
    field?: string;
    eventTitle: string;
    category: string;
    date: string;
    time: string;
    location: string;
    venue?: string;
    qrCode: string;
    attended: boolean;
    transactionId?: string;
    amount?: number;
  } | null>(null);

  const fetchEventDetail = async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.events) {
        const found = data.events.find((e: Event) => e.id === eventId);
        setEvent(found || null);
      }

      const resProfile = await fetch("/api/profile");
      const dataProfile = await resProfile.json();
      if (dataProfile.user) {
        setStudentProfile({ name: dataProfile.user.name, email: dataProfile.user.email });
        if (dataProfile.user.registrations) {
          const registered = dataProfile.user.registrations.some((r: any) => r.eventId === eventId);
          setIsRegistered(registered);
        }
      }
    } catch (err) {
      console.error("Error loading event detail", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetail();
  }, [eventId]);

  const handleRegisterSubmit = async (formData: {
    name: string;
    email: string;
    mobile: string;
    place: string;
    year: string;
    field: string;
    transactionId?: string;
  }) => {
    if (!event) return;
    setRegisterLoading(true);
    try {
      const res = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setToast({ message: "Successfully registered for this event!", type: "success" });
        setIsRegistered(true);
        fetchEventDetail();
        setShowRegisterModal(false);

        setActiveTicket({
          open: true,
          studentName: data.registration.name || formData.name,
          email: data.registration.email || formData.email,
          mobile: data.registration.mobile || formData.mobile,
          place: data.registration.place || formData.place,
          year: data.registration.year || formData.year,
          field: data.registration.field || formData.field,
          eventTitle: event.title,
          category: event.category,
          date: event.date,
          time: event.time,
          location: event.location,
          venue: event.venue,
          qrCode: data.registration.qrCodeString,
          attended: false,
          transactionId: data.registration.transactionId,
          amount: event.amount,
        });
      } else {
        setToast({ message: data.error || "Registration failed", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Network error occurred", type: "error" });
    } finally {
      setRegisterLoading(false);
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (loading) {
    return (
      <DashboardLayout title="Event Details">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout title="Event Details">
        <div style={{ padding: "40px", textAlign: "center", color: "var(--on-surface-variant)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "48px" }}>
            error
          </span>
          <p style={{ marginTop: "12px", fontSize: "16px", fontWeight: 700 }}>Event not found</p>
          <Link href="/events" style={{ textDecoration: "none" }}>
            <button className="btn-primary" style={{ marginTop: "16px", marginInline: "auto" }}>
              Back to Events
            </button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const attendeesCount = event.registrations.length;
  const capPercent = Math.round((attendeesCount / event.maxAttendees) * 100);
  const isFull = attendeesCount >= event.maxAttendees;

  return (
    <DashboardLayout title="Event Details">
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

      <div style={{ maxWidth: "900px" }}>
        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "24px",
            fontSize: "13px",
            color: "var(--on-surface-variant)",
          }}
        >
          <Link href="/events" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
            Events
          </Link>
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
            chevron_right
          </span>
          <span>{event.title}</span>
        </div>

        {/* Hero Image */}
        <div style={{ position: "relative", borderRadius: "24px", overflow: "hidden", marginBottom: "32px", height: "380px" }}>
          <img src={event.imageUrl} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(11,28,48,0.9) 0%, transparent 60%)",
            }}
          />
          <div style={{ position: "absolute", bottom: "32px", left: "32px", right: "32px" }}>
            <span
              className="chip"
              style={{
                marginBottom: "12px",
                background: "var(--secondary-container)",
                color: "var(--on-secondary-container)",
              }}
            >
              {event.category}
            </span>
            <h1 style={{ fontSize: "32px", fontWeight: 800, color: "white", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
              {event.title}
            </h1>
          </div>
        </div>

        {/* Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px" }} className="video-card-md-row">
          {/* Left: Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {/* Quick Info */}
            <div
              className="glass-tile"
              style={{ padding: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
            >
              {[
                { icon: "calendar_month", label: "Date", value: event.date, color: "var(--secondary)" },
                { icon: "schedule", label: "Time", value: event.time, color: "var(--secondary)" },
                { icon: "location_on", label: "Location", value: event.location, color: "var(--secondary)" },
                ...(event.venue ? [{ icon: "meeting_room", label: "Venue", value: event.venue, color: "var(--secondary)" }] : []),
                { icon: "people", label: "Participants", value: `${attendeesCount} / ${event.maxAttendees} registered`, color: "var(--secondary)" },
              ].map((info) => (
                <div key={info.label} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      background: "rgba(0,108,73,0.1)",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px", color: info.color }}>
                      {info.icon}
                    </span>
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--on-surface-variant)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {info.label}
                    </p>
                    <p style={{ fontWeight: 600, fontSize: "14px", marginTop: "2px" }}>{info.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* About */}
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>About This Event</h2>
              <div className="glass-tile" style={{ padding: "24px" }}>
                <p style={{ fontSize: "15px", lineHeight: 1.8, color: "var(--on-surface-variant)" }}>
                  {event.description}
                </p>
                <div style={{ marginTop: "24px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {["Robotics", "Engineering", "Innovate", "Team Event", "Certificate"].map((tag) => (
                    <span key={tag} className="chip chip-purple">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Registration Card */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="glass-tile" style={{ padding: "28px", position: "sticky", top: "88px" }}>
              <div style={{ marginBottom: "20px" }}>
                <span style={{ fontSize: "28px", fontWeight: 800, color: event.isFree ? "var(--secondary)" : "var(--primary)" }}>
                  {event.isFree ? "Free" : `₹${event.amount}`}
                </span>
                <span style={{ fontSize: "13px", color: "var(--on-surface-variant)", marginLeft: "8px" }}>
                  {event.isFree ? "No registration fee" : "Registration fee"}
                </span>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "8px" }}>
                  <span>Spots Remaining</span>
                  <span style={{ fontWeight: 700, color: isFull ? "var(--error)" : "var(--secondary)" }}>
                    {isFull ? "Full" : `${event.maxAttendees - attendeesCount} left`}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${capPercent}%` }} />
                </div>
              </div>

              {isRegistered ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button
                    className="btn-primary"
                    disabled
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      padding: "14px",
                      opacity: 0.8,
                      background: "rgba(0,108,73,0.1)",
                      color: "var(--secondary)",
                      border: "1px solid var(--secondary)",
                    }}
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    Registered
                  </button>
                  <Link href="/dashboard" style={{ textDecoration: "none" }}>
                    <button className="btn-ghost" style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
                      View QR Pass on Dashboard
                    </button>
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => setShowRegisterModal(true)}
                  disabled={isFull}
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: "15px" }}
                >
                  <span className="material-symbols-outlined">how_to_reg</span>
                  {isFull ? "Maximum Capacity Reached" : "Register Now"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <RegisterModal
          open={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onSubmit={handleRegisterSubmit}
          initialName={studentProfile?.name || ""}
          initialEmail={studentProfile?.email || ""}
          eventTitle={event.title}
          eventAmount={event.amount}
          eventIsFree={event.isFree}
          loading={registerLoading}
        />
      )}

      {/* Ticket Modal */}
      {activeTicket && (
        <TicketModal
          open={activeTicket.open}
          onClose={() => setActiveTicket(null)}
          studentName={activeTicket.studentName}
          email={activeTicket.email}
          mobile={activeTicket.mobile}
          place={activeTicket.place}
          year={activeTicket.year}
          field={activeTicket.field}
          eventTitle={activeTicket.eventTitle}
          category={activeTicket.category}
          date={activeTicket.date}
          time={activeTicket.time}
          location={activeTicket.location}
          venue={activeTicket.venue}
          qrCode={activeTicket.qrCode}
          attended={activeTicket.attended}
          transactionId={activeTicket.transactionId}
          amount={activeTicket.amount}
        />
      )}
    </DashboardLayout>
  );
}
