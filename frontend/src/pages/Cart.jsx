import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import { useCart } from "../context/CartContext";

const formatPrice = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function Cart() {
  const {
    items,
    subtotal,
    totalItems,
    loading,
    error,
    updateItem,
    removeItem,
    refreshCart,
  } = useCart();

  const [actionError, setActionError] = useState("");
  const [pendingProductId, setPendingProductId] = useState("");

  const handleQuantityChange = async (productId, quantity) => {
    setActionError("");
    setPendingProductId(productId);

    try {
      await updateItem(productId, quantity);
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Unable to update quantity. Please try again."
      );
    } finally {
      setPendingProductId("");
    }
  };

  const handleRemove = async (productId) => {
    setActionError("");
    setPendingProductId(productId);

    try {
      await removeItem(productId);
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Unable to remove this product. Please try again."
      );
    } finally {
      setPendingProductId("");
    }
  };

  if (loading && items.length === 0 && !error) {
    return (
      <main
        role="status"
        className="flex min-h-80 items-center justify-center px-4 text-sm text-gray-500"
      >
        Loading your cart...
      </main>
    );
  }

  if (error && items.length === 0) {
    return (
      <main className="mx-auto flex min-h-80 max-w-xl flex-col items-center justify-center px-5 py-10 text-center">
        <ShoppingCart size={40} className="text-gray-400" />

        <h1 className="mt-4 text-xl font-bold text-gray-900">
          Unable to load your cart
        </h1>

        <p className="mt-2 text-sm text-gray-500">{error}</p>

        <button
          type="button"
          onClick={() => refreshCart().catch(() => {})}
          className="mt-5 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
        >
          Try again
        </button>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[55vh] max-w-3xl flex-col items-center justify-center px-5 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-brand">
          <ShoppingBag size={30} />
        </div>

        <h1 className="mt-5 text-2xl font-extrabold text-gray-900">
          Your cart is empty
        </h1>

        <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
          Looks like you haven't added anything yet. Explore our products and
          find something you'll love.
        </p>

        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
        >
          <ShoppingBag size={17} />
          Start shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Page heading */}
      <Link
        to="/products"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-brand"
      >
        <ArrowLeft size={16} />
        Continue shopping
      </Link>

      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          Shopping cart
        </h1>

        <p className="mt-1.5 text-sm text-gray-500">
          {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      {(actionError || error) && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {actionError || error}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6">
        {/* Cart items */}
        <section
          className="min-w-0 space-y-2"
          aria-label="Cart items"
        >
          {items.map((item) => {
            const product =
              item.product && typeof item.product === "object"
                ? item.product
                : null;

            const productId =
              product?._id ||
              (typeof item.product === "string" ? item.product : null);

            const firstImage = product?.images?.[0];

            const imageUrl =
              (typeof firstImage === "string"
                ? firstImage
                : firstImage?.url || firstImage?.secure_url) || "";

            const price = Number(product?.price) || 0;

            const discount = Math.min(
              100,
              Math.max(0, Number(product?.discount) || 0)
            );

            const discountedPrice = price * (1 - discount / 100);
            const quantity = Number(item.quantity) || 1;
            const stock = Number(product?.stock) || 0;
            const isPending = pendingProductId === productId;
            const unavailable = !product || product.isActive === false;

            return (
              <article
                key={productId || item._id}
                className="grid min-w-0 grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:grid-cols-[80px_minmax(0,1fr)] sm:gap-3"
              >
                {/* Product image */}
                <Link
                  to={productId ? `/products/${productId}` : "/products"}
                  aria-label={`View ${product?.name || "product"}`}
                  className="flex h-[72px] w-[72px] items-center justify-center self-start overflow-hidden rounded-lg border border-gray-100 bg-gray-50 p-2 sm:h-[96px] sm:w-[96px]"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product?.name || "Product"}
                      className="flex h-16 w-16 items-center justify-center self-start overflow-hidden rounded-lg border border-gray-100 bg-gray-50 p-1.5 sm:h-20 sm:w-20"
                    />
                  ) : (
                    <ShoppingBag size={26} className="text-gray-300" />
                  )}
                </Link>

                {/* Product details */}
                <div className="min-w-0">
                  <Link
                    to={productId ? `/products/${productId}` : "/products"}
                    className="block break-words text-sm font-bold leading-5 text-gray-900 transition hover:text-brand sm:text-base sm:leading-6"
                  >
                    {product?.name || "Product unavailable"}
                  </Link>

                  {unavailable && (
                    <p className="mt-1 text-xs text-red-600">
                      This product is no longer available.
                    </p>
                  )}

                  {product && discount > 0 && (
                    <p className="mt-1 text-xs font-medium text-emerald-700">
                      {discount}% discount applied
                    </p>
                  )}

                  <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-base font-extrabold text-gray-900">
                      ₹{formatPrice(discountedPrice)}
                    </span>

                    {discount > 0 && (
                      <span className="text-xs text-gray-400 line-through sm:text-sm">
                        ₹{formatPrice(price)}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    Item total: ₹{formatPrice(discountedPrice * quantity)}
                  </p>

                  {/* Quantity and remove controls */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex h-8 items-center rounded-lg border border-gray-200">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${product?.name || "product"}`}
                        disabled={
                          isPending || quantity <= 1 || unavailable
                        }
                        onClick={() =>
                          handleQuantityChange(productId, quantity - 1)
                        }
                        className="flex h-full w-8 items-center justify-center text-gray-600 transition hover:text-brand disabled:opacity-40"
                      >
                        <Minus size={14} />
                      </button>

                      <span className="min-w-7 text-center text-sm font-semibold text-gray-900">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        aria-label={`Increase quantity of ${product?.name || "product"}`}
                        disabled={
                          isPending || unavailable || quantity >= stock
                        }
                        onClick={() =>
                          handleQuantityChange(productId, quantity + 1)
                        }
                        className="flex h-full w-8 items-center justify-center text-gray-600 transition hover:text-brand disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={isPending || !productId}
                      onClick={() => handleRemove(productId)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 transition hover:text-red-700 disabled:opacity-50 sm:text-sm"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>

                  {product && (
                    <p className="mt-1.5 text-xs text-gray-400">
                      {stock > 0
                        ? `${stock} available`
                        : "Out of stock"}
                    </p>
                  )}

                  {isPending && (
                    <p role="status" className="mt-1 text-xs text-gray-500">
                      Updating cart...
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        {/* Order summary */}
        <aside className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-24">
          <h2 className="text-base font-bold text-gray-900 sm:text-lg">
            Order summary
          </h2>

          <div className="mt-4 flex items-center justify-between gap-3 text-sm text-gray-600">
            <span>Items ({totalItems})</span>
            <span className="text-right">
              ₹{formatPrice(subtotal)}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-200 pt-3">
            <span className="text-sm font-bold text-gray-900">
              Subtotal
            </span>

            <span className="text-lg font-extrabold text-gray-900">
              ₹{formatPrice(subtotal)}
            </span>
          </div>

          <p className="mt-3 text-xs leading-5 text-gray-500">
            Shipping, taxes, and final totals will be calculated during
            checkout.
          </p>

          <button
            type="button"
            disabled
            title="Checkout will be enabled in the next milestone."
            className="mt-5 w-full cursor-not-allowed rounded-lg bg-brand px-3 py-2.5 text-sm font-semibold text-white opacity-60"
          >
            Proceed to checkout
          </button>

          <Link
            to="/products"
            className="mt-2.5 flex w-full items-center justify-center rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}

export default Cart;
