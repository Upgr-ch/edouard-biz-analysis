import { useState } from "react";
import ChatPanel from "./ChatPanel";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useConversations";
import { getAnonUserMessageCount, ANON_MAX_MESSAGES } from "@/lib/anonymousChat";

const Dashboard = () => {
  const { user } = useAuth();
  const {
    activeConversationId,
    conversations, // On récupère la liste pour trouver le titre
    messages,
    saveMessage,
    createConversation,
    updateMessageContent,
    updateTitle,
  } = useConversations();

  // On trouve la conversation active pour extraire son titre actuel
  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  // État pour suivre le quota en temps réel
  const [anonCount, setAnonCount] = useState(getAnonUserMessageCount());
  const isQuotaReached = !user && anonCount >= ANON_MAX_MESSAGES;

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <main className="flex-1 flex flex-col min-w-0 relative">
        <ChatPanel
          stepContext=""
          conversationId={activeConversationId}
          conversationTitle={activeConversation?.title} // CRUCIAL : On envoie le titre à ChatPanel
          persistedMessages={messages || []}
          setPersistedMessages={() => {}}
          saveMessage={saveMessage}
          updateMessageContent={updateMessageContent}
          onUpdateTitle={updateTitle} // On passe la fonction de mise à jour
          onCreateConversation={createConversation}
          nextMessageNumber={(messages?.length || 0) + 1}
          isQuotaReached={isQuotaReached}
        />
      </main>
    </div>
  );
};

export default Dashboard;
