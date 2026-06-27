import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Sparkles, Truck, ShieldCheck, Store } from "lucide-react";

const HERO = "https://images.unsplash.com/photo-1611432579402-7037e3e2c1e4?crop=entropy&cs=srgb&fm=jpg&q=85";
const COSMETIC = "https://images.unsplash.com/photo-1612817288484-6f916006741a?crop=entropy&cs=srgb&fm=jpg&q=85";
const FABRIC = "https://images.unsplash.com/photo-1552710307-537199cd41c0?crop=entropy&cs=srgb&fm=jpg&q=85";
const CRAFT = "https://images.unsplash.com/photo-1481061730414-e888962bd2c0?crop=entropy&cs=srgb&fm=jpg&q=85";
const FASHION = "https://images.unsplash.com/photo-1709809081557-78f803ce93a0?crop=entropy&cs=srgb&fm=jpg&q=85";

const CATEGORIES = [
  { name: "Mode & Vêtements", img: FASHION },
  { name: "Cosmétiques & Beauté", img: COSMETIC },
  { name: "Artisanat", img: CRAFT },
  { name: "Sacs & Maroquinerie", img: FABRIC },
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);

  useEffect(() => {
    api.get("/products?limit=8&sort=recent").then((r) => setProducts(r.data)).catch(() => {});
    api.get("/shops").then((r) => setShops(r.data.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <div className="fade-in">
      {/* HERO BENTO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-10 lg:pt-16">
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          <div className="col-span-12 lg:col-span-7 relative overflow-hidden rounded-sm bg-muted aspect-[4/5] lg:aspect-auto lg:min-h-[560px]">
            <img src={HERO} alt="Femme entrepreneure camerounaise" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
            <div className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-end text-background">
              <div className="text-xs uppercase tracking-[0.3em] text-secondary mb-4">Marketplace nationale · Cameroun</div>
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[0.95] text-balance">
                Le marché des <span className="font-serif italic font-light">femmes</span> qui font le Cameroun.
              </h1>
              <p className="mt-6 font-serif italic text-lg max-w-lg text-background/85">
                Mode, beauté, artisanat, livres, formations. Achetez authentique, soutenez nos entrepreneures.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/catalogue"><Button size="lg" className="rounded-full bg-primary hover:bg-[#A94422] btn-press" data-testid="hero-cta-shop">Explorer le catalogue<ArrowUpRight className="w-4 h-4 ml-1" /></Button></Link>
                <Link to="/inscription"><Button size="lg" variant="outline" className="rounded-full bg-transparent border-background/40 text-background hover:bg-background hover:text-foreground" data-testid="hero-cta-sell">Vendre sur Elles</Button></Link>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-4 lg:gap-6">
            <div className="col-span-2 bg-secondary text-secondary-foreground p-6 lg:p-8 rounded-sm grain">
              <Sparkles className="w-6 h-6" />
              <div className="font-serif italic text-3xl lg:text-4xl mt-4 leading-tight">+ de <span className="font-display font-black not-italic">300</span> femmes,<br/>une seule vitrine.</div>
              <div className="text-xs uppercase tracking-[0.2em] mt-4 opacity-70">Yaoundé · Douala · Bafoussam · Buea</div>
            </div>
            <div className="col-span-1 bg-card border border-border p-6 rounded-sm">
              <Truck className="w-5 h-5 text-primary" />
              <div className="mt-3 font-display font-semibold text-base leading-tight">Livraison nationale</div>
              <div className="text-xs text-muted-foreground mt-1">Toutes les villes du Cameroun</div>
            </div>
            <div className="col-span-1 bg-card border border-border p-6 rounded-sm">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <div className="mt-3 font-display font-semibold text-base leading-tight">Paiement sécurisé</div>
              <div className="text-xs text-muted-foreground mt-1">MoMo · Orange · Visa</div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-20 lg:py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Univers</div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight">Trouvez votre <span className="font-serif italic font-light">bonheur</span>.</h2>
          </div>
          <Link to="/catalogue" className="hidden sm:flex items-center gap-1 text-sm font-medium hover:text-primary transition" data-testid="categories-view-all">Voir tout <ArrowUpRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {CATEGORIES.map((c) => (
            <Link to={`/catalogue?category=${encodeURIComponent(c.name)}`} key={c.name} className="group relative aspect-[3/4] overflow-hidden rounded-sm bg-muted" data-testid={`category-${c.name.toLowerCase().replace(/\s+/g, "-")}`}>
              <img src={c.img} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5">
                <div className="font-display font-bold text-xl text-background leading-tight">{c.name}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-secondary mt-1">Découvrir →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="bg-muted/40 py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Nouveautés</div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight">Récemment ajoutés.</h2>
            </div>
            <Link to="/catalogue" className="text-sm font-medium hover:text-primary transition" data-testid="products-view-all">Tout voir →</Link>
          </div>
          {products.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground font-serif italic text-lg">Les premières créations arrivent bientôt…</div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* SHOPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-20 lg:py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Nos entrepreneures</div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight">Boutiques à <span className="font-serif italic font-light">l'honneur</span>.</h2>
          </div>
          <Link to="/boutiques" className="text-sm font-medium hover:text-primary transition" data-testid="shops-view-all">Toutes les boutiques →</Link>
        </div>
        {shops.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground font-serif italic">Bientôt parmi nous.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {shops.map((s) => (
              <Link to={`/boutique/${s.id}`} key={s.id} className="group p-6 border border-border bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-200 rounded-sm" data-testid={`shop-card-${s.id}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Store className="w-4 h-4 text-primary" />
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{s.city}</span>
                  {s.is_premium && <span className="ml-auto text-[10px] uppercase tracking-widest bg-foreground text-background px-2 py-0.5">Premium</span>}
                </div>
                <div className="font-display font-bold text-xl tracking-tight group-hover:text-primary transition">{s.name}</div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{s.description}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="bg-primary text-primary-foreground py-20 lg:py-24 grain">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] mb-3 opacity-80">Vous êtes entrepreneure ?</div>
            <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none">
              Ouvrez votre boutique en <span className="font-serif italic font-light">3 minutes</span>.
            </h2>
            <p className="mt-6 font-serif italic text-lg max-w-md opacity-90">Visibilité nationale, paiements sécurisés, logistique organisée. Zéro frais d'entrée.</p>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <Link to="/inscription"><Button size="lg" className="rounded-full bg-background text-foreground hover:bg-background/90 btn-press" data-testid="cta-banner-register">Devenir vendeuse</Button></Link>
            <span className="text-xs opacity-70">Offre Gratuite jusqu'à 10 produits</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
