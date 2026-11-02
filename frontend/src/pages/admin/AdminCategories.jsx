
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Pencil,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import {
  getAdminCategories,
  updateAdminCategoryStatus,
} from "../../services/admin.service";

// Category image component
const CategoryImage = ({ image, name }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [image]);

  return (
    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
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

const AdminCategories = () => {
  const navigate = useNavigate();

  // Data states
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCategories: 0,
    limit: 10,
  });

  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");

  // UI states
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminCategories({
        page: pagination.currentPage,
        limit: pagination.limit,
        search,
        status,
        sort,
      });

      const data = response.data;

      setCategories(data?.categories || []);
      setTotalProducts(data?.totalProducts || 0);

      if (data?.pagination) {
        setPagination((previous) => ({
          ...previous,
          ...data.pagination,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load categories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch when filters or pagination change
  useEffect(() => {
    fetchCategories();
  }, [
    pagination.currentPage,
    pagination.limit,
    search,
    status,
    sort,
  ]);

  // Search
  const handleSearchChange = (value) => {
    setSearch(value);

    setPagination((previous) => ({
      ...previous,
      currentPage: 1,
    }));
  };

  // Status filter
  const handleStatusFilter = (value) => {
    setStatus(value);

    setPagination((previous) => ({
      ...previous,
      currentPage: 1,
    }));
  };

  // Sorting
  const handleSortChange = (value) => {
    setSort(value);

    setPagination((previous) => ({
      ...previous,
      currentPage: 1,
    }));
  };

  // Activate / Deactivate category
  const handleStatusChange = async (category) => {
    const newStatus = !category.isActive;
    const action = newStatus ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(category._id);

      await updateAdminCategoryStatus(category._id, newStatus);

      if (selectedCategory?._id === category._id) {
        setSelectedCategory((previous) => ({
          ...previous,
          isActive: newStatus,
        }));
      }

      await fetchCategories();
    } catch (error) {
      console.error("Failed to update category status:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update category status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Pagination
  const handlePreviousPage = () => {
    if (pagination.currentPage > 1) {
      setPagination((previous) => ({
        ...previous,
        currentPage: previous.currentPage - 1,
      }));
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination((previous) => ({
        ...previous,
        currentPage: previous.currentPage + 1,
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Category Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your product categories and their status.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/categories/new")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Categories</p>

          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {pagination.totalCategories || 0}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Products Across All Categories
          </p>

          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {totalProducts}
          </h2>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search categories..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
          </select>

          {/* Refresh */}
          <button
            onClick={fetchCategories}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Categories Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Slug</th>
                <th className="px-6 py-4 font-semibold">Products</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr
                    key={category._id}
                    className="transition hover:bg-gray-50"
                  >
                    {/* Category and image from database */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <CategoryImage
                          image={category.image}
                          name={category.name}
                        />

                        <div>
                          <p className="font-medium text-gray-900">
                            {category.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {category.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-6 py-4 text-gray-600">
                      {category.slug}
                    </td>

                    {/* Product Count */}
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        {category.productCount || 0}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          category.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedCategory(category)}
                          title="View category"
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-brand"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          onClick={() =>
                            navigate(
                              `/admin/categories/edit/${category._id}`  
                            )
                          }
                          title="Edit category"
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-brand"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => handleStatusChange(category)}
                          disabled={updatingId === category._id}
                          className={`min-w-28 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            category.isActive
                              ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
                              : "border-green-200 bg-white text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {updatingId === category._id
                            ? "Updating..."
                            : category.isActive
                              ? "Deactivate"
                              : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && categories.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Showing page{" "}
              <span className="font-medium text-gray-900">
                {pagination.currentPage}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-900">
                {pagination.totalPages}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={pagination.currentPage <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <button
                onClick={handleNextPage}
                disabled={
                  pagination.currentPage >= pagination.totalPages
                }
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Category Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Category Details
              </h2>

              <button
                onClick={() => setSelectedCategory(null)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 p-6">
              <div className="flex items-center gap-4">
                <CategoryImage
                  image={selectedCategory.image}
                  name={selectedCategory.name}
                />

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedCategory.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {selectedCategory.slug}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-1 text-sm font-medium text-gray-700">
                  Description
                </p>

                <p className="text-sm text-gray-600">
                  {selectedCategory.description ||
                    "No description available."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Products</p>

                  <p className="mt-1 text-xl font-semibold text-gray-900">
                    {selectedCategory.productCount || 0}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Status</p>

                  <p
                    className={`mt-1 text-sm font-semibold ${
                      selectedCategory.isActive
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedCategory.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setSelectedCategory(null)}
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

export default AdminCategories;
