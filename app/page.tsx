"use client";
import { useEffect } from "react";
import Link from "next/link";

const stats = [
  { icon: "event_available", value: "5,000+", label: "Total Events Hosted", color: "var(--primary)" },
  { icon: "person_celebrate", value: "120k+", label: "Students Registered", color: "var(--secondary)" },
  { icon: "verified", value: "85k+", label: "Certificates Issued", color: "var(--tertiary)" },
  { icon: "school", value: "450+", label: "Partner Colleges", color: "var(--outline)" },
];

const events = [
  {
    category: "Cultural",
    categoryColor: "var(--tertiary)",
    title: "Inter-College Fusion Dance Fest",
    date: "Oct 15, 2026 • 6:00 PM",
    location: "Main Auditorium, West Campus",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWQrArleEetprvPK0x_mFd-3wTXaBHcbIz3OhuHSZIXbOyTFCtNbYZN83fwg2NDzMaSy5Jk6fZwFJQLajPkfcSXL1tfzF-TcO7OuCt9N2jBMhxcKm-Pbd0eTDSTHko1VjnSDL_ZSaHZUvGcs-caf-E8U9ZrYpETdaPZU-oWaLFZpLu2HrbptGW-Iy5QuQrfy-JrZodhq5WWBQm8MG-uqx3L0mo-hskkmCjnTmM3oH75R8grFtq704d5kZpZh3NOsBTluAMKfvaGWc",
    btnColor: "var(--on-primary-container)",
    btnBg: "var(--primary-container)",
  },
  {
    category: "Innovation",
    categoryColor: "var(--secondary)",
    title: "NextGen Robotics Hackathon",
    date: "Nov 02-04, 2026",
    location: "Innovation Hub, Building 4",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlIY7tlS6LsTOO71dYlkxmlec6kwy04IPZvZWUpe3zU6d-7gYqBDGV3XFDPvUqpvEYuidd_QshJGEpOIrIAkAkkgedppIWszDCWqKz93fdvx6pytozcTVoPlIrP0DC8w6KFSzvjvZ1OwLHdHmpSn0BtklOAIcXaNw1MUolgGTLb3MZBUeOYham0uo3qEZJ2VsTdb1pDXip-O0adDDmO_PhIsKMcNfPiyUiytAxs2MnttEgrKizqq2Wu9ErRLWznE8_VZYIVKc35-k",
    btnColor: "var(--on-secondary-container)",
    btnBg: "var(--secondary-container)",
  },
  {
    category: "Career",
    categoryColor: "var(--primary)",
    title: "Global Leadership Summit",
    date: "Dec 12, 2026 • 10:00 AM",
    location: "Grand Conference Hall",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOfw7QbuyNGe3azBaF-6_P8fxQyoSqKb0x5EzzOaqMzmjXCWedbcm4jFAPkM5LHrGte_sB6AqnBlF33Q25K7rYoxbqOXd1oHkYEk3CJf-Hfm07UNFv6DE9gcSv0OaQf8uC7bMR1j8umilW-a0iumIZtZJhYpoXKCzmFUmCm9joPsQcD0uXhn7H9_nNt_Q0R4wYOMQhrlol8JWxNKTp8wY4q6sGuMacsqyi4_U5xTRr9bgvG0XpD64QVrlJr6BZM1V1J1_5C11kc1o",
    btnColor: "var(--on-primary-container)",
    btnBg: "var(--primary-container)",
  },
];

const features = [
  {
    icon: "qr_code_2",
    color: "var(--primary)",
    title: "QR-based Attendance",
    desc: "Eliminate paper logs. Student entry is verified in milliseconds via unique, dynamic QR codes, synced directly with university databases.",
  },
  {
    icon: "psychology",
    color: "var(--secondary)",
    title: "AI Team Matching",
    desc: "Don't have a team? Our neural algorithm matches you with teammates based on complementary skill sets and shared project interests.",
  },
  {
    icon: "workspace_premium",
    color: "var(--tertiary)",
    title: "Gamified Achievements",
    desc: "Earn points, level up your profile, and unlock exclusive digital badges for participation, leadership, and community contributions.",
  },
];

