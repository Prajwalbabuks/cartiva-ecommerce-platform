import { useCallback, useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Package,
  RefreshCw,
  ShoppingBag,
  Tag,
} from "lucide-react";

import { getProductById } from "../services/product.service";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50";

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getProductById(productId);

      if (!data.success || !data.product) {
        throw new Error("Product could not be found.");
      }

      setProduct(data.product);
      setSelectedImage(0);
    } catch (err) {
      setProduct(null);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load this product."
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = async () => {
    setCartMessage("");
    setCartError("");

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: location,
          message: "Please log in to add products to your cart.",
        },
      });
      return;
    }

    if (!product || Number(product.stock) <= 0) {
      setCartError("This product is currently out of stock.");
      return;
    }

    setAddingToCart(true);

    try {
      await addItem(product._id, 1);
      setCartMessage("Product added to your cart successfully.");
    } catch (err) {
      setCartError(
        err.response?.data?.message ||
          err.message ||
          "Unable to add this product to your cart."
      );
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <main
        role="status"
        className="flex min-h-96 flex-col items-center justify-center gap-4 px-4 text-gray-500"
      >
        <RefreshCw size={28} className="animate-spin text-brand" />
        <p>Loading product details...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="mx-auto flex min-h-96 max-w-xl flex-col items-center justify-center px-5 py-12 text-center">
        <Package size={44} className="text-gray-400" />

        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Product unavailable
        </h1>

        <p className="mt-2 text-gray-500">
          {error || "This product could not be found."}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className={buttonPrimary}
            onClick={fetchProduct}
          >
            <RefreshCw size={17} />
            Try again
          </button>

          <Link to="/products" className={buttonSecondary}>
            Back to products
          </Link>
        </div>
      </main>
    );
  }

  const images = (product.images || [])
    .map((image) =>
      typeof image === "string"
        ? image
        : image?.url || image?.secure_url
    )
    .filter(Boolean);

  const price = Number(product.price) || 0;
  const discount = Math.min(
    100,
    Math.max(0, Number(product.discount) || 0)
  );
  const finalPrice = price * (1 - discount / 100);
  const inStock = Number(product.stock) > 0;

  const formattedPrice = (value) =>
    value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link
        to="/products"
        className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-brand"
      >
        <ArrowLeft size={18} />
        Back to products
      </Link>

      <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Product image gallery */}
        <div className="min-w-0">
          <div className="relative flex aspect-square max-h-[620px] items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 sm:p-10">
            {images.length > 0 ? (
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-contain"
                onError={(event) => {
                  event.currentTarget.style.visibility = "hidden";
                }}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <ShoppingBag size={54} />
                <span className="text-sm">
                  No product image available
                </span>
              </div>
            )}

            {discount > 0 && (
              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-sm font-bold text-red-700">
                <Tag size={14} />
                {discount}% OFF
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {images.map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  onClick={() => setSelectedImage(index)}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={selectedImage === index}
                  className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-2 bg-white p-2 transition ${
                    selectedImage === index
                      ? "border-brand ring-2 ring-indigo-100"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product information */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          {product.category?.name && (
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">
              {product.category.name}
            </p>
          )}

          <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-3xl">
            {product.name}
          </h1>

          {product.brand && (
            <p className="mt-3 text-sm text-gray-500">
              Brand:{" "}
              <span className="font-semibold text-gray-800">
                {product.brand}
              </span>
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-extrabold text-gray-900">
              ₹{formattedPrice(finalPrice)}
            </span>

            {discount > 0 && (
              <span className="text-lg text-gray-400 line-through">
                ₹{price.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {discount > 0 && (
            <p className="mt-2 text-sm font-semibold text-emerald-700">
              You save ₹{formattedPrice(price - finalPrice)}
            </p>
          )}

          <div
            className={`mt-6 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${
              inStock
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                inStock ? "bg-emerald-500" : "bg-red-500"
              }`}
            />

            {inStock
              ? `In stock — ${product.stock} available`
              : "Currently out of stock"}
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-lg font-bold text-gray-900">
              Product description
            </h2>

            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
              {product.description ||
                "No description is available for this product."}
            </p>
          </div>

          {product.sku && (
            <p className="mt-5 text-sm text-gray-500">
              SKU:{" "}
              <span className="font-medium text-gray-700">
                {product.sku}
              </span>
            </p>
          )}

          {cartMessage && (
            <div
              role="status"
              className="mt-5 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"
            >
              <CheckCircle size={18} className="mt-0.5 shrink-0" />
              <div className="flex-1">{cartMessage}</div>
              <Link
                to="/cart"
                className="shrink-0 font-bold underline"
              >
                View cart
              </Link>
            </div>
          )}

          {cartError && (
            <p
              role="alert"
              className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {cartError}
            </p>
          )}

          <button
            type="button"
            className={`${buttonPrimary} mt-7 w-full`}
            disabled={!inStock || addingToCart}
            onClick={handleAddToCart}
          >
            <ShoppingBag size={18} />
            {!inStock
              ? "Out of stock"
              : addingToCart
                ? "Adding to cart..."
                : "Add to cart"}
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-gray-500">
            Your cart is saved to your Cartiva account.
          </p>
        </div>
      </section>
    </main>
  );
}

export default ProductDetails;
