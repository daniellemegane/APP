import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/api";

const OrderSuccess = () => {
  const location = useLocation();
  const orders = location.state?.orders || [];

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center fade-in">
      <div className="w-16 h-16 mx-auto rounded-full bg-success text-background flex items-center justify-center" data-testid="order-success-icon">
        <CheckCircle2 className="w-8 h-8" />
      </div>
      <h1 className="mt-6 font-display font-bold text-3xl sm:text-4xl tracking-tight">Commande <span className="font-serif italic font-light">confirmée</span> !</h1>
      <p className="mt-3 text-muted-foreground">Vos vendeuses ont été notifiées. Vous recevrez un email à chaque étape de la livraison.</p>

      {orders.length > 0 && (
        <div className="mt-8 text-left space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="p-4 border border-border bg-card rounded-sm flex justify-between text-sm" data-testid={`success-order-${o.id}`}>
              <div>
                <div className="font-medium">N° {o.order_number}</div>
                <div className="text-xs text-muted-foreground">{o.items.length} article(s) · livraison à {o.shipping_city}</div>
              </div>
              <div className="font-display font-bold text-primary">{formatPrice(o.total)}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link to="/mes-commandes"><Button size="lg" className="rounded-full" data-testid="view-my-orders-button">Voir mes commandes</Button></Link>
        <Link to="/catalogue"><Button size="lg" variant="outline" className="rounded-full">Continuer mes achats</Button></Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
