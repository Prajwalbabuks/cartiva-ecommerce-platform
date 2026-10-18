
import { Link } from "react-router-dom";

function ProductCard({ product }) {
  const firstImage = product.images?.[0];

  const imageUrl =
    (typeof firstImage === "string"
      ? firstImage
      : firstImage?.url || firstImage?.secure_url) ||
    product.image ||
    "";

  const price = Number(product.price) || 0;
  const discount = Math.min(
    100,
    Math.max(0, Number(product.discount) || 0)
  );

  const discountedPrice = price * (1 - discount / 100);
  const outOfStock = Number(product.stock) <= 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <Link
        to={`/products/${product._id}`}
        className="relative flex aspect-square items-center justify-center overflow-hidden bg-gray-50 p-5"
        aria-label={`View ${product.name}`}
      >
        {discount > 0 && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
            {discount}% OFF
          </span>
        )}

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            No image available
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {product.category?.name && (
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {product.category.name}
          </p>
        )}

        <Link
          to={`/products/${product._id}`}
          className="mt-2 line-clamp-2 text-base font-bold text-gray-900 transition hover:text-brand"
        >
          {product.name}
        </Link>

        {product.brand && (
          <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
        )}

        <div className="mt-4 flex flex-wrap items-baseline gap-2">
          <span className="text-lg font-extrabold text-gray-900">
            ₹
            {discountedPrice.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </span>

          {discount > 0 && (
            <span className="text-sm text-gray-400 line-through">
              ₹
              {price.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}
            </span>
          )}
        </div>

        <p
          className={`mt-3 text-xs font-semibold ${
            outOfStock ? "text-red-600" : "text-emerald-700"
          }`}
        >
          {outOfStock ? "Out of stock" : "In stock"}
        </p>

        <Link
          to={`/products/${product._id}`}
          className="mt-auto block rounded-lg bg-brand px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-brand-hover"
        >
          View details
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;
