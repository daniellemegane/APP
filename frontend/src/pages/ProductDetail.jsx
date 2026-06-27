import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api, formatPrice } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ShoppingBag, Star, Store, MapPin, Truck, ShieldCheck } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    api.get(`/products/${id}`).then((r) => setProduct(r.data)).catch(() => setProduct(false));
    api.get(`/reviews?product_id=${id}`).then((r) => setReviews(r.data)).catch(() => {});
  }, [id]);

  if (product === false) return <div className="py-32 text-center font-serif italic text-muted-foreground">Produit introuvable.</div>;
  if (!product) return <div className="py-32 text-center text-muted-foreground">Chargement…</div>;

  const price = product.promotion_price || product.price;
  const images = product.images?.length ? product.images : ["https://images.unsplash.com/photo-1552710307-537199cd41c0?crop=entropy&cs=srgb&fm=jpg&q=85"];

  const handleAdd = () => {
    if (user?.role === "vendor" || user?.role === "admin") {
      toast.error("Connectez-vous avec un compte cliente pour acheter.");
      return;
    }
    add(product, qty);
    toast.success(`${product.name} ajouté au panier`);
  };

  const buyNow = () => { handleAdd(); navigate("/panier"); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-16 fade-in">
      <div className="text-xs text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary">Accueil</Link> · <Link to="/catalogue" className="hover:text-primary">Catalogue</Link> · <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <div>
          <div className="aspect-square bg-muted overflow-hidden rounded-sm">
            <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover" data-testid="product-main-image" />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2 mt-3">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`aspect-square overflow-hidden border-2 ${i === activeImg ? "border-primary" : "border-transparent"}`} data-testid={`product-thumb-${i}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="text-xs uppercase tracking-[0.3em] text-primary">{product.category}</div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight" data-testid="product-name">{product.name}</h1>

          <Link to={`/boutique/${product.shop_id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary" data-testid="product-shop-link">
            <Store className="w-4 h-4" /> {product.shop_name} · <MapPin className="w-3 h-3" /> {product.shop_city}
          </Link>

          {product.rating_count > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 fill-secondary text-secondary" />
              <span className="font-medium">{product.rating_avg}</span>
              <span className="text-muted-foreground">({product.rating_count} avis)</span>
            </div>
          )}

          <div className="flex items-baseline gap-3">
            {product.promotion_price && (
              <span className="text-xl line-through text-muted-foreground">{formatPrice(product.price)}</span>
            )}
            <span className="font-display font-black text-4xl lg:text-5xl text-primary" data-testid="product-price">{formatPrice(price)}</span>
          </div>

          <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap" data-testid="product-description">{product.description}</p>

          {product.type === "physical" && (
            <div className="text-sm">
              {product.stock > 0 ? <span className="text-success">En stock ({product.stock})</span> : <span className="text-destructive">Rupture de stock</span>}
            </div>
          )}

          <div className="flex items-center gap-3">
            {product.type === "physical" && (
              <div className="flex items-center border border-border rounded-sm">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-muted" data-testid="qty-decrement">−</button>
                <span className="px-4 font-medium" data-testid="qty-value">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-2 hover:bg-muted" data-testid="qty-increment">+</button>
              </div>
            )}
            <Button size="lg" className="rounded-full" onClick={handleAdd} data-testid="add-to-cart-button" disabled={product.type === "physical" && product.stock === 0}>
              <ShoppingBag className="w-4 h-4 mr-2" /> Ajouter au panier
            </Button>
            <Button size="lg" variant="outline" className="rounded-full" onClick={buyNow} data-testid="buy-now-button" disabled={product.type === "physical" && product.stock === 0}>
              Acheter
            </Button>
          </div>

          <div className="border-t border-border pt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-primary" /> Livraison nationale</div>
            <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Paiement sécurisé</div>
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <section className="mt-20 border-t border-border pt-12">
        <h2 className="font-display font-bold text-2xl mb-6">Avis clientes</h2>
        {reviews.length === 0 ? (
          <div className="text-sm text-muted-foreground font-serif italic">Pas encore d'avis pour ce produit.</div>
        ) : (
          <div className="space-y-5">
            {reviews.map((r) => (
              <div key={r.id} className="border-l-2 border-primary/30 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-medium">{r.customer_name}</div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < r.rating ? "fill-secondary text-secondary" : "text-muted"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-foreground/80">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetail;
