import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const VendorShop = () => {
  const [shop, setShop] = useState(null);
  const [cities, setCities] = useState([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", city: "", whatsapp: "" });

  useEffect(() => {
    api.get("/meta/cities").then((r) => setCities(r.data));
    api.get("/shops/mine").then((r) => {
      if (r.data) {
        setShop(r.data);
        setForm({
          name: r.data.name || "",
          description: r.data.description || "",
          city: r.data.city || "",
          whatsapp: r.data.whatsapp || "",
        });
      }
    });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (shop) {
        const { data } = await api.patch(`/shops/${shop.id}`, form);
        setShop(data);
        toast.success("Boutique mise à jour");
      } else {
        const { data } = await api.post("/shops", form);
        setShop(data);
        toast.success("Boutique créée ! En attente de validation par l'admin.");
      }
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setBusy(false);
    }
  };

  const set = (k, v) => setForm({ ...form, [k]: v });

  const statusColor = {
    pending: "bg-secondary text-secondary-foreground",
    approved: "bg-success text-background",
    rejected: "bg-destructive text-destructive-foreground",
  };
  const statusLabel = { pending: "En attente", approved: "Validée", rejected: "Refusée" };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-primary">Boutique</div>
        <h1 className="font-display font-bold text-3xl lg:text-4xl tracking-tight">Ma <span className="font-serif italic font-light">vitrine</span></h1>
      </div>

      {shop && (
        <div className="flex items-center gap-3">
          <Badge className={`${statusColor[shop.status]} rounded-full px-3 py-1`} data-testid="shop-status">{statusLabel[shop.status]}</Badge>
          {shop.is_premium && <Badge className="bg-foreground text-background rounded-full px-3 py-1">Premium</Badge>}
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <div>
          <Label>Nom de la boutique</Label>
          <Input required value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="shop-name-input" />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea required value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} data-testid="shop-description-input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Ville</Label>
            <Select value={form.city} onValueChange={(v) => set("city", v)}>
              <SelectTrigger data-testid="shop-city-select"><SelectValue placeholder="Choisir" /></SelectTrigger>
              <SelectContent>
                {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+237 6…" data-testid="shop-whatsapp-input" />
          </div>
        </div>
        <Button type="submit" disabled={busy} size="lg" className="rounded-full" data-testid="shop-save-button">
          {busy ? "Enregistrement…" : shop ? "Mettre à jour" : "Créer ma boutique"}
        </Button>
      </form>
    </div>
  );
};

export default VendorShop;
