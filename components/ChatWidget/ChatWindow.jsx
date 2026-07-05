"use client";
import MarkdownRenderer from "@/components/ui/MarkdownRender";
import { Icon } from "@iconify/react";
import Cookies from "js-cookie";
import { useCallback, useEffect, useRef, useState } from "react";
import { ROLE_USER } from "./types";
import useChatStream from "./useChatStream";

const QUICK_REPLIES = [
  "Best sellers",
  "My bookings",
  "Bundles & discounts",
  "Talk to a human",
];

export default function ChatWindow() {
  const { messages, isLoading, error, sendMessage, resetSession } =
    useChatStream();

  const [input, setInput] = useState("");
  const [isNearBottom, setIsNearBottom] = useState(true);
  const containerRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll when new content arrives (unless user scrolled up)
  useEffect(() => {
    if (!isNearBottom || !containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages, isNearBottom]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const threshold = 100;
    setIsNearBottom(
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold,
    );
  }, []);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    sendMessage(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  };

  const isAuthenticated =
    typeof window !== "undefined" &&
    (() => {
      try {
        const stored = Cookies.get("auth-storage");
        if (!stored) return false;
        return JSON.parse(stored)?.state?.isAuthenticated ?? false;
      } catch {
        return false;
      }
    })();

  // --- Empty state ---
  if (messages.length === 0 && !isLoading && !error) {
    return (
      <>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-y-auto z-[99999]">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center mb-4">
            <Icon icon="mdi:robot" className="w-7 h-7 text-cyan-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            TopDivers Assistant
          </h3>
          <p className="text-sm text-gray-500 text-center mb-6 max-w-xs">
            Hi! I can help you find the perfect diving trip, answer questions
            about bundles, check your bookings, and more.
          </p>

          <div className="flex flex-wrap justify-center gap-2 w-full max-w-xs">
            {QUICK_REPLIES.map((text) => (
              <button
                key={text}
                onClick={() => sendMessage(text)}
                className="px-4 py-2 rounded-full border border-cyan-200 text-cyan-700 text-sm font-medium hover:bg-cyan-50 hover:border-cyan-300 transition-all"
              >
                {text}
              </button>
            ))}
          </div>

          {!isAuthenticated && (
            <p className="mt-6 text-xs text-gray-400">
              <a
                href="/login/"
                className="text-cyan-600 underline underline-offset-2 hover:text-cyan-700"
              >
                Sign in
              </a>{" "}
              for personalized booking assistance
            </p>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-gray-200 px-3 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md transition-all"
              aria-label="Send"
            >
              <Icon icon="mdi:send" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === ROLE_USER ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] ${
                msg.role === ROLE_USER
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm"
              } px-4 py-2.5`}
            >
              {msg.role === ROLE_USER ? (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="text-sm prose prose-sm max-w-none">
                  {msg.content ? (
                    <MarkdownRenderer content={msg.content} />
                  ) : null}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && messages[messages.length - 1]?.role === ROLE_USER && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%]">
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center max-w-xs">
              <p className="text-sm text-red-700 mb-2">{error}</p>
              <button
                onClick={resetSession}
                className="text-xs text-red-600 underline underline-offset-2 hover:text-red-700"
              >
                Start new conversation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Auth hint */}
      {!isAuthenticated && messages.length > 0 && !error && (
        <div className="shrink-0 px-4 py-2 bg-cyan-50 border-t border-cyan-100">
          <p className="text-xs text-cyan-700 text-center">
            <a
              href="/login/"
              className="font-medium underline underline-offset-2 hover:text-cyan-800"
            >
              Sign in
            </a>{" "}
            for personalized booking assistance
          </p>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 border-t border-gray-200 px-3 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md transition-all"
            aria-label="Send"
          >
            <Icon icon="mdi:send" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
