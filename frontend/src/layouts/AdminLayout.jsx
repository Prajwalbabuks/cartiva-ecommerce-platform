
import { useState } from "react";
import {
    NavLink,
    Outlet,
    useNavigate,
} from "react-router-dom";

import {
    LayoutDashboard,
    Package,
    Tags,
    TicketPercent,
    ShoppingBag,
    Users,
    Menu,
    X,
    LogOut,
    Store,
    ChevronRight,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const navigation = [
    {
        label: "Dashboard",
        path: "/admin",
        icon: LayoutDashboard,
        end: true,
    },
    {
        label: "Products",
        path: "/admin/products",
        icon: Package,
    },
    {
        label: "Categories",
        path: "/admin/categories",
        icon: Tags,
    },
    {
        label: "Coupons",
        path: "/admin/coupons",
        icon: TicketPercent,
    },
    {
        label: "Orders",
        path: "/admin/orders",
        icon: ShoppingBag,
    },
    {
        label: "Customers",
        path: "/admin/customers",
        icon: Users,
    },
];

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="min-h-screen bg-slate-50">
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={closeSidebar}
                    className="fixed inset-0 z-40 bg-gray-950/40 lg:hidden"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
                    sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                }`}
            >
                <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
                    <NavLink
                        to="/admin"
                        onClick={closeSidebar}
                        className="flex items-center gap-3"
                    >
                        <span className="flex size-10 items-center justify-center rounded-xl bg-brand text-white">
                            <Store size={21} />
                        </span>

                        <span className="text-xl font-extrabold tracking-tight text-gray-900">
                            Cartiva
                            <span className="text-brand">.</span>
                            <span className="ml-1 text-xs font-semibold text-gray-500">
                                Admin
                            </span>
                        </span>
                    </NavLink>

                    <button
                        type="button"
                        onClick={closeSidebar}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-4 pt-6">
                    <p className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                        Management
                    </p>

                    <nav className="mt-3 space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.end}
                                    onClick={closeSidebar}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                                            isActive
                                                ? "bg-indigo-50 text-brand"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`
                                    }
                                >
                                    <Icon size={19} />

                                    <span>{item.label}</span>

                                    <ChevronRight
                                        size={16}
                                        className="ml-auto opacity-50"
                                    />
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto border-t border-gray-100 p-4">
                    <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-brand">
                            {user?.name?.charAt(0)?.toUpperCase() || "A"}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                                {user?.name || "Administrator"}
                            </p>
                            <p className="text-xs text-gray-500">
                                Administrator
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                        <LogOut size={19} />
                        Logout
                    </button>
                </div>
            </aside>

            <div className="min-h-screen lg:pl-64">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
                            aria-label="Open sidebar"
                        >
                            <Menu size={22} />
                        </button>

                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                Admin Panel
                            </p>
                            <p className="hidden text-xs text-gray-500 sm:block">
                                Manage your Cartiva store
                            </p>
                        </div>
                    </div>

                    <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-brand">
                        Admin
                    </span>
                </header>

                <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
