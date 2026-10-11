import { useState } from "react";
import loadRazorpay from "../utils/loadRazorpay";
import createRazorpayOrder from "../services/payment.service";

const PaymentTest = () => {
    const [loading, setLoading] = useState(false);

    // Temporary values for testing
    const orderId = "6aaf8f5565105bf77f9d10f2";

    // Replace this with however your Cartiva currently stores the JWT
    const token = localStorage.getItem("token");
    // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTliZTgyNDRkYzBlMWJlN2E0ZDk5OTIiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3OTE3MDYyMzMsImV4cCI6MTc5MTc5MjYzM30.pxSH_6OgJctO3edeVNwkyAAgGejHuezJlqUsdluyv"

    const handlePayment = async () => {
        try {
            setLoading(true);

            // 1. Load Razorpay Checkout
            const isLoaded = await loadRazorpay();

            if (!isLoaded) {
                throw new Error(
                    "Razorpay Checkout failed to load"
                );
            }

            // 2. Create/get Razorpay Order through Cartiva backend
            const data = await createRazorpayOrder(
                orderId,
                token
            );

            const {
                razorpayOrderId,
                amount,
                currency,
                keyId,
            } = data.payment;

            // 3. Configure Razorpay Checkout
            const options = {
                key: keyId,
                amount,
                currency,

                name: "Cartiva",

                description: `Payment for Cartiva Order ${orderId}`,

                order_id: razorpayOrderId,

                handler: function (response) {
                    console.log(
                        "Razorpay payment response:",
                        response
                    );
                },

                theme: {
                    color: "#000000",
                },
            };

            // 4. Create Razorpay Checkout instance
            const razorpay = new window.Razorpay(options);

            // 5. Open Checkout
            razorpay.open();

        } catch (error) {
            console.error("Payment error:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Cartiva Payment Test</h1>

            <p>
                Order ID: {orderId}
            </p>

            <button
                onClick={handlePayment}
                disabled={loading}
            >
                {loading
                    ? "Opening Payment..."
                    : "Pay ₹1,000"}
            </button>
        </div>
    );
};

export default PaymentTest;