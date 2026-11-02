
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Package,
  Save,
} from "lucide-react";

import api from "../../services/api";
import { createAdminProduct } from "../../services/admin.service";

// Generate slug from product name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const initialForm = {
  name: "",
  description: "",
  brand: "",
  category: "",
  sku: "",
  price: "",
  discount: 0,
  stock: "",
  images: [""],
  isActive: true,
  isFeatured: false,
};

const AdminAddProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");

        setCategories(response.data.categories || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Unable to load categories.");
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle image URL changes
  const handleImageChange = (index, value) => {
    setFormData((prev) => {
      const updatedImages = [...prev.images];

      updatedImages[index] = value;

      return {
        ...prev,
        images: updatedImages,
      };
    });
  };

  // Add image field
  const addImageField = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }));
  };

  // Remove image field
  const removeImageField = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Submit product
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validImages = formData.images
      .map((image) => image.trim())
      .filter(Boolean);

    // Basic validation
    if (!formData.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Product description is required.");
      return;
    }

    if (!formData.brand.trim()) {
      setError("Brand is required.");
      return;
    }

    if (!formData.category) {
      setError("Please select a category.");
      return;
    }

    if (!formData.sku.trim()) {
      setError("SKU is required.");
      return;
    }

    if (
      formData.price === "" ||
      !Number.isFinite(Number(formData.price)) ||
      Number(formData.price) <= 0
    ) {
      setError("Please enter a valid product price.");
      return;
    }

    if (
      formData.discount === "" ||
      !Number.isFinite(Number(formData.discount)) ||
      Number(formData.discount) < 0 ||
      Number(formData.discount) > 100
    ) {
      setError("Discount must be between 0 and 100.");
      return;
    }

    if (
      formData.stock === "" ||
      !Number.isInteger(Number(formData.stock)) ||
      Number(formData.stock) < 0
    ) {
      setError("Stock must be a non-negative whole number.");
      return;
    }

    if (validImages.length === 0) {
      setError("Please provide at least one product image URL.");
      return;
    }

    // Validate image URLs
    const invalidImage = validImages.find((image) => {
      try {
        const url = new URL(image);

        return !["http:", "https:"].includes(url.protocol);
      } catch {
        return true;
      }
    });

    if (invalidImage) {
      setError("Please provide valid HTTP or HTTPS image URLs.");
      return;
    }

    // Prepare product data
    const productData = {
      name: formData.name.trim(),
      slug: generateSlug(formData.name),
      description: formData.description.trim(),
      brand: formData.brand.trim(),
      category: formData.category,
      sku: formData.sku.trim(),
      price: Number(formData.price),
      discount: Number(formData.discount),
      stock: Number(formData.stock),
      images: validImages,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
    };

    try {
      setLoading(true);

      await createAdminProduct(productData);

      setSuccess("Product created successfully!");

      setTimeout(() => {
        navigate("/admin/products");
      }, 1000);
    } catch (err) {
      console.error("Product creation error:", err.response?.data || err);

      const validationErrors = err.response?.data?.errors;

      if (Array.isArray(validationErrors)) {
        setError(
          validationErrors
            .map((item) => `${item.field}: ${item.message}`)
            .join(", ")
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to create product. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-indigo-100";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-gray-700";

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Add Product
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Add a new product to your Cartiva store.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Information */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <Package className="text-brand" size={22} />

            <h2 className="font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <div className="md:col-span-2">
              <label className={labelClass}>
                Product Name *
              </label>

              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className={inputClass}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>
                Description *
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product..."
                rows={4}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                Brand *
              </label>

              <input
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Enter brand"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                Category *
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={inputClass}
                disabled={categoryLoading}
                required
              >
                <option value="">
                  {categoryLoading
                    ? "Loading categories..."
                    : "Select category"}
                </option>

                {categories.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>
                SKU *
              </label>

              <input
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="Enter unique SKU"
                className={inputClass}
                required
              />
            </div>

          </div>
        </section>

        {/* Pricing and Inventory */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-semibold text-gray-900">
            Pricing & Inventory
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            <div>
              <label className={labelClass}>
                Price (₹) *
              </label>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                Discount (%)
              </label>

              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                min="0"
                max="100"
                step="1"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Stock Quantity *
              </label>

              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="0"
                className={inputClass}
                required
              />
            </div>

          </div>
        </section>

        {/* Product Images */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-900">
              Product Images
            </h2>

            <button
              type="button"
              onClick={addImageField}
              className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 px-3 py-2 text-sm font-medium text-brand hover:bg-indigo-50"
            >
              <Plus size={16} />
              Add Image URL
            </button>
          </div>

          <div className="space-y-3">
            {formData.images.map((image, index) => (
              <div
                key={index}
                className="flex items-center gap-2"
              >
                <input
                  type="url"
                  value={image}
                  onChange={(e) =>
                    handleImageChange(index, e.target.value)
                  }
                  placeholder="https://example.com/product-image.jpg"
                  className={inputClass}
                />

                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="rounded-lg border border-red-200 p-2.5 text-red-600 hover:bg-red-50"
                    title="Remove image"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Provide publicly accessible HTTP or HTTPS image URLs.
            The first image will be used as the primary product image.
          </p>
        </section>

        {/* Product Visibility */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-semibold text-gray-900">
            Product Visibility
          </h2>

          <div className="space-y-4">

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 accent-indigo-600"
              />

              <span>
                <span className="block text-sm font-medium text-gray-800">
                  Active Product
                </span>

                <span className="text-xs text-gray-500">
                  Make this product visible to customers.
                </span>
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="h-4 w-4 accent-indigo-600"
              />

              <span>
                <span className="block text-sm font-medium text-gray-800">
                  Featured Product
                </span>

                <span className="text-xs text-gray-500">
                  Highlight this product in your store.
                </span>
              </span>
            </label>

          </div>
        </section>

        {/* Error and Success Messages */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">

          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || categoryLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />

            {loading ? "Creating Product..." : "Create Product"}
          </button>

        </div>
      </form>
    </div>
  );
};

export default AdminAddProduct;
