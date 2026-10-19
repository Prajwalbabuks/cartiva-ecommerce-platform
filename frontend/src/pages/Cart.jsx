
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  LoaderCircle,
  AlertCircle,
  Tag,
} from "lucide-react";

import { useCart } from "../context/CartContext";

const formatPrice = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const getProduct = (item) => item.product || item;

const getProductId = (item) => {
  const product = getProduct(item);
  return product?._id || item.productId;
};

const getProductName = (item) => {
  const product = getProduct(item);
  return product?.name || item.name || "Product";
};

const getProductImage = (item) => {
  const product = getProduct(item);
  const image = product?.images?.[0];

  if (typeof image === "string") return image;
  return image?.url || image?.secure_url || "";
};

const getProductPrice = (item) => {
  const product = getProduct(item);

  if (item.price != null) return Number(item.price);

  if (product?.finalPrice != null) {
    return Number(product.finalPrice);
  }

  const price = Number(product?.price) || 0;
  const discount = Number(product?.discount) || 0;

  return price * (1 - discount / 100);
};

function Cart() {
  const {
    items = [],
    subtotal = 0,
    totalItems = 0,
    loading = false,
    error = "",
    updateItem,
    removeItem,
  } = useCart();

  const hasItems = items.length > 0;

  const handleQuantityChange = async (item, quantity) => {
    if (quantity < 1) return;

    try {
      await updateItem(getProductId(item), quantity);
    } catch (err) {
      console.error("Unable to update cart quantity:", err);
    }
  };

  const handleRemove = async (item) => {
    try {
      await removeItem(getProductId(item));
    } catch (err) {
      console.error("Unable to remove cart item:", err);
    }
  };

  if (loading && !hasItems) {
    return (
      <main className="mx-auto flex min-h-80 max-w-6xl items-center justify-center gap-3 px-4 py-10 sm:px-6 lg:px-8">
        <LoaderCircle size={23} className="animate-spin text-brand" />
        <p className="text-sm font-medium text-gray-500">
          Loading your cart...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Link
        to="/products"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-brand"
      >
        <ArrowLeft size={17} />
        Continue shopping
      </Link>

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            Your shopping cart
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review your items before checking out.
          </p>
        </div>

        {hasItems && (
          <p className="text-sm font-semibold text-gray-600">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </p>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>
            {typeof error === "string"
              ? error
              : error.message || "Unable to load your cart."}
          </p>
        </div>
      )}

      {!hasItems ? (
        <section className="rounded-2xl border border-gray-200 bg-white px-5 py-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-brand">
            <ShoppingBag size={30} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-gray-900">
            Your cart is empty
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
            Looks like you haven't added anything yet. Explore our products
            and find something you love.
          </p>

          <Link
            to="/products"
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-hover"
          >
            Explore products
          </Link>
        </section>
      ) : (
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0 space-y-3">
            {items.map((item) => {
              const productId = getProductId(item);
              const name = getProductName(item);
              const image = getProductImage(item);
              const price = getProductPrice(item);
              const quantity = Number(item.quantity) || 1;
              const product = getProduct(item);
              const originalPrice = Number(product?.price) || price;
              const hasDiscount = originalPrice > price;

              return (
                <article
                  key={productId}
                  className="grid min-w-0 grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:grid-cols-[80px_minmax(0,1fr)] sm:gap-3"
                >
                  <Link
                    to={`/products/${productId}`}
                    aria-label={`View ${name}`}
                    className="block h-16 w-16 overflow-hidden rounded-lg bg-gray-100 sm:h-20 sm:w-20"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={name}
                        className="h-full w-full object-cover transition duration-200 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <ShoppingBag size={24} />
                      </div>
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-col justify-between gap-3">
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          to={`/products/${productId}`}
                          className="line-clamp-2 text-sm font-bold leading-5 text-gray-900 transition hover:text-brand sm:text-base"
                        >
                          {name}
                        </Link>

                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-sm font-bold text-gray-900">
                            {formatPrice(price)}
                          </span>

                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">
                              {formatPrice(originalPrice)}
                            </span>
                          )}
                        </div>

                        {product?.stock != null && (
                          <p
                            className={`mt-1 text-xs ${
                              product.stock > 0
                                ? "text-green-700"
                                : "text-red-600"
                            }`}
                          >
                            {product.stock > 0
                              ? `${product.stock} available`
                              : "Out of stock"}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        disabled={loading}
                        aria-label={`Remove ${name} from cart`}
                        title="Remove item"
                        className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-lg border border-gray-200">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(item, quantity - 1)
                          }
                          disabled={loading || quantity <= 1}
                          aria-label={`Decrease quantity of ${name}`}
                          className="rounded-l-lg p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Minus size={14} />
                        </button>

                        <span
                          aria-label={`Quantity ${quantity}`}
                          className="min-w-9 px-2 text-center text-sm font-semibold text-gray-900"
                        >
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(item, quantity + 1)
                          }
                          disabled={
                            loading ||
                            (product?.stock != null &&
                              quantity >= product.stock)
                          }
                          aria-label={`Increase quantity of ${name}`}
                          className="rounded-r-lg p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <p className="text-sm font-extrabold text-gray-900">
                        {formatPrice(price * quantity)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-gray-900">
              Order summary
            </h2>

            <div className="mt-5 space-y-3 border-b border-gray-100 pb-5 text-sm">
              <div className="flex items-center justify-between gap-3 text-gray-600">
                <span>Items</span>
                <span className="font-semibold text-gray-900">
                  {totalItems}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 text-gray-600">
                <span className="inline-flex items-center gap-1.5">
                  <Tag size={15} />
                  Discounts
                </span>
                <span className="text-xs text-gray-500">
                  Applied product discounts included
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="font-bold text-gray-900">
                Cart subtotal
              </span>
              <span className="text-xl font-extrabold text-gray-900">
                {formatPrice(subtotal)}
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-gray-500">
              Final discounts and the payable total are calculated by
              Cartiva's backend during checkout.
            </p>

            <Link
              to="/checkout"
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-brand px-5 py-3.5 text-sm font-bold text-white transition hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
            >
              Proceed to checkout
            </Link>

            <div className="mt-4 flex items-start gap-2 border-t border-gray-100 pt-4">
              <ShoppingBag
                size={18}
                className="mt-0.5 shrink-0 text-brand"
              />
              <p className="text-xs leading-5 text-gray-500">
                You can select your shipping address and review any
                applicable coupon before placing your order.
              </p>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

export default Cart;
