
import api from "./api";

export const createOrder = async (orderData) => {
  const response = await api.post("/orders", orderData);
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

export const getOrders = async (params = {}) => {
  const response = await api.get("/orders", { params });
  return response.data;
};
