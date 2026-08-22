import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, IdCard, FileText, UploadCloud } from "lucide-react";

const VendorShop = () => {
  const [shop, setShop] = useState(null);
  const [cities, setCities] = useState([]);
  const [busy, setBusy] = useState(false);
  const [uploadingIdentity, setUploadingIdentity] = useState(false);
  const [uploadingBizReg, setUploadingBizReg] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    city: "",
    whatsapp: "",
    identity_doc_type: "cni",
    identity_doc_url: "",
    business_reg_doc_url: "",
  });

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
          identity_doc_type: r.data.identity_doc_type || "cni",
          identity_doc_url: r.data.identity_doc_url || "",
          business_reg_doc_url: r.data.business_reg_doc_url || "",
        });
      }
    });
  }, []);

  const set = (k, v) => setForm({ ...form, [k]: v });

  const uploadDoc = async (file, field, setUploadingFn) => {
    if (!file) return;
    setUploadingFn(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/upload?sensitive=true", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set(field, data.url);
      toast.success("Document téléversé");
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setUploadingFn(false);
    }
  };

  const isNewShop = !shop;
  const isRejected = shop?.status === "rejected";
  const needsDocuments = isNewShop || isRejected;

  const submit = async (e) => {
    e.preventDefault();

    if (needsDocuments && !form.identity_doc_url) {
      toast.error("Merci de fournir votre pièce d'identité.");
      return;
    }

    setBusy(true);
    try {
      if (isRejected) {
        const { data } = await api.patch("/shops/mine/resubmit-documents", {
          identity_doc_type: form.identity_doc_type,
          identity_doc_url: form.identity_doc_url,
          business_reg_doc_url: form.business_reg_doc_url,
        });
        await api.patch(`/shops/${data.id}`, {
          name: form.name,
          description: form.description,
          city: form.city,
          whatsapp: form.whatsapp,
        });
        setShop({ ...data, name: form.name, description: form.description, city: form.city, whatsapp: form.whatsapp });
        toast.success("Documents renvoyés ! En attente de nouvelle validation.");
      } else if (shop) {
        const { data } = await api.patch(`/shops/${shop.id}`, {
          name: form.name,
          description: form.description,
          city: form.city,
          whatsapp: form.whatsapp,
        });
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
          {shop.is_verified && (
            <Badge className="bg-green-600 text-white rounded-full px-3 py-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Vendeuse vérifiée
            </Badge>
          )}
        </div>
      )}

      {isRejected && shop.rejection_reason && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-sm text-sm text-destructive">
          <strong>Motif du rejet :</strong> {shop.rejection_reason}
          <div className="mt-1 text-foreground/70">Merci de renvoyer des documents valides et lisibles ci-dessous.</div>
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
            <Input required value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+237 6…" data-testid="shop-whatsapp-input" />
          </div>
        </div>

        {needsDocuments && (
          <div className="space-y-5 p-5 bg-muted rounded-sm">
            <div className="text-sm font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Vérification d'identité requise
            </div>
            <p className="text-xs text-muted-foreground">
              Ces documents sont confidentiels et uniquement consultés par notre équipe de vérification.
            </p>

            <div>
              <Label>Type de pièce d'identité</Label>
              <RadioGroup
                value={form.identity_doc_type}
                onValueChange={(v) => set("identity_doc_type", v)}
                className="grid grid-cols-2 gap-3 mt-2"
              >
                <label className={`p-3 border-2 rounded-sm cursor-pointer flex items-center gap-2 ${form.identity_doc_type === "cni" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <RadioGroupItem value="cni" id="doc-cni" />
                  <span className="text-sm font-medium">CNI</span>
                </label>
                <label className={`p-3 border-2 rounded-sm cursor-pointer flex items-center gap-2 ${form.identity_doc_type === "passeport" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <RadioGroupItem value="passeport" id="doc-passeport" />
                  <span className="text-sm font-medium">Passeport</span>
                </label>
              </RadioGroup>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <IdCard className="w-4 h-4" />
                {form.identity_doc_type === "passeport" ? "Copie du passeport" : "Copie de la CNI"}
              </Label>
              <Input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif,.pdf"
                onChange={(e) => uploadDoc(e.target.files[0], "identity_doc_url", setUploadingIdentity)}
                className="mt-1"
              />
              {uploadingIdentity && <div className="text-xs text-muted-foreground mt-1">Téléversement…</div>}
              {form.identity_doc_url && !uploadingIdentity && (
                <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <UploadCloud className="w-3 h-3" /> Document reçu
                </div>
              )}
            </div>

                        <div className="opacity-60">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Attestation d'immatriculation
                <span className="text-[10px] uppercase tracking-wide bg-muted-foreground/20 text-muted-foreground px-2 py-0.5 rounded-full normal-case">
                  Bientôt requis
                </span>
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Facultatif pour le moment — deviendra obligatoire prochainement. Vous serez prévenue avant l'échéance.
              </p>
              <Input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif,.pdf"
                disabled
                className="mt-1 cursor-not-allowed"
              />
            </div>
          </div>
        
          
          
        )}

        <Button
          type="submit"
          disabled={busy || uploadingIdentity || uploadingBizReg}
          size="lg"
          className="rounded-full"
          data-testid="shop-save-button"
        >
          {busy ? "Enregistrement…" : isRejected ? "Renvoyer mes documents" : shop ? "Mettre à jour" : "Créer ma boutique"}
        </Button>
      </form>
    </div>
  );
};

export default VendorShop;
