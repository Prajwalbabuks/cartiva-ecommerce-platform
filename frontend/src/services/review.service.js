
import api from "./api";

export const getProductReviews = async (productId, params = {}) => {
    const response = await api.get(
        `/reviews/product/${productId}`,
        { params }
    );

    return response.data;
};

export const createReview = async (reviewData) => {
    const response = await api.post("/reviews", reviewData);
    return response.data;
};

export const updateReview = async (reviewId, reviewData) => {
    const response = await api.patch(
        `/reviews/${reviewId}`,
        reviewData
    );

    return response.data;
};

export const deleteReview = async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
};
