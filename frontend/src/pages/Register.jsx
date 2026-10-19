import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRules = [
    {
      label: "At least 8 characters",
      valid: form.password.length >= 8,
    },
    {
      label: "One uppercase letter (A-Z)",
      valid: /[A-Z]/.test(form.password),
    },
    {
      label: "One lowercase letter (a-z)",
      valid: /[a-z]/.test(form.password),
    },
    {
      label: "One number (0-9)",
      valid: /[0-9]/.test(form.password),
    },
    {
      label: "One special character (@, #, !, etc.)",
      valid: /[^A-Za-z0-9\s]/.test(form.password),
    },
  ];

  const passwordsMatch =
    form.confirmPassword.length > 0 &&
    form.password === form.confirmPassword;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const passwordIsValid = passwordRules.every((rule) => rule.valid);

    if (!passwordIsValid) {
      setError("Please meet all the password requirements.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    setLoading(true);

    try {
      // Confirm password is for frontend validation only.
      // Do not send it to the backend.
      const { confirmPassword, ...registrationData } = form;

      await register(registrationData);

      navigate("/login", {
        replace: true,
        state: {
          message: "Registration successful! Please log in.",
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.message ||
          err.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-slate-50 px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8"
      >
        <Link
          to="/"
          className="mb-6 block text-center text-3xl font-extrabold text-brand"
        >
          Cartiva.
        </Link>

        <h1 className="text-center text-2xl font-bold text-gray-900">
          Create your account
        </h1>

        <p className="mt-2 text-center text-sm text-gray-500">
          Join Cartiva and start shopping.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-6 space-y-5">
          {/* Full name */}
          <div>
            <label
              htmlFor="register-name"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Full name
            </label>

            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              minLength={2}
              maxLength={50}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="register-email"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Email address
            </label>

            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="register-password"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="register-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                required
                aria-describedby="password-requirements"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 outline-none transition focus:border-brand focus:ring-2 focus:ring-indigo-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-gray-500 transition hover:text-brand focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {/* Live password requirements */}
            <div
              id="password-requirements"
              className="mt-3 rounded-lg bg-slate-50 p-3"
            >
              <p className="mb-2 text-xs font-semibold text-gray-700">
                Password requirements
              </p>

              <ul className="space-y-2">
                {passwordRules.map((rule) => (
                  <li
                    key={rule.label}
                    className={`flex items-center gap-2 text-xs ${
                      rule.valid ? "text-emerald-700" : "text-gray-500"
                    }`}
                  >
                    {rule.valid ? (
                      <Check size={14} aria-hidden="true" />
                    ) : (
                      <span className="flex h-3.5 w-3.5 items-center justify-center">
                        <span className="h-1 w-1 rounded-full bg-current" />
                      </span>
                    )}

                    {rule.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label
              htmlFor="register-confirm-password"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Confirm password
            </label>

            <div className="relative">
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                aria-invalid={
                  form.confirmPassword.length > 0 &&
                  form.password !== form.confirmPassword
                }
                aria-describedby="confirm-password-status"
                className={`w-full rounded-lg border px-4 py-3 pr-12 outline-none transition focus:ring-2 ${
                  form.confirmPassword.length > 0 &&
                  form.password !== form.confirmPassword
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : passwordsMatch
                      ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100"
                      : "border-gray-300 focus:border-brand focus:ring-indigo-100"
                }`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((previous) => !previous)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                aria-pressed={showConfirmPassword}
                className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-gray-500 transition hover:text-brand focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {form.confirmPassword.length > 0 && (
              <p
                id="confirm-password-status"
                aria-live="polite"
                className={`mt-2 flex items-center gap-1 text-xs ${
                  passwordsMatch ? "text-emerald-700" : "text-red-600"
                }`}
              >
                {passwordsMatch ? (
                  <>
                    <Check size={14} />
                    Passwords match.
                  </>
                ) : (
                  <>
                    <X size={14} />
                    Passwords do not match.
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-7 w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-brand hover:underline"
          >
            Log in
          </Link>
        </p>
      </form>
    </section>
  );
}

export default Register;
