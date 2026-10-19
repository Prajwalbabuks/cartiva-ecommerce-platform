
import { useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  ShoppingCart,
  Menu,
  X,
  Package,
  MapPin,
  LogOut,
  LogIn,
  UserPlus,
  House,
  UserRound,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const navLinkClass = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-indigo-50 text-brand"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
  }`;

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems = 0 } = useCart();

  const location = useLocation();
  const navigate = useNavigate();

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      closeMobileMenu();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActivePath = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  const accountName = user?.name || user?.email || "Account";

  const navItems = [
    {
      label: "Home",
      to: "/",
      icon: House,
    },
    {
      label: "Products",
      to: "/products",
      icon: ShoppingCart,
    },
  ];

  const accountItems = [
    {
      label: "My Orders",
      to: "/orders",
      icon: Package,
    },
    {
      label: "Addresses",
      to: "/addresses",
      icon: MapPin,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex shrink-0 items-center gap-2"
            aria-label="Cartiva home"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
              <ShoppingCart size={22} strokeWidth={2.5} />
            </span>

            <span className="text-2xl font-extrabold tracking-tight text-gray-900">
              Cartiva
              <span className="text-brand">.</span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Main navigation"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={navLinkClass}
              >
                {item.label}
              </NavLink>
            ))}

            {isAuthenticated &&
              accountItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={navLinkClass}
                >
                  {item.label}
                </NavLink>
              ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated && (
              <span className="hidden max-w-36 truncate text-sm text-gray-600 lg:block">
                Hi, {accountName}
              </span>
            )}

            <Link
              to="/cart"
              aria-label={`Shopping cart, ${totalItems} items`}
              className={`relative inline-flex size-10 items-center justify-center rounded-xl transition ${
                isActivePath("/cart")
                  ? "bg-indigo-50 text-brand"
                  : "text-gray-600 hover:bg-gray-100 hover:text-brand"
              }`}
            >
              <ShoppingCart size={21} />

              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={16} />
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  <LogIn size={16} />
                  Login
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-hover"
                >
                  <UserPlus size={16} />
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile cart and menu buttons */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/cart"
              onClick={closeMobileMenu}
              aria-label={`Shopping cart, ${totalItems} items`}
              className="relative flex size-10 items-center justify-center rounded-xl text-gray-700 transition hover:bg-gray-100"
            >
              <ShoppingCart size={21} />

              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex size-10 items-center justify-center rounded-xl text-gray-700 transition hover:bg-gray-100"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-gray-200 bg-white px-4 pb-5 pt-3 md:hidden"
        >
          {isAuthenticated && (
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-brand">
                <UserRound size={20} />
              </span>

              <div className="min-w-0">
                <p className="text-xs text-gray-500">Signed in as</p>
                <p className="truncate text-sm font-semibold text-gray-900">
                  {accountName}
                </p>
              </div>
            </div>
          )}

          <nav
            className="flex flex-col gap-1"
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={closeMobileMenu}
                  className={navLinkClass}
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}

            {isAuthenticated &&
              accountItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileMenu}
                    className={navLinkClass}
                  >
                    <Icon size={18} />
                    {item.label}
                  </NavLink>
                );
              })}

            <div className="my-2 border-t border-gray-100" />

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={18} />
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  <LogIn size={18} />
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover"
                >
                  <UserPlus size={18} />
                  Create account
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
