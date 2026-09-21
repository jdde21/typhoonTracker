import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";

/**
 * AiChatWidget
 * ------------
 * A floating icon button that opens a small dialog where the user can type
 * a question. This component does NOT call any API itself — you own that.
 *
 * Usage:
 *   <AiChatWidget
 *     onAsk={async (question) => {
 *       // call your own backend / model here
 *       const res = await fetch("/api/ask", { method: "POST", body: JSON.stringify({ question }) });
 *       const data = await res.json();
 *       return data.answer; // returned string is shown as the response
 *     }}
 *   />
 *
 * Props:
 *   onAsk(question: string) => Promise<string> | string
 *     Called when the user submits a question. Return (or resolve to) the
 *     answer text to display. If it throws, an error state is shown.
 *
 *   title?: string                 Dialog heading. Default "Ask AI".
 *   placeholder?: string           Input placeholder. Default "Ask a question…".
 *   accentColor?: string           Tailwind color stem, e.g. "indigo", "emerald", "rose". Default "indigo".
 *   position?: "bottom-right" | "bottom-left"   Default "bottom-right".
 */
export default function AiChatWidget({
  onAsk,
  title = "Ask AI",
  placeholder = "Ask a question…",
  accentColor = "indigo",
  position = "bottom-left",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const inputRef = useRef(null);
  const dialogRef = useRef(null);

  // Focus the input when the dialog opens
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Close when clicking outside the dialog
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const resetState = () => {
    setQuestion("");
    setAnswer(null);
    setError(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetState();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const result = await onAsk?.(trimmed);
      setAnswer(typeof result === "string" ? result : "");
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const positionClasses =
    position === "bottom-left" ? "left-5 sm:left-6" : "right-5 sm:right-6";

  const accent = {
    button: `bg-${accentColor}-600 hover:bg-${accentColor}-500`,
    ring: `focus-visible:ring-${accentColor}-500`,
    send: `bg-${accentColor}-600 hover:bg-${accentColor}-500 disabled:bg-${accentColor}-300`,
    dot: `text-${accentColor}-600`,
  };

  return (
    <div className={`fixed bottom-5 sm:bottom-6 ${positionClasses} z-50`}>
      {/* Dialog */}
      {isOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-chat-widget-title"
          className={`absolute bottom-16 ${
            position === "bottom-left" ? "left-0" : "right-0"
          } mb-2 w-[calc(100vw-2.5rem)] max-w-sm rounded-2xl border border-gray-200 bg-white shadow-2xl
          animate-in fade-in slide-in-from-bottom-2 duration-150`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className={`h-4 w-4 ${accent.dot}`} aria-hidden="true" />
              <h2 id="ai-chat-widget-title" className="text-sm font-semibold text-gray-900">
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close dialog"
              className={`rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 ${accent.ring}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto px-4 py-3">
            {!answer && !isLoading && !error && (
              <p className="text-sm text-gray-400">
                Type a question below and hit send.
              </p>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Thinking…
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            {answer && !isLoading && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                {answer}
              </p>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gray-100 p-3">
            <label htmlFor="ai-chat-widget-input" className="sr-only">
              {placeholder}
            </label>
            <input
              id="ai-chat-widget-input"
              ref={inputRef}
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={placeholder}
              disabled={isLoading}
              className={`flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900
              placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 ${accent.ring} disabled:opacity-60`}
            />
            <button
              type="submit"
              disabled={!question.trim() || isLoading}
              aria-label="Send question"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition-colors
              focus:outline-none focus-visible:ring-2 ${accent.ring} disabled:cursor-not-allowed ${accent.send}`}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close AI chat" : "Open AI chat"}
        className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-transform
        hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${accent.ring} ${accent.button}`}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </button>
    </div>
  );
}