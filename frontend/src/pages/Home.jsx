
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center px-5 py-16 sm:px-8 lg:px-12">
      <div className="w-full">
        <p className="mb-5 text-sm font-bold tracking-[0.2em] text-brand">
          WELCOME TO CARTIVA
        </p>

        <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-7xl">
          Shopping made{" "}
          <span className="text-brand">simple.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
          Discover products you love with a seamless and secure
          shopping experience.
        </p>

        <div className="mt-9 flex flex-wrap gap-4">
          <Link
            to="/products"
            className="rounded-lg bg-brand px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-hover"
          >
            Explore Products
          </Link>

          {!isAuthenticated && (
            <Link
              to="/register"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Create Account
            </Link>
          )}
        </div>

        {isAuthenticated && (
          <p className="mt-8 text-sm font-medium text-emerald-700">
            Welcome back, {user?.name || "User"}!
          </p>
        )}

        <div className="mt-16 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              title: "Easy shopping",
              description: "Browse products in one place.",
            },
            {
              title: "Secure access",
              description: "Sign in to your account.",
            },
            {
              title: "Simple checkout",
              description: "A smooth shopping experience.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h2 className="font-bold text-gray-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Home;
