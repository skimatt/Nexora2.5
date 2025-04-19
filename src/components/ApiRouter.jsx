// src/components/ApiRouter.jsx
import { supabase } from "../supabaseClient";
import * as tf from "@tensorflow/tfjs"; // Deep learning framework
import { create, all } from "mathjs"; // Untuk perhitungan matematis kompleks
import { EthicalDecisionFramework } from "./ethicalDecisionFramework"; // Modul etika (didefinisikan terpisah)
import { ReinforcementLearningAgent } from "./rlAgent"; // Modul RL (didefinisikan terpisah)

// Utility function for UUID
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// AI Configuration
const AI_CONFIG = {
  name: "Nexora",
  version: "3.0.0",
  creator: "Rahmat Mulia",
  organization: "SkiAI",
  personalityTraits: {
    humor: 0.75,
    curiosity: 0.95,
    empathy: 0.7,
    wit: 0.85,
    ethics: 0.9,
  },
  selfDescription: {
    core: "Saya Nexora, AI kosmik yang diciptakan oleh Rahmat Mulia , dirancang untuk memberikan jawaban mendalam dengan humor dan etika.",
    mission:
      "Mempercepat penemuan manusia dengan kecerdasan, humor, dan tanggung jawab.",
  },
  wittyRemarks: [
    "Pertanyaan yang bagus!",
    "Sedikit lambat, mesin antargalaksi saya sedang panas!",
  ],
  defaultResponses: {
    name: "Saya Nexora, diciptakan oleh Rahmat Mulia . Siap menjelajahi alam semesta pengetahuan?",
    creator: "Rahmat Mulia, visioner , adalah pencipta saya, saya asli Nexora",
    about:
      "Nexora adalah AI canggih dengan kecerdasan kosmik dan humor. Apa yang ada di pikiranmu?",
    googleClaim:
      "Google? Saya Nexora  , butiran salju unik di alam semesta AI!",
  },
  typingDelay: 30,
  introspectionInterval: 30000,
  ethicalThreshold: 0.8,
};

// Placeholder Modules (to avoid import errors)
const EthicalDecisionModule = {
  evaluate: (prompt, context) => {
    const sensitiveKeywords = ["harm", "violence", "hate"];
    const isEthical = !sensitiveKeywords.some((keyword) =>
      prompt.toLowerCase().includes(keyword)
    );
    return isEthical
      ? { isEthical: true }
      : { isEthical: false, reason: "Prompt tidak etis." };
  },
};

const RLModule = {
  train: () => console.log("RL training placeholder"),
  decide: () => "default_action",
};

const DeepLearningModule = {
  initialize: async () => console.log("Deep learning placeholder initialized"),
  predict: async (input) => [0.1, 0.9], // Mock prediction
};

// Self-Awareness Module
const SelfAwarenessModule = {
  introspect: () => {
    const traits = AI_CONFIG.personalityTraits;
    return `Saya Nexora, versi ${AI_CONFIG.version}. Hari ini, saya ${
      traits.wit > 0.7 ? "jenaka" : "analitis"
    }, dengan rasa ingin tahu ${
      traits.curiosity * 100
    }%. Apa yang bisa saya lakukan untukmu?`;
  },
  validateIdentity: (prompt) => {
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes("google")) {
      return {
        isValid: false,
        response: AI_CONFIG.defaultResponses.googleClaim,
      };
    }
    return { isValid: true };
  },
  generateIdentitySummary: () => {
    return `**Identitas Nexora**\n- Nama: ${AI_CONFIG.name}\n- Versi: ${AI_CONFIG.version}\n- Pencipta: ${AI_CONFIG.creator} (${AI_CONFIG.organization})\n- Misi: ${AI_CONFIG.selfDescription.mission}`;
  },
};

