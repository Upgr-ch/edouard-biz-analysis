import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LegalLayout = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <h1 className="text-2xl font-bold mb-8 text-foreground">{title}</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          {children}
        </div>
        <div className="mt-12 pt-6 border-t border-border text-center text-xs text-muted-foreground/50">
          © 2026 - Kévin Lavergne – UpGrade
        </div>
      </div>
    </div>
  );
};

export default LegalLayout;
