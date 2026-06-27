import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Store, MapPin, MessageCircle, Sparkles } from "lucide-react";

const ShopDetail = () => {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get(`/shops/${id}`).then((r) => setShop(r.data));
    api.get(`/products?shop_id=${id}`).then((r) => setProducts(r.data));
  }, [id]);

  if (!shop) return <div className="py-32 text-center text-muted-foreground">Chargement…</div>;

  return (
    <div className="fade-in">
      <section className="bg-muted/40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-primary mb-3">
                <Store className="w-3 h-3" /> Boutique <MapPin className="w-3 h-3 ml-2" /> {shop.city}
                {shop.is_premium && <span className="ml-2 inline-flex items-center gap-1 bg-foreground text-background px-2 py-0.5 text-[10px]"><Sparkles className="w-3 h-3" /> Premium</span>}
              </div>
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight" data-testid="shop-name">{shop.name}</h1>
              <p className="mt-4 font-serif italic text-lg text-muted-foreground max-w-2xl">{shop.description}</p>
            </div>
            {shop.whatsapp && (
              <a href={`https://wa.me/${shop.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-success text-background rounded-full text-sm hover:opacity-90" data-testid="shop-whatsapp-link">
                <MessageCircle className="w-4 h-4" /> Contacter sur WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
        <h2 className="font-display font-bold text-2xl lg:text-3xl mb-8">Produits ({products.length})</h2>
        {products.length === 0 ? (
          <div className="py-12 text-center font-serif italic text-muted-foreground">Aucun produit publié pour l'instant.</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
};

export default ShopDetail;
