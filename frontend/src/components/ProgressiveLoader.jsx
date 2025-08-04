import React, { useState, useEffect } from "react";
import { Loader2, Clock, CheckCircle, AlertCircle } from "lucide-react";

const ProgressiveLoader = ({ codeLoading, className = "" }) => {
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [dots, setDots] = useState("");

  const loadingStates = [
    {
      text: "Thinking",
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
      color: "text-blue-400",
      duration: 6000,
    },
    {
      text: "Wait",
      icon: <Clock className="w-5 h-5 animate-pulse" />,
      color: "text-amber-400",
      duration: 6000,
    },
    {
      text: "Almost done",
      icon: <CheckCircle className="w-5 h-5 animate-bounce" />,
      color: "text-green-400",
      duration: 5000,
    },
    {
      text: "Delay in response",
      icon: <AlertCircle className="w-5 h-5 animate-pulse" />,
      color: "text-red-400",
      duration: 3000,
    },
  ];

  // Handle state progression
  useEffect(() => {
    if (!codeLoading) {
      setCurrentStateIndex(0);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStateIndex((prev) =>
        prev < loadingStates.length - 1 ? prev + 1 : prev
      );
    }, loadingStates[currentStateIndex].duration);

    return () => clearTimeout(timer);
  }, [currentStateIndex, codeLoading]);

  useEffect(() => {
    if (!codeLoading) {
      setDots("");
      return;
    }

    const dotTimer = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(dotTimer);
  }, [codeLoading]);

  // Reset state when loading stops
  useEffect(() => {
    if (!codeLoading) {
      setCurrentStateIndex(0);
      setDots("");
    }
  }, [codeLoading]);

  if (!codeLoading) return null;

  const currentState = loadingStates[currentStateIndex];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex-shrink-0">
        <div
          className={`w-5 h-5 flex items-center justify-center ${currentState.color} transition-colors duration-300`}
        >
          {currentState.icon}
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <span
          className={`text-md font-medium ${currentState.color} transition-all duration-300 ease-in-out`}
        >
          {currentState.text}
        </span>
        <span
          className={`text-md font-medium ${currentState.color} w-8 text-left`}
        >
          {dots}
        </span>
      </div>

      {/* Progress indicator */}
      <div className="flex space-x-1">
        {loadingStates.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index <= currentStateIndex
                ? currentState.color.replace("text-", "bg-")
                : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressiveLoader;
