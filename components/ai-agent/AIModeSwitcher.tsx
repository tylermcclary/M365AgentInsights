"use client";

import React, { useState } from "react";
import { Settings, Brain, Zap, Cpu } from "lucide-react";
import Button from "@/components/ui/Button";
import { AIProcessingMode } from "@/services/ai-types";

interface AIModeSwitcherProps {
  currentMode: AIProcessingMode;
  onModeChange: (mode: AIProcessingMode) => void;
  className?: string;
}

export default function AIModeSwitcher({ currentMode, onModeChange, className = "" }: AIModeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const modes = [
    {
      id: "mock" as AIProcessingMode,
      name: "Mock AI",
      description: "Fast demo mode with simulated insights",
      icon: <Cpu className="h-4 w-4" />,
      color: "text-gray-600"
    },
    {
      id: "nlp" as AIProcessingMode,
      name: "Local NLP",
      description: "Client-side natural language processing",
      icon: <Brain className="h-4 w-4" />,
      color: "text-blue-600"
    },
    {
      id: "openai" as AIProcessingMode,
      name: "OpenAI",
      description: "Advanced AI analysis with GPT models",
      icon: <Zap className="h-4 w-4" />,
      color: "text-green-600"
    }
  ];

  const currentModeInfo = modes.find(m => m.id === currentMode);

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        leftIcon={currentModeInfo?.icon}
        className="flex items-center space-x-2"
      >
        <span className="text-sm">{currentModeInfo?.name}</span>
        <Settings className="h-3 w-3" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">AI Processing Mode</h3>
              <p className="text-xs text-gray-500 mt-1">Choose how AI analyzes client data</p>
            </div>
            
            <div className="p-2">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    onModeChange(mode.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start space-x-3 p-3 rounded-md hover:bg-gray-50 transition-colors ${
                    currentMode === mode.id ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <div className={`mt-0.5 ${mode.color}`}>
                    {mode.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900">{mode.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{mode.description}</div>
                  </div>
                  {currentMode === mode.id && (
                    <div className="mt-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <div className="text-xs text-gray-500">
                Current mode: <span className="font-medium text-gray-700">{currentModeInfo?.name}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
