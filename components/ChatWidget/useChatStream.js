"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import Cookies from "js-cookie";
import { ROLE_USER, ROLE_ASSISTANT } from "./types";

const SESSION_KEY = "topdivers_chat_session_id";
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const getAuthHeaders = () => {
  try {
    const stored = Cookies.get("auth-storage");
    if (!stored) return {};
    const token = JSON.parse(stored)?.state?.token;
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
};

const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  }
};

const mapHistoryMessage = (m) => ({
  id: generateId(),
  role: m.role === "user" ? ROLE_USER : ROLE_ASSISTANT,
  content: m.content,
  timestamp: Date.now(),
});

export default function useChatStream() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const abortRef = useRef(null);
  const initRef = useRef(false);

  // On mount: restore session from localStorage and load history
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      setSessionId(saved);
      loadHistory(saved);
    }
  }, []);

  // Abort in-flight requests on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const loadHistory = async (sid) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/chat/session/${encodeURIComponent(sid)}/history`,
        { headers: { ...getAuthHeaders() } },
      );
      if (!res.ok) {
        localStorage.removeItem(SESSION_KEY);
        setSessionId(null);
        return;
      }
      const data = await res.json();
      if (data.messages?.length) {
        setMessages(data.messages.map(mapHistoryMessage));
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
      setSessionId(null);
    }
  };

  const persistSession = (sid) => {
    if (!sid) return;
    setSessionId(sid);
    localStorage.setItem(SESSION_KEY, sid);
  };

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text?.trim();
      if (!trimmed || isLoading) return;

      const userMsg = {
        id: generateId(),
        role: ROLE_USER,
        content: trimmed,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setError(null);

      const payload = {
        message: trimmed,
        session_id: sessionId || null,
      };

      let handled = false;
      let pendingAssistantId = null;
      const controller = new AbortController();
      abortRef.current = controller;

      // ----- try SSE streaming -----
      try {
        const res = await fetch(`${API_BASE}/api/chat/message/stream`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop();

          for (const part of parts) {
            const lines = part.split("\n");
            let eventType = "";
            let data = "";

            for (const line of lines) {
              if (line.startsWith("event: "))
                eventType = line.slice(7).trim();
              else if (line.startsWith("data: ")) data = line.slice(6);
            }

            if (eventType === "session_id" && data) {
              persistSession(data);
            } else if (eventType === "message" && data) {
              if (!pendingAssistantId) {
                pendingAssistantId = generateId();
                setMessages((prev) => [
                  ...prev,
                  {
                    id: pendingAssistantId,
                    role: ROLE_ASSISTANT,
                    content: data,
                    timestamp: Date.now(),
                  },
                ]);
              } else {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === pendingAssistantId
                      ? { ...m, content: m.content + data }
                      : m,
                  ),
                );
              }
            }
          }
        }

        // If stream ended but no content arrived, remove the empty placeholder
        if (pendingAssistantId) {
          setMessages((prev) => {
            const m = prev.find((x) => x.id === pendingAssistantId);
            if (m && !m.content) {
              return prev.filter((x) => x.id !== pendingAssistantId);
            }
            return prev;
          });
        }

        handled = true;
      } catch (err) {
        if (err.name === "AbortError") return;
        if (pendingAssistantId) {
          setMessages((prev) =>
            prev.filter((m) => m.id !== pendingAssistantId),
          );
        }
        console.warn("SSE streaming failed, falling back:", err.message);
      } finally {
        abortRef.current = null;
      }

      // ----- fallback to non-streaming -----
      if (!handled) {
        try {
          const res = await fetch(`${API_BASE}/api/chat/message`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
            body: JSON.stringify(payload),
          });

          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const data = await res.json();
          if (data.session_id) persistSession(data.session_id);

          setMessages((prev) => [
            ...prev,
            {
              id: generateId(),
              role: ROLE_ASSISTANT,
              content: data.reply || "",
              timestamp: Date.now(),
            },
          ]);
        } catch (err) {
          setError(
            "Network error. Please check your connection and try again.",
          );
        }
      }

      setIsLoading(false);
    },
    [sessionId, isLoading],
  );

  const resetSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSessionId(null);
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sessionId, sendMessage, resetSession };
}
