import React, { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ChatOutput component for rendering chat messages with Markdown and typing indicator
// Smooth auto-scrolling is enabled when new messages are added, unless the user has scrolled up
const ChatOutput = ({ messages = [], typingMessage, messagesEndRef }) => {
  const containerRef = useRef(null);
  const userScrolled = useRef(false);

  // Log scroll events for debugging (optional, can be removed in production)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const logScroll = () => {
      console.log("ChatOutput: Scroll event detected", {
        scrollTop: container.scrollTop,
        scrollHeight: container.scrollHeight,
        clientHeight: container.clientHeight,
      });
    };

    container.addEventListener("scroll", logScroll);
    return () => container.removeEventListener("scroll", logScroll);
  }, []);

  // Detect user-initiated scrolling to determine if auto-scroll should be disabled
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isAtBottom =
        Math.abs(
          container.scrollHeight - container.scrollTop - container.clientHeight
        ) < 10;
      userScrolled.current = !isAtBottom;
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll to bottom when messages or typingMessage change, unless user has scrolled up
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Only auto-scroll if the user hasn't scrolled up
    if (!userScrolled.current) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, typingMessage]);

  const renderMessageContent = (content) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children }) {
            // Removed invalid `彼此: true`
            const match = /language-(\w+)/.exec(className || "");
            return !inline ? (
              <div className="my-4 rounded bg-[#1e1e1e] text-gray-100 max-w-full">
                <div className="flex items-center justify-between px-4 py-2 bg-[#202123] text-gray-300 text-xs">
                  <span className="font-mono font-medium">
                    {match ? match[1] : "code"}
                  </span>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(String(children).trim())
                    }
                    className="hover:bg-[#2e2e2e] p-1 rounded transition-all flex items-center gap-1"
                    title="Copy code"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono whitespace-pre-wrap overflow-wrap-anywhere max-w-full">
                  <code>{children}</code>
                </pre>
              </div>
            ) : (
              <code className="bg-[#1e1e1e] px-1 py-0.5 rounded text-xs text-gray-100">
                {children}
              </code>
            );
          },
          p: ({ ...props }) => (
            <p className="mb-4 leading-relaxed text-gray-200" {...props} />
          ),
          h1: ({ ...props }) => (
            <h1
              className="text-2xl font-bold mt-6 mb-4 text-white"
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-xl font-bold mt-5 mb-3 text-white" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-lg font-bold mt-4 mb-2 text-white" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul
              className="list-disc pl-5 mb-4 space-y-1 text-gray-200"
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              className="list-decimal pl-5 mb-4 space-y-1 text-gray-200"
              {...props}
            />
          ),
          li: ({ ...props }) => <li className="mb-1" {...props} />,
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-accent pl-4 italic my-4 text-gray-300"
              {...props}
            />
          ),
          a: ({ ...props }) => (
            <a
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-4">
              <table
                className="min-w-full divide-y divide-gray-700"
                {...props}
              />
            </div>
          ),
          thead: ({ ...props }) => (
            <thead className="bg-[#202123]" {...props} />
          ),
          tbody: ({ ...props }) => (
            <tbody className="divide-y divide-gray-700" {...props} />
          ),
          tr: ({ ...props }) => (
            <tr className="hover:bg-[#2a2a2a]" {...props} />
          ),
          th: ({ ...props }) => (
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              {...props}
            />
          ),
          td: ({ ...props }) => (
            <td className="px-4 py-3 text-sm text-gray-200" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  const messageGroups = [];
  let currentGroup = null;
  messages.forEach((msg) => {
    if (!currentGroup || currentGroup.role !== msg.role) {
      currentGroup = { role: msg.role, messages: [msg] };
      messageGroups.push(currentGroup);
    } else {
      currentGroup.messages.push(msg);
    }
  });

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 pb-32 custom-scrollbar"
      style={{ maxHeight: "calc(100vh - 120px)" }}
    >
      <div className="max-w-4xl mx-auto">
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="py-2">
            <div className="max-w-3xl mx-auto">
              <div
                className={`flex ${
                  group.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-full ${
                    group.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {group.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`mb-4 message-enter ${
                        group.role === "user"
                          ? "bg-user-bg rounded-2xl p-4 shadow-md"
                          : ""
                      }`}
                    >
                      <div className="text-white">
                        {renderMessageContent(msg.content)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {typingMessage &&
          messages[messages.length - 1]?.role !== "assistant" && (
            <div className="py-2">
              <div className="max-w-3xl mx-auto">
                <div className="flex justify-start">
                  <div className="max-w-2xl">
                    <div className="bg-ai-bg rounded-2xl p-4 shadow-md">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatOutput;
