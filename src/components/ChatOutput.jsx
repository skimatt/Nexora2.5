import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatOutput = ({ messages = [], typingMessage, messagesEndRef }) => {
  const containerRef = useRef(null);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Check if the user is at the bottom of the chat
  const checkIfAtBottom = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      return scrollHeight - scrollTop <= clientHeight + 10; // 10px tolerance
    }
    return true;
  };

  // Handle scroll events to update bottom status
  const handleScroll = () => {
    const isBottom = checkIfAtBottom();
    setIsAtBottom(isBottom);
  };

  // Detect upward scrolling via wheel event
  const handleWheel = (e) => {
    setIsScrollingUp(e.deltaY < 0);
  };

  // Attach scroll and wheel event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel);
      container.addEventListener("scroll", handleScroll);
      return () => {
        container.removeEventListener("wheel", handleWheel);
        container.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  // Auto-scroll to bottom only if user is at the bottom
  useEffect(() => {
    if (isAtBottom && messagesEndRef?.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typingMessage, isAtBottom]);

  // Render Markdown content with custom styling
  const renderMessageContent = (content) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline ? (
              <div className="my-4 rounded-lg overflow-hidden shadow-lg">
                <div className="flex items-center justify-between px-4 py-2 bg-[#202123] text-gray-300 text-xs">
                  <span className="font-mono font-medium">
                    {match ? match[1] : "code"}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(children)}
                    className="hover:bg-[#2e2e2e] p-1 rounded transition-all flex items-center gap-1"
                    title="Copy code"
                    aria-label="Copy code"
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
                <div className="bg-[#1e1e1e] p-4 text-gray-100">
                  <pre className="whitespace-pre-wrap font-mono text-xs">
                    <code>{children}</code>
                  </pre>
                </div>
              </div>
            ) : (
              <code className="bg-[#1e1e1e] px-1 py-0.5 rounded font-mono text-xs text-gray-100">
                {children}
              </code>
            );
          },
          p: ({ node, ...props }) => (
            <p className="mb-4 leading-relaxed text-gray-200" {...props} />
          ),
          h1: ({ node, ...props }) => (
            <h1
              className="text-2xl font-bold mt-6 mb-4 text-white"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold mt-5 mb-3 text-white" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-bold mt-4 mb-2 text-white" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc pl-5 mb-4 space-y-1 text-gray-200"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal pl-5 mb-4 space-y-1 text-gray-200"
              {...props}
            />
          ),
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-accent pl-4 italic my-4 text-gray-300"
              {...props}
            />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table
                className="min-w-full divide-y divide-gray-700"
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-[#202123]" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-gray-700" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-[#2a2a2a]" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th
              className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-3 text-sm text-gray-200" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  // Group messages by role for cleaner rendering
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
                  className={`max-w-2xl ${
                    group.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {group.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`mb-4 message-enter ${
                        group.role === "user"
                          ? "bg-user-bg rounded-2xl p-4 shadow-md"
                          : "bg-ai-bg rounded-2xl p-4 shadow-md"
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
