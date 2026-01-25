"use client";

import * as React from "react";
import { useChat } from "@/hooks/use-chat";
import { useWidgetSettings } from "@/hooks/use-widget-settings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { toast } from "@/components/ui/toast";
import {
  Sun,
  Moon,
  Trash2,
  // Download icon not used
  HelpCircle,
  MessageSquare,
  Star,
  Type,
  RotateCcw,
  Copy,
  Settings,
  FileText,
  FileDown,
} from "lucide-react";
import {
  exportChatAsText,
  exportChatAsPDF,
  copyChatToClipboard,
} from "@/lib/export-utils";
import type { FontSize, WidgetPosition } from "@/lib/types";
// FONT_SIZES and WIDGET_POSITIONS not used in this file
import { useState, useEffect } from "react";

/**
 * Widget menu component with all Phase 2 features
 * Provides dropdown menu with all widget options
 */
export function WidgetMenu() {
  const { messages, clearChat } = useChat();
  const { theme, fontSize, position, setTheme, setFontSize, setPosition } =
    useWidgetSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [clearChatOpen, setClearChatOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");

  const [chatbotTitle, setChatbotTitle] = useState("Chat Assistant");

  // Load chatbot title after mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      interface WindowWithChatbotConfig extends Window {
        CHATBOT_TITLE?: string;
      }
      const win = window as WindowWithChatbotConfig;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChatbotTitle(win.CHATBOT_TITLE || "Chat Assistant");
    }
  }, []);

  // Calculate if dark mode is active for UI display
  // Simple: dark = true, light = false
  const isDark = theme === "dark";

  const handleThemeToggle = () => {
    // Simple toggle between dark and light
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
    setMenuOpen(false);
  };

  const handleClearChat = () => {
    clearChat();
    setMenuOpen(false);
    toast.success("Chat cleared");
  };

  const handleExportText = () => {
    const text = exportChatAsText(messages);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-history-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Chat exported as text");
    setMenuOpen(false);
  };

  const handleExportPDF = () => {
    exportChatAsPDF(messages);
    toast.success("Opening PDF preview");
    setMenuOpen(false);
  };

  const handleCopyChat = async () => {
    try {
      await copyChatToClipboard(messages);
      toast.success("Chat copied to clipboard");
      setMenuOpen(false);
    } catch {
      toast.error("Failed to copy chat");
    }
  };

  const handleNewChat = () => {
    clearChat();
    setMenuOpen(false);
    toast.success("Started new chat");
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSubmitFeedback = async () => {
    try {
      const CHATBOT_BASE_URL =
        typeof window !== "undefined"
          ? window.CHATBOT_BASE_URL || window.location.origin
          : "";

      const response = await fetch(`${CHATBOT_BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "feedback",
          rating: feedbackRating,
          comment: feedbackComment,
          email: feedbackEmail,
        }),
      });

      if (response.ok) {
        toast.success("Thank you for your feedback!");
        setFeedbackOpen(false);
        setFeedbackRating(0);
        setFeedbackComment("");
        setFeedbackEmail("");
        setMenuOpen(false);
      } else {
        toast.error("Failed to submit feedback");
      }
    } catch {
      toast.error("Failed to submit feedback");
    }
  };

  const handleSubmitRating = async () => {
    try {
      const CHATBOT_BASE_URL =
        typeof window !== "undefined"
          ? window.CHATBOT_BASE_URL || window.location.origin
          : "";

      const response = await fetch(`${CHATBOT_BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "feedback",
          rating: feedbackRating,
          comment: feedbackComment,
        }),
      });

      if (response.ok) {
        if (typeof window !== "undefined") {
          localStorage.setItem("chatbot-rating-submitted", "true");
        }
        toast.success("Thank you for rating!");
        setRatingOpen(false);
        setFeedbackRating(0);
        setFeedbackComment("");
        setMenuOpen(false);
      } else {
        toast.error("Failed to submit rating");
      }
    } catch {
      toast.error("Failed to submit rating");
    }
  };

  const handleReportIssue = async () => {
    try {
      const CHATBOT_BASE_URL =
        typeof window !== "undefined"
          ? window.CHATBOT_BASE_URL || window.location.origin
          : "";

      const response = await fetch(`${CHATBOT_BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "issue",
          comment: feedbackComment,
          email: feedbackEmail,
        }),
      });

      if (response.ok) {
        toast.success("Issue reported. Thank you!");
        setFeedbackOpen(false);
        setFeedbackComment("");
        setFeedbackEmail("");
        setMenuOpen(false);
      } else {
        toast.error("Failed to report issue");
      }
    } catch {
      toast.error("Failed to report issue");
    }
  };

  return (
    <>
      <div className="relative z-[100]">
        <button
          id="cb-m-react"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setMenuOpen((prev) => !prev);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative z-[101] pointer-events-auto cursor-pointer"
          aria-label="Menu"
          type="button"
          style={{ pointerEvents: "auto", cursor: "pointer" }}
        >
          <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
        </button>

        {menuOpen && (
          <div
            id="cb-d-react"
            className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-[101] pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ pointerEvents: "auto" }}
          >
            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>

            {/* Export Chat History */}
            <button
              onClick={handleExportText}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              <span>Export as TXT</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Export as PDF</span>
            </button>

            {/* Copy Chat */}
            <button
              onClick={handleCopyChat}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Chat</span>
            </button>

            {/* New Chat */}
            <button
              onClick={() => setNewChatOpen(true)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>New Chat</span>
            </button>
            <ConfirmationDialog
              open={newChatOpen}
              onOpenChange={setNewChatOpen}
              title="Start New Chat?"
              description="This will clear your current conversation. Are you sure?"
              confirmText="Start New Chat"
              onConfirm={handleNewChat}
            />

            {/* Clear Chat */}
            <button
              onClick={() => setClearChatOpen(true)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Chat</span>
            </button>
            <ConfirmationDialog
              open={clearChatOpen}
              onOpenChange={setClearChatOpen}
              title="Clear Chat?"
              description="This will clear your current conversation. Are you sure?"
              confirmText="Clear Chat"
              onConfirm={handleClearChat}
            />

            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

            {/* Font Size */}
            <div className="px-4 py-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                <Type className="w-3 h-3" />
                Font Size
              </div>
              <div className="flex gap-2">
                {(["small", "medium", "large"] as FontSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setFontSize(size);
                      setMenuOpen(false);
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      fontSize === size
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {size.charAt(0).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Widget Position */}
            <div className="px-4 py-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                <Settings className="w-3 h-3" />
                Position
              </div>
              <div className="flex gap-2">
                {(["bottom-right", "bottom-left"] as WidgetPosition[]).map(
                  (pos) => (
                    <button
                      key={pos}
                      onClick={() => {
                        setPosition(pos);
                        setMenuOpen(false);
                      }}
                      className={`px-2 py-1 text-xs rounded ${
                        position === pos
                          ? "bg-black text-white dark:bg-white dark:text-black"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {pos === "bottom-right" ? "Right" : "Left"}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

            {/* About / Help */}
            <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
              <DialogTrigger asChild>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>About / Help</span>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>About {chatbotTitle}</DialogTitle>
                  <DialogDescription>
                    A RAG-powered chatbot that provides accurate, context-aware
                    answers.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
                      How to use:
                    </h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                      <li>Ask questions to get helpful information</li>
                      <li>
                        The chatbot uses AI to provide accurate, context-aware
                        answers
                      </li>
                      <li>Your conversation history is saved automatically</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
                      Features:
                    </h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                      <li>Export chat history as TXT or PDF</li>
                      <li>Copy conversations to clipboard</li>
                      <li>Dark/Light mode support</li>
                      <li>Adjustable font size</li>
                      <li>Customizable widget position</li>
                    </ul>
                  </div>
                  <div>
                    <a
                      href="https://www.arnobmahmud.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Visit Portfolio →
                    </a>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Feedback / Report Issue */}
            <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
              <DialogTrigger asChild>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Feedback / Report Issue</span>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Feedback / Report Issue</DialogTitle>
                  <DialogDescription>
                    Help us improve by sharing your feedback or reporting
                    issues.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300  font-medium mb-2 block">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      value={feedbackEmail}
                      onChange={(e) => setFeedbackEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300  font-medium mb-2 block">
                      Comment
                    </label>
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Your feedback or issue description..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setFeedbackOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleReportIssue}>Submit</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Rate This Chatbot */}
            {typeof window !== "undefined" &&
              !localStorage.getItem("chatbot-rating-submitted") && (
                <Dialog open={ratingOpen} onOpenChange={setRatingOpen}>
                  <DialogTrigger asChild>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      <span>Rate This Chatbot</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rate This Chatbot</DialogTitle>
                      <DialogDescription>
                        How would you rate your experience?
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setFeedbackRating(star)}
                            className={`text-3xl ${
                              star <= feedbackRating
                                ? "text-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2 block">
                          Comment (optional)
                        </label>
                        <textarea
                          value={feedbackComment}
                          onChange={(e) => setFeedbackComment(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder="Share your thoughts..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setRatingOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitRating}
                        disabled={feedbackRating === 0}
                      >
                        Submit Rating
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
          </div>
        )}
      </div>

      {/* Close menu when clicking outside */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[99] pointer-events-auto"
          onClick={(e) => {
            // Only close if clicking the overlay itself, not menu elements
            const target = e.target as HTMLElement;
            if (
              target === e.currentTarget ||
              (!target.closest("#cb-m-react") && !target.closest("#cb-d-react"))
            ) {
              setMenuOpen(false);
            }
          }}
          onMouseDown={(e) => {
            const target = e.target as HTMLElement;
            if (
              target.closest("#cb-m-react") ||
              target.closest("#cb-d-react")
            ) {
              e.stopPropagation();
            }
          }}
        />
      )}
    </>
  );
}
