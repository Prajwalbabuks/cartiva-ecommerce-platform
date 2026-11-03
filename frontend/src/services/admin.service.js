
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


// Get all orders for admin
export const getAdminOrders = async (params = {}) => {
    const response = await api.get("/orders/admin/all", {
        params,
    });

    return response.data;
};

// Update order status
export const updateAdminOrderStatus = async (orderId, status) => {
    const response = await api.patch(`/orders/${orderId}/status`, {
        status,
    });

    return response.data;
};

// Get admin order statistics
export const getAdminOrderStats = async () => {
    const response = await api.get("/orders/admin/stats");
    return response.data;
};


// ==========================================
// COUPON MANAGEMENT
// ==========================================

// Get all coupons
export const getAdminCoupons = async (params = {}) => {
    const response = await api.get("/coupons", {
        params,
    });

    return response.data;
};

// Get a single coupon
export const getAdminCouponById = async (couponId) => {
    const response = await api.get(`/coupons/${couponId}`);

    return response.data;
};

// Create coupon
export const createAdminCoupon = async (couponData) => {
    const response = await api.post("/coupons", couponData);

    return response.data;
};

// Update coupon
export const updateAdminCoupon = async (couponId, couponData) => {
    const response = await api.patch(
        `/coupons/${couponId}`,
        couponData
    );

    return response.data;
};

// Deactivate coupon
export const deactivateAdminCoupon = async (couponId) => {
    const response = await api.patch(
        `/coupons/${couponId}/deactivate`
    );

    return response.data;
};



// ================= CUSTOMER MANAGEMENT =================

// Get all customers
export const getAdminCustomers = async (params = {}) => {
    const response = await api.get("/admin/customers", {
        params,
    });

    return response.data;
};

// Get customer details
export const getAdminCustomerById = async (customerId) => {
    const response = await api.get(
        `/admin/customers/${customerId}`
    );

    return response.data;
};

// Activate or deactivate customer
export const updateAdminCustomerStatus = async (
    customerId,
    isActive
) => {
    const response = await api.patch(
        `/admin/customers/${customerId}/status`,
        { isActive }
    );

    return response.data;
};
