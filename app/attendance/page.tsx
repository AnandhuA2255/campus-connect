"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import TicketModal from "../components/TicketModal";
import CertificateModal from "../components/CertificateModal";
import jsPDF from "jspdf";

interface Certificate {
  id: string;
  title: string;
  description?: string;
  issuer?: string;
  issueDate?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  department: string | null;
  certificates?: Certificate[];
}

interface Event {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  venue?: string;
  amount?: number;
  isFree?: boolean;
}

interface Registration {
  id: string;
  userId: string;
  eventId: string;
  registeredAt: string;
  attendedAt: string | null;
  courseCompleted: boolean;
  qrCodeString: string;
  name?: string;
  email?: string;
  mobile?: string;
  place?: string;
  year?: string;
  field?: string;
  transactionId?: string | null;
  user: User;
  event: Event;
}

export default function AttendancePortal() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // QR Input Check-in
  const [inputQrString, setInputQrString] = useState("");
  const [inputEventId, setInputEventId] = useState("");
  const [checkInLoading, setCheckInLoading] = useState(false);

  // Active Slip Preview
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

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Certificate preview modal state
  const [certPreview, setCertPreview] = useState<{
    open: boolean;
    studentName: string;
    eventTitle: string;
    category: string;
    date: string;
    location: string;
    issueDate: string;
    registrationId: string;
  } | null>(null);

  // Support Chat States
  const [threads, setThreads] = useState<any[]>([]);
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [adminChatInput, setAdminChatInput] = useState("");
  const [activeChatUser, setActiveChatUser] = useState<any | null>(null);
  const adminMessagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchThreads = async () => {
    try {
      const res = await fetch("/api/support?threads=true");
      const data = await res.json();
      if (data.threads) {
        setThreads(data.threads);
      }
    } catch (err) {
      console.error("Error fetching chat threads", err);
    }
  };

  const fetchChatMessages = async (userId: string) => {
    try {
      const res = await fetch(`/api/support?userId=${userId}`);
      const data = await res.json();
      if (data.messages) {
        setChatMessages(data.messages);
      }
    } catch (err) {
      console.error("Error fetching chat messages", err);
    }
  };

  // Poll support threads
  useEffect(() => {
    fetchThreads();
    const interval = setInterval(fetchThreads, 2000);
    return () => clearInterval(interval);
  }, []);

  // Poll chat messages for active chat user
  useEffect(() => {
    if (!activeChatUserId) return;
    fetchChatMessages(activeChatUserId);
    const interval = setInterval(() => fetchChatMessages(activeChatUserId), 2000);
    return () => clearInterval(interval);
  }, [activeChatUserId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (activeChatUserId) {
      adminMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeChatUserId]);

  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminChatInput.trim() || !activeChatUserId) return;

    const text = adminChatInput.trim();
    setAdminChatInput("");

    // Optimistic UI update
    const tempMsg = {
      id: Math.random().toString(),
      userId: activeChatUserId,
      sender: "COLLEGE",
      text,
      createdAt: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, tempMsg]);

    try {
      await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: activeChatUserId,
          text,
          sender: "COLLEGE",
        }),
      });
      fetchChatMessages(activeChatUserId);
      fetchThreads(); // Refresh thread last message
    } catch (err) {
      console.error("Error sending college reply", err);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const url = new URL("/api/registrations", window.location.origin);
      if (selectedEventId !== "All") {
        url.searchParams.set("eventId", selectedEventId);
      }
      if (searchQuery) {
        url.searchParams.set("search", searchQuery);
      }

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.registrations) {
        setRegistrations(data.registrations);
      }
    } catch (err) {
      console.error("Error loading registrations", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.events) {
        setEvents(data.events);
        if (data.events.length > 0) {
          setInputEventId(data.events[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading events", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [selectedEventId, searchQuery]);

  const handleApproveAttendance = async (eventId: string, qrCode: string) => {
    if (!eventId || !qrCode) {
      setToast({ message: "Event ID and QR Code are required.", type: "error" });
      return;
    }

    setCheckInLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCodeString: qrCode }),
      });
      const data = await res.json();

      if (res.ok) {
        setToast({
          message: `Attendance Approved! Student awarded +50 points.${
            data.badgeUnlocked ? ` Badge Unlocked: ${data.badgeUnlocked.name}!` : ""
          }`,
          type: "success",
        });
        setInputQrString(""); // Clear input if verified from scanner box
        fetchRegistrations(); // Refresh list
      } else {
        setToast({ message: data.error || "Check-in failed", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Network error during check-in approval", type: "error" });
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleUpdateRegistration = async (id: string, action: "complete" | "certificate", reg?: Registration) => {
    try {
      const res = await fetch(`/api/registrations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (res.ok) {
        setToast({
          message: action === "complete"
            ? "Course Completion Approved!"
            : "Certificate Generated! Student awarded +100 points.",
          type: "success",
        });
        fetchRegistrations();

        // Open certificate preview immediately after generating
        if (action === "certificate" && reg) {
          setCertPreview({
            open: true,
            studentName: reg.user.name,
            eventTitle: reg.event.title,
            category: reg.event.category,
            date: reg.event.date,
            location: reg.event.location,
            issueDate: new Date().toISOString(),
            registrationId: id,
          });
        }
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

  // ---------- Export Helpers ----------
  const [exportLoading, setExportLoading] = useState<"csv" | "pdf" | null>(null);

  const getExportLabel = () => {
    if (selectedEventId === "All") return "All Events";
    return events.find(e => e.id === selectedEventId)?.title || "Selected Event";
  };

  const getStatusLabel = (reg: Registration) => {
    const hasCert = reg.user.certificates?.some(
      (c: any) => c.title === `Course Completion: ${reg.event.title}`
    );
    if (!reg.attendedAt) return "Pending Check-in";
    if (!reg.courseCompleted) return "Checked In";
    if (!hasCert) return "Course Completed";
    return "Certified";
  };

  const exportCSV = () => {
    if (registrations.length === 0) {
      setToast({ message: "No registrations to export", type: "error" });
      return;
    }
    setExportLoading("csv");
    try {
      const headers = [
        "#", "Student Name", "Email", "Mobile", "Place", "Year",
        "Field / Programme", "Event", "Event Date", "Location",
        "Venue", "Registered At", "Status", "Transaction ID",
      ];
      const rows = registrations.map((reg, i) => [
        i + 1,
        `"${(reg.name || reg.user.name).replace(/"/g, '""')}"`,
        `"${(reg.email || reg.user.email).replace(/"/g, '""')}"`,
        `"${reg.mobile || ""}"`,
        `"${reg.place || ""}"`,
        `"${reg.year || ""}"`,
        `"${reg.field || ""}"`,
        `"${reg.event.title.replace(/"/g, '""')}"`,
        `"${reg.event.date}"`,
        `"${reg.event.location.replace(/"/g, '""')}"`,
        `"${(reg.event.venue || "").replace(/"/g, '""')}"`,
        `"${new Date(reg.registeredAt).toLocaleString()}"`,
        `"${getStatusLabel(reg)}"`,
        `"${reg.transactionId || "None"}"`,
      ]);
      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const filename = `CampusConnect_Registrations_${getExportLabel().replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;

      // Use Blob URL — Chrome can open blob: URLs directly from download bar (data: URIs are blocked)
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Revoke after a short delay so the download can complete
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

      setToast({ message: `✅ CSV saved as "${filename}" — check Downloads folder`, type: "success" });
    } catch (err) {
      console.error("CSV export error:", err);
      setToast({ message: "CSV export failed", type: "error" });
    } finally {
      setExportLoading(null);
    }
  };

  const exportPDF = () => {
    if (registrations.length === 0) {
      setToast({ message: "No registrations to export", type: "error" });
      return;
    }
    setExportLoading("pdf");
    // Use setTimeout so loading state renders before heavy PDF work
    setTimeout(() => {
      try {
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        const eventLabel = getExportLabel();
        const exportDate = new Date().toLocaleString();
        const pageW = doc.internal.pageSize.getWidth();

        // Header Bar
        doc.setFillColor(0, 74, 198);
        doc.rect(0, 0, pageW, 20, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text("CampusConnect \u2014 Student Registration Report", 10, 13);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Exported: ${exportDate}`, pageW - 10, 13, { align: "right" });

        // Subtitle
        doc.setTextColor(50, 50, 80);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`Event: ${eventLabel}   |   Total: ${registrations.length} student(s)`, 10, 28);

        // Table setup
        const colWidths = [6, 34, 44, 22, 18, 14, 22, 24, 20, 20, 32];
        const colKeys = ["#", "Name", "Email", "Mobile", "Place", "Year", "Field", "Event", "Reg. Date", "Status", "Transaction ID"];
        const rowH = 8;
        let x = 10;
        let y = 34;

        // Table header
        doc.setFillColor(230, 236, 255);
        doc.rect(10, y, colWidths.reduce((a, b) => a + b, 0), rowH, "F");
        doc.setTextColor(0, 74, 198);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        colKeys.forEach((key, ci) => { doc.text(key, x + 2, y + 5.5); x += colWidths[ci]; });

        // Data rows
        registrations.forEach((reg, ri) => {
          y += rowH;
          x = 10;
          if (y > doc.internal.pageSize.getHeight() - 15) {
            doc.addPage();
            y = 15;
            doc.setFillColor(230, 236, 255);
            doc.rect(10, y, colWidths.reduce((a, b) => a + b, 0), rowH, "F");
            doc.setTextColor(0, 74, 198);
            doc.setFontSize(7.5);
            doc.setFont("helvetica", "bold");
            let hx = 10;
            colKeys.forEach((key, ci) => { doc.text(key, hx + 2, y + 5.5); hx += colWidths[ci]; });
            y += rowH;
          }
          if (ri % 2 === 0) {
            doc.setFillColor(248, 249, 255);
            doc.rect(10, y, colWidths.reduce((a, b) => a + b, 0), rowH, "F");
          }
          const cells = [
            String(ri + 1),
            (reg.name || reg.user.name).substring(0, 20),
            (reg.email || reg.user.email).substring(0, 26),
            (reg.mobile || "").substring(0, 12),
            (reg.place || "").substring(0, 10),
            (reg.year || "").substring(0, 8),
            (reg.field || "").substring(0, 12),
            reg.event.title.substring(0, 14),
            new Date(reg.registeredAt).toLocaleDateString(),
            getStatusLabel(reg).substring(0, 14),
            (reg.transactionId || "None").substring(0, 18),
          ];
          doc.setTextColor(30, 30, 50);
          doc.setFontSize(7);
          doc.setFont("helvetica", "normal");
          cells.forEach((cell, ci) => { doc.text(String(cell), x + 2, y + 5.5); x += colWidths[ci]; });
          doc.setDrawColor(220, 225, 240);
          doc.line(10, y + rowH, 10 + colWidths.reduce((a, b) => a + b, 0), y + rowH);
        });

        // Footer on every page
        const totalPages = (doc as any).internal.getNumberOfPages();
        for (let p = 1; p <= totalPages; p++) {
          doc.setPage(p);
          doc.setFontSize(7);
          doc.setTextColor(150);
          doc.text(
            `Page ${p} of ${totalPages}  |  CampusConnect Academic Platform`,
            pageW / 2, doc.internal.pageSize.getHeight() - 5, { align: "center" }
          );
        }

        const filename = `CampusConnect_Registrations_${eventLabel.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

        // Use Blob URL so Chrome can open the PDF directly from the download bar
        const pdfBlob = doc.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const pdfLink = document.createElement("a");
        pdfLink.href = pdfUrl;
        pdfLink.download = filename;
        document.body.appendChild(pdfLink);
        pdfLink.click();
        document.body.removeChild(pdfLink);
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);

        setToast({ message: `✅ PDF saved as "${filename}" — check Downloads folder`, type: "success" });
      } catch (err) {
        console.error("PDF export error:", err);
        setToast({ message: "PDF export failed", type: "error" });
      } finally {
        setExportLoading(null);
      }
    }, 100);
  };




  return (
    <DashboardLayout title="Attendance Approval Portal">
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
            zIndex: 1200,
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

      {/* Page Header */}
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>Attendance &amp; QR Registry</h2>
          <p style={{ color: "var(--on-surface-variant)", fontSize: "15px" }}>
            Scan student ticket QR codes, manage registrations, and approve check-ins on behalf of the college.
          </p>
        </div>
      </div>

      {/* Export Panel */}
      <div className="glass-tile" style={{
        padding: "20px 28px",
        marginBottom: "28px",
        display: "flex",
        alignItems: "center",
        gap: "20px",
        flexWrap: "wrap",
        background: "linear-gradient(135deg, rgba(0,74,198,0.04) 0%, rgba(106,30,219,0.04) 100%)",
        border: "1px solid rgba(0,74,198,0.15)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "12px",
            background: "linear-gradient(135deg, var(--primary), var(--tertiary))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span className="material-symbols-outlined" style={{ color: "white", fontSize: "20px" }}>upload_file</span>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: "14px", margin: 0 }}>Export Registrations</p>
            <p style={{ fontSize: "11px", color: "var(--on-surface-variant)", margin: 0 }}>
              {registrations.length} student{registrations.length !== 1 ? "s" : ""} — {getExportLabel()}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--on-surface-variant)" }}>Filter by event before exporting →</span>
          <select
            value={selectedEventId}
            onChange={e => setSelectedEventId(e.target.value)}
            style={{
              height: "36px", borderRadius: "10px", border: "1px solid var(--outline-variant)",
              padding: "0 12px", fontSize: "12px", outline: "none",
              background: "var(--surface-container-low)", color: "var(--on-surface)", fontWeight: 600,
            }}
          >
            <option value="All">All Events</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>

          {/* CSV Export Button */}
          <button
            id="export-csv-btn"
            onClick={exportCSV}
            disabled={exportLoading !== null || registrations.length === 0}
            style={{
              height: "36px", padding: "0 18px", borderRadius: "10px",
              border: "1.5px solid rgba(0,108,73,0.4)",
              background: exportLoading === "csv" ? "rgba(0,108,73,0.1)" : "rgba(0,108,73,0.06)",
              color: "var(--secondary)", fontWeight: 700, fontSize: "12px",
              cursor: registrations.length === 0 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "6px",
              transition: "all 0.2s ease", opacity: registrations.length === 0 ? 0.5 : 1,
            }}
          >
            {exportLoading === "csv" ? (
              <><div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid var(--secondary)", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />Exporting...</>
            ) : (
              <><span className="material-symbols-outlined" style={{ fontSize: "16px" }}>csv</span>Export CSV</>
            )}
          </button>

          {/* PDF Export Button */}
          <button
            id="export-pdf-btn"
            onClick={exportPDF}
            disabled={exportLoading !== null || registrations.length === 0}
            style={{
              height: "36px", padding: "0 18px", borderRadius: "10px",
              border: "none",
              background: exportLoading === "pdf"
                ? "rgba(0,74,198,0.6)"
                : "linear-gradient(135deg, var(--primary) 0%, var(--tertiary) 100%)",
              color: "white", fontWeight: 700, fontSize: "12px",
              cursor: registrations.length === 0 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "6px",
              boxShadow: "0 4px 14px rgba(0,74,198,0.25)",
              transition: "all 0.2s ease", opacity: registrations.length === 0 ? 0.5 : 1,
            }}
          >
            {exportLoading === "pdf" ? (
              <><div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.5)", borderTopColor: "white", animation: "spin 0.7s linear infinite" }} />Generating...</>
            ) : (
              <><span className="material-symbols-outlined" style={{ fontSize: "16px" }}>picture_as_pdf</span>Export PDF</>
            )}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "32px", alignItems: "start" }}>
        
        {/* Left Side: QR Scanner Simulator Panel */}
        <div className="glass-tile" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--on-surface)", display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>qr_code_scanner</span>
            QR Scanner Simulator
          </h3>
          <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", lineHeight: 1.5 }}>
            Simulate a physical scanner tap by selecting the event, pasting the student's unique QR Token, and clicking approve.
          </p>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--on-surface-variant)", marginBottom: "6px" }}>Select Event</label>
            <select
              value={inputEventId}
              onChange={(e) => setInputEventId(e.target.value)}
              style={{ width: "100%", height: "44px", borderRadius: "10px", border: "1px solid var(--outline-variant)", padding: "0 8px", fontSize: "13px", outline: "none", backgroundColor: "white" }}
            >
              {events.length === 0 ? (
                <option value="">No events available...</option>
              ) : (
                events.map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))
              )}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--on-surface-variant)", marginBottom: "6px" }}>Student QR Token String</label>
            <input
              type="text"
              placeholder="e.g. qr_token_student-uuid_event-uuid..."
              value={inputQrString}
              onChange={(e) => setInputQrString(e.target.value)}
              style={{ width: "100%", height: "44px", borderRadius: "10px", border: "1px solid var(--outline-variant)", padding: "0 12px", fontSize: "13px", outline: "none" }}
            />
          </div>

          <button
            onClick={() => handleApproveAttendance(inputEventId, inputQrString)}
            disabled={checkInLoading || !inputQrString.trim()}
            className="btn-primary"
            style={{ width: "100%", height: "44px", justifyContent: "center", borderRadius: "12px", fontWeight: 700, cursor: "pointer" }}
          >
            {checkInLoading ? "Verifying Token..." : "Scan & Approve Attendance"}
          </button>
        </div>

        {/* Right Side: Registration & Attendance Log */}
        <div className="glass-tile" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Filters & Search */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--surface-container-low)", borderRadius: "12px", padding: "8px 16px", border: "1px solid var(--outline-variant)", flex: 1, minWidth: "200px" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--on-surface-variant)", fontSize: "20px" }}>search</span>
              <input
                type="text"
                placeholder="Search student name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", flex: 1, fontSize: "13px" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--on-surface-variant)" }}>Event Filter:</span>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                style={{ height: "38px", borderRadius: "10px", border: "1px solid var(--outline-variant)", padding: "0 8px", fontSize: "12px", outline: "none", backgroundColor: "white" }}
              >
                <option value="All">All Events</option>
                {events.map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Directory Registry Table */}
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "20vh" }}>
              <div className="spinner"></div>
            </div>
          ) : registrations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--on-surface-variant)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "40px" }}>how_to_reg</span>
              <p style={{ marginTop: "12px", fontWeight: 600, fontSize: "14px" }}>No student registrations found matching search parameters.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--outline-variant)" }}>
                    <th style={{ padding: "12px", color: "var(--outline)", fontWeight: 700, textTransform: "uppercase", fontSize: "10px" }}>Student</th>
                    <th style={{ padding: "12px", color: "var(--outline)", fontWeight: 700, textTransform: "uppercase", fontSize: "10px" }}>Event</th>
                    <th style={{ padding: "12px", color: "var(--outline)", fontWeight: 700, textTransform: "uppercase", fontSize: "10px" }}>Registered At</th>
                    <th style={{ padding: "12px", color: "var(--outline)", fontWeight: 700, textTransform: "uppercase", fontSize: "10px" }}>Status</th>
                    <th style={{ padding: "12px", color: "var(--outline)", fontWeight: 700, textTransform: "uppercase", fontSize: "10px" }}>Transaction ID</th>
                    <th style={{ padding: "12px", color: "var(--outline)", fontWeight: 700, textTransform: "uppercase", fontSize: "10px", textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map(reg => {
                    const hasCert = reg.user.certificates?.some(
                      (c: any) => c.title === `Course Completion: ${reg.event.title}`
                    );

                    let statusNode = null;
                    if (!reg.attendedAt) {
                      statusNode = (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          color: "var(--primary)", fontWeight: 700, fontSize: "11px",
                          background: "rgba(0,74,198,0.08)", padding: "4px 8px", borderRadius: "9999px"
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>schedule</span>
                          Pending Check-in
                        </span>
                      );
                    } else if (!reg.courseCompleted) {
                      statusNode = (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          color: "var(--secondary)", fontWeight: 700, fontSize: "11px",
                          background: "rgba(108,248,187,0.15)", padding: "4px 8px", borderRadius: "9999px"
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>check_circle</span>
                          Checked In
                        </span>
                      );
                    } else if (!hasCert) {
                      statusNode = (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          color: "#ea580c", fontWeight: 700, fontSize: "11px",
                          background: "rgba(234,88,12,0.1)", padding: "4px 8px", borderRadius: "9999px"
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>done_all</span>
                          Course Completed
                        </span>
                      );
                    } else {
                      statusNode = (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          color: "var(--tertiary)", fontWeight: 700, fontSize: "11px",
                          background: "rgba(131,67,244,0.1)", padding: "4px 8px", borderRadius: "9999px"
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>workspace_premium</span>
                          Certified
                        </span>
                      );
                    }

                    return (
                      <tr key={reg.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", transition: "background 0.2s" }} className="hover-row">
                        <td style={{ padding: "14px 12px" }}>
                          <p style={{ fontWeight: 700, color: "var(--on-surface)" }}>{reg.user.name}</p>
                          <p style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>{reg.user.email}</p>
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          <p style={{ fontWeight: 600 }}>{reg.event.title}</p>
                          <p style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>{reg.event.location}</p>
                        </td>
                        <td style={{ padding: "14px 12px", color: "var(--on-surface-variant)" }}>
                          {new Date(reg.registeredAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          {statusNode}
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          {reg.transactionId ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <span style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 700, color: "var(--tertiary)" }}>{reg.transactionId}</span>
                              {reg.event.amount ? (
                                <span style={{ fontSize: "10px", color: "var(--secondary)", fontWeight: 600 }}>₹{reg.event.amount} paid</span>
                              ) : null}
                            </div>
                          ) : (
                            <span style={{ fontSize: "12px", color: "var(--on-surface-variant)", fontStyle: "italic" }}>None (Free)</span>
                          )}
                        </td>
                        <td style={{ padding: "14px 12px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            
                            <button
                              onClick={() => setActiveTicket({
                                open: true,
                                studentName: reg.name || reg.user.name,
                                email: reg.email || reg.user.email,
                                mobile: reg.mobile,
                                place: reg.place,
                                year: reg.year,
                                field: reg.field,
                                eventTitle: reg.event.title,
                                category: reg.event.category,
                                date: reg.event.date,
                                time: reg.event.time,
                                location: reg.event.location,
                                venue: reg.event.venue,
                                qrCode: reg.qrCodeString,
                                attended: !!reg.attendedAt,
                                transactionId: reg.transactionId || undefined,
                                amount: reg.event.amount || undefined,
                              })}
                              className="btn-ghost"
                              style={{ padding: "6px 12px", fontSize: "11px", borderRadius: "8px", border: "1px solid var(--outline-variant)", display: "flex", alignItems: "center", gap: "4px" }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>visibility</span>
                              View Slip
                            </button>

                            {!reg.attendedAt && (
                              <button
                                onClick={() => handleApproveAttendance(reg.eventId, reg.qrCodeString)}
                                className="btn-primary"
                                style={{ padding: "6px 12px", fontSize: "11px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "4px" }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>how_to_reg</span>
                                Approve Check-in
                              </button>
                            )}

                            {reg.attendedAt && !reg.courseCompleted && (
                              <button
                                onClick={() => handleUpdateRegistration(reg.id, "complete")}
                                className="btn-secondary"
                                style={{ padding: "6px 12px", fontSize: "11px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "4px" }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>school</span>
                                Complete Course
                              </button>
                            )}

                            {reg.courseCompleted && !hasCert && (
                              <button
                                onClick={() => handleUpdateRegistration(reg.id, "certificate", reg)}
                                className="btn-primary"
                                style={{ padding: "6px 12px", fontSize: "11px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "4px", background: "var(--tertiary)", color: "white", boxShadow: "none" }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>workspace_premium</span>
                                Generate Certificate
                              </button>
                            )}

                            {hasCert && (
                              <button
                                onClick={() => setCertPreview({
                                  open: true,
                                  studentName: reg.user.name,
                                  eventTitle: reg.event.title,
                                  category: reg.event.category,
                                  date: reg.event.date,
                                  location: reg.event.location,
                                  issueDate: reg.user.certificates?.find(
                                    (c: any) => c.title === `Course Completion: ${reg.event.title}`
                                  )?.issueDate || new Date().toISOString(),
                                  registrationId: reg.id,
                                })}
                                className="btn-ghost"
                                style={{ padding: "6px 12px", fontSize: "11px", borderRadius: "8px", border: "1px solid rgba(106,30,219,0.3)", color: "var(--tertiary)", display: "flex", alignItems: "center", gap: "4px", background: "rgba(106,30,219,0.06)" }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>open_in_new</span>
                                View Certificate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Live Support Chat Center */}
      <div style={{ marginTop: "40px" }} id="support-chat-section">
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: "26px" }}>forum</span>
            Live Support Chat Center
          </h2>
          <p style={{ color: "var(--on-surface-variant)", fontSize: "14px" }}>
            Chat with students requesting help in real-time. Select a student thread from the list on the left to start typing.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "32px",
          minHeight: "450px",
          maxHeight: "600px",
          alignItems: "stretch"
        }} className="support-chat-grid-cols">
          {/* Threads List */}
          <div className="glass-tile" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, borderBottom: "1px solid var(--outline-variant)", paddingBottom: "12px", margin: 0 }}>
              Active Student Threads ({threads.length})
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, overflowY: "auto", paddingRight: "4px" }}>
              {threads.length === 0 ? (
                <div style={{ margin: "auto", textAlign: "center", color: "var(--on-surface-variant)", fontSize: "13px", padding: "20px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "var(--outline)", marginBottom: "8px", display: "block" }}>inbox</span>
                  No active support chats.
                </div>
              ) : (
                threads.map((t) => {
                  const isActive = activeChatUserId === t.userId;
                  return (
                    <div
                      key={t.userId}
                      onClick={() => {
                        setActiveChatUserId(t.userId);
                        setActiveChatUser(t);
                      }}
                      className="hover-lift"
                      style={{
                        padding: "14px",
                        borderRadius: "12px",
                        cursor: "pointer",
                        border: isActive ? "2px solid var(--primary)" : "1px solid var(--outline-variant)",
                        backgroundColor: isActive ? "rgba(0, 74, 198, 0.04)" : "rgba(255,255,255,0.4)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                        <span style={{ fontWeight: 700, fontSize: "13.5px", color: isActive ? "var(--primary)" : "var(--on-surface)" }}>
                          {t.userName}
                        </span>
                        <span style={{ fontSize: "9px", color: "var(--on-surface-variant)" }}>
                          {new Date(t.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{
                        fontSize: "12px",
                        color: "var(--on-surface-variant)",
                        margin: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%"
                      }}>
                        {t.lastMessage}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Chat Thread Panel */}
          <div className="glass-tile" style={{ padding: "0", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid var(--outline-variant)", borderRadius: "20px" }}>
            {activeChatUserId && activeChatUser ? (
              <>
                {/* Header */}
                <div style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid var(--outline-variant)",
                  background: "linear-gradient(90deg, rgba(0, 74, 198, 0.05) 0%, rgba(106, 30, 219, 0.05) 100%)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <h4 style={{ margin: "0 0 2px 0", fontSize: "15px", fontWeight: 700 }}>Chatting with {activeChatUser.userName}</h4>
                    <span style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>{activeChatUser.userEmail}</span>
                  </div>
                  <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>chat_bubble</span>
                </div>

                {/* Messages Feed */}
                <div style={{
                  flex: 1,
                  padding: "24px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  backgroundColor: "rgba(250,251,254,0.3)"
                }}>
                  {chatMessages.length === 0 ? (
                    <div style={{ margin: "auto", color: "var(--on-surface-variant)", fontSize: "13px" }}>
                      Loading conversation...
                    </div>
                  ) : (
                    chatMessages.map((msg: any) => {
                      const isStudent = msg.sender === "STUDENT";
                      return (
                        <div key={msg.id} style={{
                          alignSelf: isStudent ? "flex-start" : "flex-end",
                          maxWidth: "70%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: isStudent ? "flex-start" : "flex-end",
                        }}>
                          <div style={{
                            backgroundColor: isStudent ? "var(--surface-container-highest)" : "var(--primary)",
                            color: isStudent ? "var(--on-surface)" : "white",
                            padding: "12px 16px",
                            borderRadius: isStudent ? "16px 16px 16px 2px" : "16px 16px 2px 16px",
                            fontSize: "13.5px",
                            lineHeight: 1.4,
                            boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                          }}>
                            {msg.text}
                          </div>
                          <span style={{ fontSize: "9px", color: "var(--on-surface-variant)", marginTop: "4px", padding: "0 4px" }}>
                            {isStudent ? "Student" : "College Admin"} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={adminMessagesEndRef} />
                </div>

                {/* Input Form */}
                <form onSubmit={handleSendAdminMessage} style={{
                  padding: "16px 24px",
                  borderTop: "1px solid var(--outline-variant)",
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  backgroundColor: "white"
                }}>
                  <input
                    type="text"
                    value={adminChatInput}
                    onChange={(e) => setAdminChatInput(e.target.value)}
                    placeholder={`Type a reply to ${activeChatUser.userName}...`}
                    style={{
                      flex: 1,
                      height: "44px",
                      borderRadius: "22px",
                      border: "1px solid var(--outline-variant)",
                      padding: "0 20px",
                      fontSize: "13.5px",
                      outline: "none",
                      background: "var(--surface)",
                      color: "var(--on-surface)",
                    }}
                  />
                  <button type="submit" style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    backgroundColor: "var(--primary)",
                    border: "none",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(37,99,235,0.2)"
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>send</span>
                  </button>
                </form>
              </>
            ) : (
              <div style={{ margin: "auto", textAlign: "center", color: "var(--on-surface-variant)", fontSize: "14px", padding: "40px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--primary)", marginBottom: "12px", display: "block" }}>forum</span>
                <h4>Select a Conversation</h4>
                <p style={{ maxWidth: "320px", margin: "8px auto 0", fontSize: "13px" }}>
                  Select a student from the active list to view the chat history and send a reply.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Slip Preview Modal */}
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
        />
      )}

      {/* Certificate Preview Modal */}
      {certPreview && (
        <CertificateModal
          open={certPreview.open}
          onClose={() => setCertPreview(null)}
          studentName={certPreview.studentName}
          eventTitle={certPreview.eventTitle}
          category={certPreview.category}
          date={certPreview.date}
          location={certPreview.location}
          issuer="CampusConnect Academic Board"
          issueDate={certPreview.issueDate}
          certificateId={certPreview.registrationId}
        />
      )}
    </DashboardLayout>
  );
}
