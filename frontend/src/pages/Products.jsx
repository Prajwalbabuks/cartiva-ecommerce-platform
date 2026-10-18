
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  RefreshCw,
  PackageOpen,
} from "lucide-react";

import { getProducts } from "../services/product.service";
import ProductCard from "../components/products/ProductCard";

const PAGE_SIZE = 12;

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-indigo-100";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

function Products() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [appliedMinPrice, setAppliedMinPrice] = useState("");
  const [appliedMaxPrice, setAppliedMaxPrice] = useState("");

  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = { page, limit: PAGE_SIZE };

      if (search) params.search = search;
      if (appliedMinPrice !== "") params.minPrice = appliedMinPrice;
      if (appliedMaxPrice !== "") params.maxPrice = appliedMaxPrice;
      if (sort !== "newest") params.sort = sort;

      const data = await getProducts(params);

      if (!data.success) {
        throw new Error("Unable to retrieve products.");
      }

      setProducts(data.products || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setProducts([]);
      setPagination(null);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, appliedMinPrice, appliedMaxPrice, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterSubmit = (event) => {
    event.preventDefault();

    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);

    if (
      (min !== null && (!Number.isFinite(min) || min < 0)) ||
      (max !== null && (!Number.isFinite(max) || max < 0))
    ) {
      setError("Enter valid, non-negative prices.");
      return;
    }

    if (min !== null && max !== null && min > max) {
      setError("Minimum price cannot exceed maximum price.");
      return;
    }

    setError("");
    setPage(1);
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setAppliedMinPrice("");
    setAppliedMaxPrice("");
    setSort("newest");
    setPage(1);
    setError("");
  };

  const changePage = (nextPage) => {
    if (
      nextPage < 1 ||
      (pagination && nextPage > pagination.totalPages)
    ) {
      return;
    }

    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page heading */}
      <header className="mx-auto mb-8 flex max-w-5xl flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-brand">
            THE CARTIVA COLLECTION
          </p>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Explore Products
          </h1>

          <p className="mt-2 text-gray-500">
            Find something you'll love.
          </p>
        </div>

        {!loading && pagination && (
          <p className="text-sm font-medium text-gray-500">
            {pagination.totalProducts} products
          </p>
        )}
      </header>

      {/* Centered search and sorting toolbar */}
      <section
        className="mx-auto mb-6 grid w-full max-w-5xl grid-cols-1 items-end gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 md:grid-cols-[minmax(0,1fr)_240px]"
        aria-label="Search and sort products"
      >
        <label className="relative block">
          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            className={`${inputClass} pl-10`}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-gray-500">
            Sort by
          </span>

          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </label>
      </section>

      {/* Centered price filters */}
      <form
        onSubmit={handleFilterSubmit}
        className="mx-auto mb-8 w-full max-w-5xl rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="mb-5 flex items-center gap-2 font-bold text-gray-900">
          <SlidersHorizontal size={19} className="text-brand" />
          <span>Price range</span>
        </div>

        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-600">
              Minimum price (₹)
            </span>

            <input
              type="number"
              min="0"
              step="0.01"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-600">
              Maximum price (₹)
            </span>

            <input
              type="number"
              min="0"
              step="0.01"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="No limit"
              className={inputClass}
            />
          </label>

          <button
            type="submit"
            className={buttonPrimary}
            disabled={loading}
          >
            Apply filters
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className={buttonSecondary}
            disabled={loading}
          >
            Clear all
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="mx-auto mb-6 flex max-w-5xl flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={fetchProducts}
            disabled={loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 font-semibold hover:bg-red-100 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div
          role="status"
          className="flex min-h-64 flex-col items-center justify-center gap-3 text-gray-500"
        >
          <RefreshCw size={28} className="animate-spin text-brand" />
          <p>Loading products...</p>
        </div>
      ) : error ? null : products.length === 0 ? (
        /* Empty state */
        <div className="mx-auto flex min-h-72 max-w-5xl flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-5 text-center">
          <PackageOpen size={42} className="text-gray-400" />

          <h2 className="mt-4 text-xl font-bold text-gray-900">
            No products found
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
            Try another search or adjust your price filters.
          </p>

          <button
            type="button"
            className={`${buttonPrimary} mt-5`}
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {/* Centered product grid */}
          <section
            className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            aria-label="Product results"
          >
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </section>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <nav
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
              aria-label="Product pagination"
            >
              <button
                type="button"
                disabled={!pagination.hasPreviousPage}
                onClick={() => changePage(page - 1)}
                className={buttonSecondary}
              >
                Previous
              </button>

              <span className="text-sm font-medium text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => changePage(page + 1)}
                className={buttonSecondary}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}

export default Products;
