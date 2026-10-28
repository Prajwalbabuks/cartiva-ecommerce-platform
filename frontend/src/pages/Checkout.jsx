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
  X,
} from "lucide-react";

import { getAddresses } from "../services/address.service";
import { createOrder } from "../services/order.service";
import { validateCoupon } from "../services/coupon.service";
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
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  const [addressesLoading, setAddressesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingOrderId, setPendingOrderId] = useState("");

  const cartSubtotal = Number(subtotal) || 0;

  // Load the user's saved shipping addresses.
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
    setPendingOrderId("");
    setNotice("");
    setPageError("");
  };

  // Editing the code clears the previous coupon validation.
  const handleCouponInputChange = (event) => {
    setCouponCode(event.target.value.toUpperCase());
    setAppliedCoupon(null);
    setCouponError("");
    setCouponMessage("");
  };

  // Validate the coupon through the backend.
  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();

    if (couponLoading || submitting || pendingOrderId) return;

    setCouponError("");
    setCouponMessage("");

    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    if (cartSubtotal <= 0) {
      setCouponError("Your cart subtotal must be greater than zero.");
      return;
    }

    setCouponLoading(true);

    try {
      const response = await validateCoupon({
        code,
        subtotal: cartSubtotal,
      });

      const result = response?.data ?? response;

      if (
        !result ||
        result.success === false ||
        !Number.isFinite(Number(result.discount)) ||
        !Number.isFinite(Number(result.finalTotal))
      ) {
        throw new Error("The coupon validation response was invalid.");
      }

      setAppliedCoupon({
        code: result.code || code,
        discount: Number(result.discount),
        subtotal: Number(result.subtotal ?? cartSubtotal),
        finalTotal: Number(result.finalTotal),
        discountPercentage: Number(result.discountPercentage) || 0,
      });

      setCouponCode(result.code || code);
      setCouponMessage(
        `Coupon ${result.code || code} applied successfully!`
      );
    } catch (error) {
      setAppliedCoupon(null);
      setCouponError(getErrorMessage(error));
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    if (submitting || pendingOrderId) return;

    setCouponCode("");
    setAppliedCoupon(null);
    setCouponError("");
    setCouponMessage("");
    setPageError("");
  };

  // Open Razorpay and verify the payment with the backend.
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
          } catch {
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

  // Create an order and start payment, or retry payment for a pending order.
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

      if (couponCode.trim() && !appliedCoupon) {
        throw new Error(
          "Apply the coupon or clear the coupon field before placing your order."
        );
      }

      // Do not create a duplicate order when retrying payment.
      if (!orderId) {
        const orderResponse = await createOrder({
          addressId: selectedAddressId,
          ...(appliedCoupon?.code
            ? { couponCode: appliedCoupon.code }
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

  const estimatedTotal = appliedCoupon
    ? Math.max(0, appliedCoupon.finalTotal)
    : cartSubtotal;

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
            {/* Shipping address */}
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

            {/* Order items */}
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

                  const firstImage = product?.images?.[0];

                  const image =
                    firstImage?.url ||
                    firstImage?.secure_url ||
                    (typeof firstImage === "string" ? firstImage : "");

                  return (
                    <div
                      key={itemId}
                      className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {image && (
                          <img
                            src={image}
                            alt={product?.name || "Product"}
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

          {/* Price summary and coupon */}
          <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-gray-900">
              Price details
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3 text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(cartSubtotal)}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between gap-3 text-emerald-700">
                  <span>Coupon discount</span>
                  <span className="font-semibold">
                    −{formatPrice(appliedCoupon.discount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between gap-3 text-gray-600">
                <span>Shipping</span>
                <span className="font-semibold text-gray-900">
                  Calculated by server
                </span>
              </div>
            </div>

            {/* Coupon input */}
            <div className="mt-5 border-t border-gray-200 pt-5">
              <label
                htmlFor="couponCode"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700"
              >
                <Tag size={16} />
                Coupon code
              </label>

              {appliedCoupon ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <CheckCircle2
                        size={18}
                        className="shrink-0 text-emerald-600"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-emerald-800">
                          {appliedCoupon.code}
                        </p>

                        <p className="text-xs text-emerald-700">
                          {appliedCoupon.discountPercentage}% discount applied
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      disabled={submitting || Boolean(pendingOrderId)}
                      aria-label="Remove applied coupon"
                      className="rounded-lg p-2 text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                    >
                      <X size={17} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    id="couponCode"
                    value={couponCode}
                    onChange={handleCouponInputChange}
                    disabled={submitting || Boolean(pendingOrderId)}
                    maxLength={30}
                    placeholder="Enter coupon code"
                    autoComplete="off"
                    className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-gray-100"
                  />

                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={
                      couponLoading ||
                      submitting ||
                      Boolean(pendingOrderId) ||
                      !couponCode.trim()
                    }
                    className="inline-flex shrink-0 items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {couponLoading ? (
                      <LoaderCircle size={17} className="animate-spin" />
                    ) : (
                      "Apply"
                    )}
                  </button>
                </div>
              )}

              {couponError && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                  {couponError}
                </p>
              )}

              {couponMessage && appliedCoupon && (
                <p role="status" className="mt-2 text-sm text-emerald-700">
                  {couponMessage}
                </p>
              )}

              <p className="mt-2 text-xs leading-5 text-gray-500">
                Enter a valid coupon to see your discount. Final pricing is
                confirmed by the server when your order is created.
              </p>
            </div>

            {/* Estimated total */}
            <div className="mt-5 border-t border-gray-200 pt-5">
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold text-gray-900">
                  Estimated total
                </span>

                <span className="text-xl font-extrabold text-gray-900">
                  {formatPrice(estimatedTotal)}
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                {appliedCoupon
                  ? "Subtotal after discount; shipping and the confirmed order total are calculated by the server."
                  : "Shipping and the confirmed order total are calculated by the server."}
              </p>
            </div>

            {/* Checkout button */}
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