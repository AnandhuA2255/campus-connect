"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface TopBarProps {
  withSidebar?: boolean;
  title?: string;
}

interface Activity {
  id: string;
  icon: string;
  color: string;
  text: string;
  createdAt: string;
}

interface SupportMessage {
  id: string;
  userId: string;
  sender: string;
  text: string;
  createdAt: string;
}

interface SearchResults {
  events: { id: string; title: string; category: string; date: string; location: string }[];
  users: { id: string; name: string; department: string; email: string }[];
  teams: { id: string; name: string; eventTitle: string; openPositions: number }[];
}

export default function TopBar({ withSidebar = false, title }: TopBarProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [user, setUser] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [collegeMessages, setCollegeMessages] = useState<SupportMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Search state
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setActivities(data.user.activities?.slice(0, 8) || []);
        }
      })
      .catch(err => console.error("Error fetching user in top bar", err));
  }, []);

  // Poll for college support replies
  useEffect(() => {
    if (!user?.id) return;
    const poll = async () => {
      try {
        const res = await fetch(`/api/support?userId=${user.id}`);
        const data = await res.json();
        if (!data.messages) return;
        const collegeMsgs: SupportMessage[] = data.messages.filter(
          (m: SupportMessage) => m.sender === "COLLEGE"
        );
        if (collegeMsgs.length === 0) return;
        setCollegeMessages(collegeMsgs);
        // Check for new unread messages using localStorage timestamp
        const lastSeen = localStorage.getItem("support_last_seen") || "";
        const newMsgs = collegeMsgs.filter(
          (m) => !lastSeen || new Date(m.createdAt) > new Date(lastSeen)
        );
        if (newMsgs.length > 0) {
          setHasUnread(true);
          setUnreadCount(newMsgs.length);
        }
      } catch {
        // silently fail
      }
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Close panels on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced search
  const doSearch = useCallback((q: string) => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (!q || q.length < 2) {
      setSearchResults(null);
      setSearchOpen(false);
      return;
    }
    setSearchLoading(true);
    searchDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setSearchResults(data);
        setSearchOpen(true);
      } catch {
        // silently fail
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    doSearch(val);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
      setSearchValue("");
    }
    if (e.key === "Enter" && searchValue.trim()) {
      setSearchOpen(false);
      router.push(`/events?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchValue("");
    setSearchResults(null);
    setSearchOpen(false);
  };

  const handleBellClick = () => {
    setNotifOpen(o => !o);
    if (!notifOpen) {
      // Mark all college replies as read
      if (collegeMessages.length > 0) {
        const latest = collegeMessages.reduce((a, b) =>
          new Date(a.createdAt) > new Date(b.createdAt) ? a : b
        );
        localStorage.setItem("support_last_seen", latest.createdAt);
      }
      setHasUnread(false);
      setUnreadCount(0);
    }
  };

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  const totalResults = searchResults
    ? searchResults.events.length + searchResults.users.length + searchResults.teams.length
    : 0;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: withSidebar ? "256px" : 0,
        right: 0,
        height: "64px",
        zIndex: 30,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--outline-variant)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        backgroundColor: "var(--surface-container-low)",
      }}
    >
      {/* Left: title + search */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {title && (
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--on-surface)" }}>
            {title}
          </h2>
        )}

        {/* Search box with dropdown */}
        <div ref={searchRef} style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: searchOpen ? "var(--surface-container-lowest)" : "var(--surface-container)",
              borderRadius: searchOpen ? "14px 14px 0 0" : "9999px",
              padding: "6px 16px",
              border: `1px solid ${searchOpen ? "var(--primary)" : "var(--outline-variant)"}`,
              borderBottom: searchOpen ? "none" : `1px solid ${searchOpen ? "var(--primary)" : "var(--outline-variant)"}`,
              transition: "all 0.2s",
              boxShadow: searchOpen ? "0 0 0 3px rgba(0,74,198,0.08)" : "none",
            }}
          >
            {searchLoading ? (
              <div style={{
                width: "18px", height: "18px", borderRadius: "50%",
                border: "2px solid var(--outline-variant)",
                borderTopColor: "var(--primary)",
                animation: "spin 0.7s linear infinite",
                flexShrink: 0,
              }} />
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: "20px", color: searchOpen ? "var(--primary)" : "var(--on-surface-variant)" }}>
                search
              </span>
            )}
            <input
              type="text"
              placeholder="Search events, students, teams..."
              value={searchValue}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => { if (searchResults && totalResults > 0) setSearchOpen(true); }}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: "14px",
                color: "var(--on-surface)",
                width: "240px",
              }}
            />
            {searchValue && (
              <button
                onClick={clearSearch}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center",
                  color: "var(--on-surface-variant)", padding: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchOpen && searchResults && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                minWidth: "380px",
                background: "var(--surface-container-lowest)",
                border: "1px solid var(--primary)",
                borderTop: "none",
                borderRadius: "0 0 16px 16px",
                boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
                zIndex: 200,
                overflow: "hidden",
              }}
            >
              {totalResults === 0 ? (
                <div style={{ padding: "24px 20px", textAlign: "center", color: "var(--on-surface-variant)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "36px", display: "block", marginBottom: "8px" }}>search_off</span>
                  <p style={{ fontSize: "14px", fontWeight: 600 }}>No results for "{searchValue}"</p>
                  <p style={{ fontSize: "12px", marginTop: "4px" }}>Try a different keyword</p>
                </div>
              ) : (
                <div style={{ maxHeight: "420px", overflowY: "auto" }}>

                  {/* Events Section */}
                  {searchResults.events.length > 0 && (
                    <div>
                      <div style={{ padding: "10px 16px 6px", fontSize: "10px", fontWeight: 800, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.08em", background: "var(--surface-container-low)" }}>
                        🎪 Events
                      </div>
                      {searchResults.events.map(event => (
                        <Link key={event.id} href={`/events?search=${encodeURIComponent(event.title)}`} style={{ textDecoration: "none" }}>
                          <div
                            onClick={clearSearch}
                            style={{
                              display: "flex", alignItems: "center", gap: "12px",
                              padding: "10px 16px", cursor: "pointer",
                              transition: "background 0.15s",
                              borderBottom: "1px solid var(--outline-variant)",
                            }}
                            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--surface-container)"}
                            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                          >
                            <div style={{
                              width: "36px", height: "36px", borderRadius: "10px",
                              background: "linear-gradient(135deg, rgba(0,74,198,0.1), rgba(106,30,219,0.1))",
                              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}>
                              <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "var(--primary)" }}>event</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--on-surface)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {event.title}
                              </p>
                              <p style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>
                                {event.category} · {event.date} · {event.location}
                              </p>
                            </div>
                            <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--outline)" }}>arrow_forward</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Students Section */}
                  {searchResults.users.length > 0 && (
                    <div>
                      <div style={{ padding: "10px 16px 6px", fontSize: "10px", fontWeight: 800, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.08em", background: "var(--surface-container-low)" }}>
                        👤 Students
                      </div>
                      {searchResults.users.map(u => (
                        <Link key={u.id} href="/leaderboard" style={{ textDecoration: "none" }}>
                          <div
                            onClick={clearSearch}
                            style={{
                              display: "flex", alignItems: "center", gap: "12px",
                              padding: "10px 16px", cursor: "pointer",
                              transition: "background 0.15s",
                              borderBottom: "1px solid var(--outline-variant)",
                            }}
                            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--surface-container)"}
                            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                          >
                            <div style={{
                              width: "36px", height: "36px", borderRadius: "50%",
                              background: "linear-gradient(135deg, var(--primary), var(--tertiary))",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "white", fontSize: "13px", fontWeight: 800, flexShrink: 0,
                            }}>
                              {u.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--on-surface)" }}>{u.name}</p>
                              <p style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>{u.department || "Undeclared"} · {u.email}</p>
                            </div>
                            <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--outline)" }}>arrow_forward</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Teams Section */}
                  {searchResults.teams.length > 0 && (
                    <div>
                      <div style={{ padding: "10px 16px 6px", fontSize: "10px", fontWeight: 800, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.08em", background: "var(--surface-container-low)" }}>
                        🤝 Teams
                      </div>
                      {searchResults.teams.map(team => (
                        <Link key={team.id} href="/team-builder" style={{ textDecoration: "none" }}>
                          <div
                            onClick={clearSearch}
                            style={{
                              display: "flex", alignItems: "center", gap: "12px",
                              padding: "10px 16px", cursor: "pointer",
                              transition: "background 0.15s",
                            }}
                            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--surface-container)"}
                            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                          >
                            <div style={{
                              width: "36px", height: "36px", borderRadius: "10px",
                              background: "rgba(0,108,73,0.1)",
                              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}>
                              <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "var(--secondary)" }}>groups</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--on-surface)" }}>{team.name}</p>
                              <p style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>
                                {team.eventTitle} · {team.openPositions} open spot{team.openPositions !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--outline)" }}>arrow_forward</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Footer: View all */}
                  <div
                    onClick={() => { router.push(`/events?search=${encodeURIComponent(searchValue)}`); clearSearch(); }}
                    style={{
                      padding: "10px 16px",
                      borderTop: "1px solid var(--outline-variant)",
                      display: "flex", alignItems: "center", gap: "8px",
                      cursor: "pointer", color: "var(--primary)",
                      fontSize: "13px", fontWeight: 600,
                      background: "var(--surface-container-low)",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--surface-container)"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "var(--surface-container-low)"}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>search</span>
                    Search all events for "{searchValue}"
                    <span style={{ marginLeft: "auto" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>keyboard_return</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Notifications + Settings + Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Notifications Bell */}
        <div style={{ position: "relative" }} ref={notifRef}>
          <button
            id="notif-bell-btn"
            onClick={handleBellClick}
            title="Notifications"
            style={{
              width: "40px", height: "40px", borderRadius: "50%",
              background: notifOpen ? "var(--surface-container-high)" : "transparent",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--on-surface-variant)", position: "relative",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-container)"}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = notifOpen ? "var(--surface-container-high)" : "transparent"}
          >
            <span className="material-symbols-outlined">notifications</span>
            {hasUnread && (
              <span style={{
                position: "absolute", top: "6px", right: "6px",
                minWidth: unreadCount > 0 ? "16px" : "8px",
                height: unreadCount > 0 ? "16px" : "8px",
                background: "var(--error)", borderRadius: "9999px",
                border: "2px solid var(--surface-container-low)",
                fontSize: "9px", fontWeight: 800, color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: unreadCount > 0 ? "0 3px" : "0",
              }}>
                {unreadCount > 0 ? unreadCount : ""}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {notifOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              width: "360px", maxHeight: "480px",
              background: "var(--surface-container-lowest)",
              border: "1px solid var(--outline-variant)",
              borderRadius: "20px", boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
              overflow: "hidden", zIndex: 100, animation: "fadeInUp 0.2s ease",
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 20px", borderBottom: "1px solid var(--outline-variant)",
                background: "var(--surface-container-low)",
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: "20px" }}>notifications_active</span>
                    <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--on-surface)" }}>Notifications</span>
                  </div>
                  {user?.name && (
                    <span style={{ fontSize: "12px", color: "var(--on-surface-variant)", paddingLeft: "28px" }}>
                      Hi, <strong>{user.name.split(" ")[0]}</strong> 👋
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (collegeMessages.length > 0) {
                      const latest = collegeMessages.reduce((a, b) =>
                        new Date(a.createdAt) > new Date(b.createdAt) ? a : b
                      );
                      localStorage.setItem("support_last_seen", latest.createdAt);
                    }
                    setHasUnread(false);
                    setUnreadCount(0);
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", color: "var(--primary)", fontWeight: 600 }}
                >
                  Mark all read
                </button>
              </div>

              <div style={{ overflowY: "auto", maxHeight: "380px" }}>
                {/* College Admin Reply Notifications */}
                {collegeMessages.length > 0 && collegeMessages.slice().reverse().map((msg, i) => {
                  const lastSeen = typeof window !== "undefined" ? localStorage.getItem("support_last_seen") || "" : "";
                  const isNew = !lastSeen || new Date(msg.createdAt) > new Date(lastSeen);
                  return (
                    <div
                      key={`college-${msg.id}`}
                      style={{
                        display: "flex", gap: "12px", padding: "14px 20px",
                        borderBottom: "1px solid var(--outline-variant)",
                        background: isNew ? "rgba(0, 74, 198, 0.04)" : "transparent",
                        transition: "background 0.15s", cursor: "pointer",
                        position: "relative",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--surface-container)"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = isNew ? "rgba(0, 74, 198, 0.04)" : "transparent"}
                    >
                      {/* New indicator dot */}
                      {isNew && (
                        <span style={{
                          position: "absolute", top: "50%", left: "8px",
                          transform: "translateY(-50%)",
                          width: "6px", height: "6px",
                          background: "var(--primary)", borderRadius: "50%",
                        }} />
                      )}
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: "linear-gradient(135deg, rgba(0,74,198,0.15), rgba(106,30,219,0.15))",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        border: "1.5px solid rgba(0,74,198,0.2)",
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "var(--primary)" }}>support_agent</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "11px", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>
                          Message from College Admin
                        </p>
                        <p style={{ fontSize: "13px", lineHeight: 1.4, color: "var(--on-surface)", fontWeight: isNew ? 600 : 400 }}>
                          {msg.text.length > 80 ? msg.text.substring(0, 80) + "..." : msg.text}
                        </p>
                        <p style={{ fontSize: "11px", color: "var(--on-surface-variant)", marginTop: "4px" }}>{timeAgo(msg.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}

                {/* Regular Activity Notifications */}
                {activities.length === 0 && collegeMessages.length === 0 ? (
                  <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--on-surface-variant)" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "48px", display: "block", marginBottom: "8px" }}>notifications_none</span>
                    <p style={{ fontSize: "14px" }}>No notifications yet</p>
                  </div>
                ) : (
                  activities.map((act, i) => (
                    <div
                      key={act.id}
                      style={{
                        display: "flex", gap: "12px", padding: "14px 20px",
                        borderBottom: i < activities.length - 1 ? "1px solid var(--outline-variant)" : "none",
                        transition: "background 0.15s", cursor: "pointer",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--surface-container)"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                    >
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: `${act.color}20` || "var(--surface-container)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "18px", color: act.color || "var(--primary)" }}>
                          {act.icon}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "13px", lineHeight: 1.4, color: "var(--on-surface)" }} dangerouslySetInnerHTML={{ __html: act.text }} />
                        <p style={{ fontSize: "11px", color: "var(--on-surface-variant)", marginTop: "4px" }}>{timeAgo(act.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <Link href="/settings">
          <button
            style={{
              width: "40px", height: "40px", borderRadius: "50%",
              background: "transparent", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--on-surface-variant)", transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-container)"}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        </Link>

        <div style={{ width: "1px", height: "32px", background: "var(--outline-variant)" }} />

        {/* Avatar */}
        <Link href="/profile" style={{ textDecoration: "none" }}>
          <button
            title={user?.name || "Profile"}
            style={{
              display: "flex", alignItems: "center", padding: "4px",
              borderRadius: "50%", background: "transparent", border: "none",
              cursor: "pointer", transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-container)"}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
          >
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: "linear-gradient(135deg, var(--primary), var(--tertiary))",
              color: "white", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: 800,
              boxShadow: "0 2px 8px rgba(0,74,198,0.25)",
            }}>
              {(user?.name || "S").substring(0, 2).toUpperCase()}
            </div>
          </button>
        </Link>
      </div>
    </header>
  );
}
