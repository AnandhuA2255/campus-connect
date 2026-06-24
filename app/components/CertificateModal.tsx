"use client";

import { useEffect, useRef } from "react";

interface CertificateModalProps {
  open: boolean;
  onClose: () => void;
  studentName: string;
  eventTitle: string;
  category: string;
  date: string;
  location: string;
  issuer: string;
  issueDate: string;
  description?: string;
  certificateId?: string;
  autoDownload?: boolean;
}

export default function CertificateModal({
  open,
  onClose,
  studentName,
  eventTitle,
  category,
  date,
  location,
  issuer,
  issueDate,
  description,
  certificateId,
  autoDownload = false,
}: CertificateModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const formattedIssueDate = new Date(issueDate).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const formattedEventDate = date
    ? new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : date;

  const certIdDisplay = certificateId
    ? `CC-${certificateId.substring(0, 8).toUpperCase()}`
    : `CC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  const handleDownload = async () => {
    if (!printRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 3, // High scale for high quality PDF
        useCORS: true,
        logging: false,
        backgroundColor: null,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = 297;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const yOffset = (210 - pdfHeight) / 2;

      pdf.addImage(imgData, "PNG", 0, yOffset > 0 ? yOffset : 0, pdfWidth, pdfHeight);
      const filename = `Certificate_${studentName.replace(/\s+/g, "_")}_${eventTitle.replace(/\s+/g, "_")}.pdf`;

      // Use Blob URL so Chrome can open the PDF from the download bar (pdf.save() uses data: URI which blocks opening)
      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const pdfLink = document.createElement("a");
      pdfLink.href = pdfUrl;
      pdfLink.download = filename;
      document.body.appendChild(pdfLink);
      pdfLink.click();
      document.body.removeChild(pdfLink);
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);

    } catch (err) {
      console.error("PDF generation failed, downloading HTML fallback:", err);
      const certHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Certificate - ${studentName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;800&family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', sans-serif; 
      background: #fff;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; padding: 40px;
    }
    .cert {
      width: 900px;
      min-height: 620px;
      background: linear-gradient(135deg, #fefefe 0%, #f0f4ff 100%);
      border: 2px solid #004AC6;
      border-radius: 24px;
      padding: 60px 72px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,74,198,0.12);
    }
    .cert::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0;
      height: 6px;
      background: linear-gradient(90deg, #004AC6, #6A1EDB, #004AC6);
    }
    .cert::after {
      content: '';
      position: absolute; bottom: 0; left: 0; right: 0;
      height: 6px;
      background: linear-gradient(90deg, #004AC6, #6A1EDB, #004AC6);
    }
    .corner-ornament {
      position: absolute; width: 120px; height: 120px;
      border: 3px solid rgba(0,74,198,0.15);
      border-radius: 50%;
    }
    .corner-ornament.tl { top: 24px; left: 24px; }
    .corner-ornament.tr { top: 24px; right: 24px; }
    .corner-ornament.bl { bottom: 24px; left: 24px; }
    .corner-ornament.br { bottom: 24px; right: 24px; }
    .org-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .org-logo {
      font-family: 'Inter', sans-serif;
      font-size: 22px;
      font-weight: 800;
      color: #004AC6;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .org-subtitle {
      font-size: 11px;
      color: #6B7280;
      letter-spacing: 4px;
      text-transform: uppercase;
    }
    .divider {
      width: 80px; height: 2px;
      background: linear-gradient(90deg, #004AC6, #6A1EDB);
      margin: 16px auto;
    }
    .cert-title {
      font-family: 'Playfair Display', serif;
      font-size: 52px;
      font-weight: 800;
      color: #1a1a2e;
      text-align: center;
      margin-bottom: 4px;
      letter-spacing: -1px;
    }
    .cert-subtitle {
      font-size: 13px;
      color: #6A1EDB;
      text-align: center;
      letter-spacing: 6px;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 32px;
    }
    .present-text {
      font-size: 14px;
      color: #6B7280;
      text-align: center;
      font-style: italic;
      margin-bottom: 12px;
    }
    .student-name {
      font-family: 'Playfair Display', serif;
      font-size: 48px;
      font-weight: 700;
      color: #004AC6;
      text-align: center;
      margin-bottom: 8px;
      padding-bottom: 12px;
      border-bottom: 2px solid rgba(0,74,198,0.2);
    }
    .completion-text {
      font-size: 15px;
      color: #374151;
      text-align: center;
      margin: 20px 0;
      line-height: 1.8;
    }
    .event-name {
      font-weight: 700;
      color: #6A1EDB;
      font-size: 18px;
    }
    .details-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin: 32px 0;
      padding: 24px;
      background: rgba(0,74,198,0.03);
      border-radius: 16px;
      border: 1px solid rgba(0,74,198,0.1);
    }
    .detail-item {
      text-align: center;
    }
    .detail-label {
      font-size: 10px;
      font-weight: 700;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 6px;
    }
    .detail-value {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a2e;
    }
    .signature-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 40px;
    }
    .sig-block {
      text-align: center;
      width: 180px;
    }
    .sig-line {
      width: 100%;
      border-bottom: 1.5px solid #374151;
      margin-bottom: 6px;
      height: 32px;
    }
    .sig-label {
      font-size: 11px;
      color: #6B7280;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .cert-id-badge {
      text-align: center;
    }
    .cert-id-val {
      font-size: 11px;
      font-weight: 700;
      color: #6A1EDB;
      font-family: monospace;
      letter-spacing: 2px;
    }
    .cert-id-label {
      font-size: 9px;
      color: #9CA3AF;
      margin-top: 2px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    @media print {
      body { padding: 0; }
      .cert { border-radius: 0; box-shadow: none; width: 100%; }
    }
  </style>
</head>
<body>
  <div class="cert">
    <div class="corner-ornament tl"></div>
    <div class="corner-ornament tr"></div>
    <div class="corner-ornament bl"></div>
    <div class="corner-ornament br"></div>

    <div class="org-header">
      <div class="org-logo">🎓 Campus Connect</div>
      <div class="org-subtitle">Academic Excellence Program</div>
    </div>

    <div class="divider"></div>

    <div class="cert-title">Certificate</div>
    <div class="cert-subtitle">of Participation &amp; Completion</div>

    <div class="present-text">This is to proudly certify that</div>
    <div class="student-name">${studentName}</div>

    <div class="completion-text">
      has successfully participated in and completed the course<br>
      <span class="event-name">"${eventTitle}"</span><br>
      organized under the <strong>${category}</strong> category.
    </div>

    <div class="details-grid">
      <div class="detail-item">
        <div class="detail-label">📅 Event Date</div>
        <div class="detail-value">${formattedEventDate}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">📍 Location</div>
        <div class="detail-value">${location}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">📋 Category</div>
        <div class="detail-value">${category}</div>
      </div>
    </div>

    <div class="signature-row">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">Event Coordinator</div>
      </div>
      <div class="cert-id-badge">
        <div class="cert-id-val">${certIdDisplay}</div>
        <div class="cert-id-label">Certificate ID</div>
        <div class="cert-id-label" style="margin-top:4px">Issued: ${formattedIssueDate}</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">${issuer}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

      const blob = new Blob([certHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Certificate_${studentName.replace(/\s+/g, "_")}_${eventTitle.replace(/\s+/g, "_")}.html`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    if (open && autoDownload) {
      const timer = setTimeout(() => {
        handleDownload().finally(() => {
          onClose();
        });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [open, autoDownload]);

  if (!open) return null;

  const handlePrint = () => {
    const certHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Certificate - ${studentName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .cert { width: 900px; min-height: 620px; background: linear-gradient(135deg, #fefefe 0%, #f0f4ff 100%); border: 2px solid #004AC6; border-radius: 24px; padding: 60px 72px; position: relative; overflow: hidden; }
    .cert::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 6px; background: linear-gradient(90deg, #004AC6, #6A1EDB, #004AC6); }
    .cert::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 6px; background: linear-gradient(90deg, #004AC6, #6A1EDB, #004AC6); }
    .org-header { text-align: center; margin-bottom: 32px; }
    .org-logo { font-size: 22px; font-weight: 800; color: #004AC6; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
    .org-subtitle { font-size: 11px; color: #6B7280; letter-spacing: 4px; text-transform: uppercase; }
    .divider { width: 80px; height: 2px; background: linear-gradient(90deg, #004AC6, #6A1EDB); margin: 16px auto; }
    .cert-title { font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 800; color: #1a1a2e; text-align: center; margin-bottom: 4px; }
    .cert-subtitle { font-size: 13px; color: #6A1EDB; text-align: center; letter-spacing: 6px; text-transform: uppercase; font-weight: 600; margin-bottom: 32px; }
    .present-text { font-size: 14px; color: #6B7280; text-align: center; font-style: italic; margin-bottom: 12px; }
    .student-name { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 700; color: #004AC6; text-align: center; margin-bottom: 8px; padding-bottom: 12px; border-bottom: 2px solid rgba(0,74,198,0.2); }
    .completion-text { font-size: 15px; color: #374151; text-align: center; margin: 20px 0; line-height: 1.8; }
    .event-name { font-weight: 700; color: #6A1EDB; font-size: 18px; }
    .details-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin: 32px 0; padding: 24px; background: rgba(0,74,198,0.03); border-radius: 16px; border: 1px solid rgba(0,74,198,0.1); }
    .detail-item { text-align: center; }
    .detail-label { font-size: 10px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
    .detail-value { font-size: 14px; font-weight: 600; color: #1a1a2e; }
    .signature-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; }
    .sig-block { text-align: center; width: 180px; }
    .sig-line { width: 100%; border-bottom: 1.5px solid #374151; margin-bottom: 6px; height: 32px; }
    .sig-label { font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .cert-id-badge { text-align: center; }
    .cert-id-val { font-size: 11px; font-weight: 700; color: #6A1EDB; font-family: monospace; letter-spacing: 2px; }
    .cert-id-label { font-size: 9px; color: #9CA3AF; margin-top: 2px; text-transform: uppercase; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="cert">
    <div class="org-header">
      <div class="org-logo">🎓 Campus Connect</div>
      <div class="org-subtitle">Academic Excellence Program</div>
    </div>
    <div class="divider"></div>
    <div class="cert-title">Certificate</div>
    <div class="cert-subtitle">of Participation &amp; Completion</div>
    <div class="present-text">This is to proudly certify that</div>
    <div class="student-name">${studentName}</div>
    <div class="completion-text">
      has successfully participated in and completed the course<br>
      <span class="event-name">"${eventTitle}"</span><br>
      organized under the <strong>${category}</strong> category.
    </div>
    <div class="details-grid">
      <div class="detail-item">
        <div class="detail-label">📅 Event Date</div>
        <div class="detail-value">${formattedEventDate}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">📍 Location</div>
        <div class="detail-value">${location}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">📋 Category</div>
        <div class="detail-value">${category}</div>
      </div>
    </div>
    <div class="signature-row">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">Event Coordinator</div>
      </div>
      <div class="cert-id-badge">
        <div class="cert-id-val">${certIdDisplay}</div>
        <div class="cert-id-label">Certificate ID</div>
        <div class="cert-id-label" style="margin-top:4px">Issued: ${formattedIssueDate}</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">${issuer}</div>
      </div>
    </div>
  </div>
  <script>window.onload = function(){ window.print(); }</script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(certHtml);
      win.document.close();
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--surface-container-lowest)",
        borderRadius: "24px",
        maxWidth: "860px",
        width: "100%",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 32px 80px rgba(0,0,0,0.3)",
        animation: "modalIn 0.25s ease",
      }}>
        {/* Modal Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 28px",
          borderBottom: "1px solid var(--outline-variant)",
          background: "linear-gradient(135deg, rgba(0,74,198,0.04), rgba(106,30,219,0.04))",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #004AC6, #6A1EDB)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ color: "white", fontSize: "22px" }}>workspace_premium</span>
            </div>
            <div>
              <p style={{ fontSize: "17px", fontWeight: 800, color: "var(--on-surface)" }}>Certificate of Completion</p>
              <p style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>ID: {certIdDisplay}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--on-surface-variant)", display: "flex", alignItems: "center" }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Certificate Preview */}
        <div style={{ padding: "28px" }}>
          <div
            ref={printRef}
            style={{
              background: "linear-gradient(135deg, #fefefe 0%, #f0f4ff 100%)",
              border: "2px solid #004AC6",
              borderRadius: "20px",
              padding: "48px 56px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top gradient bar */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "5px", background: "linear-gradient(90deg, #004AC6, #6A1EDB, #004AC6)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "5px", background: "linear-gradient(90deg, #004AC6, #6A1EDB, #004AC6)" }} />

            {/* Corner circles */}
            {[{ top: "16px", left: "16px" }, { top: "16px", right: "16px" }, { bottom: "16px", left: "16px" }, { bottom: "16px", right: "16px" }].map((pos, i) => (
              <div key={i} style={{ position: "absolute", width: "80px", height: "80px", borderRadius: "50%", border: "2px solid rgba(0,74,198,0.12)", ...pos }} />
            ))}

            {/* Institution header */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <p style={{ fontSize: "18px", fontWeight: 800, color: "#004AC6", letterSpacing: "2px", textTransform: "uppercase" }}>🎓 Campus Connect</p>
              <p style={{ fontSize: "10px", color: "#6B7280", letterSpacing: "4px", textTransform: "uppercase", marginTop: "2px" }}>Academic Excellence Program</p>
              <div style={{ width: "60px", height: "2px", background: "linear-gradient(90deg, #004AC6, #6A1EDB)", margin: "12px auto" }} />
            </div>

            {/* Certificate title */}
            <p style={{ fontFamily: "Georgia, serif", fontSize: "40px", fontWeight: 800, color: "#1a1a2e", textAlign: "center", marginBottom: "2px" }}>Certificate</p>
            <p style={{ fontSize: "11px", color: "#6A1EDB", textAlign: "center", letterSpacing: "6px", textTransform: "uppercase", fontWeight: 700, marginBottom: "24px" }}>of Participation &amp; Completion</p>

            {/* Recipient */}
            <p style={{ fontSize: "13px", color: "#6B7280", textAlign: "center", fontStyle: "italic", marginBottom: "8px" }}>This is to proudly certify that</p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: "36px", fontWeight: 700, color: "#004AC6", textAlign: "center", borderBottom: "1.5px solid rgba(0,74,198,0.2)", paddingBottom: "12px", marginBottom: "16px" }}>
              {studentName}
            </p>

            {/* Completion statement */}
            <p style={{ fontSize: "14px", color: "#374151", textAlign: "center", lineHeight: 1.8, marginBottom: "24px" }}>
              has successfully participated in and completed the course<br />
              <span style={{ fontWeight: 700, color: "#6A1EDB", fontSize: "17px" }}>"{eventTitle}"</span><br />
              organized under the <strong>{category}</strong> category.
            </p>

            {/* Details grid */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px",
              margin: "0 0 28px",
              padding: "20px",
              background: "rgba(0,74,198,0.03)",
              borderRadius: "14px",
              border: "1px solid rgba(0,74,198,0.1)",
            }}>
              {[
                { label: "📅 Event Date", value: date },
                { label: "📍 Location", value: location },
                { label: "📋 Category", value: category },
              ].map(d => (
                <div key={d.label} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "9px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "4px" }}>{d.label}</p>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a2e" }}>{d.value}</p>
                </div>
              ))}
            </div>

            {/* Signature row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div style={{ textAlign: "center", width: "160px" }}>
                <div style={{ height: "28px", borderBottom: "1.5px solid #374151", marginBottom: "6px" }} />
                <p style={{ fontSize: "10px", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Event Coordinator</p>
              </div>

              <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 700, color: "#6A1EDB", letterSpacing: "2px" }}>{certIdDisplay}</p>
                <p style={{ fontSize: "9px", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "1px", marginTop: "2px" }}>Certificate ID</p>
                <p style={{ fontSize: "9px", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "1px", marginTop: "2px" }}>Issued: {formattedIssueDate}</p>
              </div>

              <div style={{ textAlign: "center", width: "160px" }}>
                <div style={{ height: "28px", borderBottom: "1.5px solid #374151", marginBottom: "6px" }} />
                <p style={{ fontSize: "10px", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{issuer}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "24px", flexWrap: "wrap" }}>
            <button
              onClick={handlePrint}
              className="btn-primary"
              style={{ padding: "12px 28px", gap: "8px", borderRadius: "12px" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>print</span>
              Print Certificate
            </button>
            <button
              onClick={handleDownload}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "12px 28px", borderRadius: "12px",
                background: "linear-gradient(135deg, #6A1EDB, #004AC6)",
                color: "white", border: "none", cursor: "pointer",
                fontSize: "14px", fontWeight: 700,
                boxShadow: "0 4px 16px rgba(106,30,219,0.3)",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>download</span>
              Download Certificate
            </button>
            <button
              onClick={onClose}
              className="btn-ghost"
              style={{ padding: "12px 28px", borderRadius: "12px" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
