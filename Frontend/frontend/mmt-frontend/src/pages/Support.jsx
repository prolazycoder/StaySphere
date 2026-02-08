import React, { useState, useEffect, useRef } from "react";
import { FaHeadset, FaPaperPlane, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../dashboard.css";

export default function Support() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! Welcome to StaySphere Support. How can I help you today?",
      sender: "agent",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = {
      id: messages.length + 1,
      text: input,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate Agent Reply
    setTimeout(() => {
      const agentMsg = {
        id: messages.length + 2,
        text: getAutomatedReply(userMsg.text),
        sender: "agent",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const getAutomatedReply = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes("refund")) return "I can help with refunds. Please provide your Booking ID.";
    if (lower.includes("book")) return "You can book hotels or cabs directly from the dashboard.";
    if (lower.includes("hotel")) return "Are you looking to register a hotel or book one?";
    if (lower.includes("cab")) return "We have excellent cab partners available in major cities.";
    return "Thanks for reaching out. An agent will review your query shortly.";
  };

  return (
    <div className="app-root">
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <main className="content">
          <div className="page-wrapper">
            <div className="registration-container" style={{ maxWidth: '600px' }}>
              <button className="back-btn" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Back
              </button>
              <h1 className="page-title">Chat Support</h1>
              <p className="page-subtitle">We are here to help you 24/7.</p>

              <div className="chat-window">
                {/* Header */}
                <div className="chat-header">
                  <div className="agent-avatar">
                    <FaHeadset />
                  </div>
                  <div className="agent-info">
                    <h4>Support Agent</h4>
                    <div className="agent-status">
                      <span className="status-dot"></span> Online
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="chat-messages">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`message-bubble ${msg.sender}`}>
                      {msg.text}
                      <span className="message-time">{msg.time}</span>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="typing-indicator">
                      Agent is typing...
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form className="chat-input-area" onSubmit={handleSend}>
                  <div className="chat-input-wrapper">
                    <input
                      type="text"
                      className="chat-input"
                      placeholder="Type your message..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="send-btn" disabled={!input.trim()}>
                    <FaPaperPlane />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
