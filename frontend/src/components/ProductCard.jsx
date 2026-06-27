import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/api";

const placeholderImg = "https://images.unsplash.com/photo-1552710307-537199cd41c0?crop=entropy&cs=srgb&fm=jpg&q=85";

const ProductCard = ({ product }) => {
  const img = (product.images && product.images[0]) || placeholderImg;
  const hasPromo = product.promotion_price && product.promotion_price < product.price;
  return (
    <Link
      to={`/produit/${product.id}`}
      className="group block bg-card border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-200 rounded-sm overflow-hidden"
      data-testid={`product-card-${product.id}`}
    >
      <div className="aspect-[4/5] overflow-hidden bg-muted relative">
        <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        {hasPromo && (
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] uppercase tracking-widest font-bold px-2 py-1">Promo</div>
        )}
        {product.type === "digital" && (
          <div className="absolute top-3 right-3 bg-foreground text-background text-[10px] uppercase tracking-widest font-bold px-2 py-1">Numérique</div>
        )}
      </div>
      <div className="p-4 space-y-1">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{product.category}</div>
        <div className="font-display font-medium text-base leading-tight line-clamp-2">{product.name}</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" /> {product.shop_city}
          {product.rating_count > 0 && (
            <span className="flex items-center gap-1 ml-auto"><Star className="w-3 h-3 fill-secondary text-secondary" /> {product.rating_avg}</span>
          )}
        </div>
        <div className="pt-2 flex items-baseline gap-2">
          {hasPromo && <span className="text-sm line-through text-muted-foreground">{formatPrice(product.price)}</span>}
          <span className="font-display font-bold text-lg text-primary">{formatPrice(hasPromo ? product.promotion_price : product.price)}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
