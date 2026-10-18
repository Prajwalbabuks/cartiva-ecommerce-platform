
import { ShoppingBag, Tag } from "lucide-react";

function ProductCard({ product }) {
    const imageValue = product.images?.[0];
    const imageUrl =
        typeof imageValue === "string"
            ? imageValue
            : imageValue?.url || imageValue?.secure_url;

    const discount = Number(product.discount) || 0;
    const price = Number(product.price) || 0;
    const finalPrice = price * (1 - discount / 100);

    return (
        <article className="product-card">
            <div className="product-image">
                {imageUrl ? (
                    <img src={imageUrl} alt={product.name} loading="lazy" />
                ) : (
                    <div className="product-image-placeholder">
                        <ShoppingBag size={36} />
                        <span>No image available</span>
                    </div>
                )}

                {discount > 0 && (
                    <span className="discount-badge">
                        <Tag size={13} />
                        {discount}% OFF
                    </span>
                )}
            </div>

            <div className="product-info">
                {product.category?.name && (
                    <p className="product-category">
                        {product.category.name}
                    </p>
                )}

                <h2 className="product-name">{product.name}</h2>

                {product.brand && (
                    <p className="product-brand">{product.brand}</p>
                )}

                <div className="product-prices">
                    <span className="product-current-price">
                        ₹{finalPrice.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                        })}
                    </span>

                    {discount > 0 && (
                        <span className="product-original-price">
                            ₹{price.toLocaleString("en-IN", {
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    )}
                </div>

                <p className={product.stock > 0 ? "stock-available" : "stock-unavailable"}>
                    {product.stock > 0 ? "In stock" : "Out of stock"}
                </p>
            </div>
        </article>
    );
}

export default ProductCard;
