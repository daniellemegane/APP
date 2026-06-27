import { useEffect, useRef, useState } from "react";
import { api, formatPrice, formatApiError, API } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Upload, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const emptyForm = {
  name: "", description: "", price: "", promotion_price: "", category: "",
  type: "physical", stock: 0, images: [], digital_file_url: "", is_active: true,
};

const ProductForm = ({ initial, categories, onSaved, onCancel }) => {
  const [form, setForm] = useState(initial || emptyForm);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const set = (k, v) => setForm({ ...form, [k]: v });

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const url = `${API}/files/${data.id}`;
      if (form.type === "digital" && file.type === "application/pdf") {
        set("digital_file_url", url);
        toast.success("Fichier numérique uploadé");
      } else {
        setForm((f) => ({ ...f, images: [...(f.images || []), url] }));
        toast.success("Image ajoutée");
      }
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = (idx) => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        promotion_price: form.promotion_price ? parseFloat(form.promotion_price) : null,
        stock: parseInt(form.stock) || 0,
      };
      if (initial?.id) await api.patch(`/products/${initial.id}`, payload);
      else await api.post("/products", payload);
      toast.success("Produit enregistré");
      onSaved?.();
    } catch (e) {
      toast.error(formatApiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div>
        <Label>Nom</Label>
        <Input required value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="product-name-input" />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea required value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} data-testid="product-description-input" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Catégorie</Label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger data-testid="product-category-select"><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Type</Label>
          <Select value={form.type} onValueChange={(v) => set("type", v)}>
            <SelectTrigger data-testid="product-type-select"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="physical">Physique</SelectItem>
              <SelectItem value="digital">Numérique</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Prix FCFA</Label>
          <Input type="number" required value={form.price} onChange={(e) => set("price", e.target.value)} data-testid="product-price-input" />
        </div>
        <div>
          <Label>Promo FCFA</Label>
          <Input type="number" value={form.promotion_price} onChange={(e) => set("promotion_price", e.target.value)} data-testid="product-promo-input" />
        </div>
        {form.type === "physical" && (
          <div>
            <Label>Stock</Label>
            <Input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} data-testid="product-stock-input" />
          </div>
        )}
      </div>

      <div>
        <Label>Images</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {(form.images || []).map((url, i) => (
            <div key={i} className="relative w-20 h-20">
              <img src={url} alt="" className="w-full h-full object-cover border border-border" />
              <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs" data-testid={`remove-image-${i}`}>×</button>
            </div>
          ))}
          <label className="w-20 h-20 border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <input ref={fileRef} type="file" className="hidden" onChange={upload} accept="image/*,application/pdf" data-testid="product-image-upload" />
          </label>
        </div>
        {uploading && <div className="text-xs text-muted-foreground mt-1">Upload…</div>}
      </div>

      {form.type === "digital" && (
        <div>
          <Label>Fichier numérique (PDF)</Label>
          <Input value={form.digital_file_url} onChange={(e) => set("digital_file_url", e.target.value)} placeholder="URL du fichier" data-testid="product-digital-url-input" />
          <div className="text-xs text-muted-foreground mt-1">Vous pouvez aussi uploader un PDF via le bouton ci-dessus.</div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} data-testid="product-active-switch" />
        <Label>Produit actif (visible publiquement)</Label>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={busy} className="rounded-full" data-testid="product-save-button">{busy ? "Enregistrement…" : "Enregistrer"}</Button>
        {onCancel && <Button type="button" variant="outline" onClick={onCancel} className="rounded-full">Annuler</Button>}
      </div>
    </form>
  );
};

const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => api.get("/products/mine").then((r) => setProducts(r.data));
  useEffect(() => { load(); api.get("/meta/categories").then((r) => setCategories(r.data)); }, []);

  const del = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    await api.delete(`/products/${id}`);
    toast.success("Produit supprimé");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-primary">Catalogue</div>
          <h1 className="font-display font-bold text-3xl lg:text-4xl tracking-tight">Mes <span className="font-serif italic font-light">produits</span></h1>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="rounded-full" data-testid="add-product-button"><Plus className="w-4 h-4 mr-1" /> Ajouter un produit</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editing ? "Modifier le produit" : "Nouveau produit"}</DialogTitle></DialogHeader>
            <ProductForm
              initial={editing}
              categories={categories}
              onSaved={() => { setOpen(false); setEditing(null); load(); }}
              onCancel={() => { setOpen(false); setEditing(null); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <div className="py-16 text-center font-serif italic text-muted-foreground">Aucun produit. Ajoutez votre premier produit pour démarrer.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="border border-border bg-card rounded-sm overflow-hidden" data-testid={`vendor-product-${p.id}`}>
              <div className="aspect-square bg-muted">
                {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : null}
              </div>
              <div className="p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{p.category}</div>
                <div className="font-display font-semibold text-base mt-1 line-clamp-2">{p.name}</div>
                <div className="text-primary font-display font-bold mt-2">{formatPrice(p.promotion_price || p.price)}</div>
                <div className="text-xs text-muted-foreground">{p.type === "physical" ? `Stock: ${p.stock}` : "Numérique"} · {p.is_active ? "Actif" : "Inactif"}</div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditing(p); setOpen(true); }} data-testid={`edit-product-${p.id}`}><Pencil className="w-3 h-3 mr-1" /> Modifier</Button>
                  <Button size="sm" variant="ghost" onClick={() => del(p.id)} data-testid={`delete-product-${p.id}`}><Trash2 className="w-3 h-3 mr-1" /> Supprimer</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorProducts;
