
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";

function Home() {
    return (
        <main className="home">
            <nav className="navbar">
                <Link to="/" className="brand">
                    <ShoppingBag size={26} />
                    <span>Cartiva</span>
                </Link>

                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/products">Products</Link>
                    <Link to="/payment-test">Payment Test</Link>
                </div>
            </nav>

            <section className="hero">
                <p className="eyebrow">YOUR EVERYDAY SHOPPING DESTINATION</p>
                <h1>Find your next <span>favorite.</span></h1>
                <p className="hero-description">
                    Discover products you love with a shopping experience
                    designed to keep things simple.
                </p>

                <Link to="/products" className="shop-button">
                    Explore Products <ArrowRight size={18} />
                </Link>
            </section>

            <footer className="footer">
                © {new Date().getFullYear()} Cartiva. Built for better shopping.
            </footer>
        </main>
    );
}

export default Home;
