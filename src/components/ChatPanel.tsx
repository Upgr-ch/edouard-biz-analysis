import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Brain, User, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

// Version ultra-sécurisée des fonctions anonymes pour éviter les crashs si le fichier est manquant
const getAnonCount = () => {
  try {
    return localStorage.getItem("anon-messages-count") ? Number(localStorage.getItem("anon-messages-count")) : 0;
  } catch {
    return 0;
  }
};

const ChatPanel = ({ conversationId, persistedMessages = [], isQuotaReached = false }: any) => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");

  // Message d'accueil strict
  const welcome = {
    id: "welcome",
    role: "assistant",
    content:
      "Bonjour, je suis Édouard. Je suis là pour t'aider à valider et structurer ton projet business.\n\nDis-moi, quel est le projet sur lequel tu travailles en ce moment ?",
  };

  // On s'assure que displayMessages est TOUJOURS un tableau
  const displayMessages = persistedMessages && persistedMessages.length > 0 ? persistedMessages : [welcome];

  const messagesLeft = Math.max(0, 5 - getAnonCount());

  return (
    <div className="flex flex-col h-full bg-white text-slate-900">
      {/* Zone Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {displayMessages.map((msg: any, idx: number) => (
          <div key={idx} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
            <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">
              {msg.role === "assistant" ? "Édouard" : "Vous"} — Message #{idx}
            </span>
            <div className={cn("flex gap-3 max-w-[85%]", msg.role === "user" ? "flex-row-reverse" : "")}>
              <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200">
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm prose-slate">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-sm">{msg.content}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Zone Saisie */}
      <div className="p-4 border-t">
        <div className="flex gap-2 bg-slate-50 p-2 rounded-xl border">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Réponds à Édouard..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm resize-none"
          />
          <button className="bg-blue-600 text-white p-2 rounded-lg">
            <Send size={16} />
          </button>
        </div>
        <div className="text-center mt-2 text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <Lock size={12} />
          Il te reste <strong>{messagesLeft} messages</strong> gratuits
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
