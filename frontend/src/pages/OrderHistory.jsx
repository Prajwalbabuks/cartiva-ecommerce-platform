
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { getOrders } from "../services/order.service";

const PAGE_SIZE = 10;

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getStatusStyle = (status) => {
  const styles = {
    pending: "bg-amber-50 text-amber-700",
    confirmed: "bg-blue-50 text-blue-700",
    processing: "bg-indigo-50 text-indigo-700",
    shipped: "bg-violet-50 text-violet-700",
    delivered: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-700",
    paid: "bg-emerald-50 text-emerald-700",
    failed: "bg-red-50 text-red-700",
    refunded: "bg-gray-100 text-gray-700",
  };

  return styles[String(status || "").toLowerCase()] ||
    "bg-gray-100 text-gray-700";
};

function StatusBadge({ status, label }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
        getStatusStyle(status)
      }`}
    >
      {label || status || "Unknown"}
    </span>
  );
}

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getOrders({
          page,
          limit: PAGE_SIZE,
        });

        if (!active) return;

        // Supports common paginated API response shapes.
        const result = response?.data ?? response;
        const orderList = Array.isArray(result)
          ? result
          : result?.orders ?? [];

        const pagination = result?.pagination ?? result?.meta ?? {};

        setOrders(orderList);
        setTotalPages(
          Math.max(
            1,
            Number(
              pagination.totalPages ??
              pagination.pages ??
              result?.totalPages ??
              1
            )
          )
        );
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
          err.message ||
          "Unable to load your orders. Please try again."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOrders();

    return () => {
      active = false;
    };
  }, [page]);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-brand">
            YOUR CARTIVA ACCOUNT
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            My Orders
          </h1>
          <p className="mt-2 text-gray-500">
            Track your purchases and revisit your order details.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white">
            <LoaderCircle className="animate-spin text-brand" size={32} />
            <p className="text-sm text-gray-500">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <AlertCircle className="mx-auto mb-3 text-red-500" size={36} />
            <h2 className="text-lg font-semibold text-gray-900">
              Could not load orders
            </h2>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
            <button
              onClick={() => setPage((current) => current)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-indigo-50">
              <ShoppingBag className="text-brand" size={30} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              No orders yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
              Your purchases will appear here after you place an order.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-hover"
            >
              Explore products
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => {
                const orderId = order._id || order.id;
                const orderItems = order.items || [];
                const itemCount = orderItems.reduce(
                  (total, item) => total + Number(item.quantity || 0),
                  0
                );

                return (
                  <article
                    key={orderId}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                  >
                    <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Order ID
                        </p>
                        <p className="mt-1 break-all font-semibold text-gray-900">
                          #{orderId}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={order.status} />
                        <StatusBadge
                          status={order.paymentStatus}
                          label={`Payment: ${order.paymentStatus || "unknown"}`}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                          <Package className="text-gray-600" size={22} />
                        </div>

                        <div>
                          <p className="font-medium text-gray-900">
                            {itemCount} {itemCount === 1 ? "item" : "items"}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {orderItems
                              .slice(0, 2)
                              .map((item) => item.name || item.product?.name || "Product")
                              .join(", ")}
                            {orderItems.length > 2
                              ? ` and ${orderItems.length - 2} more`
                              : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-5 sm:justify-end">
                        <div className="sm:text-right">
                          <p className="text-xs text-gray-500">Order total</p>
                          <p className="mt-1 text-lg font-bold text-gray-900">
                            {formatPrice(order.total)}
                          </p>
                        </div>

                        <Link
                          to={`/orders/${orderId}/confirmation`}
                          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-brand hover:text-brand"
                        >
                          Details
                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40"
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
