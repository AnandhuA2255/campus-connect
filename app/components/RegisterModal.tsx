"use client";

import { useState, useEffect } from "react";

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    name: string;
    email: string;
    mobile: string;
    place: string;
    year: string;
    field: string;
    transactionId?: string;
  }) => void;
  initialName: string;
  initialEmail: string;
  eventTitle: string;
  eventAmount?: number;
  eventIsFree?: boolean;
  loading?: boolean;
}

export default function RegisterModal({
  open,
  onClose,
  onSubmit,
  initialName,
  initialEmail,
  eventTitle,
  eventAmount = 0,
  eventIsFree = true,
  loading = false,
}: RegisterModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [place, setPlace] = useState("");
  const [year, setYear] = useState("1");
  const [field, setField] = useState("BTech");
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setStep(1);
      setName(initialName);
      setEmail(initialEmail);
      setMobile("");
      setPlace("");
      setYear("1");
      setField("BTech");
      setTransactionId("");
      setError("");
    }
  }, [open, initialName, initialEmail]);

  if (!open) return null;

  const inputStyle = {
    width: "100%",
    height: "42px",
    borderRadius: "10px",
    border: "1px solid var(--outline-variant)",
    padding: "0 12px",
    fontSize: "13px",
    background: "var(--surface)",
    outline: "none",
    color: "var(--on-surface)",
  } as React.CSSProperties;

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    color: "var(--on-surface-variant)",
    marginBottom: "6px",
  } as React.CSSProperties;

  const handleStepOneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    if (!email.trim()) { setError("Email is required"); return; }
    if (!mobile.trim()) { setError("Mobile number is required"); return; }
    if (!place.trim()) { setError("Place is required"); return; }
    setError("");

    if (eventIsFree) {
      // Free event — submit immediately
      onSubmit({ name: name.trim(), email: email.trim(), mobile: mobile.trim(), place: place.trim(), year, field });
    } else {
      // Paid event — advance to payment step
      setStep(2);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      setError("Please enter your UPI Transaction ID / UTR number.");
      return;
    }
    setError("");
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      place: place.trim(),
      year,
      field,
      transactionId: transactionId.trim(),
    });
  };

  // UPI Payment URL for QR code
  const upiUrl = `upi://pay?pa=campusconnect@upi&pn=CampusConnect&am=${eventAmount}&cu=INR&tn=Event+Registration+Fee`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl)}&color=1a1a2e&bgcolor=ffffff&qzone=1&margin=0`;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1200,
      backdropFilter: "blur(6px)",
      animation: "fadeIn 0.2s ease-out",
    }}>
      <div className="glass-tile" style={{
        width: "100%",
        maxWidth: step === 2 ? "480px" : "460px",
        padding: "32px",
        borderRadius: "24px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        border: "1px solid rgba(255,255,255,0.7)",
        animation: "modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        position: "relative",
        maxHeight: "90vh",
        overflowY: "auto",
      }}>
        {/* Header Ribbon */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "8px",
          background: step === 2
            ? "linear-gradient(90deg, #6a1fdb 0%, #ff6b35 100%)"
            : "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)",
          borderRadius: "24px 24px 0 0",
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

        {/* ─── STEP 1: Student Details Form ─── */}
        {step === 1 && (
          <>
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--on-surface)", lineHeight: 1.3 }}>
                  Register for Event
                </h3>
                {!eventIsFree && (
                  <span style={{
                    background: "rgba(106,31,219,0.12)",
                    color: "var(--tertiary)",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}>
                    ₹{eventAmount}
                  </span>
                )}
                {eventIsFree && (
                  <span style={{
                    background: "rgba(0,108,73,0.12)",
                    color: "var(--secondary)",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}>
                    Free
                  </span>
                )}
              </div>
              <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", fontWeight: 500 }}>
                {eventTitle}
              </p>
            </div>

            <form onSubmit={handleStepOneSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Full Name*</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email Address*</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Mobile Number*</label>
                <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="e.g. +91 9876543210" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Place / City*</label>
                <input type="text" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="e.g. Cochin, Kerala" required style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Year of Study*</label>
                  <select value={year} onChange={(e) => setYear(e.target.value)} style={inputStyle}>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="PG">Postgraduate</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Field / Degree*</label>
                  <select value={field} onChange={(e) => setField(e.target.value)} style={inputStyle}>
                    <option value="BTech">BTech</option>
                    <option value="BArch">BArch</option>
                    <option value="MBA">MBA</option>
                    <option value="MTech">MTech</option>
                    <option value="BSc">BSc</option>
                    <option value="MSc">MSc</option>
                    <option value="MCA">MCA</option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {error && <p style={{ color: "var(--error)", fontSize: "12px", fontWeight: 600, marginTop: "4px" }}>{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: "100%",
                  height: "44px",
                  justifyContent: "center",
                  borderRadius: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  marginTop: "12px",
                }}
              >
                {loading ? "Registering..." : eventIsFree ? (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>check_circle</span>
                    Confirm & Register
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>payments</span>
                    Proceed to Payment — ₹{eventAmount}
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* ─── STEP 2: Payment Screen ─── */}
        {step === 2 && (
          <>
            <div style={{ marginBottom: "20px" }}>
              <button
                onClick={() => { setStep(1); setError(""); }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "var(--on-surface-variant)",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "12px",
                  padding: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back</span>
                Back
              </button>
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "var(--on-surface)" }}>Complete Payment</h3>
              <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", fontWeight: 500, marginTop: "4px" }}>
                {eventTitle}
              </p>
            </div>

            {/* Amount Display */}
            <div style={{
              background: "linear-gradient(135deg, rgba(106,31,219,0.08) 0%, rgba(255,107,53,0.08) 100%)",
              border: "1px solid rgba(106,31,219,0.2)",
              borderRadius: "16px",
              padding: "16px 20px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <p style={{ fontSize: "11px", color: "var(--on-surface-variant)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Amount Payable</p>
                <p style={{ fontSize: "28px", fontWeight: 900, color: "var(--tertiary)", lineHeight: 1.2 }}>₹{eventAmount}</p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{
                  padding: "6px 12px",
                  borderRadius: "9999px",
                  background: "rgba(66,133,244,0.12)",
                  color: "#4285F4",
                  fontWeight: 700,
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>payments</span>
                  GPay
                </div>
                <div style={{
                  padding: "6px 12px",
                  borderRadius: "9999px",
                  background: "rgba(0,106,209,0.12)",
                  color: "#006AD1",
                  fontWeight: 700,
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>account_balance_wallet</span>
                  Paytm
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--on-surface-variant)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Scan with GPay / Paytm / PhonePe / Any UPI App
              </p>
              <div style={{
                background: "white",
                borderRadius: "16px",
                padding: "12px",
                display: "inline-block",
                border: "2px solid rgba(106,31,219,0.15)",
                boxShadow: "0 8px 24px rgba(106,31,219,0.12)",
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeUrl}
                  alt="UPI Payment QR Code"
                  width={200}
                  height={200}
                  style={{ display: "block", borderRadius: "8px" }}
                  onError={(e) => {
                    // Fallback if QR API fails
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = "none";
                    (target.nextSibling as HTMLElement).style.display = "flex";
                  }}
                />
                <div style={{
                  display: "none",
                  width: "200px",
                  height: "200px",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  color: "var(--on-surface-variant)",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--outline)" }}>qr_code_2</span>
                  <p style={{ fontSize: "11px", fontWeight: 600 }}>campusconnect@upi</p>
                </div>
              </div>
              <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginTop: "10px", fontWeight: 500 }}>
                UPI ID: <strong style={{ color: "var(--on-surface)" }}>campusconnect@upi</strong>
              </p>
            </div>

            {/* Transaction ID Input */}
            <form onSubmit={handlePaymentSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{
                background: "rgba(255,193,7,0.08)",
                border: "1px solid rgba(255,193,7,0.3)",
                borderRadius: "12px",
                padding: "12px 16px",
                display: "flex",
                gap: "8px",
                alignItems: "flex-start",
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#f59e0b", marginTop: "1px" }}>info</span>
                <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", lineHeight: 1.5 }}>
                  After completing payment, enter the <strong>UTR / Transaction ID</strong> from your UPI app receipt below to confirm your registration.
                </p>
              </div>

              <div>
                <label style={labelStyle}>UPI Transaction ID / UTR Number*</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. 426781239456 or T2506231234567"
                  required
                  style={inputStyle}
                  autoFocus
                />
              </div>

              {error && <p style={{ color: "var(--error)", fontSize: "12px", fontWeight: 600 }}>{error}</p>}

              <button
                type="submit"
                disabled={loading || !transactionId.trim()}
                className="btn-primary"
                style={{
                  width: "100%",
                  height: "46px",
                  justifyContent: "center",
                  borderRadius: "12px",
                  fontWeight: 700,
                  cursor: transactionId.trim() ? "pointer" : "not-allowed",
                  background: transactionId.trim()
                    ? "linear-gradient(135deg, #6a1fdb 0%, #004ac6 100%)"
                    : undefined,
                  marginTop: "4px",
                }}
              >
                {loading ? (
                  <>
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "white", animation: "spin 0.7s linear infinite" }} />
                    Completing Registration...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>verified</span>
                    Complete Registration
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
