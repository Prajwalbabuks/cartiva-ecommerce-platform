
import { useEffect, useState } from "react";

import {
    IndianRupee,
    ShoppingBag,
    Users,
    Package,
    Tags,
    TicketPercent,
    AlertTriangle,
    RefreshCw,
    ArrowUpRight,
} from "lucide-react";

import { getDashboardOverview } from "../../services/admin.service";

const formatCurrency = (amount = 0) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(amount);

const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

function StatCard({ title, value, description, icon: Icon }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-gray-500">
                        {title}
                    </p>

                    <h3 className="mt-3 text-2xl font-bold tracking-tight text-gray-900">
                        {value}
                    </h3>
                </div>

                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-brand">
                    <Icon size={21} />
                </div>
            </div>

            <p className="mt-4 text-xs text-gray-500">
                {description}
            </p>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        pending: "bg-amber-50 text-amber-700",
        confirmed: "bg-blue-50 text-blue-700",
        processing: "bg-indigo-50 text-indigo-700",
        shipped: "bg-purple-50 text-purple-700",
        delivered: "bg-emerald-50 text-emerald-700",
        cancelled: "bg-red-50 text-red-700",
    };

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                styles[status] || "bg-gray-100 text-gray-600"
            }`}
        >
            {status || "Unknown"}
        </span>
    );
}

export default function AdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getDashboardOverview();

            if (!response.success) {
                throw new Error(
                    response.message || "Unable to load dashboard."
                );
            }

            setDashboard(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Something went wrong while loading the dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <div className="size-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand" />
                <p className="mt-4 text-sm text-gray-500">
                    Loading dashboard...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 text-center">
                <AlertTriangle size={35} className="text-red-500" />

                <h2 className="mt-4 text-lg font-bold text-gray-900">
                    Unable to load dashboard
                </h2>

                <p className="mt-2 max-w-md text-sm text-gray-500">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={fetchDashboard}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
                >
                    <RefreshCw size={16} />
                    Try again
                </button>
            </div>
        );
    }

    const overview = dashboard?.overview || {};
    const orders = overview.orders || {};
    const customers = overview.customers || {};
    const products = overview.products || {};
    const categories = overview.categories || {};
    const coupons = overview.coupons || {};

    const recentOrders = dashboard?.recentOrders || [];

    const stats = [
        {
            title: "Total Revenue",
            value: formatCurrency(overview.revenue),
            description: "Revenue from successfully paid orders",
            icon: IndianRupee,
        },
        {
            title: "Total Orders",
            value: orders.total ?? 0,
            description: `${orders.paid ?? 0} successfully paid orders`,
            icon: ShoppingBag,
        },
        {
            title: "Total Customers",
            value: customers.total ?? 0,
            description: `${customers.active ?? 0} active customers`,
            icon: Users,
        },
        {
            title: "Total Products",
            value: products.total ?? 0,
            description: `${products.active ?? 0} active products`,
            icon: Package,
        },
        {
            title: "Categories",
            value: categories.total ?? 0,
            description: `${categories.active ?? 0} active categories`,
            icon: Tags,
        },
        {
            title: "Coupons",
            value: coupons.total ?? 0,
            description: `${coupons.active ?? 0} active coupons`,
            icon: TicketPercent,
        },
    ];

    return (
        <div className="space-y-8">
            {/* Page heading */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-brand">
                        Overview
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                        Dashboard
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Here's what's happening with your store.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchDashboard}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Statistics */}
            <section>
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-gray-900">
                        Store Statistics
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        A summary of your Cartiva store.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {stats.map((stat) => (
                        <StatCard key={stat.title} {...stat} />
                    ))}
                </div>
            </section>

            {/* Order summary */}
            <section className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Pending Orders
                            </p>
                            <h3 className="mt-2 text-3xl font-bold text-gray-900">
                                {orders.pending ?? 0}
                            </h3>
                        </div>

                        <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <ShoppingBag size={21} />
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                        Orders awaiting confirmation or further processing.
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">
                                Low Stock Products
                            </p>
                            <h3 className="mt-2 text-3xl font-bold text-gray-900">
                                {products.lowStock ?? 0}
                            </h3>
                        </div>

                        <div className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <AlertTriangle size={21} />
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                        Active products with {products.lowStockThreshold ?? 5} or fewer units.
                    </p>
                </div>
            </section>

            {/* Recent orders */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Recent Orders
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Latest orders placed in your store.
                        </p>
                    </div>

                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
                        Latest 5 orders
                        <ArrowUpRight size={16} />
                    </span>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                        <ShoppingBag
                            size={35}
                            className="mx-auto text-gray-300"
                        />
                        <p className="mt-3 font-semibold text-gray-700">
                            No orders yet
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            New customer orders will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[750px] text-left">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-gray-500">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">
                                        Order ID
                                    </th>
                                    <th className="px-5 py-4 font-semibold">
                                        Customer
                                    </th>
                                    <th className="px-5 py-4 font-semibold">
                                        Date
                                    </th>
                                    <th className="px-5 py-4 font-semibold">
                                        Amount
                                    </th>
                                    <th className="px-5 py-4 font-semibold">
                                        Payment
                                    </th>
                                    <th className="px-5 py-4 font-semibold">
                                        Order Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {recentOrders.map((order) => (
                                    <tr
                                        key={order._id}
                                        className="transition hover:bg-slate-50"
                                    >
                                        <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                                            #{order._id.slice(-8).toUpperCase()}
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="text-sm font-semibold text-gray-800">
                                                {order.user?.name || "Unknown"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {order.user?.email || "N/A"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {formatDate(order.createdAt)}
                                        </td>

                                        <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                                            {formatCurrency(order.total)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                                                    order.paymentStatus === "paid"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : order.paymentStatus === "failed"
                                                          ? "bg-red-50 text-red-700"
                                                          : "bg-amber-50 text-amber-700"
                                                }`}
                                            >
                                                {order.paymentStatus}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
