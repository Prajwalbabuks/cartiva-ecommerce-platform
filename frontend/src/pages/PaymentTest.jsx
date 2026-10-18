
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  CreditCard,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

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
        throw new Error("Please log in before making a payment.");
      }

      const isLoaded = await loadRazorpay();

      if (!isLoaded) {
        throw new Error("Razorpay Checkout failed to load.");
      }

      const data = await createRazorpayOrder(orderId, token);
      const payment = data.payment ?? data;

      const { razorpayOrderId, amount, currency, keyId } = payment;

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
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
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
              current === "initializing" || current === "checkout_open"
                ? "dismissed"
                : current
            );

            setMessage(
              (current) =>
                current ||
                "Checkout closed. You can try again if you haven't completed payment."
            );
          },
        },

        theme: {
          color: "#4f46e5",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        console.error("Razorpay payment failed:", response.error);

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
      setMessage(error.message || "Unable to start payment.");
      setLoading(false);
    }
  };

  const statusStyles = {
    idle: "bg-gray-100 text-gray-700",
    initializing: "bg-indigo-50 text-indigo-700",
    checkout_open: "bg-indigo-50 text-indigo-700",
    verifying: "bg-amber-50 text-amber-700",
    success: "bg-emerald-50 text-emerald-700",
    dismissed: "bg-gray-100 text-gray-700",
    failed: "bg-red-50 text-red-700",
    error: "bg-red-50 text-red-700",
    verification_unknown: "bg-amber-50 text-amber-800",
  };

  const successful = paymentStatus === "success";
  const unsuccessful = ["failed", "error"].includes(paymentStatus);
  const pending = ["initializing", "checkout_open", "verifying"].includes(
    paymentStatus
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <Link
        to="/"
        className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-brand"
      >
        <ArrowLeft size={18} />
        Back to Cartiva
      </Link>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="bg-brand px-6 py-8 text-white sm:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/15 p-3">
              <CreditCard size={26} />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-100">
                CARTIVA CHECKOUT
              </p>
              <h1 className="mt-1 text-2xl font-extrabold">
                Payment test
              </h1>
            </div>
          </div>

          <p className="mt-4 max-w-lg text-sm leading-6 text-indigo-100">
            Test the Razorpay checkout integration and verify payment
            confirmation with the Cartiva backend.
          </p>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Cartiva order ID
            </p>
            <p className="mt-2 break-all font-mono text-sm text-gray-800">
              {orderId}
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-gray-700">
              Payment status
            </p>
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${statusStyles[paymentStatus] || statusStyles.idle}`}
              role="status"
              aria-live="polite"
            >
              {pending && <LoaderCircle size={16} className="animate-spin" />}
              {successful && <CheckCircle2 size={16} />}
              {unsuccessful && <CircleAlert size={16} />}
              {paymentStatus.replaceAll("_", " ")}
            </div>
          </div>

          {message && (
            <div
              role="status"
              aria-live="polite"
              className={`rounded-xl border p-4 text-sm leading-6 ${
                successful
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : unsuccessful
                    ? "border-red-200 bg-red-50 text-red-800"
                    : "border-gray-200 bg-gray-50 text-gray-700"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="button"
            onClick={handlePayment}
            disabled={loading || successful}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 font-bold text-white transition hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <LoaderCircle size={19} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard size={19} />
                {successful ? "Payment confirmed" : "Pay now / Retry"}
              </>
            )}
          </button>

          <div className="flex items-start gap-3 border-t border-gray-100 pt-5">
            <ShieldCheck
              size={21}
              className="mt-0.5 shrink-0 text-emerald-600"
            />
            <p className="text-xs leading-5 text-gray-500">
              Payment confirmation is verified by the Cartiva backend.
              If verification is uncertain, check the order status before
              attempting another payment.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PaymentTest;
