import React from "react";
import { Keyboard, X } from "lucide-react";

const shortcuts = [
  { keys: "Ctrl + J", action: "Enhance Prompt" },
  { keys: "Ctrl + G", action: "Switch to Game Mode" },
  { keys: "Ctrl + O", action: "Switch to Website Mode" },
  { keys: "Ctrl + B", action: "Toggle Sidebar" },
  { keys: "Enter", action: "Send Prompt" },

  { keys: "Ctrl + M", action: "Toggle Theme" },
  { keys: "Ctrl + E", action: "Export Project" },
  { keys: "Ctrl + D", action: "Deploy Project" },
  { keys: "Ctrl + 1", action: "Switch to Code Tab" },
  { keys: "Ctrl + 2", action: "Switch to Preview Tab" },
  { keys: "Ctrl + 3", action: "Set Preview to Desktop" },
  { keys: "Ctrl + 4", action: "Set Preview to Mobile" },

  { keys: "Ctrl + H", action: "Go to Home Page" },
];

const ShortcutModal = ({ onClose }) => {

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white text-black w-[90%] md:w-[500px] max-h-[90vh] rounded-xl p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded hover:bg-gray-200"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className=" flex  items-center gap-1 text-xl font-bold mb-4"><Keyboard /> Keyboard Shortcuts</h2>
        <div className="space-y-3 overflow-y-auto max-h-[70vh]">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-3 py-1 border border-gray-200 rounded-md bg-gray-50"
            >
              <span className="font-mono text-sm text-blue-600">
                {s.keys}
              </span>
              <span className="text-sm">{s.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShortcutModal;
