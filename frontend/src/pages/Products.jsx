
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

function Products() {
    // Product data
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState(null);

    // Search
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");

    // Price inputs
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    // Only applied prices are sent to the backend
    const [appliedMinPrice, setAppliedMinPrice] = useState("");
    const [appliedMaxPrice, setAppliedMaxPrice] = useState("");

    // Sorting and pagination
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);

    // UI states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Debounce search input
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setPage(1);
            setSearch(searchInput.trim());
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [searchInput]);

    // Fetch products from the backend
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const params = {
                page,
                limit: PAGE_SIZE,
            };

            if (search) {
                params.search = search;
            }

            if (appliedMinPrice !== "") {
                params.minPrice = appliedMinPrice;
            }

            if (appliedMaxPrice !== "") {
                params.maxPrice = appliedMaxPrice;
            }

            if (sort !== "newest") {
                params.sort = sort;
            }

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

    // Validate and apply the price filter
    const handleFilterSubmit = (event) => {
        event.preventDefault();

        const min =
            minPrice === "" ? null : Number(minPrice);

        const max =
            maxPrice === "" ? null : Number(maxPrice);

        if (
            (min !== null &&
                (!Number.isFinite(min) || min < 0)) ||
            (max !== null &&
                (!Number.isFinite(max) || max < 0))
        ) {
            setError("Enter valid, non-negative prices.");
            return;
        }

        if (
            min !== null &&
            max !== null &&
            min > max
        ) {
            setError(
                "Minimum price cannot exceed maximum price."
            );
            return;
        }

        setError("");
        setPage(1);
        setAppliedMinPrice(minPrice);
        setAppliedMaxPrice(maxPrice);
    };

    // Clear search, price filters and sorting
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

    // Change page
    const changePage = (nextPage) => {
        if (
            nextPage < 1 ||
            (pagination &&
                nextPage > pagination.totalPages)
        ) {
            return;
        }

        setPage(nextPage);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <main className="products-page">
            {/* Page heading */}
            <header className="products-heading">
                <div>
                    <p className="eyebrow">
                        THE CARTIVA COLLECTION
                    </p>

                    <h1>Explore Products</h1>

                    <p className="products-subtitle">
                        Find something you'll love.
                    </p>
                </div>

                {!loading && pagination && (
                    <p className="products-count">
                        {pagination.totalProducts} products
                    </p>
                )}
            </header>

            {/* Search and sorting */}
            <section
                className="products-toolbar"
                aria-label="Search and sort products"
            >
                <label className="search-box">
                    <Search size={19} />

                    <input
                        type="search"
                        value={searchInput}
                        onChange={(event) =>
                            setSearchInput(event.target.value)
                        }
                        placeholder="Search products..."
                        aria-label="Search products"
                    />
                </label>

                <label className="sort-control">
                    <span>Sort by</span>

                    <select
                        value={sort}
                        onChange={(event) => {
                            setSort(event.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="newest">
                            Newest first
                        </option>

                        <option value="oldest">
                            Oldest first
                        </option>

                        <option value="price_asc">
                            Price: low to high
                        </option>

                        <option value="price_desc">
                            Price: high to low
                        </option>
                    </select>
                </label>
            </section>

            {/* Price filters */}
            <form
                className="price-filter"
                onSubmit={handleFilterSubmit}
            >
                <div className="filter-title">
                    <SlidersHorizontal size={18} />
                    <span>Price range</span>
                </div>

                <label>
                    <span>Minimum price (₹)</span>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={minPrice}
                        onChange={(event) =>
                            setMinPrice(event.target.value)
                        }
                        placeholder="0"
                    />
                </label>

                <label>
                    <span>Maximum price (₹)</span>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={maxPrice}
                        onChange={(event) =>
                            setMaxPrice(event.target.value)
                        }
                        placeholder="No limit"
                    />
                </label>

                <button
                    type="submit"
                    className="filter-button"
                    disabled={loading}
                >
                    Apply filters
                </button>

                <button
                    type="button"
                    className="clear-filter-button"
                    onClick={clearFilters}
                    disabled={loading}
                >
                    Clear all
                </button>
            </form>

            {/* Error state */}
            {error && (
                <div
                    className="products-error"
                    role="alert"
                >
                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={fetchProducts}
                        disabled={loading}
                    >
                        <RefreshCw size={16} />
                        Try again
                    </button>
                </div>
            )}

            {/* Loading state */}
            {loading ? (
                <div
                    className="products-message"
                    role="status"
                >
                    <RefreshCw
                        size={24}
                        className="loading-icon"
                    />

                    <p>Loading products...</p>
                </div>
            ) : error ? null : products.length === 0 ? (
                /* Empty state */
                <div className="products-message">
                    <PackageOpen size={42} />

                    <h2>No products found</h2>

                    <p>
                        Try another search or adjust your
                        price filters.
                    </p>

                    <button
                        type="button"
                        className="filter-button"
                        onClick={clearFilters}
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <>
                    {/* Product grid */}
                    <section
                        className="product-grid"
                        aria-label="Product results"
                    >
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                            />
                        ))}
                    </section>

                    {/* Pagination */}
                    {pagination &&
                        pagination.totalPages > 1 && (
                            <nav
                                className="pagination"
                                aria-label="Product pagination"
                            >
                                <button
                                    type="button"
                                    disabled={
                                        !pagination.hasPreviousPage
                                    }
                                    onClick={() =>
                                        changePage(page - 1)
                                    }
                                >
                                    Previous
                                </button>

                                <span>
                                    Page{" "}
                                    {pagination.currentPage} of{" "}
                                    {pagination.totalPages}
                                </span>

                                <button
                                    type="button"
                                    disabled={
                                        !pagination.hasNextPage
                                    }
                                    onClick={() =>
                                        changePage(page + 1)
                                    }
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
