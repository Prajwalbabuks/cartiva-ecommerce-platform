
import {
    BrowserRouter,
    Routes,
    Route,
    Outlet,
    Link,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProduct";
import AdminAddProduct from "./pages/admin/AdminAddProduct";
import AdminEditProduct from "./pages/admin/AdminEditProduct";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminAddCategory from "./pages/admin/AdminAddCategories";
import AdminEditCategory from "./pages/admin/AdminEditCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCoupons from "./pages/admin/AdminCoupon";   
import AdminCouponForm from "./pages/admin/AdminCouponForm";
import AdminCustomers from "./pages/admin/AdminCustomers";

import VerifyEmail from "./pages/VerifyEmail";
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
import Wishlist from "./pages/Wishlist";



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
                    <p>
                        © {new Date().getFullYear()} Cartiva. All rights reserved.
                    </p>
                    <p>Shop smart. Shop with Cartiva.</p>
                </div>
            </footer>
        </div>
    );
}

function NotFound() {
    return (
        <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <h1 className="text-4xl font-bold text-gray-900">
                404
            </h1>

            <p className="mt-3 text-gray-600">
                This page could not be found.
            </p>

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
                {/* Customer layout */}
                <Route element={<MainLayout />}>
                    {/* Public pages */}
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />

                    <Route
                        path="/products/:productId"
                        element={<ProductDetails />}
                    />

                    {/* Guest-only pages */}
                    <Route element={<GuestRoute />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                    </Route>

                    {/* Authenticated customer pages */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/addresses" element={<Addresses />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/orders" element={<OrderHistory />} />

                        <Route
                            path="/orders/:orderId/confirmation"
                            element={<OrderConfirmation />}
                        />

                        <Route
                            path="/payment-test"
                            element={<PaymentTest />}
                        />
                    </Route>
                </Route>

                {/* Separate admin layout */}
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                        <AdminLayout />
                        </AdminRoute>
                    }
                >
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<AdminAddProduct />} />
                    <Route path="products/edit/:id" element={<AdminEditProduct />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="categories/new" element={<AdminAddCategory />}/>
                    <Route path="categories/edit/:id" element={<AdminEditCategory />}/>
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route path="coupons/add" element={<AdminCouponForm />} />
                    <Route path="coupons/edit/:id" element={<AdminCouponForm />} />
                    <Route path="customers" element={<AdminCustomers />} />
                </Route>

                {/* Not found */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
