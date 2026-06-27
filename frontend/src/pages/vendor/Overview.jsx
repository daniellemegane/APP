import { useEffect, useState } from "react";
import { api, formatPrice } from "@/lib/api";
import { Package, ShoppingBag, Wallet, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Stat = ({ icon: Icon, label, value, testid }) => (
  <div className="p-6 border border-border bg-card rounded-sm" data-testid={testid}>
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <div className="mt-3 font-display font-bold text-3xl">{value}</div>
  </div>
);

const VendorOverview = () => {
  const [stats, setStats] = useState(null);
  const [shop, setShop] = useState(null);

  useEffect(() => {
    api.get("/vendor/stats").then((r) => setStats(r.data)).catch(() => {});
    api.get("/shops/mine").then((r) => setShop(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-primary">Aperçu</div>
        <h1 className="font-display font-bold text-3xl lg:text-4xl tracking-tight">Tableau de <span className="font-serif italic font-light">bord</span></h1>
      </div>

      {!shop && (
        <div className="p-6 border border-primary/30 bg-primary/5 rounded-sm">
          <div className="font-display font-semibold text-lg">Créez votre boutique</div>
          <p className="text-sm text-muted-foreground mt-1">Avant de vendre, vous devez créer votre boutique. L'administrateur la validera ensuite.</p>
          <Link to="/vendeuse/boutique"><Button className="mt-4 rounded-full" data-testid="create-shop-cta">Créer ma boutique</Button></Link>
        </div>
      )}

      {shop && shop.status === "pending" && (
        <div className="p-6 border border-secondary/40 bg-secondary/10 rounded-sm">
          <div className="font-display font-semibold text-lg flex items-center gap-2"><Clock className="w-5 h-5 text-secondary" /> Boutique en attente de validation</div>
          <p className="text-sm text-muted-foreground mt-1">Votre boutique a bien été créée. Un administrateur la validera sous peu. Vous pourrez ajouter des produits après validation.</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Package} label="Produits" value={stats?.products ?? "—"} testid="stat-products" />
        <Stat icon={ShoppingBag} label="Commandes" value={stats?.orders ?? "—"} testid="stat-orders" />
        <Stat icon={Wallet} label="Revenus encaissés" value={formatPrice(stats?.revenue_paid || 0)} testid="stat-revenue-paid" />
        <Stat icon={Clock} label="Revenus en attente" value={formatPrice(stats?.revenue_pending || 0)} testid="stat-revenue-pending" />
      </div>

      <div className="p-6 border border-border rounded-sm bg-card">
        <div className="font-display font-semibold text-lg mb-4">Par statut</div>
        {stats?.by_status?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stats.by_status.map((s) => (
              <div key={s._id} className="p-4 bg-muted/40 rounded-sm">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{s._id}</div>
                <div className="font-display font-bold text-xl mt-1">{s.count}</div>
                <div className="text-xs text-muted-foreground">{formatPrice(s.revenue)}</div>
              </div>
            ))}
          </div>
        ) : <div className="text-sm text-muted-foreground font-serif italic">Aucune commande pour l'instant.</div>}
      </div>
    </div>
  );
};

export default VendorOverview;
