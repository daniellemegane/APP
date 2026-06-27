import { useEffect, useState } from "react";
import { api, formatPrice } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

const LABELS = {
  pending: "En attente", confirmed: "Confirmée", preparing: "Préparation",
  shipped: "Expédiée", delivered: "Livrée", cancelled: "Annulée",
};
const COLORS = {
  pending: "bg-muted text-foreground",
  confirmed: "bg-secondary/40 text-foreground",
  preparing: "bg-secondary text-secondary-foreground",
  shipped: "bg-primary text-primary-foreground",
  delivered: "bg-success text-background",
  cancelled: "bg-destructive text-destructive-foreground",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  useEffect(() => { api.get("/admin/orders").then((r) => setOrders(r.data)); }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-primary">Logistique</div>
        <h1 className="font-display font-bold text-3xl lg:text-4xl tracking-tight">Toutes les <span className="font-serif italic font-light">commandes</span></h1>
      </div>

      {orders.length === 0 ? (
        <div className="py-12 text-center font-serif italic text-muted-foreground">Aucune commande.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="p-5 border border-border bg-card rounded-sm grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-3 items-center" data-testid={`admin-order-${o.id}`}>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{new Date(o.created_at).toLocaleString("fr-FR")}</div>
                <div className="font-medium">N° {o.order_number}</div>
                <div className="text-xs text-muted-foreground">Client: {o.customer_name} → Vendeuse: {o.vendor_id?.slice(0, 8)}…</div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={`${COLORS[o.status]} rounded-full px-3 py-1`}>{LABELS[o.status]}</Badge>
                <div className="text-right">
                  <div className="font-display font-bold text-primary">{formatPrice(o.total)}</div>
                  <div className="text-xs text-muted-foreground">Comm. {formatPrice(o.commission)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
