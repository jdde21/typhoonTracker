import { useState, useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';

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


  return (
    <>
      {!isOpen && (
        <button
          onClick={handleClick}
          aria-label="Open chat assistant"
          className="fixed bottom-6 left-6 z-9999 flex items-center gap-2 rounded-full bg-white px-[18px] py-2.5 text-sm font-semibold text-black shadow-lg shadow-black/20 border border-black/10 transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 active:translate-y-0"
        >
          <Sparkles size={18} className="animate-pulse text-black" />
          <span>Ask AI</span>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="box"
            initial={{ opacity: 0, scale: 0.8, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{ transformOrigin: 'bottom left' }}
            className="fixed bottom-6 left-6 z-9999 pointer-events-auto border border-white/10 rounded-xl w-90 flex h-96 flex-col overflow-hidden bg-neutral-900/90 backdrop-blur text-white select-none shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="text-sm font-semibold">Chat</span>
              <button
                onClick={handleClick}
                className="rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 text-sm">
              {messages.map((value, i) => (
                <div
                  key={i}
                  className={`mb-2 flex ${value.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <span
                    className={`max-w-[75%] rounded-xl px-3 py-1.5 ${value.from === 'user'
                        ? 'rounded-br-sm bg-white text-black'
                        : 'rounded-bl-sm bg-white/10 text-white'
                      }`}
                  >
                    {value.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 border-t border-white/10 p-2">
              <input
                ref={inputRef}
                type="text"
                onChange={handleType}
                placeholder="Type a message..."
                className="flex-1 rounded-full bg-white/10 px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/30"
              />
              <button
                onClick={handleSubmit}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/80"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )


}