
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Package,
  Pencil,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
} from "lucide-react";

import {
  getAdminProducts,
  updateAdminProductStatus,
} from "../../services/admin.service";

import api from "../../services/api";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(price || 0);

// Product Image Component
const ProductImage = ({ images, name, size = "h-12 w-12" }) => {
  const [imageError, setImageError] = useState(false);

  const image = images?.[0];

  useEffect(() => {
    setImageError(false);
  }, [image]);

  return (
    <div
      className={`${size} shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100`}
    >
      {image && !imageError ? (
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
          No image
        </div>
      )}
    </div>
  );
};

const AdminProducts = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 10,
  });

  // Selected product for View Details modal
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch categories for category filter
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");

        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch admin products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminProducts({
        page,
        limit: 10,
        search,
        category,
        status,
      });

      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch products"
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, category, status]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Activate or deactivate product
  const handleStatusChange = async (product) => {
    const nextStatus = !product.isActive;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        nextStatus ? "activate" : "deactivate"
      } ${product.name}?`
    );

    if (!confirmed) return;

    try {
      await updateAdminProductStatus(product._id, nextStatus);

      if (selectedProduct?._id === product._id) {
        setSelectedProduct((previous) => ({
          ...previous,
          isActive: nextStatus,
        }));
      }

      await fetchProducts();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to update product status"
      );
    }
  };

  // Search handler
  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  // Category filter handler
  const handleCategoryChange = (value) => {
    setCategory(value);
    setPage(1);
  };

  // Status filter handler
  const handleStatusFilter = (value) => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Products
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your store products and inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/products/new")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Total Products */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-indigo-50 p-3 text-brand">
            <Package size={24} />
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Total Products
            </p>

            <p className="text-2xl font-bold text-gray-900">
              {pagination.totalProducts}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                handleSearchChange(e.target.value)
              }
              placeholder="Search products..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) =>
              handleCategoryChange(e.target.value)
            }
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
          >
            <option value="">All Categories</option>

            {categories.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) =>
              handleStatusFilter(e.target.value)
            }
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            All Products
          </h2>

          <button
            type="button"
            onClick={fetchProducts}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-100 border-t-brand" />
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <p className="text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={fetchProducts}
              className="mt-3 text-sm font-medium text-brand hover:underline"
            >
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package
              size={36}
              className="mx-auto text-gray-300"
            />

            <p className="mt-3 font-medium text-gray-700">
              No products found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Price</th>
                    <th className="px-5 py-4">Stock</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-gray-50"
                    >
                      {/* Product */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <ProductImage
                            images={product.images}
                            name={product.name}
                          />

                          <div>
                            <p className="font-medium text-gray-900">
                              {product.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              SKU: {product.sku || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4 text-gray-600">
                        {product.category?.name || "Uncategorized"}
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {formatPrice(product.price)}
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-4">
                        <span
                          className={
                            product.stock <= 5
                              ? "font-medium text-red-600"
                              : "text-gray-700"
                          }
                        >
                          {product.stock}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            product.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* View */}
                          <button
                            type="button"
                            title="View product"
                            onClick={() => setSelectedProduct(product)}
                            className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-brand"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            title="Edit product"
                            onClick={() =>
                              navigate(
                                `/admin/products/edit/${product._id}`
                              )
                            }
                            className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-brand"
                          >
                            <Pencil size={16} />
                          </button>

                          {/* Activate / Deactivate */}
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(product)
                            }
                            title={
                              product.isActive
                                ? "Deactivate"
                                : "Activate"
                            }
                            className={`min-w-28 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                              product.isActive
                                ? "border-red-200 text-red-600 hover:bg-red-50"
                                : "border-green-200 text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {product.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-500">
                Page {pagination.currentPage} of{" "}
                {pagination.totalPages}
                {" · "}
                {pagination.totalProducts} products
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((current) => current - 1)
                  }
                  className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() =>
                    setPage((current) => current + 1)
                  }
                  className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* View Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Product Details
              </h2>

              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-6 p-6">
              {/* Product Image and Name */}
              <div className="flex items-center gap-4">
                <ProductImage
                  images={selectedProduct.images}
                  name={selectedProduct.name}
                  size="h-24 w-24"
                />

                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedProduct.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {selectedProduct.slug || "No slug"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    SKU: {selectedProduct.sku || "N/A"}
                  </p>
                </div>
              </div>

              {/* Product Information */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Brand</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {selectedProduct.brand || "N/A"}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {selectedProduct.category?.name || "Uncategorized"}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {formatPrice(selectedProduct.price)}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Discount</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {selectedProduct.discount || 0}%
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Stock</p>
                  <p
                    className={`mt-1 font-medium ${
                      selectedProduct.stock <= 5
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    {selectedProduct.stock ?? 0}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Status</p>
                  <p
                    className={`mt-1 font-semibold ${
                      selectedProduct.isActive
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedProduct.isActive ? "Active" : "Inactive"}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Featured</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {selectedProduct.isFeatured ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">
                  Description
                </p>

                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
                  {selectedProduct.description ||
                    "No description available."}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
