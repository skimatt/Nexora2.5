import { useState, useRef, useEffect, useCallback } from "react";
import WelcomePage from "../components/WelcomePage.jsx";
import ChatInput from "../components/ChatInput.jsx";
import Sidebar from "../components/Sidebar.jsx";
import ApiRouter from "../components/ApiRouter.jsx";
import { useChat } from "../hooks/useChat.jsx";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition.jsx";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { useToast } from "../contexts/ToastContext.jsx";
import { supabase } from "../supabaseClient";

export default function Home({ session }) {
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 769);
  const [typingMessage, setTypingMessage] = useState(null);
  const [isTypingStopped, setIsTypingStopped] = useState(false);

  const [isUserAtBottom, setIsUserAtBottom] = useState(true);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const hamburgerRef = useRef(null);

  const { toast, setToast } = useToast();
  const { theme, setTheme } = useTheme();
  const {
    chats,
    messages,
    selectedChat,
    hasSentMessage,
    setMessages,
    setSelectedChat,
    setHasSentMessage,
    fetchChats,
    fetchMessages,
    startNewChat,
    clearChat,
    deleteChat,
    formatChatTitle,
  } = useChat(session, setToast);

  const { isListening, toggleVoiceInput } = useSpeechRecognition(
    setNewMessage,
    setToast
  );

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setLoading(true);
      try {
        const chatData = await fetchChats();
        if (chatData.length === 0) {
          await startNewChat();
        } else {
          const lastChatId = chatData[0]?.id;
          setSelectedChat(lastChatId);
          await fetchMessages(lastChatId);
        }
      } catch (err) {
        console.error("Init error:", err);
        setToast({ type: "error", message: "Gagal memuat chat" });
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    init();
    return () => {
      isMounted = false;
      clearTimeout(typingTimerRef.current);
    };
  }, [fetchChats, startNewChat, setSelectedChat, fetchMessages, setToast]);

  // Check if the user is at the bottom of the chat container
  useEffect(() => {
    const el = chatContainerRef.current;
    const onScroll = () => {
      if (!el) return;
      const isNearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      setIsUserAtBottom(isNearBottom);
    };

    if (el) el.addEventListener("scroll", onScroll);
    return () => el && el.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent auto-scroll and only scroll to the bottom when user is at the bottom of the chat window
  useEffect(() => {
    if (isUserAtBottom && messagesEndRef.current) {
      // Only scroll if the user is at the bottom manually
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typingMessage, isUserAtBottom]); // No auto-scroll unless user is at the bottom

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.style.overflowY = "auto";
    }
  }, [messages, typingMessage]);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 769);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsSidebarOpen(true);
    };

    const button = hamburgerRef.current;
    if (button) {
      button.addEventListener("click", handleClick, { capture: true });
      button.addEventListener("touchstart", handleClick, {
        capture: true,
        passive: false,
      });
    }

    return () => {
      if (button) {
        button.removeEventListener("click", handleClick, { capture: true });
        button.removeEventListener("touchstart", handleClick, {
          capture: true,
        });
      }
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const stopTyping = () => {
    setIsTypingStopped(true);
    setTypingMessage(null);
    setLoading(false);
    clearTimeout(typingTimerRef.current);
  };

  const stopGenerating = () => {
    setTypingMessage(null);
    setIsTypingStopped(true);
    setLoading(false);
    clearTimeout(typingTimerRef.current);
  };

  const sendMessage = useCallback(async () => {
    if (!selectedChat || !newMessage.trim() || loading) return;

    const content = newMessage;
    setNewMessage("");
    setLoading(true);
    setIsTypingStopped(false);
    setHasSentMessage(true);

    const userMessage = {
      id: Date.now(),
      content,
      role: "user",
    };

    setMessages((prev) => [...prev, userMessage]);

    const { error: insertErr } = await supabase.from("messages").insert({
      chat_id: selectedChat,
      user_id: session.user.id,
      content,
      role: "user",
    });

    if (insertErr) {
      console.error("Error sending message:", insertErr);
      setToast({ type: "error", message: "Gagal mengirim pesan" });
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      setLoading(false);
      return;
    }

    if (messages.length === 0) {
      const newTitle = await formatChatTitle(content);
      await supabase
        .from("chats")
        .update({ title: newTitle })
        .eq("id", selectedChat);
      await fetchChats();
    }

    await ApiRouter.callAI({
      prompt: content,
      messages,
      setMessages,
      setTypingMessage,
      setLoading,
      setToast,
      selectedChat,
      thinkMode: false,
      typingTimerRef,
      isTypingStopped,
      setIsTypingStopped,
      session,
    });
  }, [
    newMessage,
    selectedChat,
    loading,
    messages,
    setMessages,
    setHasSentMessage,
    setToast,
    session,
    formatChatTitle,
    fetchChats,
  ]);

  return (
    <div className="flex h-screen bg-[#0D0D0F] overflow-hidden">
      {toast && (
        <div className={`toast toast-${toast.type} z-45`}>{toast.message}</div>
      )}

      <Sidebar
        {...{
          isSidebarOpen,
          setIsSidebarOpen,
          chats,
          selectedChat,
          fetchMessages,
          startNewChat,
          clearChat,
          deleteChat,
          thinkMode: false,
          setThinkMode: () => {},
          theme,
          setTheme,
          session,
          handleLogout,
          formatChatTitle,
          shareChat: async () => {
            try {
              await navigator.share({
                title: "Nexora AI Chat",
                text: "Check out my chat with Nexora AI!",
                url: window.location.href,
              });
              setToast({ type: "success", message: "Berhasil dibagikan" });
            } catch {
              setToast({ type: "error", message: "Gagal membagikan chat" });
            }
          },
        }}
      />

      <div className="flex-1 flex flex-col bg-neutral-900 relative z-10">
        <div className="flex items-center p-3 border-b border-neutral-700 md:hidden relative z-70 header-mobile">
          <button
            ref={hamburgerRef}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsSidebarOpen(true);
            }}
            className="p-2 text-gray-400 hover:text-white z-80 rounded-md hover:bg-gray-900 transition-colors touch-manipulation pointer-events-auto"
            aria-label="Open sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
              />
            </svg>
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-white">
            Nexora AI
          </h1>
          <div className="w-10"></div>
        </div>

        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto flex flex-col-reverse relative"
        >
          {hasSentMessage && selectedChat && messages.length > 0 ? (
            <ChatInput
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              messages={messages}
              typingMessage={typingMessage}
              loading={loading}
              isListening={isListening}
              toggleVoiceInput={toggleVoiceInput}
              thinkMode={false}
              setThinkMode={() => {}}
              startNewChat={startNewChat}
              sendMessage={sendMessage}
              stopTyping={stopTyping}
              stopGenerating={stopGenerating}
              isTypingStopped={isTypingStopped}
              textareaRef={textareaRef}
              messagesEndRef={messagesEndRef}
              hasSentMessage={hasSentMessage}
            />
          ) : (
            <div className="relative h-full flex flex-col">
              <WelcomePage session={session} />
              <div className="mobile-welcome-bottom">
                <ChatInput
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  messages={messages}
                  typingMessage={typingMessage}
                  loading={loading}
                  isListening={isListening}
                  toggleVoiceInput={toggleVoiceInput}
                  thinkMode={false}
                  setThinkMode={() => {}}
                  startNewChat={startNewChat}
                  sendMessage={sendMessage}
                  stopTyping={stopTyping}
                  stopGenerating={stopGenerating}
                  isTypingStopped={isTypingStopped}
                  textareaRef={textareaRef}
                  messagesEndRef={messagesEndRef}
                  hasSentMessage={hasSentMessage}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
