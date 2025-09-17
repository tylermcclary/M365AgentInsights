"use client";

import React, { useState } from "react";
import { Settings, Brain, Zap, Cpu } from "lucide-react";
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
      icon: <Cpu style={{ height: "16px", width: "16px" }} />,
      color: "#605e5c"
    },
    {
      id: "nlp" as AIProcessingMode,
      name: "Local NLP",
      description: "Client-side natural language processing",
      icon: <Brain style={{ height: "16px", width: "16px" }} />,
      color: "#0078d4"
    },
    {
      id: "openai" as AIProcessingMode,
      name: "OpenAI",
      description: "Advanced AI analysis with GPT models",
      icon: <Zap style={{ height: "16px", width: "16px" }} />,
      color: "#107c10"
    }
  ];

  const currentModeInfo = modes.find(m => m.id === currentMode);

  return (
    <div style={{ position: "relative", ...(className ? { className } : {}) }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#323130",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontWeight: "500"
        }}
        onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = "#f3f2f1"}
        onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = "transparent"}
      >
        <div style={{ color: currentModeInfo?.color }}>
          {currentModeInfo?.icon}
        </div>
        <span>{currentModeInfo?.name}</span>
        <Settings style={{ height: "12px", width: "12px" }} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10
            }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div style={{
            position: "absolute",
            right: 0,
            top: "100%",
            marginTop: "8px",
            width: "256px",
            backgroundColor: "white",
            border: "1px solid #edebe9",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            zIndex: 20
          }}>
            <div style={{
              padding: "12px",
              borderBottom: "1px solid #f3f2f1"
            }}>
              <h3 style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#323130",
                margin: 0
              }}>
                AI Processing Mode
              </h3>
              <p style={{
                fontSize: "12px",
                color: "#605e5c",
                margin: "4px 0 0 0"
              }}>
                Choose how AI analyzes client data
              </p>
            </div>
            
            <div style={{ padding: "8px" }}>
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    onModeChange(mode.id);
                    setIsOpen(false);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "12px",
                    borderRadius: "6px",
                    border: currentMode === mode.id ? "1px solid #deecf9" : "1px solid transparent",
                    backgroundColor: currentMode === mode.id ? "#f3f2f1" : "transparent",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                  onMouseEnter={(e) => {
                    if (currentMode !== mode.id) {
                      (e.target as HTMLElement).style.backgroundColor = "#f3f2f1";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentMode !== mode.id) {
                      (e.target as HTMLElement).style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <div style={{ 
                    marginTop: "2px",
                    color: mode.color
                  }}>
                    {mode.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#323130",
                      marginBottom: "2px"
                    }}>
                      {mode.name}
                    </div>
                    <div style={{
                      fontSize: "12px",
                      color: "#605e5c",
                      lineHeight: "1.4"
                    }}>
                      {mode.description}
                    </div>
                  </div>
                  {currentMode === mode.id && (
                    <div style={{ marginTop: "4px" }}>
                      <div style={{
                        width: "8px",
                        height: "8px",
                        backgroundColor: "#0078d4",
                        borderRadius: "50%"
                      }}></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div style={{
              padding: "12px",
              borderTop: "1px solid #f3f2f1",
              backgroundColor: "#faf9f8"
            }}>
              <div style={{
                fontSize: "12px",
                color: "#605e5c"
              }}>
                Current mode: <span style={{ fontWeight: 600, color: "#323130" }}>{currentModeInfo?.name}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
