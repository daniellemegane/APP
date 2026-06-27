import { useEffect, useState } from "react";
import { api, formatPrice, formatApiError } from "@/lib/api";
import { Package, ShoppingBag, Wallet, Clock, ArrowDownCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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
  const [retraits, setRetraits] = useState([]);
  const [showRetrait, setShowRetrait] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ montant: "", numero_mobile_money: "", operateur: "mtn" });

  useEffect(() => {
    api.get("/vendor/stats").then((r) => setStats(r.data)).catch(() => {});
    api.get("/shops/mine").then((r) => setShop(r.data)).catch(() => {});
    api.get("/retraits/mine").then((r) => setRetraits(r.data)).catch(() => {});
  }, []);

  const submitRetrait = async () => {
    setBusy(true);
    try {
      await api.post("/retraits", {
        montant: parseFloat(form.montant),
        numero_mobile_money: form.numero_mobile_money,
        operateur: form.operateur,
      });
      toast.success("Demande de retrait envoyée !");
      setShowRetrait(false);
      setForm({ montant: "", numero_mobile_money: "", operateur: "mtn" });
      api.get("/retraits/mine").then((r) => setRetraits(r.data)).catch(() => {});
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setBusy(false);
    }
  };

  const statusColor = (s) => ({
    pending: "text-yellow-600 bg-yellow-50",
    processing: "text-blue-600 bg-blue-50",
    paid: "text-green-600 bg-green-50",
    rejected: "text-red-600 bg-red-50",
  }[s] || "text-gray-600 bg-gray-50");

  const statusLabel = (s) => ({
    pending: "En attente",
    processing: "En cours",
    paid: "Payé",
    rejected: "Rejeté",
  }[s] || s);

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-primary">Aperçu</div>
        <h1 className="font-display font-bold text-3xl lg:text-4xl tracking-tight">
          Tableau de <span className="font-serif italic font-light">bord</span>
        </h1>
      </div>

      {!shop && (
        <div className="p-6 border border-primary/30 bg-primary/5 rounded-sm">
          <div className="font-display font-semibold text-lg">Créez votre boutique</div>
          <p className="text-sm text-muted-foreground mt-1">Avant de vendre, vous devez créer votre boutique.</p>
          <Link to="/vendeuse/boutique"><Button className="mt-4 rounded-full">Créer ma boutique</Button></Link>
        </div>
      )}

      {shop && shop.status === "pending" && (
        <div className="p-6 border border-secondary/40 bg-secondary/10 rounded-sm">
          <div className="font-display font-semibold text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-secondary" /> Boutique en attente de validation
          </div>
          <p className="text-sm text-muted-foreground mt-1">Un administrateur validera votre boutique sous peu.</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Package} label="Produits" value={stats?.products ?? "—"} testid="stat-products" />
        <Stat icon={ShoppingBag} label="Commandes" value={stats?.orders ?? "—"} testid="stat-orders" />
        <Stat icon={Wallet} label="Revenus encaissés" value={formatPrice(stats?.revenue_paid || 0)} testid="stat-revenue-paid" />
        <Stat icon={Clock} label="Revenus en attente" value={formatPrice(stats?.revenue_pending || 0)} testid="stat-revenue-pending" />
      </div>

      {/* Bouton retrait */}
      <div className="p-6 border border-border rounded-sm bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-display font-semibold text-lg">Retrait des gains</div>
          <Button onClick={() => setShowRetrait(!showRetrait)} className="rounded-full gap-2">
            <ArrowDownCircle className="w-4 h-4" />
            Demander un retrait
          </Button>
        </div>

        {showRetrait && (
          <div className="border border-border rounded-sm p-4 space-y-4 bg-muted/20">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Montant (FCFA)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 50000"
                  value={form.montant}
                  onChange={(e) => setForm({ ...form, montant: e.target.value })}
                />
              </div>
              <div>
                <Label>Opérateur</Label>
                <Select value={form.operateur} onValueChange={(v) => setForm({ ...form, operateur: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                    <SelectItem value="orange">Orange Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Numéro Mobile Money</Label>
              <Input
                placeholder="+237 6…"
                value={form.numero_mobile_money}
                onChange={(e) => setForm({ ...form, numero_mobile_money: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={submitRetrait} disabled={busy} className="rounded-full">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmer la demande"}
              </Button>
              <Button variant="outline" onClick={() => setShowRetrait(false)} className="rounded-full">
                Annuler
              </Button>
            </div>
          </div>
        )}

        {/* Historique retraits */}
        {retraits.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Historique des retraits</div>
            {retraits.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-sm text-sm">
                <div>
                  <span className="font-medium">{formatPrice(r.montant)}</span>
                  <span className="text-muted-foreground ml-2">{r.operateur.toUpperCase()} • {r.numero_mobile_money}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(r.status)}`}>
                  {statusLabel(r.status)}
                </span>
              </div>
            ))}
          </div>
        )}
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
        ) : (
          <div className="text-sm text-muted-foreground font-serif italic">Aucune commande pour l'instant.</div>
        )}
      </div>
    </div>
  );
};

export default VendorOverview;