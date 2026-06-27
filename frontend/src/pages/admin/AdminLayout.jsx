import { NavLink, Outlet, Link } from "react-router-dom";
import { LayoutDashboard, Store, Users, ShoppingBag, Image as ImageIcon, ArrowLeft } from "lucide-react";

const items = [
  { to: "/admin", label: "Aperçu", icon: LayoutDashboard, end: true },
  { to: "/admin/boutiques", label: "Boutiques", icon: Store },
  { to: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { to: "/admin/commandes", label: "Commandes", icon: ShoppingBag },
  { to: "/admin/bannieres", label: "Bannières", icon: ImageIcon },
];

const AdminLayout = () => (
  <div className="min-h-screen bg-background">
    <header className="border-b border-border bg-card sticky top-0 z-40">
      <div className="px-6 lg:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1" data-testid="admin-back-link"><ArrowLeft className="w-4 h-4" /> Retour au site</Link>
          <div className="hidden sm:block h-6 w-px bg-border" />
          <div className="font-display font-bold tracking-tight">Administration</div>
        </div>
      </div>
    </header>
    <div className="grid lg:grid-cols-[240px,1fr]">
      <aside className="border-r border-border bg-card/50 hidden lg:block min-h-[calc(100vh-4rem)]">
        <nav className="p-4 space-y-1">
          {items.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 text-sm rounded-sm transition ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} data-testid={`admin-nav-${n.label.toLowerCase()}`}>
              <n.icon className="w-4 h-4" /> {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="lg:hidden border-b border-border overflow-x-auto hide-scroll">
        <div className="flex gap-1 px-4 py-2">
          {items.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `whitespace-nowrap px-3 py-1.5 text-xs rounded-full ${isActive ? "bg-primary text-primary-foreground" : "bg-muted"}`} data-testid={`admin-nav-mobile-${n.label.toLowerCase()}`}>
              {n.label}
            </NavLink>
          ))}
        </div>
      </div>
      <main className="p-6 lg:p-10"><Outlet /></main>
    </div>
  </div>
);

export default AdminLayout;
