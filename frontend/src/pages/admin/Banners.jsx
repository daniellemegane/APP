import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", image_url: "", link_url: "", position: "home_hero", is_active: true });

  const load = () => api.get("/banners").then((r) => setBanners(r.data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      await api.post("/admin/banners", form);
      toast.success("Bannière créée");
      setOpen(false);
      setForm({ title: "", image_url: "", link_url: "", position: "home_hero", is_active: true });
      load();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const del = async (id) => {
    if (!window.confirm("Supprimer cette bannière ?")) return;
    await api.delete(`/admin/banners/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-primary">Communication</div>
          <h1 className="font-display font-bold text-3xl lg:text-4xl tracking-tight">Bannières</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full" data-testid="add-banner-button"><Plus className="w-4 h-4 mr-1" /> Nouvelle bannière</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle bannière</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Titre</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="banner-title-input" /></div>
              <div><Label>URL de l'image</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://…" data-testid="banner-image-url-input" /></div>
              <div><Label>Lien (facultatif)</Label><Input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} data-testid="banner-link-input" /></div>
              <div>
                <Label>Position</Label>
                <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
                  <SelectTrigger data-testid="banner-position-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home_hero">Accueil – Héros</SelectItem>
                    <SelectItem value="home_middle">Accueil – Milieu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={save} className="w-full" data-testid="banner-save-button">Créer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {banners.length === 0 ? (
        <div className="py-12 text-center font-serif italic text-muted-foreground">Aucune bannière.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div key={b.id} className="border border-border bg-card rounded-sm overflow-hidden" data-testid={`banner-${b.id}`}>
              <div className="aspect-[3/1] bg-muted">{b.image_url && <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />}</div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{b.title}</div>
                  <div className="text-xs text-muted-foreground">{b.position}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => del(b.id)} data-testid={`delete-banner-${b.id}`}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
