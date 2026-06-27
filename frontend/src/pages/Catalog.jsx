import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [city, setCity] = useState(searchParams.get("city") || "all");
  const [type, setType] = useState(searchParams.get("type") || "all");
  const [sort, setSort] = useState("recent");

  useEffect(() => {
    api.get("/meta/categories").then((r) => setCategories(r.data));
    api.get("/meta/cities").then((r) => setCities(r.data));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (category !== "all") params.append("category", category);
    if (city !== "all") params.append("city", city);
    if (type !== "all") params.append("type", type);
    params.append("sort", sort);
    setLoading(true);
    api.get(`/products?${params.toString()}`).then((r) => { setProducts(r.data); setLoading(false); }).catch(() => setLoading(false));
    const urlParams = new URLSearchParams();
    if (q) urlParams.set("q", q);
    if (category !== "all") urlParams.set("category", category);
    if (city !== "all") urlParams.set("city", city);
    if (type !== "all") urlParams.set("type", type);
    setSearchParams(urlParams, { replace: true });
  }, [q, category, city, type, sort, setSearchParams]);

  const resetFilters = () => { setQ(""); setCategory("all"); setCity("all"); setType("all"); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 fade-in">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Catalogue</div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight">Tous les <span className="font-serif italic font-light">produits</span>.</h1>
      </div>

      <div className="grid lg:grid-cols-[260px,1fr] gap-8">
        <aside className="space-y-5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" data-testid="catalog-search-input" />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Catégorie</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="filter-category"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ville</label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger data-testid="filter-city"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger data-testid="filter-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="physical">Physique</SelectItem>
                <SelectItem value="digital">Numérique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tri</label>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger data-testid="filter-sort"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récents</SelectItem>
                <SelectItem value="price_asc">Prix croissant</SelectItem>
                <SelectItem value="price_desc">Prix décroissant</SelectItem>
                <SelectItem value="best">Best-sellers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={resetFilters} className="w-full" data-testid="reset-filters-button">
            <X className="w-4 h-4 mr-1" /> Réinitialiser
          </Button>
        </aside>

        <div>
          <div className="text-sm text-muted-foreground mb-4" data-testid="catalog-results-count">{loading ? "Chargement…" : `${products.length} produit(s)`}</div>
          {!loading && products.length === 0 ? (
            <div className="py-20 text-center font-serif italic text-muted-foreground">Aucun produit ne correspond à vos critères.</div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalog;
