import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Store, MapPin, Sparkles } from "lucide-react";

const Shops = () => {
  const [shops, setShops] = useState([]);
  useEffect(() => { api.get("/shops").then((r) => setShops(r.data)); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 fade-in">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Boutiques</div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight">Toutes nos <span className="font-serif italic font-light">entrepreneures</span>.</h1>
      </div>
      {shops.length === 0 ? (
        <div className="py-20 text-center font-serif italic text-muted-foreground">Les premières boutiques arrivent bientôt.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {shops.map((s) => (
            <Link to={`/boutique/${s.id}`} key={s.id} className="group p-6 bg-card border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-200 rounded-sm" data-testid={`shop-list-card-${s.id}`}>
              <div className="flex items-center gap-2 mb-3">
                <Store className="w-4 h-4 text-primary" />
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.city}</span>
                {s.is_premium && <span className="ml-auto text-[10px] uppercase tracking-widest bg-foreground text-background px-2 py-0.5 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Premium</span>}
              </div>
              <div className="font-display font-bold text-xl tracking-tight group-hover:text-primary transition">{s.name}</div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{s.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shops;
