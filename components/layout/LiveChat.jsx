"use client";
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";

// --- Constants ---
const LOCAL_STORAGE_KEY = "chat-widget-history";

// --- Utility Functions ---
const saveToLocalStorage = (data) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
};

const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return null;
  }
};

// --- Sub-components ---
const ChatHeader = ({ onMinimize, onClose, isConnected }) => (
  <div className="bg-blue-600 p-4 text-white rounded-t-xl flex justify-between items-center shadow-lg relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 animate-pulse"></div>
    <div className="flex items-center space-x-3 relative z-10">
      <div className="relative">
        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
          <Icon icon="mdi:headset" width="20" className="text-white" />
        </div>
        <span
          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white transition-colors duration-300 ${
            isConnected ? "bg-green-400" : "bg-orange-400"
          }`}
        ></span>
      </div>
      <div>
        <h3 className="font-bold text-base">Customer Support</h3>
        <p className="text-xs text-white/80">
          {isConnected
            ? "Online • We're here to help!"
            : "Connecting to support..."}
        </p>
      </div>
    </div>
    <div className="flex space-x-2 relative z-10">
      <button
        onClick={onMinimize}
        className="hover:bg-white/20 p-2 rounded-full transition-all duration-200 hover:scale-110"
        title="Minimize"
      >
        <Icon icon="mdi:window-minimize" width="16" />
      </button>
      <button
        onClick={onClose}
        className="hover:bg-white/20 p-2 rounded-full transition-all duration-200 hover:scale-110"
        title="Close"
      >
        <Icon icon="mdi:close" width="16" />
      </button>
    </div>
  </div>
);

const MessageList = ({ messages, isTyping }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon
              icon="mdi:account-heart"
              width="24"
              className="text-blue-500"
            />
          </div>
          <h4 className="font-semibold text-gray-800 mb-2">Welcome! 👋</h4>
          <p className="text-sm text-gray-600 max-w-xs">
            Our support team is here to help. Send us a message and we'll get
            back to you right away!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50">
      {messages.map((msg, index) => {
        if (msg.sender === "system") {
          return (
            <div key={msg.id || index} className="text-center">
              <div className="inline-block bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full border border-yellow-200">
                {msg.text}
              </div>
            </div>
          );
        }

        const isCustomer = msg.sender === "customer";
        return (
          <div
            key={msg.id || index}
            className={`flex items-end gap-3 ${
              isCustomer ? "justify-end" : "justify-start"
            } group`}
          >
            {!isCustomer && (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon
                  icon="mdi:account-tie"
                  width="16"
                  className="text-white"
                />
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                isCustomer
                  ? " bg-blue-500 text-white rounded-br-md"
                  : "bg-white text-gray-800 rounded-bl-md border border-gray-100"
              }`}
            >
              <p className="text-sm leading-relaxed break-words">{msg.text}</p>
              <p
                className={`text-xs mt-2 ${
                  isCustomer ? "text-blue-100" : "text-gray-400"
                }`}
              >
                {formatTime(msg.timestamp)}
              </p>
            </div>
            {isCustomer && (
              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon icon="mdi:account" width="16" className="text-white" />
              </div>
            )}
          </div>
        );
      })}

      {isTyping && (
        <div className="flex items-end gap-3 justify-start group">
          <div className="w-8 h-8  bg-blue-500 rounded-full flex items-center justify-center">
            <Icon icon="mdi:account-tie" width="16" className="text-white" />
          </div>
          <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

const ChatInput = ({ onSend, disabled }) => {
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim() && !disabled) {
      onSend(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200 rounded-b-xl">
      <div className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={disabled}
            className="w-full bg-gray-100 border-0 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 disabled:opacity-50 pr-12"
          />
          {inputValue && (
            <button
              onClick={() => setInputValue("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon icon="mdi:close-circle" width="16" />
            </button>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || !inputValue.trim()}
          className="bg-blue-500 text-white rounded-2xl p-3 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg disabled:hover:scale-100"
          title="Send message"
        >
          <Icon icon="mdi:send" width="18" />
        </button>
      </div>
      {disabled && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Connecting to chat...
        </p>
      )}
    </div>
  );
};

// --- Main Chat Widget Component ---
const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [isChatActive, setIsChatActive] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const retryCount = useRef(0);
  const maxRetries = 5;
  const isChatActiveRef = useRef(true);

  // Load chat history on component mount
  useEffect(() => {
    const savedHistory = loadFromLocalStorage();
    if (savedHistory && savedHistory.sessionId && savedHistory.messages) {
      setMessages(savedHistory.messages);
      setSessionId(savedHistory.sessionId);
      setIsChatActive(savedHistory.isChatActive !== false);
    }
  }, []);

  // Save chat history whenever it changes
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      const historyData = {
        sessionId,
        messages,
        isChatActive,
        lastSaved: new Date().toISOString(),
      };
      saveToLocalStorage(historyData);
    }
  }, [sessionId, messages, isChatActive]);

  useEffect(() => {
    isChatActiveRef.current = isChatActive;
  }, [isChatActive]);

  const connectWebSocket = (existingSessionId = null) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus("connecting");

    let wsUrl = "ws://api.topdivers.online/chat/ws/customer";
    if (existingSessionId) {
      wsUrl += `?session_id=${existingSessionId}`;
    }

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      setConnectionStatus("connected");
      retryCount.current = 0;
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "session_created":
            const newSessionId = data.session_id;
            if (sessionId !== newSessionId) {
              // New session - clear old messages if they don't belong to this session
              if (!existingSessionId) {
                setMessages([]);
              }
              setIsChatActive(true);
            }
            setSessionId(newSessionId);
            break;

          case "message":
            setIsTyping(false);
            setMessages((prev) => [...prev, data.message]);
            break;

          case "chat_closed":
            const systemMessage = {
              id: Date.now(),
              sender: "system",
              text: data.message || "Chat session ended",
              timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, systemMessage]);
            setIsChatActive(false);
            break;

          case "agent_typing_start":
            setIsTyping(true);
            break;

          case "agent_typing_end":
            setIsTyping(false);
            break;
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    wsRef.current.onclose = (event) => {
      setIsConnected(false);
      setIsTyping(false);

      if (event.code === 1000) {
        // Normal closure
        setConnectionStatus("disconnected");
      } else {
        setConnectionStatus("error");

        // Attempt reconnection
        if (
          retryCount.current < maxRetries &&
          isOpen &&
          isChatActiveRef.current
        ) {
          const delay = Math.min(Math.pow(2, retryCount.current) * 1000, 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            retryCount.current++;
            connectWebSocket(sessionId);
          }, delay);
        }
      }
    };

    wsRef.current.onerror = () => {
      setConnectionStatus("error");
    };
  };

  const disconnectWebSocket = () => {
    clearTimeout(reconnectTimeoutRef.current);
    if (wsRef.current) {
      wsRef.current.close(1000, "User closed chat");
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsTyping(false);
    setConnectionStatus("disconnected");
  };

  const openChat = () => {
    setIsOpen(true);
    setIsMinimized(false);

    // Connect with existing session if available
    if (!isConnected) {
      connectWebSocket(sessionId);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
    disconnectWebSocket();

    // Clear everything and start fresh next time
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setMessages([]);
    setSessionId(null);
    setIsChatActive(true);
  };

  const minimizeChat = () => {
    setIsMinimized(!isMinimized);
  };

  const sendMessage = (text) => {
    if (!text.trim() || !isConnected || !isChatActive) return;

    const userMessage = {
      id: Date.now(),
      sender: "customer",
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    const messageData = {
      type: "message",
      text: text.trim(),
    };

    wsRef.current.send(JSON.stringify(messageData));
  };

  // Show tooltip after component mounts
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Hide tooltip when chat opens
  useEffect(() => {
    if (isOpen) {
      setShowTooltip(false);
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Button */}
      <div className="relative">
        <button
          onClick={openChat}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => !isOpen && setShowTooltip(false)}
          className={`relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-2xl transition-all duration-300 ease-out overflow-hidden group ${
            isOpen
              ? "p-3 opacity-0 scale-50 pointer-events-none"
              : "p-4 opacity-100 scale-100 hover:scale-110 hover:shadow-xl"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Icon
            icon="mdi:message-text-outline"
            width="28"
            className="relative z-10"
          />
        </button>

        {/* Pulse Animation */}
        {!isOpen && (
          <div className="absolute top-0 left-0 w-full h-full bg-blue-500 rounded-full animate-ping opacity-75 -z-10"></div>
        )}

        {/* Hover Tooltip */}
        {showTooltip && !isOpen && (
          <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap transform transition-all duration-200 animate-fade-in">
            💬 Need help? Chat with support!
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200/50 flex flex-col transition-all duration-300 ease-out overflow-hidden ${
          isOpen
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-10 scale-95 pointer-events-none"
        } ${isMinimized ? "h-16" : "h-[600px]"}`}
      >
        <ChatHeader
          onMinimize={minimizeChat}
          onClose={closeChat}
          isConnected={isConnected}
        />

        {!isMinimized && (
          <>
            <MessageList messages={messages} isTyping={isTyping} />
            {isChatActive ? (
              <ChatInput onSend={sendMessage} disabled={!isConnected} />
            ) : (
              <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  This support chat has ended. Thank you for contacting us!
                </p>
                <button
                  onClick={() => {
                    setMessages([]);
                    setSessionId(null);
                    setIsChatActive(true);
                    localStorage.removeItem(LOCAL_STORAGE_KEY);
                    if (isConnected) {
                      connectWebSocket();
                    }
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                >
                  Start New Support Chat
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatWidget;
