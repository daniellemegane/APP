import { useEffect, useState } from "react";
import { api, formatPrice } from "@/lib/api";
import { Users, Store, Package, ShoppingBag, Wallet, Clock } from "lucide-react";

const Stat = ({ icon: Icon, label, value, testid }) => (
  <div className="p-6 border border-border bg-card rounded-sm" data-testid={testid}>
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <div className="mt-3 font-display font-bold text-3xl">{value}</div>
  </div>
);

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get("/admin/stats").then((r) => setStats(r.data)); }, []);

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-primary">Pilotage</div>
        <h1 className="font-display font-bold text-3xl lg:text-4xl tracking-tight">Vue d'<span className="font-serif italic font-light">ensemble</span></h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Users} label="Clientes" value={stats?.customers ?? "—"} testid="admin-stat-customers" />
        <Stat icon={Store} label="Vendeuses" value={stats?.vendors ?? "—"} testid="admin-stat-vendors" />
        <Stat icon={Clock} label="Boutiques en attente" value={stats?.shops_pending ?? "—"} testid="admin-stat-shops-pending" />
        <Stat icon={Store} label="Boutiques validées" value={stats?.shops_approved ?? "—"} testid="admin-stat-shops-approved" />
        <Stat icon={Package} label="Produits" value={stats?.products ?? "—"} testid="admin-stat-products" />
        <Stat icon={ShoppingBag} label="Commandes" value={stats?.orders ?? "—"} testid="admin-stat-orders" />
        <Stat icon={Wallet} label="GMV total" value={formatPrice(stats?.gmv || 0)} testid="admin-stat-gmv" />
        <Stat icon={Wallet} label="Commissions" value={formatPrice(stats?.commission || 0)} testid="admin-stat-commission" />
      </div>
    </div>
  );
};

export default AdminOverview;
