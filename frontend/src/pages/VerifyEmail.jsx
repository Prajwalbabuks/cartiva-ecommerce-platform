
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import {
    verifyEmail,
    resendVerificationOTP,
} from "../services/auth.service";

function VerifyEmail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const email = searchParams.get("email") || "";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const [timeLeft, setTimeLeft] = useState(600);
    const [resendCooldown, setResendCooldown] = useState(60);

    const inputRefs = useRef([]);

    // OTP expiry countdown
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((previous) => Math.max(0, previous - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Resend cooldown
    useEffect(() => {
        if (resendCooldown <= 0) return;

        const timer = setInterval(() => {
            setResendCooldown((previous) =>
                Math.max(0, previous - 1)
            );
        }, 1000);

        return () => clearInterval(timer);
    }, [resendCooldown]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };

    const handleOTPChange = (index, value) => {
        const digit = value.replace(/\D/g, "").slice(-1);

        setOtp((previous) => {
            const updated = [...previous];
            updated[index] = digit;
            return updated;
        });

        setError("");
        setSuccess("");

        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, event) => {
        if (
            event.key === "Backspace" &&
            !otp[index] &&
            index > 0
        ) {
            inputRefs.current[index - 1]?.focus();
        }

        if (event.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        if (event.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (event) => {
        event.preventDefault();

        const pastedValue = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);

        if (!pastedValue) return;

        const updated = Array.from(
            { length: 6 },
            (_, index) => pastedValue[index] || ""
        );

        setOtp(updated);
        setError("");
        setSuccess("");

        const nextIndex = Math.min(pastedValue.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleVerify = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const enteredOTP = otp.join("");

        if (enteredOTP.length !== 6) {
            setError("Please enter the complete 6-digit OTP.");
            return;
        }

        if (timeLeft === 0) {
            setError("Your OTP has expired. Please request a new one.");
            return;
        }

        setLoading(true);

        try {
            const response = await verifyEmail(email, enteredOTP);

            setSuccess(
                response.message || "Email verified successfully!"
            );

            setTimeout(() => {
                navigate("/login", {
                    replace: true,
                    state: {
                        message:
                            "Email verified successfully! You can now log in.",
                    },
                });
            }, 1200);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "OTP verification failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendCooldown > 0 || resending) return;

        setError("");
        setSuccess("");
        setResending(true);

        try {
            const response = await resendVerificationOTP(email);

            setOtp(["", "", "", "", "", ""]);
            setTimeLeft(600);
            setResendCooldown(60);

            setSuccess(
                response.message || "A new OTP has been sent to your email."
            );

            inputRefs.current[0]?.focus();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to resend OTP. Please try again."
            );
        } finally {
            setResending(false);
        }
    };

    if (!email) {
        return (
            <section className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-slate-50 px-4 py-12">
                <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
                    <h1 className="text-xl font-bold text-gray-900">
                        Email address missing
                    </h1>

                    <p className="mt-3 text-sm text-gray-500">
                        Please register first to verify your email address.
                    </p>

                    <Link
                        to="/register"
                        className="mt-6 inline-block rounded-lg bg-brand px-5 py-3 font-semibold text-white transition hover:bg-brand-hover"
                    >
                        Go to Register
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-slate-50 px-4 py-12">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">

                <Link
                    to="/"
                    className="block text-center text-3xl font-extrabold text-brand"
                >
                    Cartiva.
                </Link>

                <div className="mt-7 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-brand">
                        <Mail size={30} />
                    </div>
                </div>

                <h1 className="mt-5 text-center text-2xl font-bold text-gray-900">
                    Verify your email
                </h1>

                <p className="mt-2 text-center text-sm leading-6 text-gray-500">
                    We've sent a 6-digit verification code to
                </p>

                <p className="mt-1 break-all text-center text-sm font-semibold text-gray-800">
                    {email}
                </p>

                {error && (
                    <p
                        role="alert"
                        className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                    >
                        {error}
                    </p>
                )}

                {success && (
                    <p
                        role="status"
                        className="mt-5 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"
                    >
                        {success}
                    </p>
                )}

                <form onSubmit={handleVerify}>
                    <div className="mt-8 flex justify-center gap-2 sm:gap-3">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(element) => {
                                    inputRefs.current[index] = element;
                                }}
                                type="text"
                                inputMode="numeric"
                                autoComplete={
                                    index === 0 ? "one-time-code" : "off"
                                }
                                maxLength={1}
                                value={digit}
                                onChange={(event) =>
                                    handleOTPChange(index, event.target.value)
                                }
                                onKeyDown={(event) =>
                                    handleKeyDown(index, event)
                                }
                                onPaste={handlePaste}
                                aria-label={`OTP digit ${index + 1}`}
                                className="h-12 w-11 rounded-lg border border-gray-300 text-center text-xl font-bold text-gray-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-indigo-100 sm:h-14 sm:w-12"
                            />
                        ))}
                    </div>

                    <div className="mt-5 text-center">
                        <p className="text-sm text-gray-500">
                            {timeLeft > 0 ? (
                                <>
                                    OTP expires in{" "}
                                    <span className="font-semibold tabular-nums text-brand">
                                        {formatTime(timeLeft)}
                                    </span>
                                </>
                            ) : (
                                <span className="font-semibold text-red-600">
                                    OTP expired
                                </span>
                            )}
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || timeLeft === 0}
                        className="mt-7 w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Verifying..." : "Verify Email"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        Didn't receive the code?
                    </p>

                    <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resendCooldown > 0 || resending}
                        className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:text-brand-hover disabled:cursor-not-allowed disabled:text-gray-400"
                    >
                        <RefreshCw
                            size={15}
                            className={resending ? "animate-spin" : ""}
                        />

                        {resending
                            ? "Sending..."
                            : resendCooldown > 0
                                ? `Resend OTP in ${resendCooldown}s`
                                : "Resend OTP"}
                    </button>
                </div>

                <div className="mt-7 border-t border-gray-100 pt-5">
                    <Link
                        to="/register"
                        className="flex items-center justify-center gap-2 text-sm text-gray-500 transition hover:text-brand"
                    >
                        <ArrowLeft size={16} />
                        Back to registration
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default VerifyEmail;
