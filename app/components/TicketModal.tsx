"use client";

interface TicketModalProps {
  open: boolean;
  onClose: () => void;
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
  onSimulateScan?: () => void;
}

export default function TicketModal({
  open,
  onClose,
  studentName,
  email,
  mobile,
  place,
  year,
  field,
  eventTitle,
  category,
  date,
  time,
  location,
  venue,
  qrCode,
  attended,
  transactionId,
  amount,
  onSimulateScan,
}: TicketModalProps) {
  if (!open) return null;

  const isFree = !transactionId && (!amount || amount === 0);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Innovation": return "var(--secondary)";
      case "Cultural": return "var(--tertiary)";
      case "Career":
      case "Workshop": return "var(--primary)";
      case "Sports": return "#0ea5e9";
      default: return "var(--primary)";
    }
  };

  const themeColor = getCategoryColor(category);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1100,
      backdropFilter: "blur(6px)",
      animation: "fadeIn 0.2s ease-out",
    }}>
      <div className="glass-tile" style={{
        width: "100%",
        maxWidth: "440px",
        padding: "0",
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        border: "1px solid rgba(255,255,255,0.7)",
        animation: "modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        position: "relative",
        maxHeight: "90vh",
        overflowY: "auto",
      }}>
        {/* Header Ribbon */}
        <div style={{
          background: `linear-gradient(135deg, ${themeColor} 0%, var(--primary) 100%)`,
          height: "12px",
          width: "100%",
          flexShrink: 0,
        }} />

        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "24px",
            right: "24px",
            background: "rgba(0,0,0,0.05)",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--on-surface-variant)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.05)")}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
        </button>

        {/* Ticket Content */}
        <div style={{ padding: "32px" }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <span style={{
              background: `${themeColor}15`,
              color: themeColor,
              padding: "4px 12px",
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              {category}
            </span>
            <h3 style={{ fontSize: "20px", fontWeight: 800, marginTop: "12px", color: "var(--on-surface)", lineHeight: 1.3 }}>
              {eventTitle}
            </h3>
            <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginTop: "4px" }}>
              CampusConnect Verified Registration Slip
            </p>
          </div>

          {/* Ticket Body */}
          <div style={{
            background: "rgba(255,255,255,0.4)",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.6)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: "20px",
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <span style={{ fontSize: "10px", color: "var(--outline)", textTransform: "uppercase", fontWeight: 700 }}>Attendee</span>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--on-surface)" }}>{studentName}</p>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "var(--outline)", textTransform: "uppercase", fontWeight: 700 }}>Pass Status</span>
                <p style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: attended ? "var(--secondary)" : "var(--primary)",
                }}>
                  {attended ? "Checked In" : "Registered"}
                </p>
              </div>
            </div>

            <div style={{ height: "1px", background: "rgba(0,0,0,0.06)" }} />

            {email && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "1fr", gap: "12px" }}>
                  <div>
                    <span style={{ fontSize: "10px", color: "var(--outline)", textTransform: "uppercase", fontWeight: 700 }}>Email</span>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--on-surface-variant)", wordBreak: "break-all" }}>{email}</p>
                  </div>
                  {mobile && (
                    <div>
                      <span style={{ fontSize: "10px", color: "var(--outline)", textTransform: "uppercase", fontWeight: 700 }}>Mobile</span>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--on-surface-variant)" }}>{mobile}</p>
                    </div>
                  )}
                </div>
                <div style={{ height: "1px", background: "rgba(0,0,0,0.06)" }} />
              </>
            )}

            {(place || field || year) && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {place && (
                    <div>
                      <span style={{ fontSize: "10px", color: "var(--outline)", textTransform: "uppercase", fontWeight: 700 }}>Place</span>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--on-surface-variant)" }}>{place}</p>
                    </div>
                  )}
                  {(field || year) && (
                    <div>
                      <span style={{ fontSize: "10px", color: "var(--outline)", textTransform: "uppercase", fontWeight: 700 }}>Course / Year</span>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--on-surface-variant)" }}>
                        {[field, year].filter(Boolean).join(" - Year ")}
                      </p>
                    </div>
                  )}
                </div>
                <div style={{ height: "1px", background: "rgba(0,0,0,0.06)" }} />
              </>
            )}

            <div style={{ display: "grid", gridTemplateColumns: venue ? "1fr 1fr" : "1fr", gap: "12px" }}>
              <div>
                <span style={{ fontSize: "10px", color: "var(--outline)", textTransform: "uppercase", fontWeight: 700 }}>Location</span>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--on-surface-variant)" }}>{location}</p>
              </div>
              {venue && (
                <div>
                  <span style={{ fontSize: "10px", color: "var(--outline)", textTransform: "uppercase", fontWeight: 700 }}>Venue</span>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--on-surface-variant)" }}>{venue}</p>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <span style={{ fontSize: "10px", color: "var(--outline)", textTransform: "uppercase", fontWeight: 700 }}>Date</span>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--on-surface-variant)" }}>{date}</p>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "var(--outline)", textTransform: "uppercase", fontWeight: 700 }}>Time</span>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--on-surface-variant)" }}>{time}</p>
              </div>
            </div>

            {/* Payment Info Row */}
            <div style={{ height: "1px", background: "rgba(0,0,0,0.06)" }} />
            <div style={{ display: "grid", gridTemplateColumns: transactionId ? "1fr 1fr" : "1fr", gap: "12px" }}>
              <div>
                <span style={{ fontSize: "10px", color: "var(--outline)", textTransform: "uppercase", fontWeight: 700 }}>Amount Paid</span>
                <p style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: isFree ? "var(--secondary)" : "var(--tertiary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  marginTop: "2px",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>
                    {isFree ? "check_circle" : "paid"}
                  </span>
                  {isFree ? "Free" : `₹${amount}`}
                </p>
              </div>
              {transactionId && (
                <div>
                  <span style={{ fontSize: "10px", color: "var(--outline)", textTransform: "uppercase", fontWeight: 700 }}>UPI Ref / UTR</span>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--on-surface)", fontFamily: "monospace", letterSpacing: "0.03em", marginTop: "2px", wordBreak: "break-all" }}>
                    {transactionId}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dashed Ticket Divider */}
          <div style={{ display: "flex", alignItems: "center", margin: "24px 0", position: "relative" }}>
            <div style={{ position: "absolute", left: "-44px", width: "24px", height: "24px", borderRadius: "50%", background: "var(--surface)", borderRight: "1px solid rgba(0,0,0,0.1)", zIndex: 1 }} />
            <div style={{ flex: 1, borderTop: "2px dashed var(--outline-variant)" }} />
            <div style={{ position: "absolute", right: "-44px", width: "24px", height: "24px", borderRadius: "50%", background: "var(--surface)", borderLeft: "1px solid rgba(0,0,0,0.1)", zIndex: 1 }} />
          </div>

          {/* QR Code Container */}
          <div style={{ textAlign: "center" }}>
            <div style={{
              background: "white",
              padding: "16px",
              borderRadius: "16px",
              display: "inline-block",
              border: "1px solid var(--outline-variant)",
              boxShadow: "0 8px 16px rgba(0,0,0,0.03)",
              marginBottom: "16px",
            }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "128px", color: "black" }}>qr_code_2</span>
                <span style={{ fontSize: "10px", color: "var(--outline)", fontFamily: "monospace", letterSpacing: "1px" }}>
                  {qrCode}
                </span>
              </div>
            </div>

            {attended ? (
              <div style={{
                color: "var(--secondary)",
                fontWeight: 700,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                background: "rgba(108,248,187,0.15)",
                padding: "10px",
                borderRadius: "10px",
              }}>
                <span className="material-symbols-outlined">verified</span>
                Verified Checked-In (+50 pts)
              </div>
            ) : (
              <div>
                {onSimulateScan && (
                  <button
                    onClick={onSimulateScan}
                    className="btn-primary"
                    style={{ width: "100%", justifyContent: "center", padding: "12px", borderRadius: "10px", fontWeight: 700 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>sensor_occupied</span>
                    Simulate Quick Scan
                  </button>
                )}
                <p style={{ fontSize: "11px", color: "var(--on-surface-variant)", marginTop: "8px" }}>
                  Present this QR code to the college registrar table to check in.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
