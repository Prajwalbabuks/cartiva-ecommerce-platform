
import api from "./api";

export const validateCoupon = async ({ code, subtotal }) => {
  const response = await api.post("/coupons/validate", {
    code: code.trim().toUpperCase(),
    subtotal: Number(subtotal),
  });

  return response.data;
};
