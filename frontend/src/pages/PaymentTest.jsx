import { useState } from "react";
import loadRazorpay from "../utils/loadRazorpay";
import {
    createRazorpayOrder,
    verifyRazorpayPayment,
} from "../services/payment.service";

const PaymentTest = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Replace with a valid, pending Cartiva order ID.
    const orderId = "6ace027f38bd5ecb27a64991";

    const handlePayment = async () => {
        setLoading(true);
        setMessage("");

        try {
            const token = localStorage.getItem("token");
            // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWEwNTliMWQ1OGM5ZDk2ODQyOGQwOWIiLCJyb2xlIjoidXNlciIsImlhdCI6MTc5MTg4NDI3MCwiZXhwIjoxNzkxOTcwNjcwfQ.cz6zYwrX9XBhRG94cc6PyjE9svZAF9xMS2qyuWVmFVg"; // Replace with actual token retrieval

            if (!token) {
                throw new Error("Please log in before making a payment.");
            }

            const isLoaded = await loadRazorpay();

            if (!isLoaded) {
                throw new Error("Razorpay Checkout failed to load.");
            }

            const data = await createRazorpayOrder(orderId, token);

            // Supports either { payment: {...} } or a direct payment object.
            const payment = data.payment ?? data;

            const {
                razorpayOrderId,
                amount,
                currency,
                keyId,
            } = payment;

            if (!razorpayOrderId || !amount || !currency || !keyId) {
                throw new Error(
                    "Missing payment details. Check the create-order API response."
                );
            }

            const options = {
                key: keyId,
                amount,
                currency,
                name: "Cartiva",
                description: `Payment for Cartiva Order ${orderId}`,
                order_id: razorpayOrderId,

                handler: async (response) => {
                    setLoading(true);

                    try {
                        await verifyRazorpayPayment(
                            {
                                orderId,
                                razorpay_order_id:
                                    response.razorpay_order_id,
                                razorpay_payment_id:
                                    response.razorpay_payment_id,
                                razorpay_signature:
                                    response.razorpay_signature,
                            },
                            token
                        );

                        setMessage(
                            "Payment verified successfully! Your order is confirmed."
                        );
                    } catch (error) {
                        console.error("Verification error:", error);
                        setMessage(
                            "Payment may have succeeded, but verification failed. Check your order before retrying."
                        );
                    } finally {
                        setLoading(false);
                    }
                },

                modal: {
                    ondismiss: () => setLoading(false),
                },

                theme: {
                    color: "#000000",
                },
            };

            const razorpay = new window.Razorpay(options);

            razorpay.on("payment.failed", (response) => {
                console.error("Razorpay payment failed:", response.error);
                setMessage(
                    response.error?.description || "Payment failed."
                );
                setLoading(false);
            });

            razorpay.open();
        } catch (error) {
            console.error("Payment error:", error);
            setMessage(error.message || "Unable to start payment.");
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Cartiva Payment Test</h1>
            <p>Order ID: {orderId}</p>

            <button onClick={handlePayment} disabled={loading}>
                {loading ? "Processing..." : "Pay Now"}
            </button>

            {message && <p>{message}</p>}
        </div>
    );
};

export default PaymentTest;