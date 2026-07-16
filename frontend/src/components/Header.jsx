import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User, LogOut, Menu, Search, LayoutDashboard, Trash2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const NavLink = ({ to, children, testid }) => (
  <Link to={to} data-testid={testid} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
    {children}
  </Link>
);

const Header = () => {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashLink =
    user?.role === "admin" ? "/admin" : user?.role === "vendor" ? "/vendeuse" : "/mes-commandes";

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group" data-testid="logo-link">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <span className="font-display font-black text-primary-foreground text-lg">e.</span>
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-lg tracking-tight">Elles Market</div>
            <div className="font-serif italic text-[10px] text-muted-foreground -mt-0.5">Cameroun</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/catalogue" testid="nav-catalog">Catalogue</NavLink>
          <NavLink to="/boutiques" testid="nav-shops">Boutiques</NavLink>
          <NavLink to="/a-propos" testid="nav-about">À propos</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/catalogue" className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted transition" data-testid="search-icon">
            <Search className="w-4 h-4" />
          </Link>
          <Link to="/panier" className="relative inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted transition" data-testid="cart-icon">
            <ShoppingBag className="w-4 h-4" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1" data-testid="cart-count">
                {count}
              </span>
            )}
          </Link>

          {!user ? (
            <div className="flex items-center gap-2 ml-2">
              <Link to="/connexion" data-testid="login-link">
                <Button variant="ghost" size="sm">Se connecter</Button>
              </Link>
              <Link to="/inscription" data-testid="register-link">
                <Button size="sm" className="rounded-full">Créer un compte</Button>
              </Link>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-2 gap-2" data-testid="user-menu-button">
                  <div className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold">
                    {user.full_name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden sm:inline text-sm">{user.full_name?.split(" ")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="text-sm font-medium">{user.full_name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{user.role === "vendor" ? "Vendeuse" : user.role === "customer" ? "Cliente" : "Admin"}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(dashLink)} data-testid="dashboard-menu-item">
                  <LayoutDashboard className="w-4 h-4 mr-2" /> Mon espace
                </DropdownMenuItem>
                {user.role === "customer" && (
                  <DropdownMenuItem onClick={() => navigate("/mes-commandes")} data-testid="my-orders-menu-item">
                    <ShoppingBag className="w-4 h-4 mr-2" /> Mes commandes
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => { await logout(); navigate("/"); }} data-testid="logout-menu-item">
                  <LogOut className="w-4 h-4 mr-2" /> Se déconnecter
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/supprimer-mon-compte")}
                  className="text-destructive focus:text-destructive"
                  data-testid="delete-account-menu-item"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Supprimer mon compte
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <button className="md:hidden p-2" onClick={() => setMobileOpen((o) => !o)} data-testid="mobile-menu-toggle">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-border/60 bg-background px-6 py-4 space-y-3">
          <NavLink to="/catalogue" testid="nav-catalog-mobile">Catalogue</NavLink><br />
          <NavLink to="/boutiques" testid="nav-shops-mobile">Boutiques</NavLink><br />
          <NavLink to="/a-propos" testid="nav-about-mobile">À propos</NavLink>
        </div>
      )}
    </header>
  );
};

export default Header;
