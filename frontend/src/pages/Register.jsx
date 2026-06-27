import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "customer",
    phone: "",
    city: "",
  });
  const [cities, setCities] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { api.get("/meta/cities").then((r) => setCities(r.data)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const u = await register(form);
      toast.success("Compte créé avec succès !");
      navigate(u.role === "vendor" ? "/vendeuse" : "/");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const set = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div className="max-w-md mx-auto px-6 py-16 lg:py-20 fade-in">
      <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Inscription</div>
      <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">Rejoignez la <span className="font-serif italic font-light">communauté</span>.</h1>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <Label>Je suis…</Label>
          <RadioGroup value={form.role} onValueChange={(v) => set("role", v)} className="grid grid-cols-2 gap-3 mt-2">
            <label className={`p-4 border-2 rounded-sm cursor-pointer flex items-start gap-3 ${form.role === "customer" ? "border-primary bg-primary/5" : "border-border"}`}>
              <RadioGroupItem value="customer" id="role-customer" data-testid="role-customer" />
              <div>
                <div className="font-medium">Cliente</div>
                <div className="text-xs text-muted-foreground">J'achète</div>
              </div>
            </label>
            <label className={`p-4 border-2 rounded-sm cursor-pointer flex items-start gap-3 ${form.role === "vendor" ? "border-primary bg-primary/5" : "border-border"}`}>
              <RadioGroupItem value="vendor" id="role-vendor" data-testid="role-vendor" />
              <div>
                <div className="font-medium">Vendeuse</div>
                <div className="text-xs text-muted-foreground">Je vends</div>
              </div>
            </label>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="full_name">Nom complet</Label>
          <Input id="full_name" required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} data-testid="register-name-input" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} data-testid="register-email-input" />
        </div>
        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" type="password" required minLength={6} value={form.password} onChange={(e) => set("password", e.target.value)} data-testid="register-password-input" />
          <div className="text-xs text-muted-foreground mt-1">Minimum 6 caractères.</div>
        </div>
        <div>
          <Label htmlFor="phone">Téléphone (facultatif)</Label>
          <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+237 6…" data-testid="register-phone-input" />
        </div>
        <div>
          <Label>Ville</Label>
          <Select value={form.city} onValueChange={(v) => set("city", v)}>
            <SelectTrigger data-testid="register-city-select"><SelectValue placeholder="Choisir une ville" /></SelectTrigger>
            <SelectContent>
              {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {error && <div className="text-sm text-destructive" data-testid="register-error">{error}</div>}

        <Button type="submit" disabled={busy} className="w-full rounded-full" size="lg" data-testid="register-submit-button">
          {busy ? "Création…" : "Créer mon compte"}
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Déjà inscrite ? <Link to="/connexion" className="text-primary hover:underline" data-testid="goto-login-link">Se connecter</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
