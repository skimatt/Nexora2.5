import React, { useState, useEffect } from "react";
import ChatOutput from "./ChatOutput";
import { useTextareaResize } from "./useTextareaResize";

const ChatInput = ({
  newMessage,
  setNewMessage,
  messages,
  typingMessage,
  loading,
  isListening,
  toggleVoiceInput,
  thinkMode,
  setThinkMode,
  startNewChat,
  sendMessage,
  stopTyping,
  stopGenerating,
  isTypingStopped,
  textareaRef,
  messagesEndRef,
  hasSentMessage,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useTextareaResize(textareaRef, newMessage);

  useEffect(() => {
    const processing = loading || thinkMode || !!typingMessage;
    setIsProcessing(processing);
  }, [loading, thinkMode, typingMessage]);

  // Handle keyboard positioning on mobile
  useEffect(() => {
    if (window.innerWidth >= 769 || hasSentMessage) return;

    const handleViewportChange = () => {
      if (isInputFocused && window.visualViewport) {
        const inputContainer = textareaRef.current?.closest(".input-container");
        if (inputContainer) {
          const viewportHeight = window.visualViewport.height;
          const offset = window.innerHeight - viewportHeight;
          inputContainer.style.bottom = `${offset + 16}px`; // 16px padding above keyboard
        }
      }
    };

    const resetPosition = () => {
      const inputContainer = textareaRef.current?.closest(".input-container");
      if (inputContainer) {
        inputContainer.style.bottom = "";
      }
    };

    if (isInputFocused) {
      window.visualViewport?.addEventListener("resize", handleViewportChange);
      window.visualViewport?.addEventListener("scroll", handleViewportChange);
    }

    return () => {
      resetPosition();
      window.visualViewport?.removeEventListener(
        "resize",
        handleViewportChange
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        handleViewportChange
      );
    };
  }, [isInputFocused, hasSentMessage, textareaRef]);

  const handleStopTyping = () => {
    stopTyping();
    stopGenerating();
    setIsProcessing(false);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      sendMessage();
      setIsProcessing(true);
      setIsInputFocused(false); // Reset focus state after sending
      if (textareaRef.current) {
        textareaRef.current.blur(); // Remove focus from textarea
      }
    }
  };

  const handleKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !isProcessing &&
      newMessage.trim() !== ""
    ) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ChatOutput
        messages={messages || []}
        typingMessage={typingMessage}
        messagesEndRef={messagesEndRef}
      />
      <div
        className={`input-container mb-6 ${
          hasSentMessage ? "input-container-bottom" : ""
        } ${isInputFocused && !hasSentMessage ? "input-above-keyboard" : ""}`}
      >
        <div className="flex flex-col bg-[#1e1e1e] rounded-2xl shadow-lg">
          <div className="relative w-full">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder="Tanyakan apa saja"
              className="w-full p-4 bg-transparent text-white focus:outline-none resize-none rounded-t-2xl overflow-hidden leading-relaxed transition-all duration-200 ease-in-out"
              rows="1"
              disabled={loading}
              aria-label="Message input"
            />
          </div>
          <div className="flex items-center justify-between w-full p-3">
            <div className="flex items-center gap-3">
              {/* Tombol New Chat */}
              <button
                onClick={startNewChat}
                className="p-2 text-gray-400 hover:text-[var(--accent-color)] focus:outline-none transition-colors duration-200"
                aria-label="New chat"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                >
                  <path
                    d="M12 4V20M4 12H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-colors duration-200"
                  />
                </svg>
              </button>

              {/* Tombol Think Mode */}
              <button
                onClick={() => setThinkMode(!thinkMode)}
                className={`p-2 ${
                  thinkMode
                    ? "text-[var(--premium-color)]"
                    : "text-gray-400 hover:text-[var(--accent-color)]"
                } focus:outline-none transition-colors duration-200`}
                aria-label={
                  thinkMode ? "Disable Think Mode" : "Enable Think Mode"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                  />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Tombol Voice */}
              {("SpeechRecognition" in window ||
                "webkitSpeechRecognition" in window) && (
                <button
                  onClick={toggleVoiceInput}
                  className={`p-2 rounded-lg ${
                    isListening
                      ? "text-[var(--accent-color)] bg-[var(--accent-color)]/20"
                      : "text-gray-400 hover:text-[var(--accent-color)]"
                  } focus:outline-none transition-colors duration-200`}
                  aria-label={
                    isListening ? "Stop voice input" : "Start voice input"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                    />
                  </svg>
                </button>
              )}

              {/* Tombol Stop / Kirim */}
              {isProcessing ? (
                <button
                  onClick={handleStopTyping}
                  className="p-2 text-gray-400 hover:text-[var(--accent-color)] focus:outline-none transition-colors duration-200"
                  aria-label="Stop response"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                  >
                    <rect
                      x="6"
                      y="6"
                      width="12"
                      height="12"
                      rx="2"
                      fill="currentColor"
                      className="transition-colors duration-200"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleSendMessage}
                  disabled={loading || newMessage.trim() === ""}
                  className={`p-2 ${
                    loading || newMessage.trim() === ""
                      ? "text-gray-600 cursor-not-allowed"
                      : "text-gray-400 hover:text-[var(--accent-color)]"
                  } focus:outline-none transition-colors duration-200`}
                  aria-label="Send message"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="text-center text-gray-400 text-sm mt-2">
        Nexora dapat membuat kesalahan. Periksa info penting.
      </div>
    </div>
  );
};

export default ChatInput;
