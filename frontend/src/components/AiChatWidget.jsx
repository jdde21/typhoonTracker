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

  const [isOpen, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ "from": "ai", text: "ask away" }])
  const query = useRef("")
  const inputRef = useRef(null)

  const handleClick = () => {
    setOpen(prev => !prev)
  }

  const handleType = (e) => {
    query.current = e.target.value
    console.log(e.target.value)
  }

  const handleSubmit = async () => {
    inputRef.current.value = ""
    setMessages(prev => [...prev, { "from": "user", "text": query.current }])
    const response = await onAsk(query.current)
    setMessages(prev => [...prev, { "from": "ai", "text": response }])
  }


  return <>
    {
      !isOpen ?
        <button
          onClick={handleClick}
          aria-label="Open chat assistant"
          className="fixed bottom-6 left-6 z-9999 flex items-center gap-2 rounded-full bg-white px-[18px] py-2.5 text-sm font-semibold text-black shadow-lg shadow-black/20 border border-black/10 transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 active:translate-y-0"
        >
          <Sparkles size={18} className="animate-pulse text-black" />
          <span>Ask AI</span>
        </button> :
        <div className="fixed bottom-20 left-6 z-9999 flex h-96 w-80 flex-col border border-gray-300 bg-white">
          <div className="flex items-center justify-between border-b border-gray-300 px-3 py-2">
            <span className="text-sm font-medium">Chat</span>
            <button onClick={handleClick} className="text-sm text-gray-500">
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 text-sm">
            {
              messages.map((value, i) => (
                <div
                  key={i}
                  className={`mb-2 flex ${value.from === "user" ? 'justify-end' : 'justify-start'}`}
                >
                  <span className="max-w-[75%] rounded-md bg-gray-100 px-2 py-1">
                    {value.text}
                  </span>
                </div>
              ))
            }
          </div>

          <div className="flex border-t border-gray-300">
            <input
              ref={inputRef}
              onChange={handleType}
              type="text"
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
            <button
              onClick={handleSubmit}
              className="border-l border-gray-300 px-3 text-sm"
            >
              Send
            </button>
          </div>
        </div>
    }
  </>


}