
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Plus,
    RefreshCw,
    Eye,
    Pencil,
    Ban,
    TicketPercent,
    CalendarDays,
    X,
} from "lucide-react";

import {
    getAdminCoupons,
    updateAdminCoupon,
} from "../../services/admin.service";

// -----------------------------------------
// Helpers
// -----------------------------------------

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(amount || 0);

const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getCouponStatus = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (!coupon.isActive) return "inactive";
    if (now < startDate) return "upcoming";
    if (now > endDate) return "expired";

    if (
        coupon.usageLimit !== null &&
        coupon.usageLimit !== undefined &&
        coupon.usedCount >= coupon.usageLimit
    ) {
        return "limit reached";
    }

    return "active";
};

const statusStyles = {
    active: "bg-green-50 text-green-700",
    inactive: "bg-gray-100 text-gray-600",
    expired: "bg-red-50 text-red-700",
    upcoming: "bg-blue-50 text-blue-700",
    "limit reached": "bg-amber-50 text-amber-700",
};

const formatStatus = (status) =>
    status.charAt(0).toUpperCase() + status.slice(1);

// -----------------------------------------
// Status Badge
// -----------------------------------------

function CouponStatusBadge({ status }) {
    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                statusStyles[status] || "bg-gray-100 text-gray-600"
            }`}
        >
            {formatStatus(status)}
        </span>
    );
}

// -----------------------------------------
// Summary Card
// -----------------------------------------

function SummaryCard({ title, value, description, icon: Icon }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                    {title}
                </p>

                <div className="rounded-lg bg-indigo-50 p-2">
                    <Icon size={19} className="text-brand" />
                </div>
            </div>

            <p className="mt-3 text-2xl font-bold text-gray-900">
                {value}
            </p>

            <p className="mt-1 text-xs text-gray-500">
                {description}
            </p>
        </div>
    );
}

// -----------------------------------------
// Coupon Details Modal
// -----------------------------------------

function CouponDetailsModal({ coupon, onClose, onEdit }) {
    if (!coupon) return null;

    const status = getCouponStatus(coupon);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Coupon Details
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            View coupon information
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mt-6 rounded-xl border border-dashed border-indigo-200 bg-indigo-50 p-5 text-center">
                    <TicketPercent
                        size={30}
                        className="mx-auto text-brand"
                    />

                    <h3 className="mt-3 text-2xl font-bold tracking-wider text-gray-900">
                        {coupon.code}
                    </h3>

                    <p className="mt-2 text-3xl font-bold text-brand">
                        {coupon.discountPercentage}% OFF
                    </p>

                    <div className="mt-3">
                        <CouponStatusBadge status={status} />
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-xs text-gray-500">
                            Minimum Order Value
                        </p>

                        <p className="mt-1 font-semibold text-gray-900">
                            {formatCurrency(coupon.minOrderValue)}
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-xs text-gray-500">
                            Maximum Discount
                        </p>

                        <p className="mt-1 font-semibold text-gray-900">
                            {coupon.maxDiscount == null
                                ? "No limit"
                                : formatCurrency(coupon.maxDiscount)}
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-xs text-gray-500">
                            Start Date
                        </p>

                        <p className="mt-1 font-semibold text-gray-900">
                            {formatDate(coupon.startDate)}
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-xs text-gray-500">
                            Expiry Date
                        </p>

                        <p className="mt-1 font-semibold text-gray-900">
                            {formatDate(coupon.endDate)}
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-xs text-gray-500">
                            Total Usage
                        </p>

                        <p className="mt-1 font-semibold text-gray-900">
                            {coupon.usedCount ?? 0}
                            {" / "}
                            {coupon.usageLimit ?? "Unlimited"}
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-xs text-gray-500">
                            Per User Limit
                        </p>

                        <p className="mt-1 font-semibold text-gray-900">
                            {coupon.perUserLimit}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </button>

                    <button
                        onClick={() => onEdit(coupon._id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-hover"
                    >
                        <Pencil size={15} />
                        Edit Coupon
                    </button>
                </div>
            </div>
        </div>
    );
}

// =========================================
// MAIN ADMIN COUPONS PAGE
// =========================================

export default function AdminCoupons() {
    const navigate = useNavigate();

    const [coupons, setCoupons] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [pagination, setPagination] = useState({
        currentPage: 1,
        limit: 10,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [deactivatingId, setDeactivatingId] = useState(null);

    // -----------------------------------------
    // Fetch Coupons
    // -----------------------------------------

    const fetchCoupons = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getAdminCoupons();

            const couponData =
                response.coupons ||
                response.data?.coupons ||
                (Array.isArray(response.data) ? response.data : []);

            setCoupons(couponData);
        } catch (error) {
            console.error("Failed to fetch coupons:", error);

            setError(
                error.response?.data?.message ||
                    "Unable to load coupons. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    // -----------------------------------------
    // Filter Coupons
    // -----------------------------------------

    const filteredCoupons = useMemo(() => {
        return coupons.filter((coupon) => {
            const matchesSearch = coupon.code
                ?.toLowerCase()
                .includes(search.trim().toLowerCase());

            const status = getCouponStatus(coupon);

            const matchesStatus =
                statusFilter === "all" || status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [coupons, search, statusFilter]);

    // -----------------------------------------
    // Pagination
    // -----------------------------------------

    const totalPages = Math.max(
        1,
        Math.ceil(filteredCoupons.length / pagination.limit)
    );

    const currentPage = Math.min(
        pagination.currentPage,
        totalPages
    );

    const paginatedCoupons = filteredCoupons.slice(
        (currentPage - 1) * pagination.limit,
        currentPage * pagination.limit
    );

    const handlePageChange = (page) => {
        setPagination((previous) => ({
            ...previous,
            currentPage: page,
        }));
    };

    // -----------------------------------------
    // Summary Statistics
    // -----------------------------------------

    const summary = useMemo(() => {
        const statuses = coupons.map(getCouponStatus);

        return {
            total: coupons.length,
            active: statuses.filter((status) => status === "active").length,
            expired: statuses.filter((status) => status === "expired").length,
            inactive: statuses.filter((status) => status === "inactive").length,
        };
    }, [coupons]);

    // -----------------------------------------
    // Deactivate Coupon
    // -----------------------------------------

      const handleToggleStatus = async (coupon) => {
          const newStatus = !coupon.isActive;

          const action = newStatus ? "activate" : "deactivate";

          const confirmed = window.confirm(
              `Are you sure you want to ${action} coupon ${coupon.code}?`
          );

          if (!confirmed) return;

          try {
              await updateAdminCoupon(coupon._id, {
                  isActive: newStatus,
              });

              await fetchCoupons();
          } catch (error) {
              console.error(`Failed to ${action} coupon:`, error);

              alert(
                  error.response?.data?.message ||
                  `Unable to ${action} coupon. Please try again.`
              );
          }
      };

    // -----------------------------------------
    // Render
    // -----------------------------------------

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Coupons
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Create and manage discount coupons.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={fetchCoupons}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={16}
                                className={loading ? "animate-spin" : ""}
                            />
                            {loading ? "Refreshing..." : "Refresh"}
                        </button>

                        <button
                            onClick={() => navigate("/admin/coupons/add")}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover"
                        >
                            <Plus size={17} />
                            Add Coupon
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Total Coupons"
                        value={summary.total}
                        description="All coupons"
                        icon={TicketPercent}
                    />

                    <SummaryCard
                        title="Active Coupons"
                        value={summary.active}
                        description="Currently available"
                        icon={TicketPercent}
                    />

                    <SummaryCard
                        title="Expired Coupons"
                        value={summary.expired}
                        description="Past expiry date"
                        icon={CalendarDays}
                    />

                    <SummaryCard
                        title="Inactive Coupons"
                        value={summary.inactive}
                        description="Manually deactivated"
                        icon={Ban}
                    />
                </div>

                {/* Search and Filters */}
                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Search Coupon
                            </label>

                            <div className="relative">
                                <Search
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    placeholder="Search by coupon code..."
                                    value={search}
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                        handlePageChange(1);
                                    }}
                                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Coupon Status
                            </label>

                            <select
                                value={statusFilter}
                                onChange={(event) => {
                                    setStatusFilter(event.target.value);
                                    handlePageChange(1);
                                }}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
                            >
                                <option value="all">All Coupons</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="expired">Expired</option>
                                <option value="limit reached">Limit Reached</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Coupon Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

                    <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                        <h2 className="font-semibold text-gray-900">
                            All Coupons
                        </h2>

                        <span className="text-xs text-gray-500">
                            {filteredCoupons.length} coupons
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-sm text-gray-500">
                            Loading coupons...
                        </div>
                    ) : paginatedCoupons.length === 0 ? (
                        <div className="p-12 text-center">
                            <TicketPercent
                                size={36}
                                className="mx-auto text-gray-300"
                            />

                            <p className="mt-3 font-medium text-gray-700">
                                No coupons found
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                Try changing your search or filters.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1100px] text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                    <tr>
                                        <th className="px-5 py-4">Coupon</th>
                                        <th className="px-5 py-4">Discount</th>
                                        <th className="px-5 py-4">Min. Order</th>
                                        <th className="px-5 py-4">Validity</th> 
                                        <th className="px-5 py-4">Usage</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>    

                                <tbody className="divide-y divide-gray-100">
                                    {paginatedCoupons.map((coupon) => {
                                        const status = getCouponStatus(coupon);

                                        return (
                                            <tr
                                                key={coupon._id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold text-gray-900">
                                                        {coupon.code}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Created {formatDate(coupon.createdAt)}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4 font-semibold text-brand">
                                                    {coupon.discountPercentage}% OFF
                                                </td>

                                                <td className="px-5 py-4 text-gray-600">
                                                    {formatCurrency(coupon.minOrderValue)}
                                                </td>

                                                <td className="px-5 py-4 text-gray-600">
                                                    <p>{formatDate(coupon.startDate)}</p>
                                                    <p className="mt-1 text-xs text-gray-400">
                                                        to {formatDate(coupon.endDate)}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4 text-gray-600">
                                                    <p>
                                                        {coupon.usedCount ?? 0}
                                                        {" / "}
                                                        {coupon.usageLimit ?? "∞"}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-400">
                                                        Per user: {coupon.perUserLimit}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <CouponStatusBadge status={status} />
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setSelectedCoupon(coupon)}
                                                            title="View coupon"
                                                            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-brand"
                                                        >
                                                            <Eye size={17} />
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                navigate(`/admin/coupons/edit/${coupon._id}`)
                                                            }
                                                            title="Edit coupon"
                                                            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-brand"
                                                        >
                                                            <Pencil size={17} />
                                                        </button>

                                                        <button
                                                            onClick={() => handleToggleStatus(coupon)}
                                                            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                                                                coupon.isActive
                                                                    ? "border-red-200 text-red-600 hover:bg-red-50"
                                                                    : "border-green-200 text-green-600 hover:bg-green-50"
                                                            }`}
                                                        >
                                                            {coupon.isActive ? "Deactivate" : "Activate"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && filteredCoupons.length > 0 && (
                        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row">
                            <p className="text-sm text-gray-500">
                                Showing{" "}
                                {(currentPage - 1) * pagination.limit + 1}
                                {" - "}
                                {Math.min(
                                    currentPage * pagination.limit,
                                    filteredCoupons.length
                                )}
                                {" of "}
                                {filteredCoupons.length} coupons
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage <= 1}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= totalPages}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Coupon Details Modal */}
            {selectedCoupon && (
                <CouponDetailsModal
                    coupon={selectedCoupon}
                    onClose={() => setSelectedCoupon(null)}
                    onEdit={(id) =>
                        navigate(`/admin/coupons/edit/${id}`)
                    }
                />
            )}
        </div>
    );
}
