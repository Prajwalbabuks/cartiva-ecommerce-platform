
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import api from "../../services/api";

const generateSlug = (name) => {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

const AdminEditCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch existing category details.
        const response = await api.get(`/categories/${id}`);

        const category =
          response.data.category || response.data;

        setFormData({
          name: category.name || "",
          description: category.description || "",
          image: category.image || "",
          isActive: category.isActive ?? true,
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load category details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);

      const categoryData = {
        ...formData,
        name: formData.name.trim(),
        slug: generateSlug(formData.name),
      };

      // Connect this call to your existing Update Category API.
      await api.patch(`/categories/${id}`, categoryData);

      navigate("/admin/categories");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update category."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-100 border-t-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/admin/categories")}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand"
      >
        <ArrowLeft size={18} />
        Back to Categories
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Category
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Update your category information.
        </p>
      </div>

      {error && (
        <div className="max-w-3xl rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!error || formData.name ? (
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-indigo-100"
            />

            {formData.image && (
              <img
                src={formData.image}
                alt="Category preview"
                className="mt-3 h-24 w-24 rounded-lg border object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <p className="text-sm font-medium text-gray-800">
                Category Status
              </p>
              <p className="text-xs text-gray-500">
                Enable this category in your store.
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 accent-indigo-600"
              />
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-60"
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
};

export default AdminEditCategory;
