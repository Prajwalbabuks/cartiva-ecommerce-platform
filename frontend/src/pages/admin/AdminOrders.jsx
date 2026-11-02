
import { useCallback, useEffect, useState } from "react";

import { RefreshCw } from "lucide-react";

import {
    getAdminOrders,
    updateAdminOrderStatus,
    getAdminOrderStats,
} from "../../services/admin.service";

// Available order statuses
const ORDER_STATUSES = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
];

// Available payment statuses
const PAYMENT_STATUSES = [
    "pending",
    "paid",
    "failed",
    "refunded",
];

// Status badge styles
const statusStyles = {
    pending: "bg-amber-50 text-amber-700",
    confirmed: "bg-blue-50 text-blue-700",
    processing: "bg-indigo-50 text-indigo-700",
    shipped: "bg-purple-50 text-purple-700",
    delivered: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-700",
    paid: "bg-green-50 text-green-700",
    failed: "bg-red-50 text-red-700",
    refunded: "bg-gray-100 text-gray-700",
};

// Format date
const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

// Format currency
const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(amount || 0);

// Format status text
const formatStatus = (status = "") =>
    status.charAt(0).toUpperCase() + status.slice(1);

// Status badge component
function StatusBadge({ status }) {
    const normalizedStatus = status?.toLowerCase() || "pending";

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[normalizedStatus] ||
                "bg-gray-100 text-gray-700"
                }`}
        >
            {formatStatus(normalizedStatus)}
        </span>
    );
}

// Summary card component
function SummaryCard({ title, value, description }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-medium text-gray-500">
                {title}
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
                {value}
            </p>

            <p className="mt-1 text-xs text-gray-500">
                {description}
            </p>
        </div>
    );
}

// Order details modal
function OrderDetailsModal({
    order,
    onClose,
    onStatusUpdate,
    updating,
}) {
    if (!order) return null;

    const address = order.shippingAddress || {};

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Order Details
                        </h2>

                        <p className="mt-1 break-all text-sm text-gray-500">
                            Order ID: {order._id}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg px-3 py-1 text-xl text-gray-500 hover:bg-gray-100"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                {/* Customer and Order Information */}
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div className="rounded-xl bg-gray-50 p-4">
                        <h3 className="font-semibold text-gray-900">
                            Customer Information
                        </h3>

                        <p className="mt-3 text-sm text-gray-600">
                            {order.user?.name || "Unknown customer"}
                        </p>

                        <p className="mt-1 break-all text-sm text-gray-600">
                            {order.user?.email || "No email"}
                        </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                        <h3 className="font-semibold text-gray-900">
                            Order Information
                        </h3>

                        <div className="mt-3 space-y-2 text-sm text-gray-600">
                            <p>
                                Placed: {formatDate(order.createdAt)}
                            </p>

                            <p className="flex items-center gap-2">
                                Payment:
                                <StatusBadge
                                    status={order.paymentStatus}
                                />
                            </p>

                            <p className="flex items-center gap-2">
                                Order status:
                                <StatusBadge status={order.status} />
                            </p>
                        </div>
                    </div>
                </div>

                {/* Ordered Items */}
                <div className="mt-6">
                    <h3 className="font-semibold text-gray-900">
                        Ordered Items
                    </h3>

                    <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full min-w-[500px] text-sm">
                            <thead className="bg-gray-50 text-left text-gray-600">
                                <tr>
                                    <th className="px-4 py-3">
                                        Product
                                    </th>

                                    <th className="px-4 py-3">
                                        Price
                                    </th>

                                    <th className="px-4 py-3">
                                        Quantity
                                    </th>

                                    <th className="px-4 py-3">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {(order.items || []).map(
                                    (item, index) => (
                                        <tr key={item._id || index}>
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                {item.name}
                                            </td>

                                            <td className="px-4 py-3 text-gray-600">
                                                {formatCurrency(item.price)}
                                            </td>

                                            <td className="px-4 py-3 text-gray-600">
                                                {item.quantity}
                                            </td>

                                            <td className="px-4 py-3 text-gray-900">
                                                {formatCurrency(item.subtotal)}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Shipping and Payment Summary */}
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            Shipping Address
                        </h3>

                        <div className="mt-3 text-sm leading-6 text-gray-600">
                            <p>{address.fullName}</p>
                            <p>{address.phone}</p>
                            <p>{address.addressLine1}</p>

                            {address.addressLine2 && (
                                <p>{address.addressLine2}</p>
                            )}

                            <p>
                                {[
                                    address.city,
                                    address.state,
                                    address.postalCode,
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                            </p>

                            <p>{address.country}</p>
                        </div>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                        <h3 className="font-semibold text-gray-900">
                            Payment Summary
                        </h3>

                        <div className="mt-3 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>
                                    {formatCurrency(order.subtotal)}
                                </span>
                            </div>

                            <div className="flex justify-between text-gray-600">
                                <span>Discount</span>
                                <span>
                                    -{formatCurrency(order.discount)}
                                </span>
                            </div>

                            <div className="flex justify-between border-t border-gray-200 pt-3 font-bold text-gray-900">
                                <span>Total</span>
                                <span>
                                    {formatCurrency(order.total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Update Order Status */}
                <div className="mt-6 border-t border-gray-200 pt-5">
                    <label
                        htmlFor="order-status"
                        className="mb-2 block text-sm font-semibold text-gray-900"
                    >
                        Update Order Status
                    </label>

                    <select
                        id="order-status"
                        value={order.status}
                        onChange={(event) =>
                            onStatusUpdate(
                                order._id,
                                event.target.value
                            )
                        }
                        disabled={updating}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-50"
                    >
                        {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {formatStatus(status)}
                            </option>
                        ))}
                    </select>

                    <p className="mt-2 text-xs text-gray-500">
                        Only valid order status transitions will be
                        accepted by the backend.
                    </p>
                </div>

                {/* Modal Footer */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// Main Admin Orders Page
export default function AdminOrders() {
    const [orders, setOrders] = useState([]);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalOrders: 0,
    });

    const [filters, setFilters] = useState({
        search: "",
        status: "",
        paymentStatus: "",
        sort: "newest",
    });

    const [summary, setSummary] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        deliveredOrders: 0,
        paidOrders: 0,
        totalRevenue: 0,
    });

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Fetch all orders with filters and pagination
    const fetchOrders = useCallback(
        async (page = 1) => {
            try {
                setLoading(true);
                setError("");

                const response = await getAdminOrders({
                    page,
                    limit: 10,
                    ...filters,
                });

                const fetchedOrders = response.orders || [];

                setOrders(fetchedOrders);

                setPagination(
                    response.pagination || {
                        currentPage: page,
                        totalPages: 1,
                        totalOrders: fetchedOrders.length,
                    }
                );
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load orders. Please try again."
                );
            } finally {
                setLoading(false);
            }
        },
        [filters]
    );

    // Fetch database-wide order statistics
    const fetchOrderStats = useCallback(async () => {
        try {
            const response = await getAdminOrderStats();

            setSummary({
                totalOrders: response.stats?.totalOrders ?? 0,
                pendingOrders: response.stats?.pendingOrders ?? 0,
                processingOrders: response.stats?.processingOrders ?? 0,
                deliveredOrders: response.stats?.deliveredOrders ?? 0,
                paidOrders: response.stats?.paidOrders ?? 0,
                totalRevenue: response.stats?.totalRevenue ?? 0,
            });
        } catch (err) {
            console.error(
                "Failed to fetch order statistics:",
                err.response?.data?.message || err.message
            );
        }
    }, []);

    // Fetch orders and statistics when page loads or filters change
    useEffect(() => {
        fetchOrders(1);
    }, [fetchOrders]);

    useEffect(() => {
        fetchOrderStats();
    }, [fetchOrderStats]);

    // Handle filter changes
    const handleFilterChange = (name, value) => {
        setFilters((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Update order status
    const handleStatusUpdate = async (orderId, status) => {
        const confirmed = window.confirm(
            `Are you sure you want to change this order status to ${status}?`
        );

        if (!confirmed) return;

        try {
            setUpdating(true);

            await updateAdminOrderStatus(orderId, status);

            await Promise.all([
                fetchOrders(pagination.currentPage),
                fetchOrderStats(),
            ]);

            setSelectedOrder((previous) =>
                previous?._id === orderId
                    ? { ...previous, status }
                    : previous
            );

            window.alert("Order status updated successfully.");
        } catch (err) {
            window.alert(
                err.response?.data?.message ||
                "Failed to update order status."
            );
        } finally {
            setUpdating(false);
        }
    };

    // Handle pagination
    const handlePageChange = (page) => {
        fetchOrders(page);
    };

    // Refresh orders and statistics
    const handleRefresh = async () => {
        try {
            setLoading(true);
            setError("");

            // Fetch orders and statistics simultaneously
            const [ordersResponse, statsResponse] = await Promise.all([
                getAdminOrders({
                    page: pagination.currentPage,
                    limit: 10,
                    ...filters,
                }),
                getAdminOrderStats(),
            ]);

            // Refresh orders table
            setOrders(ordersResponse.orders || []);

            // Refresh pagination
            if (ordersResponse.pagination) {
                setPagination((previous) => ({
                    ...previous,
                    ...ordersResponse.pagination,
                }));
            }

            // Refresh statistics cards
            setSummary(statsResponse.stats || {
                totalOrders: 0,
                pendingOrders: 0,
                processingOrders: 0,
                deliveredOrders: 0,
                paidOrders: 0,
                totalRevenue: 0,
            });

        } catch (error) {
            console.error("Failed to refresh Admin Orders:", error);

            setError(
                error.response?.data?.message ||
                    "Unable to refresh orders. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">

                {/* Page Header */}
                <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Orders
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage and track customer orders.
                        </p>
                    </div>

                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? "animate-spin" : ""}
                        />

                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {/* Database-wide Statistics */}
                <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <SummaryCard
                        title="Total Orders"
                        value={summary.totalOrders}
                        description="All registered orders"
                    />

                    <SummaryCard
                        title="Pending Orders"
                        value={summary.pendingOrders}
                        description="Awaiting confirmation"
                    />

                    <SummaryCard
                        title="Processing Orders"
                        value={summary.processingOrders}
                        description="Currently being processed"
                    />

                    <SummaryCard
                        title="Delivered Orders"
                        value={summary.deliveredOrders}
                        description="Successfully delivered"
                    />

                    <SummaryCard
                        title="Paid Orders"
                        value={summary.paidOrders}
                        description="Successfully paid orders"
                    />

                    <SummaryCard
                        title="Total Revenue"
                        value={formatCurrency(summary.totalRevenue)}
                        description="Revenue from paid orders"
                    />
                </div>

                {/* Search and Filters */}
                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                        {/* Search */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Search Orders
                            </label>

                            <input
                                type="text"
                                placeholder="Order ID, customer name, email..."
                                value={filters.search}
                                onChange={(event) =>
                                    handleFilterChange(
                                        "search",
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                            />
                        </div>

                        {/* Order Status */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Order Status
                            </label>

                            <select
                                value={filters.status}
                                onChange={(event) =>
                                    handleFilterChange(
                                        "status",
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
                            >
                                <option value="">All Statuses</option>

                                {ORDER_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {formatStatus(status)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Payment Status */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Payment Status
                            </label>

                            <select
                                value={filters.paymentStatus}
                                onChange={(event) =>
                                    handleFilterChange(
                                        "paymentStatus",
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
                            >
                                <option value="">All Payments</option>

                                {PAYMENT_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {formatStatus(status)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sorting */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Sort By
                            </label>

                            <select
                                value={filters.sort}
                                onChange={(event) =>
                                    handleFilterChange(
                                        "sort",
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
                            >
                                <option value="newest">
                                    Newest First
                                </option>

                                <option value="oldest">
                                    Oldest First
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Orders Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

                    <div className="border-b border-gray-200 px-5 py-4">
                        <h2 className="font-semibold text-gray-900">
                            All Orders
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-sm text-gray-500">
                            Loading orders...
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="font-medium text-gray-700">
                                No orders found
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                Try changing your search or filters.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1050px] text-left text-sm">

                                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-5 py-4">
                                            Order ID
                                        </th>

                                        <th className="px-5 py-4">
                                            Customer
                                        </th>

                                        <th className="px-5 py-4">
                                            Date
                                        </th>

                                        <th className="px-5 py-4">
                                            Items
                                        </th>

                                        <th className="px-5 py-4">
                                            Total
                                        </th>

                                        <th className="px-5 py-4">
                                            Payment
                                        </th>

                                        <th className="px-5 py-4">
                                            Status
                                        </th>

                                        <th className="px-5 py-4 text-right">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {orders.map((order) => (
                                        <tr
                                            key={order._id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-5 py-4 font-medium text-gray-900">
                                                #
                                                {order._id
                                                    .slice(-8)
                                                    .toUpperCase()}
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="font-medium text-gray-900">
                                                    {order.user?.name ||
                                                        "Unknown"}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {order.user?.email || "—"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 text-gray-600">
                                                {formatDate(order.createdAt)}
                                            </td>

                                            <td className="px-5 py-4 text-gray-600">
                                                {order.items?.reduce(
                                                    (total, item) =>
                                                        total + item.quantity,
                                                    0
                                                ) || 0}
                                            </td>

                                            <td className="px-5 py-4 font-medium text-gray-900">
                                                {formatCurrency(order.total)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <StatusBadge
                                                    status={order.paymentStatus}
                                                />
                                            </td>

                                            <td className="px-5 py-4">
                                                <StatusBadge
                                                    status={order.status}
                                                />
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    onClick={() =>
                                                        setSelectedOrder(order)
                                                    }
                                                    className="rounded-lg border border-brand px-3 py-2 text-xs font-medium text-brand hover:bg-indigo-50"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && orders.length > 0 && (
                        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row">

                            <p className="text-sm text-gray-500">
                                Page {pagination.currentPage} of{" "}
                                {pagination.totalPages}
                                {" · "}
                                {pagination.totalOrders} orders
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={() =>
                                        handlePageChange(
                                            pagination.currentPage - 1
                                        )
                                    }
                                    disabled={pagination.currentPage <= 1}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                <button
                                    onClick={() =>
                                        handlePageChange(
                                            pagination.currentPage + 1
                                        )
                                    }
                                    disabled={
                                        pagination.currentPage >=
                                        pagination.totalPages
                                    }
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onStatusUpdate={handleStatusUpdate}
                    updating={updating}
                />
            )}
        </div>
    );
}
