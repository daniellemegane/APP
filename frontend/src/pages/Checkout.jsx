import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { api, formatPrice, formatApiError } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { CreditCard, Smartphone, Loader2, CheckCircle, Clock, MessageCircle } from "lucide-react";

const Checkout = () => {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState({
    shipping_address: "",
    shipping_city: user?.city || "",
    shipping_phone: user?.phone || "",
    payment_method: "whatsapp",
    notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paymentStep, setPaymentStep] = useState(null);
  // null | "creating_order" | "initiating_payment" | "waiting_confirmation" | "confirmed"

  useEffect(() => { api.get("/meta/cities").then((r) => setCities(r.data)); }, []);
  useEffect(() => { if (items.length === 0) navigate("/panier"); }, [items.length, navigate]);

  const hasPhysical = items.some((i) => i.type === "physical");
  const shipping = hasPhysical ? 1500 : 0;
  const total = subtotal + shipping;

  const set = (k, v) => setForm({ ...form, [k]: v });

  const pollPaymentStatus = async (referenceId, orderId, maxAttempts = 60) => {
    setPaymentStep("waiting_confirmation");
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 5000)); // attendre 5 secondes
      try {
        const { data } = await api.get(`/payments/mtn/status/${referenceId}`);
        if (data.status === "SUCCESSFUL") {
          setPaymentStep("confirmed");
          toast.success("Paiement MTN MoMo confirmé !");
          clear();
          navigate("/commande-confirmee", { state: { orders: [{ id: orderId }] } });
          return;
        } else if (data.status === "FAILED") {
          setError("Paiement refusé. Veuillez réessayer.");
          setPaymentStep(null);
          setBusy(false);
          return;
        }
      } catch (e) {
        console.error("Erreur vérification:", e);
      }
    }
    // Timeout — paiement non confirmé
    setError("Le paiement n'a pas été confirmé dans le délai imparti. Veuillez réessayer.");
    setPaymentStep(null);
    setBusy(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      // Étape 1 — Créer la commande
      setPaymentStep("creating_order");
      const { data } = await api.post("/orders/checkout", {
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        shipping_address: form.shipping_address,
        shipping_city: form.shipping_city,
        shipping_phone: form.shipping_phone,
        payment_method: form.payment_method,
        notes: form.notes,
      });

      const order = data.orders[0];

      // Étape 2 — Paiement MTN MoMo
      if (form.payment_method === "mtn_momo") {
        setPaymentStep("initiating_payment");
        const { data: payData } = await api.post("/payments/mtn/initiate", {
          phone_number: form.shipping_phone.replace(/\D/g, ""),
          amount: total,
          order_id: order.id,
        });

        if (payData.success) {
          toast.info("📱 Confirmez le paiement sur votre téléphone MTN !");
          await pollPaymentStatus(payData.reference_id, order.id);
        } else {
          throw new Error("Échec initiation paiement MTN");
        }
      } else if (form.payment_method === "whatsapp") {
        // Redirection vers WhatsApp pour finaliser le paiement avec la vendeuse
        const orders = data.orders;
        const firstOrder = orders[0];
        const buildMessage = (o) => encodeURIComponent(
          `Bonjour ! Je souhaite finaliser ma commande N° ${o.order_number}.\n\n` +
          o.items.map((i) => `- ${i.quantity} × ${i.name}`).join("\n") +
          `\n\nTotal : ${formatPrice(o.total)}\nAdresse de livraison : ${form.shipping_address}, ${form.shipping_city}`
        );
        const whatsappNumber = (firstOrder.shop_whatsapp || "").replace(/\D/g, "");

        if (!whatsappNumber) {
          setError("Cette boutique n'a pas encore renseigné son numéro WhatsApp. Contactez le support.");
          setPaymentStep(null);
          setBusy(false);
          return;
        }

        clear();
        // Commandes des autres boutiques (si panier multi-vendeuses) à contacter manuellement
        navigate("/commande-confirmee", { state: { orders, pendingWhatsapp: orders.slice(1) } });
        window.location.href = `https://wa.me/${whatsappNumber}?text=${buildMessage(firstOrder)}`;
      } else {
        // Orange Money / Carte — simulation pour l'instant
        toast.success("Commande enregistrée ! Paiement à confirmer.");
        clear();
        navigate("/commande-confirmee", { state: { orders: data.orders } });
      }
    } catch (e) {
      setError(formatApiError(e));
      setPaymentStep(null);
      setBusy(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-12 fade-in">
      <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-10">
        <span className="font-serif italic font-light">Finaliser</span> votre commande.
      </h1>

      {/* Indicateur de progression paiement */}
      {paymentStep && (
        <div className="mb-8 p-4 border border-yellow-300 bg-yellow-50 rounded-lg flex items-center gap-3">
          {paymentStep === "confirmed" ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : paymentStep === "waiting_confirmation" ? (
            <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
          ) : (
            <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
          )}
          <div>
            {paymentStep === "creating_order" && <p className="font-medium">Création de votre commande...</p>}
            {paymentStep === "initiating_payment" && <p className="font-medium">Envoi de la demande de paiement MTN...</p>}
            {paymentStep === "waiting_confirmation" && (
              <>
                <p className="font-medium">En attente de votre confirmation MTN MoMo</p>
                <p className="text-sm text-muted-foreground">Vérifiez votre téléphone et confirmez avec votre PIN MTN</p>
              </>
            )}
            {paymentStep === "confirmed" && <p className="font-medium text-green-600">Paiement confirmé !</p>}
          </div>
        </div>
      )}

      <form onSubmit={submit} className="grid lg:grid-cols-[1fr,360px] gap-10">
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="font-display font-semibold text-xl">Adresse de livraison</h2>
            <div>
              <Label>Adresse complète</Label>
              <Textarea required value={form.shipping_address} onChange={(e) => set("shipping_address", e.target.value)} placeholder="Quartier, rue, repère…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ville</Label>
                <Select value={form.shipping_city} onValueChange={(v) => set("shipping_city", v)}>
                  <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input required value={form.shipping_phone} onChange={(e) => set("shipping_phone", e.target.value)} placeholder="+237 6…" />
              </div>
            </div>
            <div>
              <Label>Notes (facultatif)</Label>
              <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Instructions pour la livraison…" />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display font-semibold text-xl">Mode de paiement</h2>
            <RadioGroup value={form.payment_method} onValueChange={(v) => set("payment_method", v)} className="grid gap-3">
              {[
                { v: "mtn_momo", t: "MTN Mobile Money", sub: "Bientôt disponible", icon: Smartphone, c: "bg-[#FFCC00]", disabled: true },
                { v: "whatsapp", t: "Finaliser sur WhatsApp", sub: "Contactez la vendeuse directement pour le paiement", icon: MessageCircle, c: "bg-[#25D366]", disabled: false },
                { v: "orange_money", t: "Orange Money", sub: "Bientôt disponible", icon: Smartphone, c: "bg-[#FF6600]", disabled: true },
                { v: "card", t: "Carte Visa / Mastercard", sub: "Bientôt disponible", icon: CreditCard, c: "bg-foreground", disabled: true },
              ].map((p) => (
                <label
                  key={p.v}
                  className={`p-4 border-2 rounded-sm flex items-center gap-3 ${
                    p.disabled
                      ? "opacity-50 cursor-not-allowed border-border"
                      : `cursor-pointer ${form.payment_method === p.v ? "border-primary bg-primary/5" : "border-border"}`
                  }`}
                >
                  <RadioGroupItem value={p.v} id={`pay-${p.v}`} disabled={p.disabled} />
                  <span className={`w-8 h-8 rounded-full ${p.c} text-background flex items-center justify-center`}><p.icon className="w-4 h-4" /></span>
                  <div>
                    <span className="font-medium block">{p.t}</span>
                    <span className="text-xs text-muted-foreground">{p.sub}</span>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </section>

          {error && <div className="text-sm text-destructive">{error}</div>}
        </div>

        <aside className="h-fit p-6 bg-muted/40 border border-border rounded-sm space-y-4">
          <div className="font-display font-bold text-xl">Récapitulatif</div>
          <div className="space-y-2 max-h-60 overflow-auto">
            {items.map((i) => (
              <div key={i.product_id} className="flex justify-between text-sm">
                <span className="text-foreground/80 line-clamp-1">{i.quantity} × {i.name}</span>
                <span className="ml-2 whitespace-nowrap">{formatPrice(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 space-y-1">
            <div className="flex justify-between text-sm"><span>Sous-total</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span>Livraison</span><span>{shipping ? formatPrice(shipping) : "Gratuite"}</span></div>
          </div>
          <div className="border-t border-border pt-3 flex justify-between font-display font-bold text-xl">
            <span>Total</span><span>{formatPrice(total)}</span>
          </div>
          <Button type="submit" disabled={busy} className="w-full rounded-full" size="lg">
            {busy ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Traitement…
              </span>
            ) : `Payer ${formatPrice(total)}`}
          </Button>
        </aside>
      </form>
    </div>
  );
};

export default Checkout;
