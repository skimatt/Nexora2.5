import { useState, useCallback, useMemo } from "react";
import { supabase } from "../supabaseClient";

// Custom hook for managing chat functionality with Supabase
// Note: This hook does not handle UI scrolling behavior (e.g., auto-scrolling),
// which is managed in rendering components (e.g., ChatOutput, ChatUI)
export const useChat = (session, setToast) => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [hasSentMessage, setHasSentMessage] = useState(false);

  // Debug message updates
  const setMessagesWithDebug = useCallback((newMessages) => {
    console.log("useChat: setMessages called", {
      messageCount: newMessages.length,
    });
    setMessages(newMessages);
  }, []);

  const fetchChats = useCallback(async () => {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching chats:", error);
      setToast({ type: "error", message: "Gagal memuat riwayat chat" });
      return [];
    }
    setChats(data || []);
    return data || [];
  }, [session.user.id, setToast]);

  const fetchMessages = useCallback(
    async (chatId) => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        setToast({ type: "error", message: "Gagal memuat pesan" });
        return;
      }

      setSelectedChat(chatId);
      setMessagesWithDebug(data || []);
      setHasSentMessage(data && data.length > 0);
    },
    [setToast, setMessagesWithDebug]
  );

  const startNewChat = useCallback(async () => {
    const { data, error } = await supabase
      .from("chats")
      .insert({ user_id: session.user.id, title: "New Chat" })
      .select();

    if (error) {
      console.error("Error starting new chat:", error);
      setToast({ type: "error", message: "Gagal membuat chat baru" });
      return;
    }

    if (data?.length > 0) {
      const chatId = data[0].id;
      setSelectedChat(chatId);
      setMessagesWithDebug([]);
      setHasSentMessage(false);
      await fetchChats();
    }
  }, [session.user.id, fetchChats, setToast, setMessagesWithDebug]);

  const clearChat = useCallback(async () => {
    if (!selectedChat) return;
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("chat_id", selectedChat);

    if (error) {
      console.error("Error clearing chat:", error);
      setToast({ type: "error", message: "Gagal menghapus pesan" });
      return;
    }

    setMessagesWithDebug([]);
    setHasSentMessage(false);
    setToast({ type: "success", message: "Chat berhasil dihapus" });
    await updateChatTitle(selectedChat, "New Chat");
  }, [selectedChat, setToast, setMessagesWithDebug]);

  const deleteChat = useCallback(
    async (chatId) => {
      const { error } = await supabase.from("chats").delete().eq("id", chatId);

      if (error) {
        console.error("Error deleting chat:", error);
        setToast({ type: "error", message: "Gagal menghapus chat" });
        return;
      }

      await fetchChats();
      if (selectedChat === chatId) {
        const remainingChats = await fetchChats();
        if (remainingChats.length > 0) {
          setSelectedChat(remainingChats[0].id);
          await fetchMessages(remainingChats[0].id);
        } else {
          await startNewChat();
        }
      }
      setToast({ type: "success", message: "Chat dihapus" });
    },
    [selectedChat, fetchChats, fetchMessages, startNewChat, setToast]
  );

  const updateChatTitle = useCallback(
    async (chatId, title) => {
      const { error } = await supabase
        .from("chats")
        .update({ title })
        .eq("id", chatId);

      if (error) {
        console.error("Error updating chat title:", error);
        setToast({ type: "error", message: "Gagal memperbarui judul chat" });
        return;
      }
      await fetchChats();
    },
    [fetchChats, setToast]
  );

  const formatChatTitle = useCallback(
    (title) =>
      !title || title === "New Chat"
        ? "New Chat"
        : title.length > 20
        ? title.substring(0, 20) + "..."
        : title,
    []
  );

  // Memoize return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      chats,
      messages,
      selectedChat,
      hasSentMessage,
      setMessages: setMessagesWithDebug,
      setSelectedChat,
      setHasSentMessage,
      fetchChats,
      fetchMessages,
      startNewChat,
      clearChat,
      deleteChat,
      updateChatTitle,
      formatChatTitle,
    }),
    [
      chats,
      messages,
      selectedChat,
      hasSentMessage,
      setMessagesWithDebug,
      setSelectedChat,
      setHasSentMessage,
      fetchChats,
      fetchMessages,
      startNewChat,
      clearChat,
      deleteChat,
      updateChatTitle,
      formatChatTitle,
    ]
  );
};
