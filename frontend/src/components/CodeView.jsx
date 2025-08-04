import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import {
  Code,
  Eye,
  File,
  FolderDown,
  Loader2,
  Moon,
  Rocket,
  Sun,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import SandpackSync from "./SandpackSync ";
import axiosClient from "../utils/axiosClient";
import LookUp from "../utils/LookUp";

function CodeView({
  prompt,
  chatId,
  initialFiles = {},
  sandboxFiles,
  setSandboxFiles,
  setPromt,
  setCodeLoading,
  mode,
}) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("code");
  const [deploying, setDeploying] = useState(false);
  const [istheme, setTheme] = useState(true);
  const [previewDevice, setPreviewDevice] = useState("desktop");

  // const handleSendPrompt = async () => {
  //   if (!prompt) return;

  //   setLoading(true);
  //   setCodeLoading(true);

  //   const controller = new AbortController();
  //   const signal = controller.signal;

  //   try {
  //     const response = await fetch(
  //       `${import.meta.env.VITE_BACKEND_URL}/chat/code/${chatId}`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         credentials: "include",
  //         body: JSON.stringify({ message: prompt }),
  //         signal,
  //       }
  //     );

  //     setCodeLoading(false);
  //     if (!response.ok || !response.body) {
  //       throw new Error("Streaming failed.");
  //     }

  //     const reader = response.body.getReader();
  //     const decoder = new TextDecoder("utf-8");
  //     let buffer = "";

  //     while (true) {
  //       const { value, done } = await reader.read();
  //       if (done) break;

  //       buffer += decoder.decode(value, { stream: true });

  //       let boundary = buffer.lastIndexOf("\n");

  //       if (boundary !== -1) {
  //         const fullLines = buffer.slice(0, boundary).split("\n");
  //         buffer = buffer.slice(boundary + 1); // save incomplete line

  //         for (const line of fullLines) {
  //           if (!line.trim()) continue;

  //           try {
  //             const parsed = JSON.parse(line); // { type: 'file', value: { path, content } }

  //             if (parsed.type === "file") {
  //               const { path, content } = parsed.value;

  //               // 📁 Add progress msg
  //               setPromt((prev) => {
  //                 const last = prev[prev.length - 1];

  //                 return [
  //                   ...prev.slice(0, -1),
  //                   {
  //                     ...last,
  //                     role: "model",
  //                     content: last.content + `\n\n📁 Generating ${path}...`,
  //                     temp: true,
  //                   },
  //                 ];
  //               });

  //               const isPackageJson = path === "/package.json";

  //               if (!isPackageJson) {
  //                 let streamedContent = "";
  //                 for (let i = 0; i < content.length; i += 10) {
  //                   streamedContent += content.slice(i, i + 10);
  //                   setSandboxFiles((prev) => ({
  //                     ...prev,
  //                     [path]: { code: streamedContent },
  //                   }));
  //                   await new Promise((r) => setTimeout(r, 25));
  //                 }
  //               } else {
  //                 setSandboxFiles((prev) => ({
  //                   ...prev,
  //                   [path]: { code: content },
  //                 }));
  //               }

  //               setPromt((prev) => [
  //                 ...prev.slice(0, -1),
  //                 {
  //                   ...prev[prev.length - 1],
  //                   content:
  //                     prev[prev.length - 1].content + `\n✅ ${path}`,
  //                 },
  //               ]);
  //             }
  //           } catch (e) {
  //             console.warn("Invalid JSON line:", line);
  //             continue;
  //           }
  //         }
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Streaming Error:", err);
  //     setPromt((prev) => {
  //       const last = prev[prev.length - 1];
  //       const withoutTemp =
  //         last?.temp && last.content === "🧠 Generating code, please wait..."
  //           ? prev.slice(0, -1)
  //           : prev;

  //       return [
  //         ...withoutTemp,
  //         {
  //           role: "model",
  //           content: "❌ Code generation failed.",
  //         },
  //       ];
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSendPrompt = async () => {
    if (!prompt) return;

    setLoading(true);
    setCodeLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/chat/code/${chatId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ message: prompt }),
        }
      );

      setCodeLoading(false);

      if (!response.ok) {
        throw new Error("Failed to generate code.");
      }

      const data = await response.json();

      if (!data.success || !data.files) {
        throw new Error("Invalid response format.");
      }

      const allFiles = {};
      for (const { path, content } of data.files) {
        allFiles[path] = { code: content };
      }
      setSandboxFiles(allFiles);

      toast.success(`✅ ${data.files.length} files generated successfully!`);
      // Update prompt content with success message
      setPromt((prev) => [
        ...prev,
        {
          role: "model",
          content: `✅ Generated ${data.files.length} files.`,
        },
      ]);
    } catch (err) {
      console.error("Generation Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSandboxFiles(initialFiles);
  }, [initialFiles]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (prompt) handleSendPrompt();
    }, 500);

    return () => clearTimeout(timeout);
  }, [prompt]);

  const handleDownloadAll = () => {
    const zip = new JSZip();

    Object.entries(sandboxFiles).forEach(([path, { code }]) => {
      zip.file(path.replace(/^\//, ""), code);
    });

    zip.generateAsync({ type: "blob" }).then((blob) => {
      saveAs(blob, "project.zip");
    });
  };

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      const files = Object.entries(sandboxFiles).map(([path, { code }]) => ({
        path,
        content: code,
      }));

      const res = await axiosClient.post("/deploy", { files });

      if (res.data.success && res.data.url) {
        alert("✅ Your site is live!");
        window.open(res.data.url, "_blank");
      } else {
        alert("❌ Failed to deploy. Check console");
        console.log(res.data);
      }
    } catch (err) {
      console.error("Deployment Error:", err);
      alert("❌ Error during deployment.");
    } finally {
      setDeploying(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        setTheme((prev) => !prev);
      }

      if (e.ctrlKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        handleDownloadAll();
      }

      if (e.ctrlKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (!deploying) handleDeploy();
      }

      if (e.ctrlKey && e.key === "1") {
        e.preventDefault();
        setActiveTab("code");
      }

      if (e.ctrlKey && e.key === "2") {
        e.preventDefault();
        setActiveTab("preview");
      }

      if (e.ctrlKey && e.key === "3") {
        e.preventDefault();
        setPreviewDevice("desktop");
      }

      if (e.ctrlKey && e.key === "4") {
        e.preventDefault();
        setPreviewDevice("mobile");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deploying]);

  return (
    <div>
      <div className="flex items-center justify-between border-b border-white/10  p-2 pr-5 h-[7%]">
        <div className="flex gap-1 mr-1">
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center px-2 md:px-3 py-1..5 rounded-md  text-[10px] md:text-sm transition-colors ${
              activeTab === "code"
                ? "bg-blue-600/30 text-white font-bold shadow-sm cursor-default"
                : "text-gray-600 hover:text-yellow-500 cursor-pointer"
            }`}
          >
            <Code className="h-3 w-3 md:h-4.5 md:w-4.5 mr-1 md:mr-2" />
            Code
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center px-2 md:px-3 py-1.5 rounded-md text-[10px] md:text-sm transition-colors ${
              activeTab === "preview"
                ? "bg-blue-600/30 text-white font-bold shadow-sm cursor-default"
                : "text-gray-600 hover:text-yellow-500 cursor-pointer "
            }`}
          >
            <Eye className="h-3 w-3 md:h-4.5 md:w-4.5 mr-1 md:mr-2" />
            Preview
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setTheme((prev) => !prev)}
            className="flex items-center active:scale-95 hover:bg-black cursor-pointer px-1.5 md:px-2 py-0 md:py-1.5 rounded-md text-white font-medium text-xs shadow shadow-gray-300"
          >
            {istheme ? (
              <Moon className="h-3 w-3 md:h-4.5 md:w-4.5" />
            ) : (
              <Sun className="h-3 w-3 md:h-4.5 md:w-4.5 text-yellow-400" />
            )}
          </button>
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-1 active:scale-95 hover:bg-pink-700/80 cursor-pointer px-2 py-1.5 rounded-md bg-pink-700 text-white font-medium text-[8px] md:text-xs shadow-sm"
          >
            <FolderDown className="h-3 w-3 md:h-4.5 md:w-4.5" />
            <span>Export</span>
          </button>
          <button
            onClick={handleDeploy}
            disabled={deploying}
            className={`flex items-center gap-1 active:scale-95 hover:bg-blue-500/80 cursor-pointer px-2 py-2 rounded-md bg-blue-500 font-bold text-white text-[8px] md:text-xs shadow-sm   ${
              deploying
                ? "bg-blue-400 cursor-not-allowed"
                : "hover:bg-blue-500/80 bg-blue-500"
            }`}
          >
            {deploying ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Deploying...</span>
              </>
            ) : (
              <>
                <Rocket className="h-3 w-3 md:h-4.5 md:w-4.5" />
                <span>Deploy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <SandpackProvider
        template={mode === "website" ? "static" : "react"}
        theme={istheme ? "dark" : "light"}
        files={sandboxFiles}
        options={{
          showNavigator: true,
          showLineNumbers: true,
          showInlineErrors: true,
          wrapContent: true,
          editorHeight: "100%",
          layout: "preview",
          showConsole: true,
          showConsoleButton: true,
          externalResources: ["https://cdn.tailwindcss.com"],
        }}
        customSetup={{
          dependencies: {
            ...LookUp?.Dependencies,
          },
        }}
      >
        <SandpackSync activeTab={activeTab} />

        <SandpackLayout className="rounded-b-2xl! h-[61.5vh]! md:h-[83.2vh]! lg:h-[87vh]!">
          {activeTab === "code" &&
            (loading ? (
              <div className="p-4 text-green-500 h-full w-full flex flex-col gap-3 items-center justify-center text-xl animate-pulse">
                <File size={50} />
                <div>
                  <span className="loading loading-spinner text-green-500"></span>{" "}
                  Your preview will appear here
                </div>
              </div>
            ) : (
              <>
                <SandpackFileExplorer className="h-[22vh]! md:h-[83.2vh]! lg:h-[87vh]!" />
                <SandpackCodeEditor
                  showLineNumbers
                  wrapContent
                  showTabs={false}
                  closableTabs={false}
                  className="h-[61.5vh]! md:h-[83.2vh]! lg:h-[87vh]!"
                />
              </>
            ))}

          {activeTab === "preview" && (
            <div className="relative w-full h-[83.2vh] lg:h-[87.2vh]">
              {/* Toggle Device Buttons */}
              <div className="absolute bottom-1 right-55 z-2 flex gap-1 text-sm text-yellow-400">
                ⚠️{" "}
                <span>
                  Preview not loading? go to{" "}
                  <span className="font-semibold">Code</span> tab see bottom
                  right click on tab → <span className="underline">Run</span>.
                </span>
              </div>

              <div className="absolute top-2 right-2 z-20 flex gap-2">
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`px-2 py-1 text-xs font-semibold rounded-md ${
                    previewDevice === "desktop"
                      ? "bg-white text-black"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  🖥 Desktop
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`px-2 py-1 text-xs font-semibold rounded-md ${
                    previewDevice === "mobile"
                      ? "bg-white text-black"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  📱 Mobile
                </button>
              </div>

              {/* Loading Preview Message */}
              {loading ? (
                <div className="p-4 text-yellow-500 h-full w-full flex flex-col gap-3 items-center justify-center text-xl animate-pulse">
                  <Zap size={50} />
                  <div>Your preview will appear here</div>
                </div>
              ) : (
                <div
                  className={`mx-auto bg-white shadow-md rounded-md overflow-hidden ${
                    previewDevice === "mobile"
                      ? "w-[375px] h-[667px]" // iPhone X
                      : "w-full h-full"
                  }`}
                >
                  <SandpackPreview className="h-full w-full" showNavigator />
                </div>
              )}
            </div>
          )}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}

export default CodeView;
