
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const getLinkClass = ({ isActive }) =>
    `whitespace-nowrap text-sm font-semibold transition-colors ${
      isActive
        ? "text-brand"
        : "text-gray-600 hover:text-brand"
    }`;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex min-h-[72px] max-w-[1440px] flex-col items-start justify-between gap-4 px-5 py-4 sm:px-8 md:flex-row md:items-center lg:px-12">
        <Link
          to="/"
          className="shrink-0 text-2xl font-extrabold tracking-tight text-gray-900"
        >
          Cartiva<span className="text-brand">.</span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex w-full flex-wrap items-center gap-x-5 gap-y-3 md:w-auto md:justify-end"
        >
          <NavLink to="/" end className={getLinkClass}>
            Home
          </NavLink>

          <NavLink to="/products" className={getLinkClass}>
            Products
          </NavLink>

          {isAuthenticated ? (
            <>
              <span className="max-w-36 truncate text-sm font-medium text-gray-500">
                Hi, {user?.name || "User"}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={getLinkClass}>
                Login
              </NavLink>

              <Link
                to="/register"
                className="whitespace-nowrap rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
