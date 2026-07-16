import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("email"); // "email" | "otp" | "newpassword"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Étape 1 — Envoyer le code
  const submitEmail = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
      toast.success("Code envoyé sur votre email !");
      setStep("otp");
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setBusy(false);
    }
  };

  // Étape 2 — Vérifier le code
  const submitOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setStep("newpassword");
  };

  // Étape 3 — Nouveau mot de passe
  const submitNewPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Minimum 6 caractères.");
      return;
    }
    setBusy(true);
    try {
      await api.post(
        `/auth/reset-password?email=${encodeURIComponent(email)}&otp=${otp}&new_password=${encodeURIComponent(newPassword)}`
      );
      toast.success("Mot de passe réinitialisé ! Connectez-vous.");
      navigate("/connexion");
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16 lg:py-24 fade-in">
      <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">
        Mot de passe oublié
      </div>

      {/* ÉTAPE 1 — Email */}
      {step === "email" && (
        <>
          <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">
            Réinitialiser votre <span className="font-serif italic font-light">mot de passe</span>.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Entrez votre email et nous vous enverrons un code de réinitialisation.
          </p>
          <form onSubmit={submitEmail} className="mt-8 space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
            <Button type="submit" disabled={busy} className="w-full rounded-full" size="lg">
              {busy ? "Envoi…" : "Envoyer le code"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              <Link to="/connexion" className="text-primary hover:underline">
                ← Retour à la connexion
              </Link>
            </p>
          </form>
        </>
      )}

      {/* ÉTAPE 2 — OTP */}
      {step === "otp" && (
        <>
          <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">
            Entrez le <span className="font-serif italic font-light">code</span>.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Un code à 6 chiffres a été envoyé à <strong>{email}</strong>.
          </p>
          <form onSubmit={submitOtp} className="mt-8 space-y-5">
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
            <Button type="submit" disabled={otp.length !== 6} className="w-full rounded-full" size="lg">
              Continuer
            </Button>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-sm text-center text-muted-foreground hover:underline"
            >
              ← Modifier mon email
            </button>
          </form>
        </>
      )}

      {/* ÉTAPE 3 — Nouveau mot de passe */}
      {step === "newpassword" && (
        <>
          <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">
            Nouveau <span className="font-serif italic font-light">mot de passe</span>.
          </h1>
          <form onSubmit={submitNewPassword} className="mt-8 space-y-5">
            <div>
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
            <Button type="submit" disabled={busy} className="w-full rounded-full" size="lg">
              {busy ? "Enregistrement…" : "Enregistrer le mot de passe"}
            </Button>
          </form>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;