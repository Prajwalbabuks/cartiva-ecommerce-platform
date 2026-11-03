
import api from "./api";

export const registerUser = async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get("/auth/me");
    return response.data;
};

// Verify email using OTP
export const verifyEmail = async (email, otp) => {
    const response = await api.post("/auth/verify-email", {
        email,
        otp,
    });

    return response.data;
};

// Resend verification OTP
export const resendVerificationOTP = async (email) => {
    const response = await api.post("/auth/resend-verification", {
        email,
    });

    return response.data;
};
