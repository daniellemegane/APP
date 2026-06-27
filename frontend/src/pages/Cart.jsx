import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/api";
import { Trash2, ShoppingBag } from "lucide-react";

const Cart = () => {
  const { items, remove, setQty, subtotal, count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const proceed = () => {
    if (!user) navigate("/connexion", { state: { from: "/checkout" } });
    else if (user.role !== "customer") return;
    else navigate("/checkout");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-12 fade-in">
      <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Panier</div>
      <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-8">
        Votre <span className="font-serif italic font-light">sélection</span>. <span className="text-muted-foreground text-base font-sans">({count} article{count > 1 ? "s" : ""})</span>
      </h1>

      {items.length === 0 ? (
        <div className="py-16 text-center" data-testid="cart-empty-state">
          <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground" />
          <div className="mt-4 font-serif italic text-xl text-muted-foreground">Votre panier est vide.</div>
          <Link to="/catalogue"><Button className="mt-6 rounded-full">Explorer le catalogue</Button></Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr,360px] gap-10">
          <div className="space-y-4">
            {items.map((i) => (
              <div key={i.product_id} className="flex gap-4 p-4 bg-card border border-border rounded-sm" data-testid={`cart-item-${i.product_id}`}>
                <div className="w-24 h-24 bg-muted overflow-hidden flex-shrink-0">
                  {i.image && <img src={i.image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <Link to={`/produit/${i.product_id}`} className="font-display font-medium text-base hover:text-primary">{i.name}</Link>
                  <div className="text-xs text-muted-foreground mt-1">Vendu par {i.shop_name}</div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center border border-border rounded-sm">
                      <button onClick={() => setQty(i.product_id, i.quantity - 1)} className="px-2 py-1 text-sm hover:bg-muted" data-testid={`cart-decrement-${i.product_id}`}>−</button>
                      <span className="px-3 text-sm">{i.quantity}</span>
                      <button onClick={() => setQty(i.product_id, i.quantity + 1)} className="px-2 py-1 text-sm hover:bg-muted" data-testid={`cart-increment-${i.product_id}`}>+</button>
                    </div>
                    <button onClick={() => remove(i.product_id)} className="text-sm text-destructive hover:underline inline-flex items-center gap-1" data-testid={`cart-remove-${i.product_id}`}>
                      <Trash2 className="w-3 h-3" /> Retirer
                    </button>
                  </div>
                </div>
                <div className="font-display font-bold text-primary text-lg">{formatPrice(i.price * i.quantity)}</div>
              </div>
            ))}
          </div>

          <aside className="h-fit p-6 bg-muted/40 border border-border rounded-sm space-y-4">
            <div className="font-display font-bold text-xl">Récapitulatif</div>
            <div className="flex justify-between text-sm"><span>Sous-total</span><span data-testid="cart-subtotal">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-sm text-muted-foreground"><span>Livraison</span><span>Calculée à l'étape suivante</span></div>
            <div className="border-t border-border pt-4 flex justify-between font-display font-bold text-xl"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
            <Button className="w-full rounded-full" size="lg" onClick={proceed} disabled={user && user.role !== "customer"} data-testid="checkout-button">
              Procéder au paiement
            </Button>
            {user && user.role !== "customer" && (
              <div className="text-xs text-destructive">Connectez-vous avec un compte cliente pour acheter.</div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
