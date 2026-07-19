import { useEffect, useState } from "react";
import { api, formatApiError, fileUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Check, X, MapPin, FileText, IdCard } from "lucide-react";

const STATUS_LABELS = { pending: "En attente", approved: "Validée", rejected: "Refusée" };
const STATUS_COLORS = {
  pending: "bg-secondary text-secondary-foreground",
  approved: "bg-success text-background",
  rejected: "bg-destructive text-destructive-foreground",
};

const AdminShops = () => {
  const [shops, setShops] = useState([]);
  const [tab, setTab] = useState("pending");
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = async () => {
    const [pending, approved, rejected] = await Promise.all([
      api.get("/shops?status=pending"),
      api.get("/shops?status=approved"),
      api.get("/shops?status=rejected"),
    ]);
    setShops([...pending.data, ...approved.data, ...rejected.data]);
  };
  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    try { await api.post(`/admin/shops/${id}/approve`); toast.success("Boutique validée et badge attribué"); load(); }
    catch (e) { toast.error(formatApiError(e)); }
  };

  const openReject = (id) => {
    setRejectingId(id);
    setRejectReason("");
  };

  const confirmReject = async () => {
    if (rejectReason.trim().length < 3) {
      toast.error("Merci de préciser un motif de rejet.");
      return;
    }
    try {
      await api.post(`/admin/shops/${rejectingId}/reject`, { reason: rejectReason.trim() });
      toast.success("Boutique rejetée, email envoyé à la vendeuse");
      setRejectingId(null);
      load();
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const filtered = shops.filter((s) => s.status === tab);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const buildDocUrl = (url) => (url?.startsWith("http") ? url : `${BACKEND_URL}${url}`);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-primary">Validation</div>
        <h1 className="font-display font-bold text-3xl lg:text-4xl tracking-tight">Gérer les <span className="font-serif italic font-light">boutiques</span></h1>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending" data-testid="tab-pending">En attente</TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved">Validées</TabsTrigger>
          <TabsTrigger value="rejected" data-testid="tab-rejected">Rejetées</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-6">
          {filtered.length === 0 ? (
            <div className="py-12 text-center font-serif italic text-muted-foreground">Aucune boutique dans cette catégorie.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((s) => (
                <div key={s.id} className="p-5 bg-card border border-border rounded-sm" data-testid={`admin-shop-${s.id}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-display font-semibold text-lg">{s.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1"><MapPin className="w-3 h-3" /> {s.city}</div>
                    </div>
                    <Badge className={`${STATUS_COLORS[s.status]} rounded-full px-3 py-1`}>{STATUS_LABELS[s.status]}</Badge>
                  </div>
                  <p className="text-sm text-foreground/80 mt-3 line-clamp-3">{s.description}</p>

                  {/* Documents de vérification */}
                  {(s.identity_doc_url || s.business_reg_doc_url) && (
                    <div className="mt-4 pt-4 border-t border-border space-y-2">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Documents fournis</div>
                      {s.identity_doc_url && (
                      <a href={buildDocUrl(s.identity_doc_url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <IdCard className="w-4 h-4" />
                        {s.identity_doc_type === "passeport" ? "Passeport" : "CNI"}
                      </a>
                    )}
                    {s.business_reg_doc_url && (
                      <a href={buildDocUrl(s.business_reg_doc_url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <FileText className="w-4 h-4" />
                        Attestation d'immatriculation
                      </a>
                    )}
                    </div>
                  )}

                  {s.status === "rejected" && s.rejection_reason && (
                    <div className="mt-3 text-xs text-destructive bg-destructive/10 rounded-sm p-2">
                      Motif : {s.rejection_reason}
                    </div>
                  )}

                  {s.status === "pending" && (
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" onClick={() => approve(s.id)} data-testid={`approve-shop-${s.id}`}><Check className="w-4 h-4 mr-1" /> Valider</Button>
                      <Button size="sm" variant="outline" onClick={() => openReject(s.id)} data-testid={`reject-shop-${s.id}`}><X className="w-4 h-4 mr-1" /> Rejeter</Button>
                    </div>
                  )}
                  {s.status === "rejected" && (
                    <Button size="sm" className="mt-4" variant="outline" onClick={() => approve(s.id)} data-testid={`approve-rejected-${s.id}`}>Approuver finalement</Button>
                  )}
                  {s.status === "approved" && (
                    <Button size="sm" className="mt-4" variant="ghost" onClick={() => openReject(s.id)} data-testid={`suspend-shop-${s.id}`}>Suspendre</Button>
                  )}

                  {/* Formulaire motif de rejet inline */}
                  {rejectingId === s.id && (
                    <div className="mt-4 p-3 bg-muted rounded-sm space-y-2">
                      <Input
                        placeholder="Motif du rejet (ex: document illisible)"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={confirmReject}>Confirmer le rejet</Button>
                        <Button size="sm" variant="ghost" onClick={() => setRejectingId(null)}>Annuler</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminShops;