import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "@/components/ui/sonner";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import ProductDetail from "@/pages/ProductDetail";
import Shops from "@/pages/Shops";
import ShopDetail from "@/pages/ShopDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";
import About from "@/pages/About";

import CustomerOrders from "@/pages/customer/Orders";
import VendorLayout from "@/pages/vendor/VendorLayout";
import VendorOverview from "@/pages/vendor/Overview";
import VendorShop from "@/pages/vendor/Shop";
import VendorProducts from "@/pages/vendor/Products";
import VendorOrders from "@/pages/vendor/Orders";
import VendorSubscription from "@/pages/vendor/Subscription";

import AdminLayout from "@/pages/admin/AdminLayout";
import AdminOverview from "@/pages/admin/Overview";
import AdminShops from "@/pages/admin/Shops";
import AdminUsers from "@/pages/admin/Users";
import AdminOrders from "@/pages/admin/Orders";
import AdminBanners from "@/pages/admin/Banners";

const ProtectedRoute = ({ roles, children }) => {
  const { user } = useAuth();
  if (user === undefined) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Chargement…</div>;
  }
  if (!user) return <Navigate to="/connexion" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const Shell = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Shell><Home /></Shell>} />
            <Route path="/catalogue" element={<Shell><Catalog /></Shell>} />
            <Route path="/produit/:id" element={<Shell><ProductDetail /></Shell>} />
            <Route path="/boutiques" element={<Shell><Shops /></Shell>} />
            <Route path="/boutique/:id" element={<Shell><ShopDetail /></Shell>} />
            <Route path="/connexion" element={<Shell><Login /></Shell>} />
            <Route path="/inscription" element={<Shell><Register /></Shell>} />
            <Route path="/panier" element={<Shell><Cart /></Shell>} />
            <Route path="/checkout" element={<Shell><ProtectedRoute roles={["customer"]}><Checkout /></ProtectedRoute></Shell>} />
            <Route path="/commande-confirmee" element={<Shell><ProtectedRoute roles={["customer"]}><OrderSuccess /></ProtectedRoute></Shell>} />
            <Route path="/a-propos" element={<Shell><About /></Shell>} />
            <Route path="/mes-commandes" element={<Shell><ProtectedRoute roles={["customer"]}><CustomerOrders /></ProtectedRoute></Shell>} />

            <Route path="/vendeuse" element={<ProtectedRoute roles={["vendor"]}><VendorLayout /></ProtectedRoute>}>
              <Route index element={<VendorOverview />} />
              <Route path="boutique" element={<VendorShop />} />
              <Route path="produits" element={<VendorProducts />} />
              <Route path="commandes" element={<VendorOrders />} />
              <Route path="abonnement" element={<VendorSubscription />} />
            </Route>

            <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminOverview />} />
              <Route path="boutiques" element={<AdminShops />} />
              <Route path="utilisateurs" element={<AdminUsers />} />
              <Route path="commandes" element={<AdminOrders />} />
              <Route path="bannieres" element={<AdminBanners />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
