
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, TicketPercent, Save } from "lucide-react";

import {
    createAdminCoupon,
    getAdminCouponById,
    updateAdminCoupon,
} from "../../services/admin.service";

const initialForm = {
    code: "",
    discountPercentage: "",
    minOrderValue: 0,
    maxDiscount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    perUserLimit: 1,
    isActive: true,
};

const getDateValue = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "";

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const AdminCouponForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isEditMode) {
            fetchCoupon();
        }
    }, [id]);

    const fetchCoupon = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getAdminCouponById(id);

            const coupon =
                response.coupon ||
                response.data?.coupon ||
                response.data ||
                response;

            setFormData({
                code: coupon.code || "",
                discountPercentage: coupon.discountPercentage ?? "",
                minOrderValue: coupon.minOrderValue ?? 0,
                maxDiscount: coupon.maxDiscount ?? "",
                startDate: getDateValue(coupon.startDate),
                endDate: getDateValue(coupon.endDate),
                usageLimit: coupon.usageLimit ?? "",
                perUserLimit: coupon.perUserLimit ?? 1,
                isActive: coupon.isActive ?? true,
            });
        } catch (err) {
            console.error("Failed to fetch coupon:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load coupon details."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const discount = Number(formData.discountPercentage);
        const minimum = Number(formData.minOrderValue);
        const perUser = Number(formData.perUserLimit);

        if (!formData.code.trim()) {
            setError("Please enter a coupon code.");
            return;
        }

        if (!discount || discount < 1 || discount > 100) {
            setError("Discount percentage must be between 1 and 100.");
            return;
        }

        if (minimum < 0) {
            setError("Minimum order value cannot be negative.");
            return;
        }

        if (
            formData.maxDiscount !== "" &&
            Number(formData.maxDiscount) < 0
        ) {
            setError("Maximum discount cannot be negative.");
            return;
        }

        if (!formData.startDate || !formData.endDate) {
            setError("Please select both start and end dates.");
            return;
        }

        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            setError("End date must be on or after the start date.");
            return;
        }

        if (
            formData.usageLimit !== "" &&
            Number(formData.usageLimit) < 1
        ) {
            setError("Usage limit must be at least 1.");
            return;
        }

        if (!perUser || perUser < 1) {
            setError("Per-user limit must be at least 1.");
            return;
        }

        const couponData = {
            code: formData.code.trim().toUpperCase(),
            discountPercentage: discount,
            minOrderValue: minimum,
            maxDiscount:
                formData.maxDiscount === ""
                    ? null
                    : Number(formData.maxDiscount),
            startDate: new Date(
                `${formData.startDate}T00:00:00`
            ).toISOString(),
            endDate: new Date(
                `${formData.endDate}T23:59:59`
            ).toISOString(),
            usageLimit:
                formData.usageLimit === ""
                    ? null
                    : Number(formData.usageLimit),
            perUserLimit: perUser,
            isActive: formData.isActive,
        };

        try {
            setSaving(true);

            if (isEditMode) {
                await updateAdminCoupon(id, couponData);
            } else {
                await createAdminCoupon(couponData);
            }

            navigate("/admin/coupons");
        } catch (err) {
            console.error("Failed to save coupon:", err);

            setError(
                err.response?.data?.message ||
                "Unable to save coupon. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    const inputClass =
        "mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

    const labelClass =
        "block text-sm font-medium text-gray-700";

    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center">
                <p className="text-sm text-gray-500">
                    Loading coupon details...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <button
                        type="button"
                        onClick={() => navigate("/admin/coupons")}
                        className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600"
                    >
                        <ArrowLeft size={16} />
                        Back to Coupons
                    </button>

                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditMode ? "Edit Coupon" : "Add Coupon"}
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        {isEditMode
                            ? "Update the coupon details and settings."
                            : "Create a new discount coupon for your customers."}
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <form onSubmit={handleSubmit}>
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-gray-100 p-5">
                        <div className="rounded-lg bg-indigo-50 p-2.5">
                            <TicketPercent
                                size={22}
                                className="text-indigo-600"
                            />
                        </div>

                        <div>
                            <h2 className="font-semibold text-gray-900">
                                Coupon Information
                            </h2>
                            <p className="text-xs text-gray-500">
                                Enter the coupon details below.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6 p-5">
                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {/* Coupon Code and Discount */}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className={labelClass}>
                                    Coupon Code *
                                </label>

                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    placeholder="Example: WELCOME20"
                                    className={inputClass}
                                    required
                                    maxLength={30}
                                    style={{ textTransform: "uppercase" }}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Discount Percentage (%) *
                                </label>

                                <input
                                    type="number"
                                    name="discountPercentage"
                                    value={formData.discountPercentage}
                                    onChange={handleChange}
                                    placeholder="20"
                                    min="1"
                                    max="100"
                                    className={inputClass}
                                    required
                                />
                            </div>
                        </div>

                        {/* Order Values */}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className={labelClass}>
                                    Minimum Order Value (₹)
                                </label>

                                <input
                                    type="number"
                                    name="minOrderValue"
                                    value={formData.minOrderValue}
                                    onChange={handleChange}
                                    min="0"
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Maximum Discount (₹)
                                </label>

                                <input
                                    type="number"
                                    name="maxDiscount"
                                    value={formData.maxDiscount}
                                    onChange={handleChange}
                                    min="0"
                                    placeholder="Leave empty for no limit"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* Validity */}
                        <div>
                            <h3 className="mb-3 text-sm font-semibold text-gray-800">
                                Coupon Validity
                            </h3>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className={labelClass}>
                                        Start Date *
                                    </label>

                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className={inputClass}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        End Date *
                                    </label>

                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        min={formData.startDate || undefined}
                                        className={inputClass}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Usage Settings */}
                        <div>
                            <h3 className="mb-3 text-sm font-semibold text-gray-800">
                                Usage Settings
                            </h3>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className={labelClass}>
                                        Total Usage Limit
                                    </label>

                                    <input
                                        type="number"
                                        name="usageLimit"
                                        value={formData.usageLimit}
                                        onChange={handleChange}
                                        min="1"
                                        placeholder="Leave empty for unlimited"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Per User Limit *
                                    </label>

                                    <input
                                        type="number"
                                        name="perUserLimit"
                                        value={formData.perUserLimit}
                                        onChange={handleChange}
                                        min="1"
                                        className={inputClass}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="rounded-lg border border-gray-200 p-4">
                            <label className="flex cursor-pointer items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">
                                        Coupon Status
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Enable or disable this coupon.
                                    </p>
                                </div>

                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="h-5 w-5 cursor-pointer rounded border-gray-300 accent-indigo-600"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col-reverse gap-3 border-t border-gray-100 p-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/coupons")}
                            disabled={saving}
                            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save size={16} />
                            {saving
                                ? "Saving..."
                                : isEditMode
                                    ? "Update Coupon"
                                    : "Create Coupon"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AdminCouponForm;
