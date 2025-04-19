import React, { useEffect, useState } from "react";
import {
  Plus,
  X,
  Trash2,
  Edit,
  Share2,
  BarChart2,
  LogOut,
  MoreVertical,
  Check,
  AlertCircle,
} from "lucide-react";

const Sidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  chats,
  selectedChat,
  fetchMessages,
  startNewChat,
  clearChat,
  deleteChat,
  shareChat,
  thinkMode,
  setThinkMode,
  session,
  handleLogout,
  formatChatTitle,
  updateChatTitle,
}) => {
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingChat, setEditingChat] = useState(null);
  const [chatTitle, setChatTitle] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const generateContextualTitle = (chatContent) => {
    if (!chatContent || chatContent.title !== "New chat") {
      return chatContent.title;
    }

    const firstMessage = chatContent.messages?.[0]?.content || "";
    if (firstMessage.includes("code") || firstMessage.includes("programming")) {
      return "Coding Assistance";
    } else if (
      firstMessage.includes("recipe") ||
      firstMessage.includes("cook")
    ) {
      return "Cooking Discussion";
    } else if (
      firstMessage.includes("explain") ||
      firstMessage.includes("what is")
    ) {
      return "Concept Explanation";
    }

    return "New Conversation";
  };

  const toggleMenu = (chatId) => {
    setMenuOpen(menuOpen === chatId ? null : chatId);
  };

  const handleEditChat = (chatId, currentTitle) => {
    setEditingChat(chatId);
    setChatTitle(currentTitle);
    setMenuOpen(null);
  };

  const saveChatTitle = (chatId) => {
    if (chatTitle.trim()) {
      updateChatTitle(chatId, chatTitle.trim());
    }
    setEditingChat(null);
    setChatTitle("");
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const proceedWithLogout = () => {
    setShowLogoutConfirm(false);
    handleLogout();
  };

  useEffect(() => {
    console.log("Sidebar rendered, isSidebarOpen:", isSidebarOpen);
  }, [isSidebarOpen]);

  return (
    <>
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-black text-gray-100 flex flex-col transition-transform duration-500 ease-in-out z-30 md:static md:flex md:flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          visibility: isSidebarOpen ? "visible" : "hidden",
        }}
        role="navigation"
        aria-label="Chat history sidebar"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-purple-700 tracking-tight drop-shadow-[0_0_5px_rgba(128,90,213,0.6)]">
            Nexora AI
          </h2>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-full transition-colors duration-200 md:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-6 py-4">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-xl text-white hover:text-blue-400 transition-all duration-300"
            aria-label="Start new chat"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-grow overflow-y-auto px-4 py-2">
          <div className="text-gray-300 text-xs font-medium uppercase px-2 pb-3 tracking-wider">
            Chat History
          </div>
          {chats.length > 0 ? (
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className="flex items-center justify-between group px-2 relative"
                >
                  {editingChat === chat.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={chatTitle}
                        onChange={(e) => setChatTitle(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                        onKeyDown={(e) =>
                          e.key === "Enter" && saveChatTitle(chat.id)
                        }
                      />
                      <button
                        onClick={() => saveChatTitle(chat.id)}
                        className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-colors duration-200"
                        aria-label="Save chat title"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-1 items-center justify-between">
                        <button
                          onClick={() => fetchMessages(chat.id)}
                          className={`flex-1 px-3 py-2 text-sm rounded-lg text-left ${
                            selectedChat === chat.id
                              ? "bg-gray-800 text-white"
                              : "text-gray-300 hover:bg-gray-800"
                          } transition-all duration-200 truncate font-medium`}
                          aria-label={`Open chat: ${formatChatTitle(
                            chat.title
                          )}`}
                        >
                          {formatChatTitle(chat.title) ||
                            generateContextualTitle(chat)}
                        </button>
                        <button
                          onClick={() => toggleMenu(chat.id)}
                          className="p-2 text-gray-400 hover:text-white transition-all duration-200 rounded-full hover:bg-gray-800"
                          aria-label="Chat options"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                      {menuOpen === chat.id && (
                        <div className="absolute right-2 top-10 bg-gray-800 rounded-xl shadow-md z-10 w-48 border border-gray-700 overflow-hidden">
                          <button
                            onClick={() =>
                              handleEditChat(
                                chat.id,
                                formatChatTitle(chat.title) ||
                                  generateContextualTitle(chat)
                              )
                            }
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                          >
                            <Edit size={16} />
                            Edit Name
                          </button>
                          <button
                            onClick={() => {
                              shareChat(chat.id);
                              setMenuOpen(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                          >
                            <Share2 size={16} />
                            Share Chat
                          </button>
                          <button
                            onClick={() => {
                              deleteChat(chat.id);
                              setMenuOpen(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm px-2 py-4 text-left font-medium">
              No chat history
            </div>
          )}
        </div>

        {/* Think Mode Toggle */}
        <div className="px-6 py-4 border-t border-gray-800">
          <button
            onClick={() => setThinkMode(!thinkMode)}
            className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-xl ${
              thinkMode ? "bg-gray-800 text-white" : "bg-gray-900 text-gray-300"
            } hover:bg-gray-700 transition-all duration-300 font-medium`}
            aria-label={thinkMode ? "Disable Think Mode" : "Enable Think Mode"}
          >
            <div className="flex items-center gap-3">
              <BarChart2 size={18} />
              <span>Think Mode</span>
            </div>
            {thinkMode && (
              <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded-full">
                Active
              </span>
            )}
          </button>
        </div>

        {/* User Profile & Logout */}
        <div className="px-6 py-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-blue-400 font-semibold border border-gray-800 shadow-sm">
                {session.user.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-100 truncate max-w-[160px]">
                  {session.user.name || "User"}
                </span>
                <span className="text-xs text-gray-400 truncate max-w-[160px] font-medium">
                  {session.user.email || "user@example.com"}
                </span>
              </div>
            </div>
            <button
              onClick={confirmLogout}
              className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors duration-200"
              aria-label="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl shadow-lg p-6 max-w-sm mx-4 w-full border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-blue-400" size={24} />
              <h3 className="text-lg font-semibold text-gray-100">
                Confirm Logout
              </h3>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to log out from your account?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={proceedWithLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-800 hover:bg-blue-500 rounded-lg transition-colors duration-200"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {isSidebarOpen && window.innerWidth < 769 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          style={{ pointerEvents: isSidebarOpen ? "auto" : "none" }}
          aria-label="Close sidebar overlay"
        />
      )}
    </>
  );
};

export default Sidebar;
