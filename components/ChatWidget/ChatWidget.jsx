"use client";
import { useState } from "react";
import { Icon } from "@iconify/react";
import ChatWindow from "./ChatWindow";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating action button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[1001] w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
          aria-label="Open chat"
        >
          <Icon icon="mdi:chat" className="w-6 h-6" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-[1001] md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div
            className={`
              fixed z-[1002] flex flex-col bg-white overflow-hidden
              /* Mobile: full-screen sheet */
              inset-0
              /* Desktop: fixed-size card */
              md:inset-auto md:bottom-24 md:right-6
              md:w-96 md:h-[600px] md:rounded-2xl
              md:shadow-2xl md:border md:border-gray-200
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Icon icon="mdi:robot" className="w-5 h-5 shrink-0" />
                <span className="font-medium text-sm truncate">
                  TopDivers Assistant
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors shrink-0"
                aria-label="Close chat"
              >
                <Icon icon="mdi:close" className="w-5 h-5" />
              </button>
            </div>

            {/* Chat body */}
            <ChatWindow />
          </div>
        </>
      )}
    </>
  );
}
