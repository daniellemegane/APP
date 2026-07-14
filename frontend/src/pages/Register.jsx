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
  const { register, verifyOtp } = useAuth();
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

  // OTP state
  const [step, setStep] = useState("register"); // "register" | "otp"
  const [otp, setOtp] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [resendBusy, setResendBusy] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    api.get("/meta/cities").then((r) => setCities(r.data));
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ============ Soumission inscription ============
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await register(form);
      if (res.requires_verification) {
        setPendingEmail(res.email);
        setStep("otp");
        setCountdown(60);
        toast.success("Code envoyé sur votre email !");
      } else {
        toast.success("Compte créé avec succès !");
        navigate(form.role === "vendor" ? "/vendeuse" : "/");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  // ============ Vérification OTP ============
  const verifyOtpSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const u = await verifyOtp(pendingEmail, otp);
      toast.success("Compte vérifié avec succès ! 🎉");
      navigate(u.role === "vendor" ? "/vendeuse" : "/");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const resendOtp = async () => {
    setResendBusy(true);
    try {
      await api.post(`/auth/resend-otp?email=${encodeURIComponent(pendingEmail)}`);
      toast.success("Nouveau code envoyé !");
      setCountdown(60);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Erreur envoi");
    } finally {
      setResendBusy(false);
    }
  };

  const set = (k, v) => setForm({ ...form, [k]: v });

  // ============ PAGE OTP ============
  if (step === "otp") {
    return (
      <div className="max-w-md mx-auto px-6 py-16 lg:py-20 fade-in">
        <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Vérification</div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">
          Confirmez votre <span className="font-serif italic font-light">email</span>.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Un code à 6 chiffres a été envoyé à <strong>{pendingEmail}</strong>. Vérifiez vos spams si nécessaire.
        </p>

        <form onSubmit={verifyOtpSubmit} className="mt-8 space-y-5">
          <div>
            <Label htmlFor="otp">Code de vérification</Label>
            <Input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              className="text-center text-2xl tracking-[0.5em] font-bold mt-2"
              autoFocus
            />
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <Button type="submit" disabled={busy || otp.length !== 6} className="w-full rounded-full" size="lg">
            {busy ? "Vérification…" : "Confirmer mon compte"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Vous n'avez pas reçu le code ?{" "}
            {countdown > 0 ? (
              <span className="text-primary">Renvoyer dans {countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={resendOtp}
                disabled={resendBusy}
                className="text-primary hover:underline font-medium"
              >
                {resendBusy ? "Envoi…" : "Renvoyer le code"}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setStep("register")}
            className="w-full text-sm text-center text-muted-foreground hover:underline"
          >
            ← Modifier mon email
          </button>
        </form>
      </div>
    );
  }

  // ============ PAGE INSCRIPTION ============
  return (
    <div className="max-w-md mx-auto px-6 py-16 lg:py-20 fade-in">
      <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Inscription</div>
      <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">
        Rejoignez la <span className="font-serif italic font-light">communauté</span>.
      </h1>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <Label>Je suis…</Label>
          <RadioGroup value={form.role} onValueChange={(v) => set("role", v)} className="grid grid-cols-2 gap-3 mt-2">
            <label className={`p-4 border-2 rounded-sm cursor-pointer flex items-start gap-3 ${form.role === "customer" ? "border-primary bg-primary/5" : "border-border"}`}>
              <RadioGroupItem value="customer" id="role-customer" />
              <div>
                <div className="font-medium">Cliente</div>
                <div className="text-xs text-muted-foreground">J'achète</div>
              </div>
            </label>
            <label className={`p-4 border-2 rounded-sm cursor-pointer flex items-start gap-3 ${form.role === "vendor" ? "border-primary bg-primary/5" : "border-border"}`}>
              <RadioGroupItem value="vendor" id="role-vendor" />
              <div>
                <div className="font-medium">Vendeuse</div>
                <div className="text-xs text-muted-foreground">Je vends</div>
              </div>
            </label>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="full_name">Nom complet</Label>
          <Input id="full_name" required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" type="password" required minLength={6} value={form.password} onChange={(e) => set("password", e.target.value)} />
          <div className="text-xs text-muted-foreground mt-1">Minimum 6 caractères.</div>
        </div>
        <div>
          <Label htmlFor="phone">Téléphone (facultatif)</Label>
          <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+237 6…" />
        </div>
        <div>
          <Label>Ville</Label>
          <Select value={form.city} onValueChange={(v) => set("city", v)}>
            <SelectTrigger><SelectValue placeholder="Choisir une ville" /></SelectTrigger>
            <SelectContent>
              {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <Button type="submit" disabled={busy} className="w-full rounded-full" size="lg">
          {busy ? "Création…" : "Créer mon compte"}
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Déjà inscrite ? <Link to="/connexion" className="text-primary hover:underline">Se connecter</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;