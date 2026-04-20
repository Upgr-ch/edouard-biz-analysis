import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Brain, User, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import {
  ANON_MAX_MESSAGES,
  appendAnonMessage,
  getAnonMessages,
  getAnonUserMessageCount,
  setPendingMessage,
} from "@/lib/anonymousChat";

const ChatPanel = ({
  conversationId,
  persistedMessages = [],
  saveMessage,
  onCreateConversation,
  isQuotaReached = false,
}: any) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAnonymous = !user;

  const [anonMessages, setAnonMessages] = useState<any[]>(() =>
    getAnonMessages().map((m, i) => ({ ...m, id: `anon-${i}`, number: i + 1 })),
  );

  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const displayMessages = isAnonymous
    ? anonMessages.length > 0
      ? anonMessages
      : [{ id: "welcome", role: "assistant", content: "Bonjour, je suis Édouard.", number: 0 }]
    : persistedMessages.map((m: any, i: number) => ({ ...m, number: i + 1 }));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  const handleSend = async () => {
    if (isLoading || isQuotaReached || !input.trim()) return;
    const content = input.trim();

    if (isAnonymous && getAnonUserMessageCount() >= ANON_MAX_MESSAGES) {
      setPendingMessage(content);
      toast.info("Inscription requise.");
      navigate("/auth");
      return;
    }

    setInput("");
    setIsLoading(true);

    if (isAnonymous) {
      appendAnonMessage("user", content);
      setTimeout(() => {
        appendAnonMessage("assistant", "Analyse en cours...");
        setAnonMessages(getAnonMessages().map((m, i) => ({ ...m, id: `anon-${i}`, number: i + 1 })));
        setIsLoading(false);
      }, 800);
    } else {
      let convId = conversationId;
      if (!convId) convId = await onCreateConversation(content.slice(0, 30));
      await saveMessage(convId, "user", content);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {displayMessages.map((msg: any, idx: number) => (
            <div key={msg.id || idx} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
              <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1 px-1">
                {msg.role === "assistant" ? "Édouard" : "Vous"} — Message #{msg.number ?? idx + 1}
              </span>

              <div className={cn("flex gap-3 w-full", msg.role === "user" ? "flex-row-reverse" : "")}>
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    msg.role === "assistant" ? "bg-primary text-white" : "bg-muted",
                  )}
                >
                  {msg.role === "assistant" ? <Brain size={16} /> : <User size={16} />}
                </div>

                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                    msg.role === "assistant" ? "bg-card border border-border" : "bg-primary/10",
                  )}
                >
                  {msg.role === "assistant" ? (
                    /* LE FIX EST ICI : Aucune prop className sur ReactMarkdown */
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-end gap-2 max-w-3xl mx-auto bg-card p-2 rounded-2xl border">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Posez votre question..."
            className="flex-1 min-h-[40px] bg-transparent border-none focus:ring-0 text-sm py-2 resize-none outline-none"
          />
          <button onClick={handleSend} disabled={isLoading} className="bg-primary text-white p-2.5 rounded-xl">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
