
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  MapPin,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
} from "lucide-react";

import { getAddresses } from "../services/address.service";
import { createOrder } from "../services/order.service";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../services/payment.service";
import loadRazorpay from "../utils/loadRazorpay";
import { useCart } from "../context/CartContext";

const formatPrice = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Something went wrong. Please try again.";

function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, totalItems } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingOrderId, setPendingOrderId] = useState("");

  useEffect(() => {
    let active = true;

    const loadAddresses = async () => {
      try {
        const response = await getAddresses();

        if (!active) return;

        const savedAddresses = response.addresses || [];
        setAddresses(savedAddresses);

        const defaultAddress = savedAddresses.find(
          (address) => address.isDefault
        );

        setSelectedAddressId(
          defaultAddress?._id || savedAddresses[0]?._id || ""
        );
      } catch (error) {
        if (active) setPageError(getErrorMessage(error));
      } finally {
        if (active) setAddressesLoading(false);
      }
    };

    loadAddresses();

    return () => {
      active = false;
    };
  }, []);

  const handleAddressChange = (addressId) => {
    setSelectedAddressId(addressId);

    // A changed address requires a new order.
    setPendingOrderId("");
    setNotice("");
    setPageError("");
  };

  const startPayment = async (orderId) => {
    const loaded = await loadRazorpay();

    if (!loaded) {
      throw new Error("Unable to load Razorpay Checkout.");
    }

    const response = await createRazorpayOrder(orderId);
    const payment = response.payment ?? response;

    const { razorpayOrderId, amount, currency, keyId } = payment;

    if (
      !razorpayOrderId ||
      !Number.isSafeInteger(amount) ||
      amount <= 0 ||
      !currency ||
      !keyId
    ) {
      throw new Error("The payment API returned invalid payment details.");
    }

    return new Promise((resolve, reject) => {
      let finished = false;

      const finish = (callback, value) => {
        if (finished) return;
        finished = true;
        callback(value);
      };

      const razorpay = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: "Cartiva",
        description: `Payment for order ${orderId}`,
        order_id: razorpayOrderId,
        theme: { color: "#4f46e5" },

        handler: async (paymentResponse) => {
          try {
            await verifyRazorpayPayment({
              orderId,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            finish(resolve, orderId);
          } catch (error) {
            finish(
              reject,
              new Error(
                "We couldn't confirm your payment yet. Check your order status before retrying."
              )
            );
          }
        },

        modal: {
          ondismiss: () => {
            finish(
              reject,
              new Error(
                "Payment window closed. Your pending order has been kept so you can retry."
              )
            );
          },
        },
      });

      razorpay.on("payment.failed", (response) => {
        finish(
          reject,
          new Error(
            response.error?.description ||
              "Payment failed. You can retry the same order."
          )
        );
      });

      razorpay.open();
    });
  };

  const handleCheckout = async () => {
    if (submitting) return;

    setSubmitting(true);
    setPageError("");
    setNotice("");

    let orderId = pendingOrderId;

    try {
      if (!selectedAddressId) {
        throw new Error("Please select a shipping address.");
      }

      if (!items?.length) {
        throw new Error("Your cart is empty.");
      }

      // Create an order only once. Failed or dismissed payments can
      // retry the same pending order instead of creating duplicates.
      if (!orderId) {
        const orderResponse = await createOrder({
          addressId: selectedAddressId,
          ...(couponCode.trim()
            ? { couponCode: couponCode.trim().toUpperCase() }
            : {}),
        });

        orderId = orderResponse.order?._id;

        if (!orderId) {
          throw new Error("Order creation returned no order ID.");
        }

        setPendingOrderId(orderId);
      }

      const verifiedOrderId = await startPayment(orderId);

      navigate(`/orders/${verifiedOrderId}/confirmation`, {
        replace: true,
      });
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/cart"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-brand"
      >
        <ArrowLeft size={17} />
        Back to cart
      </Link>

      <div className="mb-8">
        <p className="text-sm font-semibold text-brand">CARTIVA CHECKOUT</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">
          Complete your order
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Choose a delivery address and review your order before payment.
        </p>
      </div>

      {pageError && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {pageError}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          {notice}
        </div>
      )}

      {!items?.length ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
          <ShoppingBag className="mx-auto text-gray-400" size={36} />
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Your cart is empty
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Add products to your cart before checking out.
          </p>
          <Link
            to="/products"
            className="mt-5 inline-flex rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-hover"
          >
            Browse products
          </Link>
        </section>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-50 p-2.5 text-brand">
                    <MapPin size={21} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Shipping address
                    </h2>
                    <p className="text-sm text-gray-500">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>

                <Link
                  to="/addresses"
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand hover:text-brand-hover"
                >
                  <Plus size={16} />
                  Manage
                </Link>
              </div>

              {addressesLoading ? (
                <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
                  <LoaderCircle className="animate-spin" size={18} />
                  Loading saved addresses...
                </div>
              ) : addresses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
                  <MapPin className="mx-auto text-gray-400" size={30} />
                  <p className="mt-3 font-semibold text-gray-900">
                    Add a delivery address
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    You need a saved address before placing your order.
                  </p>
                  <Link
                    to="/addresses"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
                  >
                    <Plus size={17} />
                    Add address
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address._id}
                      className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                        selectedAddressId === address._id
                          ? "border-brand bg-indigo-50/50 ring-1 ring-brand/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shippingAddress"
                        value={address._id}
                        checked={selectedAddressId === address._id}
                        onChange={() => handleAddressChange(address._id)}
                        className="mt-1 accent-brand"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-gray-900">
                            {address.fullName}
                          </p>
                          {address.isDefault && (
                            <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-brand">
                              Default
                            </span>
                          )}
                        </div>

                        <p className="mt-1 break-words text-sm leading-6 text-gray-600">
                          {address.addressLine1}
                          {address.addressLine2
                            ? `, ${address.addressLine2}`
                            : ""}
                          {`, ${address.city}, ${address.state} - ${address.postalCode}, ${address.country}`}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          Phone: {address.phone}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-2.5 text-brand">
                  <ShoppingBag size={21} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Order items
                  </h2>
                  <p className="text-sm text-gray-500">
                    {totalItems} item(s) in your cart
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {items.map((item) => {
                  const product = item.product;
                  const itemId = product?._id || item.productId;
                  const price = Number(
                    item.price ??
                      product?.finalPrice ??
                      (product?.price != null
                        ? product.price *
                          (1 - (product.discount || 0) / 100)
                        : 0)
                  );

                  return (
                    <div
                      key={itemId}
                      className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {(product?.images?.[0]?.url ||
                          product?.images?.[0]?.secure_url ||
                          product?.images?.[0]) && (
                          <img
                            src={
                              product.images[0].url ||
                              product.images[0].secure_url ||
                              product.images[0]
                            }
                            alt={product.name || "Product"}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                          {product?.name || item.name || "Product"}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-bold text-gray-900">
                        {formatPrice(price * item.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-gray-900">
              Price details
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3 text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex justify-between gap-3 text-gray-600">
                <span>Shipping</span>
                <span className="font-semibold text-gray-900">
                  Calculated by server
                </span>
              </div>
            </div>

            <div className="mt-5 border-t border-gray-200 pt-5">
              <label
                htmlFor="couponCode"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700"
              >
                <Tag size={16} />
                Coupon code (optional)
              </label>
              <input
                id="couponCode"
                value={couponCode}
                onChange={(event) => {
                  setCouponCode(event.target.value.toUpperCase());
                  setPendingOrderId("");
                }}
                disabled={Boolean(pendingOrderId)}
                maxLength={30}
                placeholder="Enter coupon code"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-gray-100"
              />
              <p className="mt-2 text-xs leading-5 text-gray-500">
                The backend validates the coupon and calculates the final
                amount when creating the order.
              </p>
            </div>

            <div className="mt-5 border-t border-gray-200 pt-5">
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold text-gray-900">Final total</span>
                <span className="text-xl font-extrabold text-gray-900">
                  Calculated by server
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-gray-500">
                Your confirmed total will be determined by the server,
                including any applicable discount.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={
                submitting ||
                addressesLoading ||
                !addresses.length ||
                !selectedAddressId
              }
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 font-bold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={19} />
                  {pendingOrderId ? "Retry payment" : "Place order & pay"}
                </>
              )}
            </button>

            <div className="mt-4 flex items-start gap-2 border-t border-gray-100 pt-4">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-emerald-600"
              />
              <p className="text-xs leading-5 text-gray-500">
                Payments are verified by the Cartiva backend. If payment
                confirmation is uncertain, check your order status before
                retrying.
              </p>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

export default Checkout;