export default function LandingPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cachedTheme = localStorage.getItem("cc-theme") || "system";
      let resolved = cachedTheme;
      if (cachedTheme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        resolved = prefersDark ? "dark" : "light";
      }
      document.documentElement.setAttribute("data-theme", resolved);
    }
  }, []);

  return (
    <div style={{ background: "var(--surface)", minHeight: "100vh" }}>
      {/* Top Navigation */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 48px",
          height: "64px",
          background: "rgba(var(--surface-rgb), 0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--glass-border)",
          boxShadow: "0 1px 8px rgba(0,74,198,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
          <span style={{ fontSize: "20px", fontWeight: 900, color: "var(--primary)", letterSpacing: "-0.02em" }}>
            CampusConnect
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { href: "/", label: "Home", icon: "home" },
              { href: "/events", label: "Events", icon: "calendar_month" },
              { href: "/leaderboard", label: "Rankings", icon: "military_tech" },
              { href: "/team-builder", label: "Team Builder", icon: "groups" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--on-surface-variant)",
                  transition: "all 0.2s",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <Link href="/dashboard">
          <button
            className="btn-secondary"
            style={{ borderRadius: "9999px", padding: "8px 24px" }}
          >
            Get Started
          </button>
        </Link>
      </nav>

      <main style={{ paddingTop: "64px" }}>
        {/* Hero Section */}
        <section
          style={{
            minHeight: "92vh",
            display: "flex",
            alignItems: "center",
            padding: "0 48px",
            maxWidth: "1440px",
            margin: "0 auto",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background Decorations */}
          <div style={{
            position: "absolute", top: "10%", right: "5%",
            width: "400px", height: "400px",
            background: "radial-gradient(circle, rgba(106,30,219,0.08) 0%, transparent 70%)",
            borderRadius: "50%", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "10%", left: "0%",
            width: "300px", height: "300px",
            background: "radial-gradient(circle, rgba(0,108,73,0.06) 0%, transparent 70%)",
            borderRadius: "50%", pointerEvents: "none",
          }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center", width: "100%" }}>
            {/* Left Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(0,74,198,0.08)",
                  border: "1px solid rgba(0,74,198,0.15)",
                  borderRadius: "9999px",
                  padding: "6px 16px",
                  width: "fit-content",
                }}
              >
                <span className="material-symbols-outlined filled" style={{ fontSize: "16px", color: "var(--primary)" }}>
                  stars
                </span>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--primary)", letterSpacing: "0.05em" }}>
                  SMART EVENT MANAGEMENT PLATFORM
                </span>
              </div>

              <h1
                style={{
                  fontSize: "clamp(36px, 4vw, 56px)",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  color: "var(--on-surface)",
                }}
              >
                Empowering Campus Life Through{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, var(--primary), var(--tertiary))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Seamless Events.
                </span>
              </h1>

              <p style={{ fontSize: "18px", lineHeight: 1.7, color: "var(--on-surface-variant)", maxWidth: "500px" }}>
                The all-in-one platform for student leaders and university administrators to orchestrate
                high-impact experiences, from hackathons to cultural fests.
              </p>

              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <Link href="/dashboard">
                  <button
                    className="btn-primary"
                    style={{ padding: "14px 28px", fontSize: "15px", borderRadius: "14px" }}
                  >
                    Get Started
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </Link>
                <Link href="/events">
                  <button
                    className="btn-ghost"
                    style={{ padding: "14px 28px", fontSize: "15px", borderRadius: "14px" }}
                  >
                    View Live Events
                  </button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                {[
                  { icon: "shield", text: "SSL Secured" },
                  { icon: "verified_user", text: "GDPR Compliant" },
                  { icon: "support_agent", text: "24/7 Support" },
                ].map((badge) => (
                  <div key={badge.text} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--secondary)" }}>
                      {badge.icon}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--on-surface-variant)", fontWeight: 500 }}>
                      {badge.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Hero Card */}
            <div style={{ position: "relative" }}>
              <div
                className="glass-card"
                style={{
                  borderRadius: "24px",
                  padding: "16px",
                  transform: "rotate(2deg)",
                  transition: "transform 0.5s ease",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "rotate(0deg)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "rotate(2deg)";
                }}
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsDon_K0K1emeeQ20mT2uUhkDsn6EPujOOIDeb3uJYXHcVL8QmXma2h4poUC3bD0Q96YsPGnMAFdGafk2uMrFhjLkggcpU6novxoDWg1w78A3MoasDVjF0RQcFG14umzT888UULBIES4rlVwgc2IChukb-yOwY6PR39Mv-uDSt447z36wtQ7jhfm1o3eL6AtabbKW0demo2I0KRy-USg59uqEsTwwn0eIv72Hf3DJ9JsD6VhB8Lbs3h4OxVbH31cAO1GTrclzmSFU"
                  alt="Campus Event"
                  style={{ width: "100%", height: "420px", objectFit: "cover", borderRadius: "16px" }}
                />
                {/* Live Update Card */}
                <div
                  className="glass-card"
                  style={{
                    position: "absolute",
                    bottom: "32px",
                    left: "32px",
                    right: "32px",
                    padding: "20px",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.6)",
                    animation: "pulse-glow 2s ease-in-out infinite",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        background: "var(--secondary-container)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ color: "var(--on-secondary-container)" }}>
                        trending_up
                      </span>
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", color: "var(--secondary)", fontWeight: 700, letterSpacing: "0.05em" }}>
                        🔴 LIVE UPDATE
                      </p>
                      <p style={{ fontWeight: 600, fontSize: "14px", color: "var(--on-surface)", marginTop: "2px" }}>
                        1.2k+ students joined &quot;Tech Summit 2026&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating decorations */}
              <div
                className="animate-float glass-card"
                style={{
                  position: "absolute",
                  top: "-16px",
                  right: "-16px",
                  padding: "12px 16px",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span className="material-symbols-outlined filled" style={{ color: "var(--tertiary)", fontSize: "20px" }}>
                  emoji_events
                </span>
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--tertiary)" }}>Achievement</p>
                  <p style={{ fontSize: "10px", color: "var(--on-surface-variant)" }}>5 badges earned!</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section style={{ padding: "80px 48px", maxWidth: "1440px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass-card hover-lift"
                style={{
                  padding: "40px 24px",
                  borderRadius: "24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    background: `${stat.color}15`,
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "32px", color: stat.color }}>
                    {stat.icon}
                  </span>
                </div>
                <div>
                  <h3 style={{ fontSize: "42px", fontWeight: 800, color: "var(--on-surface)", letterSpacing: "-0.02em" }}>
                    {stat.value}
                  </h3>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "4px" }}>
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Events */}
        <section style={{ padding: "80px 48px", maxWidth: "1440px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "48px" }}>
            <div>
              <h2 style={{ fontSize: "36px", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "12px" }}>
                Featured Events
              </h2>
              <p style={{ fontSize: "16px", color: "var(--on-surface-variant)", maxWidth: "600px" }}>
                Explore hand-picked workshops, festivals, and competitions currently trending across top-tier campuses nationwide.
              </p>
            </div>
            <Link href="/events">
              <button style={{
                display: "flex", alignItems: "center", gap: "4px",
                color: "var(--primary)", fontWeight: 700, fontSize: "14px",
                background: "none", border: "none", cursor: "pointer",
                transition: "transform 0.2s",
              }}>
                View All Events
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {events.map((event) => (
              <div
                key={event.title}
                className="glass-card event-card"
                style={{ borderRadius: "24px" }}
              >
                <div style={{ position: "relative", height: "224px", overflow: "hidden" }}>
                  <img
                    src={event.image}
                    alt={event.title}
                    className="event-card-img"
                    style={{ borderRadius: "0" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "16px",
                      left: "16px",
                      background: event.categoryColor,
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: "9999px",
                      fontSize: "11px",
                      fontWeight: 700,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    }}
                  >
                    {event.category}
                  </div>
                </div>
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
                  <h4 style={{ fontSize: "18px", fontWeight: 700, lineHeight: 1.3 }}>{event.title}</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--on-surface-variant)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "16px", color: event.categoryColor }}>calendar_month</span>
                      {event.date}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--on-surface-variant)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "16px", color: event.categoryColor }}>location_on</span>
                      {event.location}
                    </div>
                  </div>
                  <Link href="/events/1" style={{ marginTop: "auto" }}>
                    <button
                      style={{
                        width: "100%",
                        background: event.btnBg,
                        color: event.btnColor,
                        padding: "12px",
                        borderRadius: "12px",
                        border: "none",
                        fontWeight: 700,
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      Register Now
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why CampusConnect */}
        <section
          style={{
            padding: "96px 48px",
            background: "var(--surface-container-low)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{
            position: "absolute", top: 0, right: 0,
            width: "384px", height: "384px",
            background: "radial-gradient(circle, rgba(0,74,198,0.05) 0%, transparent 70%)",
            borderRadius: "50%",
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0,
            width: "384px", height: "384px",
            background: "radial-gradient(circle, rgba(106,30,219,0.05) 0%, transparent 70%)",
            borderRadius: "50%",
          }} />

          <div style={{ maxWidth: "1440px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            <div style={{ textAlign: "center", marginBottom: "64px" }}>
              <h2 style={{ fontSize: "36px", fontWeight: 700, marginBottom: "16px" }}>Why CampusConnect?</h2>
              <p style={{ fontSize: "18px", color: "var(--on-surface-variant)", maxWidth: "640px", margin: "0 auto", lineHeight: 1.7 }}>
                We&apos;ve built the ultimate student engagement layer that transforms passive event-going into active community building.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "48px" }}>
              {features.map((feat) => (
                <div key={feat.title} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      background: "white",
                      borderRadius: "16px",
                      boxShadow: "0 4px 16px rgba(0,74,198,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span className="material-symbols-outlined filled" style={{ fontSize: "28px", color: feat.color }}>
                      {feat.icon}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: 700 }}>{feat.title}</h3>
                  <p style={{ fontSize: "15px", color: "var(--on-surface-variant)", lineHeight: 1.7 }}>{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ padding: "96px 48px", maxWidth: "1440px", margin: "0 auto" }}>
          <div
            style={{
              background: "linear-gradient(135deg, var(--primary) 0%, var(--tertiary) 100%)",
              borderRadius: "32px",
              padding: "80px 64px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute", top: "-50px", right: "-50px",
              width: "200px", height: "200px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "50%",
            }} />
            <div style={{
              position: "absolute", bottom: "-30px", left: "10%",
              width: "150px", height: "150px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "50%",
            }} />

            <div style={{ position: "relative", zIndex: 1, maxWidth: "640px", margin: "0 auto" }}>
              <h2 style={{ fontSize: "36px", fontWeight: 700, color: "white", marginBottom: "16px" }}>
                Ready to Elevate Your Campus?
              </h2>
              <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.8)", marginBottom: "40px", lineHeight: 1.7 }}>
                Join thousands of student organizers and start creating unforgettable experiences today.
              </p>
              <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/dashboard">
                  <button style={{
                    background: "white",
                    color: "var(--primary)",
                    padding: "16px 40px",
                    borderRadius: "16px",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "16px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}>
                    Get Started
                  </button>
                </Link>

              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(195,198,215,0.3)",
          background: "var(--surface-container-lowest)",
          padding: "64px 48px",
        }}
      >
        <div style={{ maxWidth: "1440px", margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "48px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--primary)", marginBottom: "16px" }}>CampusConnect</h3>
            <p style={{ fontSize: "15px", color: "var(--on-surface-variant)", lineHeight: 1.7, marginBottom: "24px", maxWidth: "280px" }}>
              Empowering student leaders to build vibrant, engaged campus communities through technology.
            </p>
            <p style={{ fontSize: "12px", color: "var(--on-surface-variant)" }}>© 2026 CampusConnect. Elevating Academic Life.</p>
          </div>

          {[
            { title: "Platform", links: ["Browse Events", "Create Event", "Leaderboard", "University Partner"] },
            { title: "Resources", links: ["Help Center", "Organizer FAQ", "Student Handbook", "API Reference"] },
            { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 style={{ fontSize: "13px", fontWeight: 700, marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {col.title}
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" style={{ fontSize: "14px", color: "var(--on-surface-variant)", textDecoration: "none", transition: "color 0.2s" }}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>

      {/* FAB */}
      <button className="fab" id="create-event-fab" aria-label="Create Event">
        <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>add</span>
      </button>
    </div>
  );
}
