
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Link,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Addresses from "./pages/Addresses";
import Checkout from "./pages/Checkout";
import PaymentTest from "./pages/PaymentTest";
import OrderHistory from "./pages/OrderHistory";
import OrderConfirmation from "./pages/OrderConfirmation";

import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main>
        <Outlet />
      </main>

      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-center text-sm text-gray-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Cartiva. All rights reserved.</p>
          <p>Shop smart. Shop with Cartiva.</p>
        </div>
      </footer>
    </div>
  );
}

function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="mt-3 text-gray-600">This page could not be found.</p>
      <Link
        to="/"
        className="mt-5 rounded-lg bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-hover"
      >
        Back to Home
      </Link>
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route
            path="/products/:productId"
            element={<ProductDetails />}
          />

          {/* Guest-only pages: GuestRoute renders their Outlet */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected pages: ProtectedRoute renders their Outlet */}
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/addresses" element={<Addresses />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route
              path="/orders/:orderId/confirmation"
              element={<OrderConfirmation />}
            />
            <Route path="/payment-test" element={<PaymentTest />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