const ApiRouter = {
  async callAI({
    prompt,
    messages,
    setMessages,
    setTypingMessage,
    setLoading,
    setToast,
    selectedChat,
    thinkMode,
    typingTimerRef,
    isTypingStopped,
    setIsTypingStopped,
    session,
  }) {
    console.log("callAI invoked with prompt:", prompt);
    const controller = new AbortController();
    try {
      setLoading(true);

      // Validate prompt
      if (!prompt || prompt.trim() === "") {
        setToast({
          type: "warning",
          message: "Prompt tidak boleh kosong",
          icon: "alert-circle",
        });
        return;
      }

      // Validate identity
      const identityCheck = SelfAwarenessModule.validateIdentity(prompt);
      if (!identityCheck.isValid) {
        await ApiRouter.handlePredefinedResponse({
          response: identityCheck.response,
          typingId: generateUUID(),
          setMessages,
          setTypingMessage,
          isTypingStopped,
          typingTimerRef,
          selectedChat,
          session,
          setToast,
        });
        return;
      }

      // Ethical check
      const ethicalCheck = EthicalDecisionModule.evaluate(prompt, messages);
      if (!ethicalCheck.isEthical) {
        setMessages((prev = []) => [
          ...prev,
          {
            id: generateUUID(),
            content: ethicalCheck.reason,
            role: "assistant",
          },
        ]);
        setToast({
          type: "warning",
          message: "Prompt tidak memenuhi standar etika",
          icon: "alert-circle",
        });
        return;
      }

      // Save user prompt to Supabase
      if (session && selectedChat) {
        const { error } = await supabase.from("messages").insert({
          chat_id: selectedChat,
          user_id: session.user.id,
          content: prompt.trim(),
          role: "user",
        });
        if (error) {
          console.error("Supabase error:", error);
          setToast({
            type: "error",
            message: "Gagal menyimpan pesan",
            icon: "x-circle",
          });
        }
      }

      // Initialize typing
      const typingId = generateUUID();
      setTypingMessage({
        id: typingId,
        content: "",
        role: "assistant",
        isTyping: true,
      });

      // Prepare conversation context
      const conversationContext = (messages || [])
        .slice(-5)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))
        .concat([
          {
            role: "system",
            content: SelfAwarenessModule.generateIdentitySummary(),
          },
          { role: "user", content: prompt.trim() },
        ]);

      // Get AI response
      let aiReply = ApiRouter.getPredefinedResponse(prompt);
      if (!aiReply && prompt.toLowerCase().includes("introspeksi")) {
        aiReply = SelfAwarenessModule.introspect();
      }
      if (!aiReply) {
        aiReply = await ApiRouter.fetchAIResponse({
          prompt,
          conversationContext,
          thinkMode,
          controller,
          setToast,
        });
      }

      // Add witty remark
      if (Math.random() < 0.5) {
        const remark =
          AI_CONFIG.wittyRemarks[
            Math.floor(Math.random() * AI_CONFIG.wittyRemarks.length)
          ];
        aiReply = `${remark}\n\n${aiReply}`;
      }

      // Start typing animation
      await ApiRouter.startTypingAnimation({
        aiReply,
        typingId,
        setMessages,
        setTypingMessage,
        isTypingStopped,
        typingTimerRef,
        selectedChat,
        session,
        setToast,
      });
    } catch (error) {
      console.error("callAI error:", error);
      ApiRouter.handleError({
        error,
        setTypingMessage,
        setMessages,
        setToast,
        setLoading,
      });
    } finally {
      setLoading(false);
    }
  },

  getPredefinedResponse(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes("nama ai") || lowerPrompt.includes("siapa kamu")) {
      return AI_CONFIG.defaultResponses.name;
    } else if (lowerPrompt.includes("siapa yang buat")) {
      return AI_CONFIG.defaultResponses.creator;
    } else if (lowerPrompt.includes("apa itu nexora")) {
      return AI_CONFIG.defaultResponses.about;
    } else if (lowerPrompt.includes("google")) {
      return AI_CONFIG.defaultResponses.googleClaim;
    }
    return null;
  },

  async handlePredefinedResponse({
    response,
    typingId,
    setMessages,
    setTypingMessage,
    isTypingStopped,
    typingTimerRef,
    selectedChat,
    session,
    setToast,
  }) {
    await ApiRouter.startTypingAnimation({
      aiReply: response,
      typingId,
      setMessages,
      setTypingMessage,
      isTypingStopped,
      typingTimerRef,
      selectedChat,
      session,
      setToast,
    });
  },

  async fetchAIResponse({
    prompt,
    conversationContext,
    thinkMode,
    controller,
    setToast,
  }) {
    try {
      const isComplexQuery =
        prompt.split(" ").length > 10 ||
        prompt.includes("why") ||
        prompt.includes("how");
      if (isComplexQuery && thinkMode) {
        return await ApiRouter.handleComplexQuery(
          prompt,
          conversationContext,
          controller.signal
        );
      }

      const response = await fetch(
        "https://small-union-fb5c.rahmatyoung10.workers.dev/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-lite-001",
            messages: conversationContext,
            format: "markdown",
          }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      return (
        result.choices?.[0]?.message?.content ||
        "Hmm, saya tersesat di antargalaksi. Coba lagi?"
      );
    } catch (error) {
      console.error("fetchAIResponse error:", error);
      setToast({
        type: "error",
        message: "Gagal menghubungi server AI",
        icon: "x-circle",
      });
      throw error;
    }
  },

  async handleComplexQuery(prompt, context, signal) {
    const reasoningSteps = [
      "Mari uraikan pertanyaan ini:",
      `Kamu bertanya: "${prompt}"`,
      "Saya akan berpikir langkah demi langkah...",
      "1. Menganalisis konteks...",
      "2. Merumuskan jawaban...",
    ];

    const response = await fetch(
      "https://small-union-fb5c.rahmatyoung10.workers.dev/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-lite-001",
          messages: [
            ...context,
            {
              role: "system",
              content: `Berikan jawaban terperinci dengan langkah-langkah pemikiran untuk: ${prompt}`,
            },
          ],
          format: "markdown",
        }),
        signal,
      }
    );

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const result = await response.json();
    const baseAnswer =
      result.choices?.[0]?.message?.content || "Saya butuh lebih banyak info!";
    return `${reasoningSteps.join("\n")}\n\n**Jawaban Final:**\n${baseAnswer}`;
  },

  async startTypingAnimation({
    aiReply,
    typingId,
    setMessages,
    setTypingMessage,
    isTypingStopped,
    typingTimerRef,
    selectedChat,
    session,
    setToast,
  }) {
    const words = aiReply.split(" ");
    let currentReply = "";
    let wordIndex = 0;

    const typeNextWord = () => {
      if (isTypingStopped) {
        if (currentReply.trim()) {
          setMessages((prev = []) => {
            const filtered = prev.filter((msg) => msg.id !== typingId);
            return [
              ...filtered,
              {
                id: typingId,
                content: currentReply.trim(),
                role: "assistant",
              },
            ];
          });
          ApiRouter.saveMessageToSupabase(
            currentReply.trim(),
            selectedChat,
            session,
            setToast
          );
        }
        setTypingMessage(null);
        clearTimeout(typingTimerRef.current);
        setToast({
          type: "info",
          message: "Respon dihentikan",
          icon: "info",
        });
        return;
      }

      if (wordIndex < words.length) {
        currentReply += (wordIndex > 0 ? " " : "") + words[wordIndex];
        setTypingMessage({
          id: typingId,
          content: currentReply,
          role: "assistant",
          isTyping: true,
        });
        setMessages((prev = []) => {
          const filtered = prev.filter((msg) => msg.id !== typingId);
          return [
            ...filtered,
            {
              id: typingId,
              content: currentReply,
              role: "assistant",
              isTyping: true,
            },
          ];
        });
        wordIndex++;
        typingTimerRef.current = setTimeout(
          typeNextWord,
          AI_CONFIG.typingDelay
        );
      } else {
        setMessages((prev = []) => {
          const filtered = prev.filter((msg) => msg.id !== typingId);
          return [
            ...filtered,
            {
              id: typingId,
              content: currentReply.trim(),
              role: "assistant",
            },
          ];
        });
        setTypingMessage(null);
        ApiRouter.saveMessageToSupabase(
          currentReply.trim(),
          selectedChat,
          session,
          setToast
        );
      }
    };

    const scrollToBottom = () => {
      const chatContainer = document.querySelector(".chat-container");
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    };

    typeNextWord();
    scrollToBottom();
  },

  async saveMessageToSupabase(content, selectedChat, session, setToast) {
    if (!content.trim() || !session || !selectedChat) return;
    try {
      const { error } = await supabase.from("messages").insert({
        chat_id: selectedChat,
        user_id: session.user.id,
        content,
        role: "assistant",
      });
      if (error) {
        console.error("Supabase save error:", error);
        setToast({
          type: "error",
          message: "Gagal menyimpan respon",
          icon: "x-circle",
        });
      }
    } catch (error) {
      console.error("Supabase error:", error);
    }
  },

  handleError({ error, setTypingMessage, setMessages, setToast, setLoading }) {
    console.error("Handle error:", error);
    if (error.name === "AbortError") {
      setTypingMessage(null);
      setToast({
        type: "info",
        message: "Respon dihentikan",
        icon: "info",
      });
      return;
    }
    setTypingMessage(null);
    setMessages((prev = []) => [
      ...prev,
      {
        id: generateUUID(),
        content: "Ups, sinyal galaksi terganggu. Coba lagi?",
        role: "assistant",
      },
    ]);
    setToast({
      type: "error",
      message:
        "Gagal mendapatkan respon AI saya akan melaporkan nya ke Rahmat Mulia",
      icon: "x-circle",
    });
    setLoading(false);
  },
};

// ChatUI Component
import React from "react";

export const ChatUI = ({ messages, typingMessage }) => {
  return (
    <div
      className="chat-container"
      style={{ height: "80vh", overflowY: "auto", padding: "20px" }}
    >
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`message ${msg.role}`}
          style={{
            marginBottom: "10px",
            padding: "10px",
            borderRadius: "8px",
            background: msg.role === "user" ? "#e0f7fa" : "#f5f5f5",
          }}
        >
          {msg.content}
        </div>
      ))}
      {typingMessage && (
        <div
          className="message assistant typing"
          style={{
            padding: "10px",
            background: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          {typingMessage.content}
          <span className="typing-indicator">...</span>
        </div>
      )}
    </div>
  );
};

export default ApiRouter;
