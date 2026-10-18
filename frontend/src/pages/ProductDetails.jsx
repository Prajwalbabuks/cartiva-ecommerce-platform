
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Package,
    RefreshCw,
    ShoppingBag,
    Tag,
} from "lucide-react";

import { getProductById } from "../services/product.service";

function ProductDetails() {
    const { productId } = useParams();

    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchProduct = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getProductById(productId);

            if (!data.success || !data.product) {
                throw new Error("Product could not be found.");
            }

            setProduct(data.product);
            setSelectedImage(0);
        } catch (err) {
            setProduct(null);
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load this product."
            );
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    if (loading) {
        return (
            <main className="product-detail-message" role="status">
                <RefreshCw size={26} className="loading-icon" />
                <p>Loading product details...</p>
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="product-detail-message">
                <Package size={42} />
                <h1>Product unavailable</h1>
                <p>{error || "This product could not be found."}</p>

                <div className="detail-actions">
                    <button
                        type="button"
                        className="detail-primary-button"
                        onClick={fetchProduct}
                    >
                        <RefreshCw size={17} />
                        Try again
                    </button>

                    <Link to="/products" className="detail-secondary-button">
                        Back to products
                    </Link>
                </div>
            </main>
        );
    }

    const images = (product.images || [])
        .map((image) =>
            typeof image === "string"
                ? image
                : image?.url || image?.secure_url
        )
        .filter(Boolean);

    const price = Number(product.price) || 0;
    const discount = Number(product.discount) || 0;
    const finalPrice = price * (1 - discount / 100);
    const inStock = Number(product.stock) > 0;

    return (
        <main className="product-detail-page">
            <Link to="/products" className="back-to-products">
                <ArrowLeft size={18} />
                Back to products
            </Link>

            <section className="product-detail">
                <div className="detail-gallery">
                    <div className="detail-main-image">
                        {images.length > 0 ? (
                            <img
                                src={images[selectedImage]}
                                alt={product.name}
                                onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                }}
                            />
                        ) : (
                            <div className="detail-image-placeholder">
                                <ShoppingBag size={54} />
                                <span>No product image available</span>
                            </div>
                        )}

                        {discount > 0 && (
                            <span className="detail-discount-badge">
                                <Tag size={14} />
                                {discount}% OFF
                            </span>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="detail-thumbnails">
                            {images.map((image, index) => (
                                <button
                                    type="button"
                                    key={`${image}-${index}`}
                                    className={
                                        selectedImage === index
                                            ? "detail-thumbnail active"
                                            : "detail-thumbnail"
                                    }
                                    onClick={() => setSelectedImage(index)}
                                    aria-label={`View image ${index + 1}`}
                                    aria-pressed={selectedImage === index}
                                >
                                    <img src={image} alt="" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="detail-information">
                    {product.category?.name && (
                        <p className="detail-category">
                            {product.category.name}
                        </p>
                    )}

                    <h1>{product.name}</h1>

                    {product.brand && (
                        <p className="detail-brand">
                            Brand: <strong>{product.brand}</strong>
                        </p>
                    )}

                    <div className="detail-price">
                        <span className="detail-current-price">
                            ₹{finalPrice.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>

                        {discount > 0 && (
                            <span className="detail-original-price">
                                ₹{price.toLocaleString("en-IN")}
                            </span>
                        )}
                    </div>

                    {discount > 0 && (
                        <p className="detail-savings">
                            You save ₹{(price - finalPrice).toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </p>
                    )}

                    <div
                        className={
                            inStock
                                ? "detail-stock in-stock"
                                : "detail-stock out-of-stock"
                        }
                    >
                        <span className="stock-dot" />
                        {inStock
                            ? `In stock — ${product.stock} available`
                            : "Currently out of stock"}
                    </div>

                    <div className="detail-description">
                        <h2>Product description</h2>
                        <p>
                            {product.description ||
                                "No description is available for this product."}
                        </p>
                    </div>

                    {product.sku && (
                        <p className="detail-sku">
                            SKU: {product.sku}
                        </p>
                    )}

                    <div className="detail-actions">
                        <button
                            type="button"
                            className="detail-primary-button"
                            disabled={!inStock}
                            onClick={() => {
                                window.alert(
                                    "Cart functionality is coming in the next milestone."
                                );
                            }}
                        >
                            <ShoppingBag size={18} />
                            {inStock ? "Add to cart" : "Out of stock"}
                        </button>
                    </div>

                    <p className="detail-note">
                        Secure checkout with Cartiva's payment integration.
                    </p>
                </div>
            </section>
        </main>
    );
}

export default ProductDetails;
