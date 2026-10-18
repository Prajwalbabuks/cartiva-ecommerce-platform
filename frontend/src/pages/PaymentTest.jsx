
import { useState } from "react";
import loadRazorpay from "../utils/loadRazorpay";
import {
    createRazorpayOrder,
    verifyRazorpayPayment,
} from "../services/payment.service";

const PaymentTest = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("idle");

    // Replace with a valid, pending Cartiva order ID.
    const orderId = "6aaf8fec65105bf77f9d10f3";

    const handlePayment = async () => {
        if (loading) return;

        setLoading(true);
        setMessage("");
        setPaymentStatus("initializing");

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "Please log in before making a payment."
                );
            }

            const isLoaded = await loadRazorpay();

            if (!isLoaded) {
                throw new Error(
                    "Razorpay Checkout failed to load."
                );
            }

            const data = await createRazorpayOrder(orderId, token);
            const payment = data.payment ?? data;

            const {
                razorpayOrderId,
                amount,
                currency,
                keyId,
            } = payment;

            if (
                !razorpayOrderId ||
                !Number.isSafeInteger(amount) ||
                amount <= 0 ||
                !currency ||
                !keyId
            ) {
                throw new Error(
                    "Invalid payment details. Check the create-order API response."
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
                    setPaymentStatus("verifying");
                    setMessage("Payment received. Verifying with Cartiva...");

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

                        setPaymentStatus("success");
                        setMessage(
                            "Payment verified successfully! Your order is confirmed."
                        );
                    } catch (error) {
                        console.error("Verification error:", error);

                        setPaymentStatus("verification_unknown");
                        setMessage(
                            "We couldn't confirm your payment yet. Check your order status before attempting another payment."
                        );
                    } finally {
                        setLoading(false);
                    }
                },

                modal: {
                    ondismiss: () => {
                        setLoading(false);

                        setPaymentStatus((current) =>
                        current === "initializing" ||
                        current === "checkout_open"
                            ? "dismissed"
                            : current   
                        );

                        setMessage((current) =>
                            current ||
                            "Checkout closed. You can try again if you haven't completed payment."
                        );
                    },
                },

                theme: {
                    color: "#000000",
                },
            };

            const razorpay = new window.Razorpay(options);

            razorpay.on("payment.failed", (response) => {
                console.error(
                    "Razorpay payment failed:",
                    response.error
                );

                setPaymentStatus("failed");
                setMessage(
                    response.error?.description ||
                    "Payment attempt failed. You can try again."
                );
                setLoading(false);
            });

            razorpay.open();
            setPaymentStatus("checkout_open");
        } catch (error) {
            console.error("Payment error:", error);
            setPaymentStatus("error");
            setMessage(
                error.message || "Unable to start payment."
            );
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Cartiva Payment Test</h1>

            <p>Order ID: {orderId}</p>
            <p>Payment status: {paymentStatus}</p>

            <button
                onClick={handlePayment}
                disabled={loading || paymentStatus === "success"}
            >
                {loading ? "Processing..." : "Pay Now / Retry"}
            </button>

            {message && (
                <p role="status" aria-live="polite">
                    {message}
                </p>
            )}
        </div>
    );
};

export default PaymentTest;
