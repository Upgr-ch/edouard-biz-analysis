import { useState, useRef, useEffect } from "react";
import { Send, Brain, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  stepContext: string;
}

const ChatPanel = ({ stepContext }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Bienvenue. Je suis Édouard, ton consultant business. Décris-moi ton idée de projet et je t'aiderai à en évaluer la faisabilité et la rentabilité. Sois précis : quel problème résous-tu, pour qui, et comment comptes-tu acquérir tes clients ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulated response for now
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Je note ton idée. Pour avancer dans l'analyse, j'ai besoin de précisions sur ta stratégie d'acquisition client — c'est le facteur numéro un de viabilité. Comment comptes-tu concrètement atteindre tes premiers clients dans les 30 premiers jours ?",
      };
      setMessages((prev) => [...prev, response]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <div className="w-6 h-6 rounded-md gradient-primary flex items-center justify-center">
          <Brain className="w-3 h-3 text-primary-foreground" />
        </div>
        <span className="text-sm font-medium text-foreground">Édouard</span>
        <span className="text-xs text-muted-foreground ml-1">— {stepContext}</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-decision-viable animate-pulse" />
          <span className="text-xs text-muted-foreground">En ligne</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3 animate-fade-in",
              msg.role === "user" ? "flex-row-reverse" : ""
            )}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                msg.role === "assistant" ? "gradient-primary" : "bg-accent"
              )}
            >
              {msg.role === "assistant" ? (
                <Brain className="w-3.5 h-3.5 text-primary-foreground" />
              ) : (
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>
            <div
              className={cn(
                "max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "assistant"
                  ? "bg-card text-foreground border border-border/50"
                  : "bg-primary/15 text-foreground"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
              <Brain className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <div className="bg-card border border-border/50 rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Décris ton idée de business..."
            className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="gradient-primary text-primary-foreground p-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed glow-primary"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
