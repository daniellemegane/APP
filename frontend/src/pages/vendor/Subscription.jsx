import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Sparkles } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Gratuite",
    price: "0 FCFA",
    subtitle: "Pour démarrer",
    commissions: ["9% (≤ 100 000 FCFA)", "8% (100 001–200 000 FCFA)", "7% (> 200 000 FCFA)"],
    features: ["10 produits max", "Statistiques de base", "Support standard", "4 stories / mois", "2 reels / mois", "4 produits en promo"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "5 000 FCFA",
    subtitle: "/ mois",
    commissions: ["8% (≤ 100 000 FCFA)", "7,5% (100 001–200 000 FCFA)", "7% (200 001–800 000 FCFA)", "6,5% (> 800 000 FCFA)"],
    features: ["Produits illimités", "Boutique Premium", "Référencement amélioré", "Statistiques avancées", "20 stories / mois", "10 reels / mois", "Support prioritaire"],
    highlight: true,
  },
];

const VendorSubscription = () => {
  const { user, refresh } = useAuth();
  const [busy, setBusy] = useState("");

  const upgrade = async (plan) => {
    setBusy(plan);
    try {
      await api.post("/subscription/upgrade", { plan });
      toast.success(plan === "premium" ? "Bienvenue dans Premium !" : "Plan basculé en Gratuite");
      await refresh();
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-primary">Abonnement</div>
        <h1 className="font-display font-bold text-3xl lg:text-4xl tracking-tight">Choisissez votre <span className="font-serif italic font-light">offre</span></h1>
        <p className="mt-2 text-sm text-muted-foreground">Plan actuel : <span className="font-medium capitalize">{user?.subscription_plan || "free"}</span></p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {PLANS.map((p) => {
          const current = user?.subscription_plan === p.id;
          return (
            <div key={p.id} className={`p-8 border-2 rounded-sm relative ${p.highlight ? "border-primary bg-primary/5" : "border-border bg-card"}`} data-testid={`plan-card-${p.id}`}>
              {p.highlight && <div className="absolute -top-3 left-6 bg-primary text-primary-foreground text-[10px] uppercase tracking-widest px-3 py-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Recommandé</div>}
              <div className="font-display font-bold text-2xl">{p.name}</div>
              <div className="mt-2 font-display font-black text-5xl">{p.price}<span className="text-base font-normal text-muted-foreground"> {p.subtitle}</span></div>
              <div className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">Commissions</div>
              <ul className="mt-2 space-y-1 text-sm">
                {p.commissions.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
              <div className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">Fonctionnalités</div>
              <ul className="mt-2 space-y-1 text-sm">
                {p.features.map((f, i) => <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /> {f}</li>)}
              </ul>
              <Button
                className="mt-8 w-full rounded-full"
                variant={p.highlight ? "default" : "outline"}
                onClick={() => upgrade(p.id)}
                disabled={current || busy === p.id}
                data-testid={`subscribe-${p.id}-button`}
              >
                {current ? "Plan actuel" : busy === p.id ? "Traitement…" : p.id === "premium" ? "Passer Premium" : "Choisir Gratuite"}
              </Button>
            </div>
          );
        })}
      </div>
      <div className="text-xs text-muted-foreground italic">Paiement simulé pour le MVP. Mobile Money / cartes à venir.</div>
    </div>
  );
};

export default VendorSubscription;
