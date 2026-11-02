
import api from "./api";

export const getDashboardOverview = async () => {
  const response = await api.get("/admin/dashboard/overview");
  return response.data;
};

// Get all admin products
export const getAdminProducts = async (params = {}) => {
  const response = await api.get("/admin/products", { params });
  return response.data;
};

// Activate or deactivate product
export const updateAdminProductStatus = async (productId, isActive) => {
  const response = await api.patch(
    `/admin/products/${productId}/status`,
    { isActive }
  );

  return response.data;
};

// Create a new product
export const createAdminProduct = async (productData) => {
  const response = await api.post("/products", productData);
  return response.data;
};

// Get single product for editing
export const getAdminProductById = async (productId) => {
  const response = await api.get(`/products/${productId}`);
  return response.data;
};

// Update product
export const updateAdminProduct = async (productId, productData) => {
  const response = await api.patch(
    `/products/${productId}`,
    productData
  );

  return response.data;
};

// Get all categories for admin
export const getAdminCategories = async (params = {}) => {
  const response = await api.get("/admin/categories", { params });
  return response.data;
};

// Activate or deactivate category
export const updateAdminCategoryStatus = async (categoryId, isActive) => {
  const response = await api.patch(
    `/admin/categories/${categoryId}/status`,
    { isActive }
  );

  return response.data;
};