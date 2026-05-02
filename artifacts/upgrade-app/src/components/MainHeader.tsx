import { Link } from "react-router-dom";
import { LogOut, LogIn, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface MainHeaderProps {
  conversationTitle?: string | null;
}

const MainHeader = ({ conversationTitle }: MainHeaderProps) => {
  const { user, signOut } = useAuth();

  return (
    <header
      className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-border z-30"
      style={{
        background: "rgba(8,15,30,0.90)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Titre de la conversation courante */}
      <div className="flex items-center gap-2 min-w-0">
        {conversationTitle ? (
          <>
            <MessageSquare
              size={13}
              style={{ color: "rgba(245,224,144,0.50)", flexShrink: 0 }}
            />
            <span
              className="text-xs truncate max-w-[200px] md:max-w-[420px]"
              style={{ color: "rgba(255,255,255,0.60)", fontFamily: "var(--up-font)" }}
            >
              {conversationTitle}
            </span>
          </>
        ) : (
          <span
            className="text-xs"
            style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--up-font)", letterSpacing: "0.1em" }}
          >
            Nouvelle analyse
          </span>
        )}
      </div>

      {/* Bouton connexion / utilisateur connecté */}
      {user ? (
        <div className="flex items-center gap-3 shrink-0">
          <span
            className="hidden sm:block text-xs truncate max-w-[140px]"
            style={{ color: "rgba(245,224,144,0.70)", fontFamily: "var(--up-font)" }}
          >
            {user.firstName ?? user.emailAddresses?.[0]?.emailAddress ?? ""}
          </span>
          <button
            onClick={() => void signOut()}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded-sm transition-all"
            style={{
              color: "rgba(255,255,255,0.45)",
              borderColor: "rgba(255,255,255,0.10)",
              background: "transparent",
              fontFamily: "var(--up-font)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#F5E090";
              e.currentTarget.style.borderColor = "rgba(245,224,144,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.45)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
            }}
          >
            <LogOut size={12} />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      ) : (
        <Link
          to="/auth"
          className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-sm font-semibold transition-all shrink-0"
          style={{
            background: "#F5E090",
            color: "#080F1E",
            fontFamily: "var(--up-font)",
            boxShadow: "0 4px 16px -4px rgba(245,224,144,0.40)",
            letterSpacing: "0.04em",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
          }}
        >
          <LogIn size={12} />
          Connexion
        </Link>
      )}
    </header>
  );
};

export default MainHeader;
