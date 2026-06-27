import { createContext, useContext, useEffect, useState } from "react";

const CartCtx = createContext(null);
const KEY = "elles.cart.v1";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = (product, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product_id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price: product.promotion_price || product.price,
        image: (product.images || [])[0],
        shop_id: product.shop_id,
        shop_name: product.shop_name,
        type: product.type,
        quantity: qty,
      }];
    });
  };

  const remove = (product_id) => setItems((p) => p.filter((i) => i.product_id !== product_id));
  const setQty = (product_id, quantity) => setItems((p) => p.map((i) => i.product_id === product_id ? { ...i, quantity: Math.max(1, quantity) } : i));
  const clear = () => setItems([]);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartCtx.Provider value={{ items, add, remove, setQty, clear, subtotal, count }}>
      {children}
    </CartCtx.Provider>
  );
};

export const useCart = () => useContext(CartCtx);
