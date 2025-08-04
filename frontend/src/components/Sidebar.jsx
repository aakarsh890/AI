import { PanelTopClose, SquarePen, LogOut, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";
import logo from "/genify1.webp";
import icon from "/icon.webp";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../features/auth/authThunks";
import { toast } from "react-hot-toast";

function Sidebar({
  setIsSidebarOpen,
  isSidebarOpen,
  setPromt,
  setSandboxFiles,
}) {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axiosClient.get("/chat/allChats");
        if (res.data.success) {
          setChats(res.data.chats);
        }
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };
    fetchChats();
  }, []);

  const handleChatClick = (chatId) => {
    setIsSidebarOpen({
      workflowBar: false,
      historyBar: false,
    });
    navigate(`/chat/${chatId}`);
  };

  const handleNewChatClick = () => {
    setPromt([]);
    setSandboxFiles({});
    navigate("/chat");
    setIsSidebarOpen({
      workflowBar: false,
      historyBar: false,
    });
  };

  useEffect(() => {
    const persistedAuth = localStorage.getItem("persist:auth");
    if (persistedAuth) {
      const parsedAuth = JSON.parse(persistedAuth);
      const user = JSON.parse(parsedAuth.user);
      setFirstName(user.firstName); // Example: Sonu
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    if (loading) return; // Prevent multiple clicks

    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err?.message || "Logout failed");
    }
  };

  const deleteChat = async (chatId) => {
    try {
      const res = await axiosClient.delete(`/chat/${chatId}`);
      if (res.data.success) {
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        toast.success("Chat deleted");
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
      toast.error("Failed to delete chat");
    }
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this chat?"
    );
    if (confirmDelete) {
      deleteChat(id);
    }
  };

  return (
    <div
      className={`h-full ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } overflow-auto transition-transform flex flex-col justify-between px-4 backdrop-blur-lg relative border-r border-amber-50/10 scroll-hidden z-50`}
    >
      {/* Header */}
      <div>
        <div className="flex border-b border-white/10 px-2 py-1.5 justify-between items-center mb-4">
          <NavLink to="/" className="flex items-center gap-2 text-[18px] font-bold text-gray-200 py-1">
            <img
              src={logo}
              alt="DeepSeek Logo"
              className="h-7"
            />
            Webify
          </NavLink>
          <button
            onClick={() =>
              setIsSidebarOpen((prev) => ({
                ...prev,
                historyBar: !prev.historyBar,
              }))
            }
            className="cursor-pointer md:hidden active:scale-95 rounded-xl p-1.5"
          >
            <PanelTopClose className="w-6 h-6 -rotate-90" />
          </button>
        </div>

        <button
          className="cursor-pointer bg-purple-700 active:scale-98 text-gray-300 px-3 rounded-xl p-2 w-full flex items-center gap-2"
          onClick={handleNewChatClick}
        >
          <SquarePen className="w-5 h-5" /> New Chat
        </button>
        <div className="relative pb-2 border-b md:border-none border-white/15">
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full mt-3 px-3 py-2 pl-10 rounded-xl border border-white/10 text-white placeholder-gray-400 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute top-5.5 left-3 w-5 h-5 text-gray-400" />
        </div>
        {/* Chat List */}
        <div className="flex-1 overflow-auto max-h-[73%] py-2 scroll-hidden space-y-1">
          {chats.length > 0 ? (
            chats.filter((chat) => {
              const messageText =
                chat.messages?.[0]?.parts?.[0]?.text?.toLowerCase() || "";
              return messageText.includes(searchTerm.toLowerCase());
            }).length > 0 ? (
              chats
                .filter((chat) => {
                  const messageText =
                    chat.messages?.[0]?.parts?.[0]?.text?.toLowerCase() || "";
                  return messageText.includes(searchTerm.toLowerCase());
                })
                .map((chat) => (
                  <div
                    key={chat._id}
                    className="group flex items-center justify-between gap-1 text-sm border md:border-none border-white/5 md:gap-0.5 py-2 px-3 rounded-xl hover:bg-purple-500/20 text-gray-200 truncate"
                  >
                    <div
                      onClick={() => handleChatClick(chat._id)}
                      className="w-full truncate cursor-pointer"
                      title={
                        chat.messages?.[0]?.parts?.[0]?.text || "Empty Chat"
                      }
                    >
                      {chat.messages?.[0]?.parts?.[0]?.text?.slice(0, 30) ||
                        "New Chat"}
                    </div>

                    {/* 🗑️ Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleDelete(chat._id);
                      }}
                      title="Delete Chat"
                      className="text-red-500 p-1 bg-white/10 hover:bg-white/10 rounded active:scale-95 cursor-pointer md:opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
            ) : (
              <div className="text-gray-500 text-sm mt-20 text-center">
                No chats found
              </div>
            )
          ) : (
            <div className="text-gray-500 text-sm mt-20 text-center">
              No chat history yet
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 w-41 lg:w-51 pb-2 border-t border-gray-600">
        <div className="flex items-center gap-2 pl-2 cursor-pointer my-3">
          <img src={icon} alt="profile" className="rounded-full w-8 h-8" />
          <span className="text-gray-300 font-bold">
            {" "}
            {firstName ? firstName : "My Profile"}
          </span>
        </div>

        <button
          onClick={handleLogout}
          disabled={loading}
          className={`w-full flex items-center gap-2 text-white text-sm px-3 py-2 rounded-lg transition duration-300 cursor-pointer 
    ${loading ? "opacity-50 cursor-not-allowed" : "hover:shadow shadow-white"}`}
        >
          <LogOut />
          {loading ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
