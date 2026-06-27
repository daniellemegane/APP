import { useEffect, useState } from "react";
import { api, formatPrice } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { formatApiError } from "@/lib/api";

const STATUS_LABELS = {
  pending: { label: "En attente", color: "bg-muted text-foreground" },
  confirmed: { label: "Confirmée", color: "bg-secondary/40 text-foreground" },
  preparing: { label: "En préparation", color: "bg-secondary text-secondary-foreground" },
  shipped: { label: "Expédiée", color: "bg-primary/80 text-primary-foreground" },
  delivered: { label: "Livrée", color: "bg-success text-background" },
  cancelled: { label: "Annulée", color: "bg-destructive text-destructive-foreground" },
};

const ReviewDialog = ({ productId, productName, onCreated }) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await api.post("/reviews", { product_id: productId, rating, comment });
      toast.success("Merci pour votre avis !");
      setOpen(false);
      onCreated?.();
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" data-testid={`review-button-${productId}`}>Laisser un avis</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Donner votre avis</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">{productName}</div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button key={i} onClick={() => setRating(i + 1)} type="button" data-testid={`star-${i + 1}`}>
                <Star className={`w-7 h-7 ${i < rating ? "fill-secondary text-secondary" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Votre expérience…" rows={4} data-testid="review-comment-input" />
          <Button className="w-full" onClick={submit} disabled={busy || !comment} data-testid="review-submit-button">Publier</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const load = () => api.get("/orders/mine").then((r) => setOrders(r.data));
  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-12 fade-in">
      <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Mon espace</div>
      <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-8">Mes <span className="font-serif italic font-light">commandes</span>.</h1>

      {orders.length === 0 ? (
        <div className="py-16 text-center font-serif italic text-muted-foreground">Aucune commande pour l'instant.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const status = STATUS_LABELS[o.status] || STATUS_LABELS.pending;
            return (
              <div key={o.id} className="p-6 bg-card border border-border rounded-sm" data-testid={`my-order-${o.id}`}>
                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{new Date(o.created_at).toLocaleDateString("fr-FR")}</div>
                    <div className="font-medium mt-1">N° {o.order_number}</div>
                  </div>
                  <Badge className={`${status.color} rounded-full px-3 py-1`}>{status.label}</Badge>
                  <div className="font-display font-bold text-primary text-xl">{formatPrice(o.total)}</div>
                </div>
                <div className="mt-4 space-y-2">
                  {o.items.map((it, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      {it.image && <img src={it.image} alt="" className="w-12 h-12 object-cover bg-muted" />}
                      <div className="flex-1">
                        <div>{it.name}</div>
                        <div className="text-xs text-muted-foreground">{it.quantity} × {formatPrice(it.unit_price)}</div>
                      </div>
                      {o.status === "delivered" && (
                        <ReviewDialog productId={it.product_id} productName={it.name} onCreated={load} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Livraison à {o.shipping_city} · {o.shipping_address}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
