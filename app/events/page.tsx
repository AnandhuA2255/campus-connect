"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Link from "next/link";
import TicketModal from "../components/TicketModal";
import RegisterModal from "../components/RegisterModal";

interface Registration {
  userId: string;
  eventId: string;
}

interface Event {
  id: string;
  title: string;
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

const categories = ["All", "Cultural", "Innovation", "Career", "Sports", "Academic", "Workshop"];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
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

  const [studentProfile, setStudentProfile] = useState<{ name: string; email: string } | null>(null);
  const [activeRegisterEvent, setActiveRegisterEvent] = useState<Event | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);

  const fetchEventsData = async (cat = activeCategory, search = searchQuery) => {
    try {
      const url = new URL("/api/events", window.location.origin);
      if (cat !== "All") url.searchParams.set("category", cat);
      if (search) url.searchParams.set("search", search);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.events) {
        setEvents(data.events);
      }

      // Sync active registrations for the current student
      const resProfile = await fetch("/api/profile");
      const dataProfile = await resProfile.json();
      if (dataProfile.user) {
        setStudentProfile({ name: dataProfile.user.name, email: dataProfile.user.email });
        if (dataProfile.user.registrations) {
          setRegisteredEventIds(dataProfile.user.registrations.map((r: any) => r.eventId));
        }
      }
    } catch (err) {
      console.error("Error loading events", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsData(activeCategory, searchQuery);
  }, [activeCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEventsData(activeCategory, searchQuery);
  };

  const handleRegisterSubmit = async (formData: {
    name: string;
    email: string;
    mobile: string;
    place: string;
    year: string;
    field: string;
    transactionId?: string;
  }) => {
    if (!activeRegisterEvent) return;
    setRegisterLoading(true);
    try {
      const res = await fetch(`/api/events/${activeRegisterEvent.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setToast({ message: "Successfully registered for this event!", type: "success" });
        setRegisteredEventIds((prev) => [...prev, activeRegisterEvent.id]);
        fetchEventsData(); // Refresh capacities
        setActiveRegisterEvent(null); // Close registration form

        setActiveTicket({
          open: true,
          studentName: data.registration.name || formData.name,
          email: data.registration.email || formData.email,
          mobile: data.registration.mobile || formData.mobile,
          place: data.registration.place || formData.place,
          year: data.registration.year || formData.year,
          field: data.registration.field || formData.field,
          eventTitle: activeRegisterEvent.title,
          category: activeRegisterEvent.category,
          date: activeRegisterEvent.date,
          time: activeRegisterEvent.time,
          location: activeRegisterEvent.location,
          venue: activeRegisterEvent.venue,
          qrCode: data.registration.qrCodeString,
          attended: false,
          transactionId: data.registration.transactionId,
          amount: activeRegisterEvent.amount,
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

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Innovation":
        return "var(--secondary)";
      case "Cultural":
        return "var(--tertiary)";
      case "Career":
        return "var(--primary)";
      case "Workshop":
        return "var(--primary)";
      case "Sports":
        return "var(--secondary)";
      default:
        return "var(--primary)";
    }
  };

  return (
    <DashboardLayout title="Event Discovery">
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

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>Discover Events</h2>
        <p style={{ color: "var(--on-surface-variant)", fontSize: "15px" }}>
          Find your next campus experience — from hackathons to cultural fests.
        </p>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="glass-card"
        style={{
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "32px",
          display: "flex",
          gap: "16px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "var(--surface-container-low)",
            borderRadius: "12px",
            padding: "10px 16px",
            border: "1px solid var(--outline-variant)",
          }}
        >
          <span className="material-symbols-outlined" style={{ color: "var(--on-surface-variant)", fontSize: "20px" }}>
            search
          </span>
          <input
            type="text"
            placeholder="Search events by name, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: "transparent", border: "none", outline: "none", flex: 1, fontSize: "14px" }}
          />
        </div>
        <button type="submit" className="btn-primary" style={{ padding: "12px 24px", borderRadius: "12px" }}>
          Search
        </button>
      </form>

      {/* Category Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "32px", flexWrap: "wrap" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: "8px 20px",
              borderRadius: "9999px",
              border: "1px solid",
              borderColor: activeCategory === cat ? "var(--primary)" : "var(--outline-variant)",
              background: activeCategory === cat ? "var(--primary)" : "transparent",
              color: activeCategory === cat ? "white" : "var(--on-surface-variant)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
          <div className="spinner"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="glass-tile" style={{ padding: "40px", textAlign: "center", color: "var(--on-surface-variant)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "48px" }}>
            event_busy
          </span>
          <p style={{ marginTop: "12px", fontWeight: 600 }}>No events found matching your selection.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {events.map((event) => {
            const isRegistered = registeredEventIds.includes(event.id);
            const attendeesCount = event.registrations.length;
            const capPercent = Math.round((attendeesCount / event.maxAttendees) * 100);
            const isFull = attendeesCount >= event.maxAttendees;

            return (
              <div
                key={event.id}
                className="glass-card event-card hover-lift"
                style={{ borderRadius: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
              >
                <div>
                  <div style={{ position: "relative", height: "180px", overflow: "hidden", borderRadius: "24px 24px 0 0" }}>
                    <img src={event.imageUrl} alt={event.title} className="event-card-img" />
                    <div style={{ position: "absolute", top: "16px", left: "16px" }}>
                      <span className="chip" style={{ background: getCategoryColor(event.category), color: "white" }}>
                        {event.category}
                      </span>
                    </div>
                    <div style={{ position: "absolute", bottom: "16px", right: "16px", display: "flex", gap: "6px" }}>
                      <span
                        className="chip"
                        style={{
                          background: event.isFree ? "rgba(0,108,73,0.95)" : "rgba(106,30,219,0.95)",
                          color: "white",
                          backdropFilter: "blur(8px)",
                          fontWeight: 700,
                          fontSize: "12px",
                          padding: "4px 10px",
                          borderRadius: "9999px",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                        }}
                      >
                        {event.isFree ? "Free" : `₹${event.amount}`}
                      </span>
                    </div>
                    {isRegistered && (
                      <div style={{ position: "absolute", top: "16px", right: "16px" }}>
                        <span
                          className="chip"
                          style={{
                            background: "rgba(0,108,73,0.95)",
                            color: "white",
                            backdropFilter: "blur(8px)",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>
                            check
                          </span>
                          Registered
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: 700, lineHeight: 1.3 }}>{event.title}</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {[
                        { icon: "calendar_month", text: event.date },
                        { icon: "location_on", text: event.location },
                      ].map((info) => (
                        <div
                          key={info.icon}
                          style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--on-surface-variant)" }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "14px", color: getCategoryColor(event.category) }}
                          >
                            {info.icon}
                          </span>
                          {info.text}
                        </div>
                      ))}
                    </div>
                    {/* Capacity Bar */}
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "11px",
                          color: "var(--on-surface-variant)",
                          marginBottom: "6px",
                        }}
                      >
                        <span>Capacity</span>
                        <span style={{ fontWeight: 600 }}>
                          {attendeesCount}/{event.maxAttendees}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${capPercent}%`,
                            background: isFull ? "linear-gradient(90deg, var(--error), #ff6b6b)" : undefined,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "0 20px 20px", display: "flex", gap: "10px" }}>
                  <Link href={`/events/${event.id}`} style={{ flex: 1 }}>
                    <button
                      className="btn-ghost"
                      style={{ width: "100%", justifyContent: "center", borderRadius: "12px", padding: "10px" }}
                    >
                      Details
                    </button>
                  </Link>
                  {isRegistered ? (
                    <button
                      onClick={async () => {
                        const resProfile = await fetch("/api/profile");
                        const dataProfile = await resProfile.json();
                        const studentName = dataProfile.user?.name || "Student";
                        const userReg = dataProfile.user?.registrations?.find((r: any) => r.eventId === event.id);
                        if (userReg) {
                          setActiveTicket({
                            open: true,
                            studentName: userReg.name || studentName,
                            email: userReg.email,
                            mobile: userReg.mobile,
                            place: userReg.place,
                            year: userReg.year,
                            field: userReg.field,
                            eventTitle: event.title,
                            category: event.category,
                            date: event.date,
                            time: event.time,
                            location: event.location,
                            venue: event.venue,
                            qrCode: userReg.qrCodeString,
                            attended: !!userReg.attendedAt,
                            transactionId: userReg.transactionId,
                            amount: event.amount,
                          });
                        }
                      }}
                      className="btn-secondary"
                      style={{ borderRadius: "12px", padding: "10px 20px" }}
                    >
                      View Ticket
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveRegisterEvent(event)}
                      className="btn-primary"
                      disabled={isFull}
                      style={{ borderRadius: "12px", padding: "10px 20px" }}
                    >
                      {isFull ? "Full" : "Register"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Registration Modal */}
      {activeRegisterEvent && (
        <RegisterModal
          open={!!activeRegisterEvent}
          onClose={() => setActiveRegisterEvent(null)}
          onSubmit={handleRegisterSubmit}
          initialName={studentProfile?.name || ""}
          initialEmail={studentProfile?.email || ""}
          eventTitle={activeRegisterEvent.title}
          eventAmount={activeRegisterEvent.amount}
          eventIsFree={activeRegisterEvent.isFree}
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
