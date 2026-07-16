import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const DeleteAccount = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = password.length > 0 && confirmText.trim().toUpperCase() === "SUPPRIMER";

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError("");
    try {
      await api.delete(`/auth/me?password=${encodeURIComponent(password)}`);
      toast.success("Votre compte a été supprimé.");
      logout();
      navigate("/");
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16 lg:py-24 fade-in">
      <div className="text-xs uppercase tracking-[0.3em] text-destructive mb-2">
        Supprimer mon compte
      </div>
      <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">
        C'est une action <span className="font-serif italic font-light">définitive</span>.
      </h1>
      <p className="mt-4 text-muted-foreground">
        {user?.email ? (
          <>La suppression du compte lié à <strong>{user.email}</strong> est irréversible. Vos données, commandes et informations personnelles seront définitivement effacées.</>
        ) : (
          <>La suppression de votre compte est irréversible. Vos données, commandes et informations personnelles seront définitivement effacées.</>
        )}
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <Label htmlFor="password">Confirmez votre mot de passe</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="delete-account-password-input"
          />
        </div>

        <div>
          <Label htmlFor="confirmText">
            Tapez <strong>SUPPRIMER</strong> pour confirmer
          </Label>
          <Input
            id="confirmText"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="SUPPRIMER"
            data-testid="delete-account-confirm-input"
          />
        </div>

        {error && (
          <div className="text-sm text-destructive" data-testid="delete-account-error">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={busy || !canSubmit}
          variant="destructive"
          className="w-full rounded-full"
          size="lg"
          data-testid="delete-account-submit-button"
        >
          {busy ? "Suppression…" : "Supprimer définitivement mon compte"}
        </Button>

        <p className="text-sm text-center text-muted-foreground">
          <Link to="/" className="text-primary hover:underline">
            ← Annuler et revenir en arrière
          </Link>
        </p>
      </form>
    </div>
  );
};

export default DeleteAccount;