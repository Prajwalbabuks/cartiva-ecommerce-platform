
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  Package,
  ShoppingBag,
  LoaderCircle,
  CircleAlert,
} from "lucide-react";

import { getOrderById } from "../services/order.service";

const formatPrice = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

function OrderConfirmation() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadOrder = async () => {
      try {
        const response = await getOrderById(orderId);

        if (active) setOrder(response.order);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load this order. Please check your orders."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOrder();

    return () => {
      active = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-gray-500">
        <LoaderCircle size={22} className="animate-spin text-brand" />
        Loading order details...
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <CircleAlert size={40} className="mx-auto text-red-500" />
        <h1 className="mt-4 text-2xl font-extrabold text-gray-900">
          Unable to load order
        </h1>
        <p role="alert" className="mt-2 text-sm text-gray-600">
          {error || "The requested order could not be found."}
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-hover"
        >
          Back to Cartiva
        </Link>
      </main>
    );
  }

  const paid = order.paymentStatus === "paid";
  const cancelled = order.status === "cancelled";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div
          className={`px-6 py-9 text-center sm:px-10 ${
            paid ? "bg-emerald-50" : "bg-amber-50"
          }`}
        >
          {paid ? (
            <CheckCircle2
              size={54}
              className="mx-auto text-emerald-600"
            />
          ) : (
            <Clock3 size={54} className="mx-auto text-amber-600" />
          )}

          <h1 className="mt-4 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {paid
              ? "Thank you for your order!"
              : cancelled
                ? "Order cancelled"
                : "Order created"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            {paid
              ? "Your payment has been verified by Cartiva."
              : cancelled
                ? "This order is cancelled. Contact support if you need help with a payment."
                : "Your order details are available below. Payment is not yet confirmed."}
          </p>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Order ID
            </p>
            <p className="mt-2 break-all font-mono text-sm text-gray-900">
              {order._id}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Order status
              </p>
              <p className="mt-2 break-words font-bold capitalize text-gray-900">
                {order.status}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Payment status
              </p>
              <p className="mt-2 break-words font-bold capitalize text-gray-900">
                {order.paymentStatus}
              </p>
            </div>
          </div>

          <div>
            <h2 className="flex items-center gap-2 font-bold text-gray-900">
              <Package size={19} className="text-brand" />
              Items ordered
            </h2>

            <div className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200 px-4">
              {order.items?.map((item, index) => (
                <div
                  key={`${item.product || item.name}-${index}`}
                  className="flex items-start justify-between gap-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-gray-900">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-bold text-gray-900">
                    {formatPrice(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {order.shippingAddress && (
            <div>
              <h2 className="font-bold text-gray-900">Shipping address</h2>
              <div className="mt-3 rounded-xl border border-gray-200 p-4 text-sm leading-6 text-gray-600">
                <p className="font-semibold text-gray-900">
                  {order.shippingAddress.fullName}
                </p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state} -{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>
          )}

          <div className="space-y-3 border-t border-gray-200 pt-5">
            <div className="flex justify-between gap-4 text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>

            {Number(order.discount) > 0 && (
              <div className="flex justify-between gap-4 text-sm text-emerald-700">
                <span>Discount</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}

            <div className="flex justify-between gap-4 text-lg font-extrabold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/products"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-hover"
            >
              <ShoppingBag size={18} />
              Continue shopping
            </Link>

            <Link
              to="/cart"
              className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-300 px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            >
              View cart
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default OrderConfirmation;
