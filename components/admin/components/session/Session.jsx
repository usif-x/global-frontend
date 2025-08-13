"use client";
import "@/styles/chatwidget.css"; // Make sure you have this CSS file
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

const SessionItem = ({
  session,
  isSelected,
  isUnread,
  onSelect,
  onDismiss,
}) => {
  const getStatusInfo = (status) => {
    switch (status) {
      case "active":
        return { color: "bg-green-500", text: "Active" };
      case "closed":
        return { color: "bg-yellow-500", text: "Closed" };
      case "ended":
        return { color: "bg-slate-400", text: "Ended" };
      default:
        return { color: "bg-slate-400", text: "Unknown" };
    }
  };
  const statusInfo = getStatusInfo(session.status);

  const handleDismiss = (e) => {
    e.stopPropagation();
    onDismiss(session.id);
  };

  return (
    <div
      onClick={() => onSelect(session.id)}
      className={`group p-3 cursor-pointer flex items-start gap-3 border-l-4 transition-colors ${
        isSelected
          ? "border-blue-600 bg-blue-50"
          : "border-transparent hover:bg-slate-50"
      }`}
    >
      <div className="relative flex-shrink-0">
        <div
          className={`w-3 h-3 mt-1.5 rounded-full ${statusInfo.color}`}
        ></div>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold text-slate-800 truncate">
            Session #{session.id.slice(-6)}
          </p>
          {session.status !== "active" && (
            <button
              onClick={handleDismiss}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
              aria-label="Dismiss session"
            >
              <Icon icon="mdi:close-circle" width="18" />
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 truncate">
          {session.customer_ip} • {session.browser}
        </p>
        <div className="flex justify-between items-center mt-2 text-xs">
          <p className="text-slate-400">
            {new Date(session.started_at).toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            {isUnread && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            )}
            <p className="font-medium text-blue-600">
              {session.message_count || 0} messages
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ADDED onEndSession and onCloseChat props
const ChatWindow = ({
  session,
  messages,
  onSendMessage,
  isConnected,
  onEndSession,
  onCloseChat,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center flex-shrink-0">
        <div>
          <h3 className="font-bold text-slate-800">
            Chat with Session #{session.id.slice(-6)}
          </h3>
          <p className="text-sm text-slate-500">
            {session.customer_ip} • {session.browser} • {session.device}
          </p>
        </div>
        {/* ACTION BUTTONS ARE NOW HERE */}
        {session.status === "active" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onCloseChat(session.id)}
              className="px-3 py-1.5 bg-yellow-500 text-white text-xs font-semibold rounded-md hover:bg-yellow-600 transition-colors"
            >
              Close Chat
            </button>
            <button
              onClick={() => onEndSession(session.id)}
              className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-md hover:bg-red-700 transition-colors"
            >
              End Session
            </button>
          </div>
        )}
      </header>

      <div className="chat-message-list flex-1 p-6 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end gap-2 ${
              message.sender === "admin" ? "justify-end" : "justify-start"
            }`}
          >
            {message.sender !== "admin" && (
              <Icon
                icon="mdi:account-circle"
                width="32"
                className="text-slate-300 self-start"
              />
            )}
            <div
              className={`max-w-[70%] px-4 py-2.5 rounded-xl ${
                message.sender === "admin"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : message.sender === "system"
                  ? "w-full bg-slate-200 text-slate-600 text-center text-xs"
                  : "bg-white text-slate-800 rounded-bl-none shadow-sm"
              }`}
            >
              <p className="text-sm break-words">{message.text}</p>
              {message.sender !== "system" && (
                <p
                  className={`text-xs mt-1.5 opacity-70 ${
                    message.sender === "admin" ? "text-right" : "text-left"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {session.status === "active" ? (
        <div className="bg-white border-t border-slate-200 p-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message as an admin..."
              disabled={!isConnected}
              className="w-full bg-slate-100 border-transparent rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!isConnected || !newMessage.trim()}
              className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Icon icon="mdi:send" width="20" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-100 border-t border-slate-200 p-4 text-center text-slate-500 flex-shrink-0">
          <p>This session is {session.status}. No new messages can be sent.</p>
        </div>
      )}
    </div>
  );
};

const AdminChatDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({});
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [loading, setLoading] = useState(false);

  const [dismissedSessions, setDismissedSessions] = useState(new Set());
  const [unreadSessions, setUnreadSessions] = useState(new Set());

  const wsRef = useRef(null);
  const selectedSessionRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    selectedSessionRef.current = selectedSession;
    if (selectedSession) {
      setUnreadSessions((prev) => {
        const newUnread = new Set(prev);
        newUnread.delete(selectedSession.id);
        return newUnread;
      });
    }
  }, [selectedSession]);

  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = () => {
      fetchSessions();
      fetchStats();
    };

    fetchInitialData();

    function connect() {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      const ws = new WebSocket("ws://api.topdivers.online/chat/ws/admin");
      wsRef.current = ws;

      if (isMounted) {
        setConnectionStatus("connecting");
      }

      ws.onopen = () => {
        if (isMounted) {
          setIsConnected(true);
          setConnectionStatus("connected");
        }
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;
        const data = JSON.parse(event.data);

        if (data.type === "new_message") {
          if (data.message.sender === "admin") return;
          setSessions((prev) =>
            prev.map((s) =>
              s.id === data.session_id
                ? { ...s, message_count: (s.message_count || 0) + 1 }
                : s
            )
          );
          if (selectedSessionRef.current?.id === data.session_id) {
            setMessages((prev) => [...prev, data.message]);
          } else {
            setUnreadSessions((prev) => new Set(prev).add(data.session_id));
          }
        } else if (data.type === "new_session") {
          setSessions((prev) => [data.session, ...prev]);
        } else if (
          data.type === "session_ended" ||
          data.type === "chat_closed"
        ) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === data.session_id
                ? {
                    ...s,
                    status: data.type === "session_ended" ? "ended" : "closed",
                  }
                : s
            )
          );
          if (selectedSessionRef.current?.id === data.session_id) {
            setSelectedSession((prev) =>
              prev
                ? {
                    ...prev,
                    status: data.type === "session_ended" ? "ended" : "closed",
                  }
                : null
            );
          }
        } else if (data.type === "initial_sessions") {
          setSessions(data.sessions || []);
        }
      };

      ws.onclose = () => {
        if (isMounted) {
          setIsConnected(false);
          setConnectionStatus("disconnected");
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      };

      ws.onerror = (error) => {
        if (isMounted) {
          console.error("WebSocket Error:", error);
          setConnectionStatus("error");
        }
      };
    }

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("http://api.topdivers.online/chat/sessions");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("http://api.topdivers.online/chat/stats");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchSessionMessages = async (sessionId) => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const response = await fetch(
        `http://api.topdivers.online/chat/sessions/${sessionId}`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setMessages(data.messages || []);
      setSelectedSession({
        id: data.id,
        customer_ip: data.customer_ip,
        browser: data.browser,
        device: data.device,
        status: data.status,
        started_at: data.started_at,
        message_count: data.message_count,
      });
    } catch (error) {
      console.error("Failed to fetch session messages:", error);
      alert("Failed to load session messages.");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (text) => {
    if (!text.trim() || !isConnected || !selectedSession) return;
    const optimisticMessage = {
      id: Date.now(),
      sender: "admin",
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSession.id
          ? { ...s, message_count: (s.message_count || 0) + 1 }
          : s
      )
    );
    const messageToSend = {
      type: "message",
      session_id: selectedSession.id,
      text: text.trim(),
    };
    wsRef.current.send(JSON.stringify(messageToSend));
  };

  const closeChat = async (sessionId) => {
    try {
      const response = await fetch(
        `http://api.topdivers.online/chat/sessions/${sessionId}/close-chat`,
        { method: "POST" }
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      console.error("Failed to close chat:", error);
      alert("Failed to close chat. Please try again.");
    }
  };

  // NEW: Function to end the session
  const endSession = async (sessionId) => {
    if (
      Swal.isVisible() || // fixed
      !sessionId ||
      !wsRef.current ||
      connectionStatus !== "connected"
    ) {
      Swal.fire({
        icon: "info",
        title: "Action not allowed",
        text: "Please ensure you are connected and a session is selected.",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
        backdrop: true,
      });
      return;
    }

    try {
      const response = await fetch(
        `http://api.topdivers.online/chat/sessions/${sessionId}/end-session`,
        { method: "POST" }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to end session:", error);
      alert("Failed to end session. Please try again.");
    }
  };

  const handleDismissSession = (sessionId) => {
    setDismissedSessions((prev) => new Set(prev).add(sessionId));
    if (selectedSession?.id === sessionId) {
      setSelectedSession(null);
      setMessages([]);
    }
  };

  const visibleSessions = sessions.filter((s) => !dismissedSessions.has(s.id));

  return (
    <div className="h-screen bg-slate-100 flex font-sans">
      <aside className="w-96 bg-white border-r border-slate-200 flex flex-col h-full">
        <header className="p-4 border-b border-slate-200 flex-shrink-0">
          <h1 className="text-xl font-bold text-slate-800">
            Live Chat Sessions
          </h1>
          <p className="text-sm text-slate-500">
            {visibleSessions.length} visible sessions • {connectionStatus}
          </p>
        </header>
        <div className="flex-1 overflow-y-auto">
          {visibleSessions.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {visibleSessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isSelected={selectedSession?.id === session.id}
                  isUnread={unreadSessions.has(session.id)}
                  onSelect={fetchSessionMessages}
                  onDismiss={handleDismissSession}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <Icon
                icon="mdi:chat-sleep-outline"
                width="48"
                className="mx-auto mb-4"
              />
              <p>No active sessions</p>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Icon
              icon="line-md:loading-twotone-loop"
              className="h-12 w-12 text-blue-600"
            />
          </div>
        ) : selectedSession ? (
          <ChatWindow
            session={selectedSession}
            messages={messages}
            onSendMessage={sendMessage}
            isConnected={isConnected}
            onCloseChat={closeChat}
            onEndSession={endSession}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-center text-slate-400">
            <div>
              <Icon
                icon="mdi:chat-processing-outline"
                width="64"
                className="mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold mb-1">Select a session</h3>
              <p>Choose a chat from the sidebar to view messages.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminChatDashboard;
