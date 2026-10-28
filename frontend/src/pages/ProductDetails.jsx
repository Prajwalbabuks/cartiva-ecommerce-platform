
import { useCallback, useEffect, useState } from "react";
import {
    Link,
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle,
    Package,
    RefreshCw,
    ShoppingBag,
    Tag,
    Star,
    Send,
    Pencil,
    Trash2,
    MessageSquare,
} from "lucide-react";

import { getProductById } from "../services/product.service";
import {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview,
} from "../services/review.service";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const buttonPrimary =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50";

const buttonSecondary =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

const StarRating = ({ rating = 0, size = 18 }) => (
    <div
        className="inline-flex items-center gap-0.5"
        aria-label={`${Number(rating).toFixed(1)} out of 5 stars`}
    >
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                size={size}
                className={
                    star <= Math.round(Number(rating))
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                }
            />
        ))}
    </div>
);

const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

function ProductDetails() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const { user, isAuthenticated } = useAuth();
    const { addItem } = useCart();

    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [error, setError] = useState("");
    const [cartMessage, setCartMessage] = useState("");
    const [cartError, setCartError] = useState("");

    // Reviews
    const [reviews, setReviews] = useState([]);
    const [ratingSummary, setRatingSummary] = useState({
        average: 0,
        count: 0,
    });
    const [reviewPage, setReviewPage] = useState(1);
    const [totalReviewPages, setTotalReviewPages] = useState(1);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [reviewsError, setReviewsError] = useState("");

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewMessage, setReviewMessage] = useState("");
    const [reviewError, setReviewError] = useState("");
    const [deletingReviewId, setDeletingReviewId] = useState(null);

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

    const fetchReviews = useCallback(async () => {
        setReviewsLoading(true);
        setReviewsError("");

        try {
            const response = await getProductReviews(productId, {
                page: reviewPage,
                limit: 10,
            });

            if (!response.success) {
                throw new Error("Unable to load reviews.");
            }

            // Supports the response shape returned by our review service:
            // { success: true, data: { reviews, pagination, rating } }
            const result = response.data;

            setReviews(result?.reviews || []);
            setRatingSummary(
                result?.rating || { average: 0, count: 0 }
            );
            setTotalReviewPages(
                Math.max(1, result?.pagination?.totalPages || 1)
            );
        } catch (err) {
            setReviews([]);
            setReviewsError(
                err.response?.data?.message ||
                    err.message ||
                    "Unable to load product reviews."
            );
        } finally {
            setReviewsLoading(false);
        }
    }, [productId, reviewPage]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleAddToCart = async () => {
        setCartMessage("");
        setCartError("");

        if (!isAuthenticated) {
            navigate("/login", {
                state: {
                    from: location,
                    message: "Please log in to add products to your cart.",
                },
            });
            return;
        }

        if (!product || Number(product.stock) <= 0) {
            setCartError("This product is currently out of stock.");
            return;
        }

        setAddingToCart(true);

        try {
            await addItem(product._id, 1);
            setCartMessage("Product added to your cart successfully.");
        } catch (err) {
            setCartError(
                err.response?.data?.message ||
                    err.message ||
                    "Unable to add this product to your cart."
            );
        } finally {
            setAddingToCart(false);
        }
    };

    const handleSubmitReview = async (event) => {
        event.preventDefault();

        setReviewMessage("");
        setReviewError("");

        if (!isAuthenticated) {
            navigate("/login", {
                state: {
                    from: location,
                    message: "Please log in to write a review.",
                },
            });
            return;
        }

        setSubmittingReview(true);

        try {
            const reviewData = {
                rating: Number(rating),
                comment: comment.trim(),
            };

            if (editingReviewId) {
                await updateReview(editingReviewId, reviewData);
                setReviewMessage("Your review was updated.");
            } else {
                await createReview({
                    productId,
                    ...reviewData,
                });
                setReviewMessage("Your review was submitted successfully.");
            }

            setRating(5);
            setComment("");
            setEditingReviewId(null);
            setReviewPage(1);

            // Refresh the list and rating summary after a mutation.
            const response = await getProductReviews(productId, {
                page: 1,
                limit: 10,
            });

            const result = response.data;

            setReviews(result?.reviews || []);
            setRatingSummary(
                result?.rating || { average: 0, count: 0 }
            );
            setTotalReviewPages(
                Math.max(1, result?.pagination?.totalPages || 1)
            );
        } catch (err) {
            setReviewError(
                err.response?.data?.message ||
                    err.message ||
                    "Unable to submit your review."
            );
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleEditReview = (review) => {
        setEditingReviewId(review._id);
        setRating(review.rating);
        setComment(review.comment || "");
        setReviewMessage("");
        setReviewError("");

        document
            .getElementById("review-form")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const handleCancelEdit = () => {
        setEditingReviewId(null);
        setRating(5);
        setComment("");
        setReviewMessage("");
        setReviewError("");
    };

    const handleDeleteReview = async (reviewId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this review?"
        );

        if (!confirmed) return;

        setDeletingReviewId(reviewId);
        setReviewMessage("");
        setReviewError("");

        try {
            await deleteReview(reviewId);
            setReviewMessage("Your review was deleted.");

            // Refresh the current page. If its last review was removed,
            // move back one page when necessary.
            const response = await getProductReviews(productId, {
                page: reviewPage,
                limit: 10,
            });

            const result = response.data;
            const pages = Math.max(
                1,
                result?.pagination?.totalPages || 1
            );

            if (reviewPage > pages) {
                setReviewPage(pages);
            } else {
                setReviews(result?.reviews || []);
                setRatingSummary(
                    result?.rating || { average: 0, count: 0 }
                );
                setTotalReviewPages(pages);
            }
        } catch (err) {
            setReviewError(
                err.response?.data?.message ||
                    err.message ||
                    "Unable to delete your review."
            );
        } finally {
            setDeletingReviewId(null);
        }
    };

    if (loading) {
        return (
            <main
                role="status"
                className="flex min-h-96 flex-col items-center justify-center gap-4 px-4 text-gray-500"
            >
                <RefreshCw size={28} className="animate-spin text-brand" />
                <p>Loading product details...</p>
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="mx-auto flex min-h-96 max-w-xl flex-col items-center justify-center px-5 py-12 text-center">
                <Package size={44} className="text-gray-400" />

                <h1 className="mt-4 text-2xl font-bold text-gray-900">
                    Product unavailable
                </h1>

                <p className="mt-2 text-gray-500">
                    {error || "This product could not be found."}
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                        type="button"
                        className={buttonPrimary}
                        onClick={fetchProduct}
                    >
                        <RefreshCw size={17} />
                        Try again
                    </button>

                    <Link to="/products" className={buttonSecondary}>
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
    const discount = Math.min(
        100,
        Math.max(0, Number(product.discount) || 0)
    );
    const finalPrice = price * (1 - discount / 100);
    const inStock = Number(product.stock) > 0;

    const formattedPrice = (value) =>
        value.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    // Adjust this comparison if your JWT stores the user ID under a
    // different field or your API returns a different user shape.
    const currentUserId = user?._id || user?.id || null;

    return (
        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <Link
                to="/products"
                className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-brand"
            >
                <ArrowLeft size={18} />
                Back to products
            </Link>

            <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">
                {/* Product image gallery */}
                <div className="min-w-0">
                    <div className="relative flex aspect-square max-h-[620px] items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 sm:p-10">
                        {images.length > 0 ? (
                            <img
                                src={images[selectedImage]}
                                alt={product.name}
                                className="h-full w-full object-contain"
                                onError={(event) => {
                                    event.currentTarget.style.visibility =
                                        "hidden";
                                }}
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-gray-400">
                                <ShoppingBag size={54} />
                                <span className="text-sm">
                                    No product image available
                                </span>
                            </div>
                        )}

                        {discount > 0 && (
                            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-sm font-bold text-red-700">
                                <Tag size={14} />
                                {discount}% OFF
                            </span>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="mt-4 flex flex-wrap gap-3">
                            {images.map((image, index) => (
                                <button
                                    type="button"
                                    key={`${image}-${index}`}
                                    onClick={() => setSelectedImage(index)}
                                    aria-label={`View image ${index + 1}`}
                                    aria-pressed={selectedImage === index}
                                    className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-2 bg-white p-2 transition ${
                                        selectedImage === index
                                            ? "border-brand ring-2 ring-indigo-100"
                                            : "border-gray-200 hover:border-gray-400"
                                    }`}
                                >
                                    <img
                                        src={image}
                                        alt=""
                                        className="h-full w-full object-contain"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product information */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
                    {product.category?.name && (
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand">
                            {product.category.name}
                        </p>
                    )}

                    <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-3xl">
                        {product.name}
                    </h1>

                    {product.brand && (
                        <p className="mt-3 text-sm text-gray-500">
                            Brand:{" "}
                            <span className="font-semibold text-gray-800">
                                {product.brand}
                            </span>
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={() =>
                            document
                                .getElementById("product-reviews")
                                ?.scrollIntoView({ behavior: "smooth" })
                        }
                        className="mt-4 flex items-center gap-2 text-sm hover:underline"
                    >
                        <StarRating rating={ratingSummary.average} size={16} />
                        <span className="font-semibold text-gray-800">
                            {Number(ratingSummary.average).toFixed(1)}
                        </span>
                        <span className="text-gray-500">
                            ({ratingSummary.count} reviews)
                        </span>
                    </button>

                    <div className="mt-6 flex flex-wrap items-baseline gap-3">
                        <span className="text-3xl font-extrabold text-gray-900">
                            ₹{formattedPrice(finalPrice)}
                        </span>

                        {discount > 0 && (
                            <span className="text-lg text-gray-400 line-through">
                                ₹{price.toLocaleString("en-IN")}
                            </span>
                        )}
                    </div>

                    {discount > 0 && (
                        <p className="mt-2 text-sm font-semibold text-emerald-700">
                            You save ₹{formattedPrice(price - finalPrice)}
                        </p>
                    )}

                    <div
                        className={`mt-6 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${
                            inStock
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                        }`}
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${
                                inStock ? "bg-emerald-500" : "bg-red-500"
                            }`}
                        />
                        {inStock
                            ? `In stock — ${product.stock} available`
                            : "Currently out of stock"}
                    </div>

                    <div className="mt-8 border-t border-gray-200 pt-6">
                        <h2 className="text-lg font-bold text-gray-900">
                            Product description
                        </h2>

                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
                            {product.description ||
                                "No description is available for this product."}
                        </p>
                    </div>

                    {product.sku && (
                        <p className="mt-5 text-sm text-gray-500">
                            SKU:{" "}
                            <span className="font-medium text-gray-700">
                                {product.sku}
                            </span>
                        </p>
                    )}

                    {cartMessage && (
                        <div
                            role="status"
                            className="mt-5 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"
                        >
                            <CheckCircle
                                size={18}
                                className="mt-0.5 shrink-0"
                            />
                            <div className="flex-1">{cartMessage}</div>
                            <Link
                                to="/cart"
                                className="shrink-0 font-bold underline"
                            >
                                View cart
                            </Link>
                        </div>
                    )}

                    {cartError && (
                        <p
                            role="alert"
                            className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                        >
                            {cartError}
                        </p>
                    )}

                    <button
                        type="button"
                        className={`${buttonPrimary} mt-7 w-full`}
                        disabled={!inStock || addingToCart}
                        onClick={handleAddToCart}
                    >
                        <ShoppingBag size={18} />
                        {!inStock
                            ? "Out of stock"
                            : addingToCart
                              ? "Adding to cart..."
                              : "Add to cart"}
                    </button>

                    <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                        Your cart is saved to your Cartiva account.
                    </p>
                </div>
            </section>

            {/* Reviews section */}
            <section
                id="product-reviews"
                className="mt-12 scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
            >
                <div className="flex flex-col gap-5 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-brand">
                            CUSTOMER FEEDBACK
                        </p>
                        <h2 className="mt-1 text-2xl font-extrabold text-gray-900">
                            Ratings & reviews
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            See what customers think about this product.
                        </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4 text-center">
                        <p className="text-3xl font-extrabold text-gray-900">
                            {Number(ratingSummary.average).toFixed(1)}
                            <span className="text-base text-gray-400">/5</span>
                        </p>
                        <StarRating rating={ratingSummary.average} />
                        <p className="mt-1 text-xs text-gray-500">
                            {ratingSummary.count} reviews
                        </p>
                    </div>
                </div>

                {/* Review form */}
                <div className="mt-7 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={20} className="text-brand" />
                        <h3 className="text-lg font-bold text-gray-900">
                            {editingReviewId ? "Edit your review" : "Write a review"}
                        </h3>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                        Only customers with a qualifying paid purchase can submit a review.
                    </p>

                    {reviewMessage && (
                        <p
                            role="status"
                            className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"
                        >
                            {reviewMessage}
                        </p>
                    )}

                    {reviewError && (
                        <p
                            role="alert"
                            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                        >
                            {reviewError}
                        </p>
                    )}

                    <form
                        id="review-form"
                        onSubmit={handleSubmitReview}
                        className="mt-5 space-y-5"
                    >
                        <fieldset>
                            <legend className="mb-2 text-sm font-semibold text-gray-800">
                                Your rating
                            </legend>

                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setRating(value)}
                                        aria-label={`Rate ${value} out of 5`}
                                        aria-pressed={rating === value}
                                        className="rounded-md p-1 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand"
                                    >
                                        <Star
                                            size={30}
                                            className={
                                                value <= rating
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-gray-300"
                                            }
                                        />
                                    </button>
                                ))}
                                <span className="ml-2 text-sm font-semibold text-gray-700">
                                    {rating}/5
                                </span>
                            </div>
                        </fieldset>

                        <div>
                            <label
                                htmlFor="review-comment"
                                className="mb-2 block text-sm font-semibold text-gray-800"
                            >
                                Your comments
                            </label>

                            <textarea
                                id="review-comment"
                                value={comment}
                                onChange={(event) =>
                                    setComment(event.target.value)
                                }
                                maxLength={1000}
                                rows={4}
                                placeholder="Share your experience with this product..."
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-indigo-100"
                            />

                            <p className="mt-1 text-right text-xs text-gray-500">
                                {comment.length}/1000
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="submit"
                                disabled={submittingReview}
                                className={buttonPrimary}
                            >
                                <Send size={16} />
                                {submittingReview
                                    ? "Submitting..."
                                    : editingReviewId
                                      ? "Save changes"
                                      : "Submit review"}
                            </button>

                            {editingReviewId && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className={buttonSecondary}
                                >
                                    Cancel edit
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Review list */}
                <div className="mt-8">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <h3 className="text-lg font-bold text-gray-900">
                            Customer reviews
                        </h3>

                        <button
                            type="button"
                            onClick={fetchReviews}
                            disabled={reviewsLoading}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline disabled:opacity-50"
                        >
                            <RefreshCw
                                size={15}
                                className={reviewsLoading ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>
                    </div>

                    {reviewsLoading ? (
                        <div
                            role="status"
                            className="flex items-center justify-center gap-3 py-12 text-sm text-gray-500"
                        >
                            <RefreshCw
                                size={20}
                                className="animate-spin text-brand"
                            />
                            Loading reviews...
                        </div>
                    ) : reviewsError ? (
                        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                            {reviewsError}
                            <button
                                type="button"
                                onClick={fetchReviews}
                                className="ml-2 font-bold underline"
                            >
                                Try again
                            </button>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center">
                            <MessageSquare
                                size={32}
                                className="mx-auto text-gray-400"
                            />
                            <p className="mt-3 font-semibold text-gray-800">
                                No reviews yet
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                Be the first to share your experience after purchasing this product.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {reviews.map((review) => {
                                const reviewUserId =
                                    review.user?._id || review.user;

                                const isOwner =
                                    currentUserId &&
                                    String(reviewUserId) ===
                                        String(currentUserId);

                                return (
                                    <article
                                        key={review._id}
                                        className="py-6 first:pt-0 last:pb-0"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-50 text-sm font-bold text-brand">
                                                {review.user?.avatar ? (
                                                    <img
                                                        src={review.user.avatar}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    (
                                                        review.user?.name ||
                                                        "Customer"
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase()
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div>
                                                        <p className="font-bold text-gray-900">
                                                            {review.user?.name ||
                                                                "Customer"}
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {formatDate(
                                                                review.createdAt
                                                            )}
                                                            {review.updatedAt &&
                                                                review.createdAt !==
                                                                    review.updatedAt &&
                                                                " · Edited"}
                                                        </p>
                                                    </div>

                                                    {isOwner && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEditReview(
                                                                        review
                                                                    )
                                                                }
                                                                aria-label="Edit review"
                                                                className="rounded-lg p-2 text-gray-500 transition hover:bg-indigo-50 hover:text-brand"
                                                            >
                                                                <Pencil
                                                                    size={16}
                                                                />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteReview(
                                                                        review._id
                                                                    )
                                                                }
                                                                disabled={
                                                                    deletingReviewId ===
                                                                    review._id
                                                                }
                                                                aria-label="Delete review"
                                                                className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                                            >
                                                                {deletingReviewId ===
                                                                review._id ? (
                                                                    <RefreshCw
                                                                        size={16}
                                                                        className="animate-spin"
                                                                    />
                                                                ) : (
                                                                    <Trash2
                                                                        size={16}
                                                                    />
                                                                )}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-2">
                                                    <StarRating
                                                        rating={review.rating}
                                                        size={16}
                                                    />
                                                </div>

                                                {review.comment && (
                                                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
                                                        {review.comment}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    {!reviewsLoading &&
                        !reviewsError &&
                        totalReviewPages > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-4">
                                <button
                                    type="button"
                                    className={buttonSecondary}
                                    disabled={reviewPage <= 1}
                                    onClick={() =>
                                        setReviewPage((page) =>
                                            Math.max(1, page - 1)
                                        )
                                    }
                                >
                                    Previous
                                </button>

                                <span className="text-sm text-gray-600">
                                    Page {reviewPage} of {totalReviewPages}
                                </span>

                                <button
                                    type="button"
                                    className={buttonSecondary}
                                    disabled={reviewPage >= totalReviewPages}
                                    onClick={() =>
                                        setReviewPage((page) =>
                                            Math.min(
                                                totalReviewPages,
                                                page + 1
                                            )
                                        )
                                    }
                                >
                                    Next
                                </button>
                            </div>
                        )}
                </div>
            </section>
        </main>
    );
}

export default ProductDetails;
