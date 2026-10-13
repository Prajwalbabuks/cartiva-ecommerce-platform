const API_URL = "http://localhost:5000/api/v1";

const createRazorpayOrder = async (orderId, token) => {
    const response = await fetch(
        `${API_URL}/payments/create-order`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ orderId }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to create payment order"
        );
    }

    return data;
};

const verifyRazorpayPayment = async (paymentData, token) => {
    const response = await fetch(
        `${API_URL}/payments/verify`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(paymentData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Payment verification failed"
        );
    }

    return data;
};

export {
    createRazorpayOrder,
    verifyRazorpayPayment,
};
