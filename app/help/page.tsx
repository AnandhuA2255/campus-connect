"use client";
import { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";

const topics = [
  { name: "Getting Started", desc: "New here? Learn the basics of CampusConnect.", icon: "rocket_launch", bg: "rgba(0,74,198,0.1)", color: "var(--primary)" },
  { name: "Registration", desc: "Manage tickets and event sign-ups easily.", icon: "confirmation_number", bg: "rgba(0,108,73,0.1)", color: "var(--secondary)" },
  { name: "Team Building", desc: "Collaborate with fellow student leaders.", icon: "groups_2", bg: "rgba(106,30,219,0.1)", color: "var(--tertiary)" },
  { name: "Privacy & Safety", desc: "Secure your account and manage data.", icon: "lock_person", bg: "var(--error-container)", color: "var(--error)" },
  { name: "Organizer Tools", desc: "Advanced tools for campus event planning.", icon: "construction", bg: "var(--surface-container-high)", color: "var(--primary)" },
];

const faqs = [
  {
    q: "How do I verify my student status?",
    a: "Verification is simple. Navigate to Settings > Identity, upload a clear photo of your student ID, or use your official .edu email for instant verification."
  },
  {
    q: "Can I co-host events with other clubs?",
    a: "Yes! When creating an event, look for the 'Add Co-Host' button in the Organizer Tools section to share co-management permissions with other registered clubs."
  },
  {
    q: "What is the AI Matching algorithm?",
    a: "It's a recommendation engine that matches students with teams based on complementary skill profiles, schedules, and shared event achievements."
  },
  {
    q: "How do I refund ticket sales?",
    a: "Refunds are processed in the Organization dashboard under 'Finance'. Simply choose the registration and trigger a refund. Processing times depend on standard bank cycles."
  }
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0); // Default open first

  // Support Chat States
  const [user, setUser] = useState<any>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Error loading user profile", err);
      }
    };
    fetchUser();
  }, []);

  const fetchMessages = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/support?userId=${user.id}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Error loading chat messages", err);
    }
  };

  // Poll for messages when chat is open
  useEffect(() => {
    if (!chatOpen || !user) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [chatOpen, user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user) return;

    const text = chatInput.trim();
    setChatInput("");

    // Optimistic local update
    const tempMsg = {
      id: Math.random().toString(),
      userId: user.id,
      sender: "STUDENT",
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          text,
          sender: "STUDENT",
        }),
      });
      fetchMessages();
    } catch (err) {
      console.error("Error sending support message", err);
    }
  };

  const filteredTopics = topics.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Support Center">
      <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
        
        {/* Hero Section */}
        <section 
          className="glass-tile"
          style={{ 
            padding: "48px 32px", 
            background: "linear-gradient(180deg, rgba(0, 74, 198, 0.08) 0%, rgba(248, 249, 255, 0.5) 100%)",
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            textAlign: "center",
            gap: "16px",
            border: "1px solid rgba(255,255,255,0.6)"
          }}
        >
          <h2 style={{ fontSize: "36px", fontWeight: 800, color: "var(--on-surface)", letterSpacing: "-0.02em" }}>How can we help you today?</h2>
          <p style={{ fontSize: "16px", color: "var(--on-surface-variant)", maxWidth: "600px", lineHeight: "1.6" }}>
            Search our knowledge base for student guides, organization tools, and technical troubleshooting.
          </p>
          <div style={{ width: "100%", maxWidth: "640px", position: "relative", marginTop: "12px" }}>
            <span className="material-symbols-outlined" style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)", color: "var(--primary)", fontSize: "24px" }}>search</span>
            <input 
              type="text" 
              placeholder="Search for articles, videos, or tutorials..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field hover-lift"
              style={{ 
                paddingLeft: "52px", 
                height: "56px", 
                borderRadius: "16px", 
                backgroundColor: "rgba(255, 255, 255, 0.8)", 
                border: "1px solid rgba(255,255,255,0.8)",
                boxShadow: "0 12px 32px rgba(37,99,235,0.06)" 
              }} 
            />
          </div>
        </section>

        {/* Explore Topics */}
        <section style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 700 }}>Explore Topics</h3>
            <button style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>View All Docs</button>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "20px" }}>
            {filteredTopics.map((topic, i) => (
              <div 
                key={i} 
                className="glass-tile hover-lift" 
                style={{ padding: "24px", cursor: "pointer", display: "flex", flexDirection: "column", gap: "12px", transition: "all 0.2s ease" }}
              >
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: topic.bg, color: topic.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>{topic.icon}</span>
                </div>
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--on-surface)" }}>{topic.name}</h4>
                <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", lineHeight: 1.5 }}>{topic.desc}</p>
              </div>
            ))}
            {filteredTopics.length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "32px", color: "var(--on-surface-variant)" }}>No matching support topics found.</div>
            )}
          </div>
        </section>

        {/* Bento columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }} className="help-columns-lg-cols">

          {/* Left Column: Video Tutorials */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 700 }}>Video Tutorials</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              <div className="glass-tile hover-lift video-card-md-row" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "20px", cursor: "pointer" }}>
                <div style={{ width: "100%", height: "140px", borderRadius: "16px", overflow: "hidden", position: "relative", flexShrink: 0 }} className="video-thumbnail-md-width">
                  <img 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    alt="Tutorial Thumbnail"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBt84of22gzqrVnW9lL9bdtLWAzNdYgm3g4a0-_oKye6l2SsrqkaT5dJR_7CKrAKXYsq6GDSi4SFDcnOp0eJHk12r61sNfnl9pSTweeKgnub1SOqyg3PldsCo2xeeJ6YM7JV0LBvfaqub1sYxXPDxLKJZKkD5j6ZDiatBVmjxL5WD0_82hrIwYFM1fRjcsJMWJCpslA_8B9xS3CS8z69S57CTRl54RaOjwMyU9z5HUWQqnlP2lmBqqHHY2GxQWZkJU9F0eGSVEsWEQ"
                  />
                  <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "white" }}>play_circle</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Technical Guide</span>
                  <h4 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>Mastering QR Check-ins</h4>
                  <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", lineHeight: 1.5 }}>
                    Learn how to manage high-traffic event lines with our instant QR validation flow.
                  </p>
                </div>
              </div>

              <div className="glass-tile hover-lift video-card-md-row" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "20px", cursor: "pointer" }}>
                <div style={{ width: "100%", height: "140px", borderRadius: "16px", overflow: "hidden", position: "relative", flexShrink: 0 }} className="video-thumbnail-md-width">
                  <img 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    alt="Tutorial Thumbnail"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCI4V1V9_KCur9XoQc6TjR5IzEC_yLqZ8_UXrChP3iW4IuFbTfps2u78BC3uQWc10kc4TA49ok32X59xWk4211ZH8KGQ6h6dNoStq3qJtsI1zZ9rrr3YEvAdBqvZBivm1LnPzLfdZaYJZ33P5cB1XcE6nAu9HgnucAqtkYETkzKdaD9K_DQeOEO9SiE5BKQ4WNasHQc8qxrZK9OWH8En-f52Lz7SWxqPXWfr0hRp42FyNTMkrB6PqUI74OO_YiqBgZe5SFt_-Nv5nM"
                  />
                  <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "white" }}>play_circle</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Product Feature</span>
                  <h4 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>AI-Powered Networking</h4>
                  <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", lineHeight: 1.5 }}>
                    Discover how our recommendation algorithms pair complementary skillsets for projects.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: FAQ Accordion */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 700 }}>Popular Questions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div 
                    key={i} 
                    className="glass-tile" 
                    style={{ borderRadius: "16px", overflow: "hidden", transition: "all 0.2s ease" }}
                  >
                    <button 
                      onClick={() => toggleFaq(i)}
                      style={{ 
                        width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", 
                        padding: "20px", border: "none", background: "none", cursor: "pointer", textAlign: "left" 
                      }}
                    >
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--on-surface)" }}>{faq.q}</span>
                      <span className="material-symbols-outlined" style={{ color: "var(--outline)", transition: "transform 0.2s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>expand_more</span>
                    </button>
                    
                    <div 
                      style={{ 
                        maxHeight: isOpen ? "160px" : 0, 
                        overflow: "hidden", 
                        transition: "all 0.3s ease-in-out",
                        padding: isOpen ? "0 20px 20px" : "0 20px"
                      }}
                    >
                      <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", lineHeight: 1.5 }}>
                        {faq.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Support channels */}
        <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "6px" }}>Still need help?</h3>
            <p style={{ fontSize: "14px", color: "var(--on-surface-variant)" }}>Our team is available 24/7 to support your campus journey.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            
            <div className="glass-tile" style={{ padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "rgba(0,108,73,0.1)", color: "var(--secondary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>chat_bubble</span>
              </div>
              <h4 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Live Chat</h4>
              <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", marginBottom: "24px", lineHeight: 1.5 }}>
                Connect with a support agent in real-time. Average wait: 2 mins.
              </p>
              <button 
                onClick={() => setChatOpen(true)}
                className="btn-primary" 
                style={{ marginTop: "auto", padding: "10px 32px", borderRadius: "9999px" }}
              >
                Start Chat
              </button>
            </div>

            <div className="glass-tile" style={{ padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "rgba(0, 74, 198, 0.08)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>mail</span>
              </div>
              <h4 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Email Support</h4>
              <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", marginBottom: "24px", lineHeight: 1.5 }}>
                Detailed queries? Send us an email and we'll reply within 24 hours.
              </p>
              <button 
                onClick={() => alert("Opening email dialog...")}
                className="btn-ghost" 
                style={{ marginTop: "auto", padding: "10px 32px", borderRadius: "9999px", fontWeight: 700 }}
              >
                Contact Us
              </button>
            </div>

            <div className="glass-tile" style={{ padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "rgba(106, 30, 219, 0.08)", color: "var(--tertiary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>forum</span>
              </div>
              <h4 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Community Forum</h4>
              <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", marginBottom: "24px", lineHeight: 1.5 }}>
                Ask fellow students and leaders in our vibrant community space.
              </p>
              <button 
                onClick={() => alert("Redirecting to Community Forum...")}
                className="btn-ghost" 
                style={{ marginTop: "auto", padding: "10px 32px", borderRadius: "9999px", fontWeight: 700 }}
              >
                Visit Forum
              </button>
            </div>

          </div>
        </section>

      </div>

      {/* Floating Support Chat Window */}
      {chatOpen && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "360px",
          height: "460px",
          borderRadius: "20px",
          boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid var(--outline-variant)",
          animation: "modalIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }} className="glass-tile">
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, var(--primary) 0%, var(--tertiary) 100%)",
            padding: "16px 20px",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>chat_bubble</span>
              <span style={{ fontWeight: 700, fontSize: "14px" }}>CampusConnect Support Chat</span>
            </div>
            <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
            </button>
          </div>
          
          {/* Messages Container */}
          <div style={{
            flex: 1,
            padding: "16px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}>
            {messages.length === 0 ? (
              <div style={{ margin: "auto", textAlign: "center", color: "var(--on-surface-variant)", fontSize: "12px", padding: "20px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "36px", marginBottom: "8px", display: "block", color: "var(--primary)" }}>forum</span>
                Hello! How can we help you? Send a message to start chatting with college support.
              </div>
            ) : (
              messages.map((msg: any) => {
                const isStudent = msg.sender === "STUDENT";
                return (
                  <div key={msg.id} style={{
                    alignSelf: isStudent ? "flex-end" : "flex-start",
                    maxWidth: "80%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isStudent ? "flex-end" : "flex-start",
                  }}>
                    <div style={{
                      backgroundColor: isStudent ? "var(--primary)" : "var(--surface-container-highest)",
                      color: isStudent ? "white" : "var(--on-surface)",
                      padding: "10px 14px",
                      borderRadius: isStudent ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                      fontSize: "13px",
                      lineHeight: 1.4,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                    }}>
                      {msg.text}
                    </div>
                    <span style={{ fontSize: "9px", color: "var(--on-surface-variant)", marginTop: "4px", padding: "0 4px" }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Footer */}
          <form onSubmit={handleSendMessage} style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--outline-variant)",
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                height: "36px",
                borderRadius: "18px",
                border: "1px solid var(--outline-variant)",
                padding: "0 12px",
                fontSize: "13px",
                outline: "none",
                background: "var(--surface)",
                color: "var(--on-surface)",
              }}
            />
            <button type="submit" style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "var(--primary)",
              border: "none",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>send</span>
            </button>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
