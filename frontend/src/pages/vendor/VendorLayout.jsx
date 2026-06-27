import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Store, Package, ShoppingBag, Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const navItems = [
  { to: "/vendeuse", label: "Aperçu", icon: LayoutDashboard, end: true },
  { to: "/vendeuse/boutique", label: "Boutique", icon: Store },
  { to: "/vendeuse/produits", label: "Produits", icon: Package },
  { to: "/vendeuse/commandes", label: "Commandes", icon: ShoppingBag },
  { to: "/vendeuse/abonnement", label: "Abonnement", icon: Sparkles },
];

const VendorLayout = () => {
  const { user } = useAuth();
  useLocation();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1" data-testid="vendor-back-link"><ArrowLeft className="w-4 h-4" /> Retour au site</Link>
            <div className="hidden sm:block h-6 w-px bg-border" />
            <div className="font-display font-bold tracking-tight">Espace Vendeuse</div>
            {user?.subscription_plan === "premium" && (
              <span className="text-[10px] uppercase tracking-widest bg-foreground text-background px-2 py-0.5 inline-flex items-center gap-1"><Sparkles className="w-3 h-3" /> Premium</span>
            )}
          </div>
          <div className="text-sm text-muted-foreground hidden sm:block">{user?.full_name}</div>
        </div>
      </header>
      <div className="grid lg:grid-cols-[240px,1fr]">
        <aside className="border-r border-border bg-card/50 hidden lg:block min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-1">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-sm rounded-sm transition ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`
                }
                data-testid={`vendor-nav-${n.label.toLowerCase()}`}
              >
                <n.icon className="w-4 h-4" /> {n.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="lg:hidden border-b border-border overflow-x-auto hide-scroll">
          <div className="flex gap-1 px-4 py-2">
            {navItems.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `whitespace-nowrap px-3 py-1.5 text-xs rounded-full ${isActive ? "bg-primary text-primary-foreground" : "bg-muted"}`} data-testid={`vendor-nav-mobile-${n.label.toLowerCase()}`}>
                {n.label}
              </NavLink>
            ))}
          </div>
        </div>
        <main className="p-6 lg:p-10"><Outlet /></main>
      </div>
    </div>
  );
};

export default VendorLayout;
