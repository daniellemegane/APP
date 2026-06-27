import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const u = await login(email, password);
      toast.success(`Bienvenue, ${u.full_name?.split(" ")[0]} !`);
      const redirect = location.state?.from || (u.role === "admin" ? "/admin" : u.role === "vendor" ? "/vendeuse" : "/");
      navigate(redirect);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16 lg:py-24 fade-in">
      <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Connexion</div>
      <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">Heureux de vous <span className="font-serif italic font-light">revoir</span>.</h1>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="login-email-input" />
        </div>
        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="login-password-input" />
        </div>
        {error && <div className="text-sm text-destructive" data-testid="login-error">{error}</div>}
        <Button type="submit" disabled={busy} className="w-full rounded-full" size="lg" data-testid="login-submit-button">
          {busy ? "Connexion…" : "Se connecter"}
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          Pas encore de compte ? <Link to="/inscription" className="text-primary hover:underline" data-testid="goto-register-link">Créer un compte</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
