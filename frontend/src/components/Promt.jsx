import { useState, useEffect, useRef } from "react";
import { ArrowUp, Globe, Bot, Loader2, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow as codeTheme } from "react-syntax-highlighter/dist/esm/styles/prism";
import axiosClient from "../utils/axiosClient";
import { useNavigate, useParams } from "react-router";
import ProgressiveLoader from "./ProgressiveLoader";

function Promt({
  promt,
  setPromt,
  onPromptComplete,
  setInitialFiles,
  setIsSidebarOpen,
  codeLoading,
  setMode,
  mode,
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const promtEndRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();
  const { chatId: paramChatId } = useParams();
  const [chatId, setChatId] = useState(paramChatId || null);
  const [chatLoading, setChatLoading] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState("");

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [input]);

  useEffect(() => {
    promtEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [promt]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) {
        handleSendPrompt();
      }
    }
  };

  useEffect(() => {
    const loadChat = async () => {
      if (!paramChatId) {
        setChatId(null);
        setPromt([]);
        return;
      }

      setChatLoading(true);
      setPromt([]);

      try {
        const res = await axiosClient.get(`/chat/info/${paramChatId}`);

        if (res.data.success) {
          const fetchedChat = res.data.chat;

          const formattedMessages = fetchedChat.messages.map((m) => ({
            role: m.role === "user" ? "user" : "model",
            content: m.parts?.[0]?.text || "",
          }));

          if (fetchedChat.messages) {
            const lastModelMessageWithFiles = [...fetchedChat.messages]
              .reverse()
              .find(
                (msg) =>
                  msg.role === "model" && msg.files && msg.files.length > 0
              );

            if (lastModelMessageWithFiles) {
              const extractedFiles = {};
              for (const file of lastModelMessageWithFiles.files) {
                extractedFiles[file.path] = { code: file.content };
              }

              setInitialFiles(extractedFiles);
            }
          }

          setPromt(formattedMessages);
          setChatId(paramChatId);
        }
      } catch (err) {
        console.error("Failed to load chat:", err);
        setPromt([
          {
            role: "model",
            content: "⚠️ Failed to load this chat.",
          },
        ]);
      } finally {
        setChatLoading(false);
      }
    };

    loadChat();
  }, [paramChatId]);

  const handleEnhancePrompt = async (userInput) => {
    if (!userInput.trim()) return;

    setEnhancedPrompt(true);
    setInput(""); // optional: show "enhancing..." state

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/chat/promptEnhance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ message: userInput }),
        }
      );

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let finalText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        finalText += decoder.decode(value);
        const cleaned = finalText
          .replace(/^```(.*?)\n/, "")
          .replace(/```$/, "");

        setInput(cleaned);
      }
    } catch (err) {
      console.error("Enhance error:", err);
      setInput("⚠️ Failed to enhance prompt.");
    } finally {
      setEnhancedPrompt(false);
    }
  };

  const handleSendPrompt = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    setPromt((prev) => [
      ...prev,
      { role: "user", content: trimmedInput },
      { role: "model", content: "" },
    ]);

    setInput("");
    setLoading(true);

    const controller = new AbortController();
    const signal = controller.signal;

    try {
      const endpoint = chatId ? `/chat/explain/${chatId}` : "/chat/explain";
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            message: trimmedInput,
          }),
          signal,
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to fetch or stream response.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulated = "";

      let buffer = "";
      let flushTimeout = null;

      const flushBuffer = () => {
        if (!buffer) return;
        setPromt((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];

          if (last.role === "model") {
            updated[updated.length - 1] = {
              ...last,
              content: last.content + buffer,
            };
          }

          return updated;
        });

        buffer = "";
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          flushBuffer(); // flush remaining buffer
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        for (let char of chunk) {
          buffer += char;
          await new Promise((resolve) => setTimeout(resolve, 5));

          if (!flushTimeout) {
            flushTimeout = setTimeout(() => {
              flushBuffer();
              flushTimeout = null;
            }, 50);
          }
        }
      }

      const newChatId = response.headers.get("X-Chat-Id");
      const effectiveChatId = newChatId || chatId;

      if (newChatId) {
        setChatId(newChatId);
        await navigate(`/chat/${newChatId}`);
      }

      if (onPromptComplete && trimmedInput) {
        onPromptComplete(trimmedInput, effectiveChatId);
      }
      setIsSidebarOpen((prev) => ({
        ...prev,
        workflowBar: true,
      }));
    } catch (error) {
      console.error("Chat error:", error.message || error);
      setPromt((prev) => [
        ...prev,
        { role: "model", content: "⚠️ Failed to fetch response." },
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "j") {
        e.preventDefault();
        if (!enhancedPrompt && input.trim()) {
          handleEnhancePrompt(input);
        }
      }

      if (e.ctrlKey && e.key.toLowerCase() === "g") {
        e.preventDefault();
        setMode("game");
      }

      if (e.ctrlKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        setMode("website");
      }

      if (e.ctrlKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsSidebarOpen((prev) => ({
          ...prev,
          historyBar: !prev.historyBar,
        }));
      }

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!loading) {
          handleSendPrompt();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [input, enhancedPrompt, loading, setMode, setIsSidebarOpen]);

  if (chatLoading)
    return (
      <div className="flex flex-col justify-center items-center gap-1 w-full">
        <span className="loading loading-bars loading-xl"></span>
        <span className="font-bold text-2xl animate-pulse">Loading...</span>
      </div>
    );

  return (
    <div
      className={`flex flex-col items-center justify-between flex-1 ${
        promt.length == 0 ? "" : "h-full"
      } w-full px-4 pb-4`}
    >
      <div
        className={` text-center ${promt.length == 0 ? "" : "hidden"} ${
          paramChatId ? "hidden" : ""
        } mb-15`}
      >
        <div className="flex items-center gap-3 text-2xl md:text-4xl font-semibold text-white mb-3">
          What do you want to build?
        </div>
        <p className="text-gray-400 text-sm md:text-[16px] mt-4">
          Create stunning apps & websites by chatting with AI.
        </p>
      </div>

      {/* Chat Section */}
      <div
        className={`w-full max-w-2xl lg:max-w-md ml-3 flex-1 overflow-y-auto scroll-hidden ${
          promt.length == 0 ? "" : "pt-6 pb-25"
        }  space-y-4 max-h-[75vh] px-1`}
      >
        {promt.map((msg, index) => (
          <div
            key={index}
            className={`w-full flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "model" ? (
              <div className="w-full  text-white rounded-xl py-3 text-[16px] whitespace-pre-wrap">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={codeTheme}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg mt-2"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code
                          className="bg-gray-800 px-1 py-0.5 rounded"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
                {index === promt.length - 1 &&
                  loading &&
                  msg.role === "model" &&
                  msg.content === "" && (
                    <ProgressiveLoader codeLoading={loading} />
                  )}
              </div>
            ) : (
              <div className="max-w-[80%] bg-blue-600 text-white rounded-lg p-3 text-sm whitespace-pre-wrap self-start">
                {msg.content}
              </div>
            )}
          </div>
        ))}
        {codeLoading && <ProgressiveLoader codeLoading={codeLoading} />}
        <div ref={promtEndRef} />
      </div>

      <div
        className={`max-w-2xl px-1 lg:max-w-110 ${
          promt.length === 0 ? "max-w-xl!" : ""
        } ${paramChatId ? "fixed bottom-5 mr-1" : ""} w-[96%] md:w-[100%]`}
      >
        <div
          className={`relative shadow shadow-purple-200  rounded-xl px-4 py-2 md:py-4`}
        >
          <textarea
            type="text"
            ref={textareaRef}
            value={input}
            autoFocus
            disabled={enhancedPrompt}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              enhancedPrompt
                ? "Enhancing prompt..."
                : "Type your idea and we'll bring it to life"
            }
            className={`flex-1 bg-transparent w-full text-white placeholder-white/70 ${
              enhancedPrompt && "font-semibold placeholder-white"
            } text-sm outline-none resize-none overflow-y-auto max-h-40 py-2 px-4`}
            onKeyDown={handleKeyDown}
          />

          <button
            onClick={handleSendPrompt}
            disabled={loading || input.trim().length === 0 || enhancedPrompt}
            className={`absolute top-7 right-5 p-2 rounded-full text-white transition 
                ${
                  loading || input.trim().length === 0 || enhancedPrompt
                    ? "hidden"
                    : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                }`}
          >
            <ArrowUp className="w-4 h-4 " />
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => handleEnhancePrompt(input)}
              className={`px-2.5 py-1.5 cursor-pointer rounded-lg text-[9px] sm:text-xs font-medium shadow transition bg-white/10`}
            >
              {enhancedPrompt ? (
                <span className="loading loading-ring loading-sm"></span>
              ) : (
                "✨"
              )}{" "}
              Enhance Prompt
            </button>
            <button
              onClick={() => setMode("game")}
              className={`px-2.5 py-1.5 cursor-pointer rounded-lg text-[9px] sm:text-xs font-medium shadow transition ${
                mode === "game"
                  ? "bg-white text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              🎮 Game
            </button>
            <button
              onClick={() => setMode("website")}
              className={`px-2.5 py-1.5 cursor-pointer rounded-lg text-[9px] sm:text-xs font-medium shadow transition ${
                mode === "website"
                  ? "bg-white text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              🌐 Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Promt;
