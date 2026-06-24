"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

function applyTheme(theme: string) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = theme === "system" ? (prefersDark ? "dark" : "light") : theme;
  document.documentElement.setAttribute("data-theme", resolved);
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState("");
  const mediaQueryRef = useRef<MediaQueryList | null>(null);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        // Apply theme preference
        applyTheme(data.user.theme || "system");
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Session check failed", err);
    } finally {
      setLoading(false);
    }
  };

  // Listen for system preference changes when user wants "system" theme
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQueryRef.current = mql;
    const handler = () => {
      const savedTheme = localStorage.getItem("cc-theme") || "system";
      if (savedTheme === "system") applyTheme("system");
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const cachedTheme = localStorage.getItem("cc-theme") || "system";
    applyTheme(cachedTheme);
    checkSession();
  }, []);

  const handleAuth = async () => {
    setError("");
    if (!nameInput.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!emailInput.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoginLoading(true);

    try {
      const payload = {
        name: nameInput.trim(),
        email: emailInput.trim(),
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.user) {
        // Set the userId cookie
        document.cookie = `userId=${data.user.id}; path=/; max-age=31536000;`;
        setUser(data.user);
        // Refresh page to load everything for the user
        window.location.reload();
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch (err) {
      setError("Network error occurred during authentication");
    } finally {
      setLoginLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "var(--surface)" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // If no user is logged in, render the unified Enter Platform page overlay
  if (!user) {
    return (
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh",
        background: "linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(106,30,219,0.05) 100%), var(--surface)",
        padding: "24px"
      }}>
        <div className="glass-tile" style={{
          width: "100%", maxWidth: "440px", padding: "36px", textAlign: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.8)",
          borderRadius: "28px", animation: "modalIn 0.3s ease-out"
        }}>
          <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px", background: "linear-gradient(135deg, var(--primary), var(--tertiary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>CampusConnect</h2>
          <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", marginBottom: "28px" }}>Sign in to access your student hub, event discoveries, and matching engine.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px", textAlign: "left" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--on-surface-variant)", marginBottom: "8px", paddingLeft: "4px" }}>
                Student Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. David Miller"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                style={{ width: "100%", height: "48px", borderRadius: "14px", border: "1px solid var(--outline-variant)", padding: "0 16px", outline: "none", fontSize: "14px", transition: "all 0.2s" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--on-surface-variant)", marginBottom: "8px", paddingLeft: "4px" }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. david.miller@campusconnect.edu"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{ width: "100%", height: "48px", borderRadius: "14px", border: "1px solid var(--outline-variant)", padding: "0 16px", outline: "none", fontSize: "14px", transition: "all 0.2s" }}
              />
            </div>

            {error && <p style={{ color: "var(--error)", fontSize: "12px", fontWeight: 600 }}>{error}</p>}

            <button
              onClick={handleAuth}
              disabled={loginLoading}
              className="btn-primary"
              style={{ width: "100%", height: "48px", justifyContent: "center", borderRadius: "14px", fontWeight: 700, fontSize: "15px", cursor: "pointer", marginTop: "8px" }}
            >
              {loginLoading ? "Entering Platform..." : "Enter Platform"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: "256px", display: "flex", flexDirection: "column" }}>
        <TopBar withSidebar title={title} />
        <main
          style={{
            flex: 1,
            paddingTop: "88px",
            paddingBottom: "48px",
            paddingLeft: "32px",
            paddingRight: "32px",
            maxWidth: "1440px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
