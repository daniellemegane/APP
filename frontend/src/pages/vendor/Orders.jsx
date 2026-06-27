import { useEffect, useState } from "react";
import { api, formatPrice, formatApiError } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const STATUSES = ["pending", "confirmed", "preparing", "shipped", "delivered", "cancelled"];
const LABELS = {
  pending: "En attente", confirmed: "Confirmée", preparing: "Préparation",
  shipped: "Expédiée", delivered: "Livrée", cancelled: "Annulée",
};

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const load = () => api.get("/orders/mine").then((r) => setOrders(r.data));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      toast.success(`Statut mis à jour: ${LABELS[status]}`);
      load();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-primary">Logistique</div>
        <h1 className="font-display font-bold text-3xl lg:text-4xl tracking-tight">Mes <span className="font-serif italic font-light">commandes</span></h1>
      </div>

      {orders.length === 0 ? (
        <div className="py-16 text-center font-serif italic text-muted-foreground">Aucune commande pour l'instant.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="p-5 border border-border bg-card rounded-sm" data-testid={`vendor-order-${o.id}`}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{new Date(o.created_at).toLocaleString("fr-FR")}</div>
                  <div className="font-medium">N° {o.order_number}</div>
                  <div className="text-xs text-muted-foreground">{o.customer_name} · {o.shipping_city}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-display font-bold text-primary">{formatPrice(o.total)}</div>
                    <div className="text-xs text-muted-foreground">Net: {formatPrice(o.vendor_payout)} · Comm. {formatPrice(o.commission)}</div>
                  </div>
                  <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                    <SelectTrigger className="w-40" data-testid={`order-status-select-${o.id}`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{LABELS[s]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {o.items.map((it, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {it.image && <img src={it.image} alt="" className="w-10 h-10 object-cover bg-muted" />}
                    <span>{it.quantity} × {it.name}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Tél: {o.shipping_phone} · Adresse: {o.shipping_address}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
