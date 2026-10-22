
import { useCallback, useEffect, useState  } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShoppingBag,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
  Package,
} from "lucide-react";

import {
  getWishlist,
  removeFromWishlist,
  addWishlistItemToCart,
} from "../services/wishlist.service";

import { useCart } from "../context/CartContext";


const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const getProductPrice = (product) => {
  const price = Number(product.price) || 0;
  const discount = Number(product.discount) || 0;

  return price * (1 - discount / 100);
};

const getProductImage = (product) => {
  const image = product.images?.[0];

  if (typeof image === "string") return image;

  return image?.url || image?.secure_url || "";
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

export default function Wishlist() {
  const { refreshCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [itemErrors, setItemErrors] = useState({});
  const [busyItems, setBusyItems] = useState([]);

  const loadWishlist = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await getWishlist();

      // Your backend returns populated products inside wishlist.products.
      // It returns products: [] directly when no wishlist exists.
      const result = response?.data ?? response;
      const savedProducts =
        result?.wishlist?.products ??
        result?.products ??
        [];

      setProducts(
        Array.isArray(savedProducts)
          ? savedProducts.filter(
              (product) =>
                product && typeof product === "object" && product._id
            )
          : []
      );
    } catch (error) {
      setPageError(
        getErrorMessage(error, "Unable to load your wishlist.")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const runForItem = async (productId, action) => {
    if (busyItems.includes(productId)) return;

    setBusyItems((current) => [...current, productId]);
    setItemErrors((current) => ({
      ...current,
      [productId]: "",
    }));

    try {
      await action();
      await loadWishlist();
    } catch (error) {
      setItemErrors((current) => ({
        ...current,
        [productId]: getErrorMessage(
          error,
          "The operation failed. Please try again."
        ),
      }));
    } finally {
      setBusyItems((current) =>
        current.filter((id) => id !== productId)
      );
    }
  };

  const handleRemove = (productId) =>
    runForItem(productId, () => removeFromWishlist(productId));

const handleMoveToCart = (productId) =>
  runForItem(productId, async () => {
    // Add the wishlist product to the backend cart.
    await addWishlistItemToCart(productId, 1);

    // Immediately synchronize the Navbar and Cart page.
    await refreshCart();

    // Remove it from the wishlist after the cart update succeeds.
    await removeFromWishlist(productId);
  });

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-64 max-w-6xl flex-col items-center justify-center gap-3">
          <LoaderCircle className="animate-spin text-brand" size={34} />
          <p className="text-sm text-gray-500">
            Loading your wishlist...
          </p>
        </div>
      </main>
    );
  }

  if (pageError) {
    return (
      <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={36} />
          <h1 className="text-xl font-bold text-gray-900">
            Couldn't load your wishlist
          </h1>
          <p className="mt-2 text-sm text-gray-500">{pageError}</p>
          <button
            onClick={loadWishlist}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-brand">
            <Heart size={28} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              My Wishlist
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {products.length}{" "}
              {products.length === 1 ? "product" : "products"} saved for later
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <section className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-indigo-50">
              <Heart size={30} className="text-brand" />
            </div>

            <h2 className="text-xl font-semibold text-gray-900">
              Your wishlist is empty
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
              Save products you're interested in and they'll be waiting here
              when you're ready.
            </p>

            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover"
            >
              Explore products
              <ArrowRight size={16} />
            </Link>
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const productId = product._id;
              const price = getProductPrice(product);
              const originalPrice = Number(product.price) || 0;
              const discount = Number(product.discount) || 0;
              const image = getProductImage(product);
              const busy = busyItems.includes(productId);
              const outOfStock =
                Number(product.stock) <= 0 || product.isActive === false;

              return (
                <article
                  key={productId}
                  className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <Link
                    to={`/products/${productId}`}
                    className="relative flex h-56 items-center justify-center overflow-hidden bg-gray-50"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={product.name || "Product"}
                        loading="lazy"
                        className="h-full w-full object-contain p-5 transition duration-300 hover:scale-105"
                      />
                    ) : (
                      <Package size={48} className="text-gray-300" />
                    )}

                    {discount > 0 && (
                      <span className="absolute left-3 top-3 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                        {discount}% OFF
                      </span>
                    )}

                    {outOfStock && (
                      <span className="absolute bottom-3 left-3 rounded-full bg-gray-900/80 px-3 py-1 text-xs font-semibold text-white">
                        {product.isActive === false
                          ? "Unavailable"
                          : "Out of stock"}
                      </span>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col p-4">
                    <Link
                      to={`/products/${productId}`}
                      className="line-clamp-2 font-semibold text-gray-900 transition hover:text-brand"
                    >
                      {product.name || "Unnamed product"}
                    </Link>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(price)}
                      </span>

                      {discount > 0 && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(originalPrice)}
                        </span>
                      )}
                    </div>

                    {itemErrors[productId] && (
                      <p className="mt-3 text-sm text-red-600">
                        {itemErrors[productId]}
                      </p>
                    )}

                    <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                      <button
                        type="button"
                        disabled={busy || outOfStock}
                        onClick={() => handleMoveToCart(productId)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busy ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <ShoppingCart size={16} />
                        )}
                        Move to cart
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleRemove(productId)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-8">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-hover"
          >
            <ArrowRight className="rotate-180" size={16} />
            Continue browsing
          </Link>
        </div>
      </div>
    </main>
  );
}
