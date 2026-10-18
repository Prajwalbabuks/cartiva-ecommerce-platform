
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form);
      navigate("/login", {
        replace: true,
        state: { message: "Registration successful! Please log in." },
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
          <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="register-name" className="mb-2 block text-sm font-semibold text-gray-700">
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
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label htmlFor="register-email" className="mb-2 block text-sm font-semibold text-gray-700">
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

          <div>
            <label htmlFor="register-password" className="mb-2 block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-indigo-100"
            />
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
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </section>
  );
}

export default Register;
