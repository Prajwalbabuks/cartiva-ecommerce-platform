
import { useCallback, useEffect, useState } from "react";
import {
    Search,
    RefreshCw,
    Eye,
    UserRound,
    Users,
    UserCheck,
    UserX,
    ShieldCheck,
    X,
} from "lucide-react";

import {
    getAdminCustomers,
    getAdminCustomerById,
    updateAdminCustomerStatus,
} from "../../services/admin.service";

// ================= HELPERS =================

const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getInitials = (name = "") => {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");
};

// ================= SUMMARY CARD =================

const SummaryCard = ({ title, value, icon: Icon, iconBg, iconColor }) => (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">
                    {title}
                </p>

                <h3 className="mt-2 text-2xl font-bold text-gray-900">
                    {value ?? 0}
                </h3>
            </div>

            <div className={`rounded-xl p-3 ${iconBg}`}>
                <Icon size={22} className={iconColor} />
            </div>
        </div>
    </div>
);

// ================= CUSTOMER DETAILS MODAL =================

const CustomerDetailsModal = ({ customer, onClose }) => {
    if (!customer) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 p-5">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Customer Details
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Complete customer information
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-5 p-5">
                    <div className="flex flex-col items-center text-center">
                        {customer.avatar ? (
                            <img
                                src={customer.avatar}
                                alt={customer.name}
                                className="h-20 w-20 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-700">
                                {getInitials(customer.name)}
                            </div>
                        )}

                        <h3 className="mt-3 text-lg font-semibold text-gray-900">
                            {customer.name}
                        </h3>

                        <p className="text-sm text-gray-500">
                            {customer.email}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="text-xs text-gray-500">
                                Account Status
                            </p>

                            <span
                                className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                    customer.isActive
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                }`}
                            >
                                {customer.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="text-xs text-gray-500">
                                Email Verification
                            </p>

                            <span
                                className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                    customer.isEmailVerified
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                }`}
                            >
                                {customer.isEmailVerified
                                    ? "Verified"
                                    : "Not Verified"}
                            </span>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="text-xs text-gray-500">
                                Customer ID
                            </p>

                            <p className="mt-2 break-all text-sm font-medium text-gray-800">
                                {customer._id}
                            </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="text-xs text-gray-500">
                                Account Role
                            </p>

                            <p className="mt-2 text-sm font-medium capitalize text-gray-800">
                                {customer.role}
                            </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4 sm:col-span-2">
                            <p className="text-xs text-gray-500">
                                Registration Date
                            </p>

                            <p className="mt-2 text-sm font-medium text-gray-800">
                                {formatDate(customer.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end border-t border-gray-100 p-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// ================= MAIN COMPONENT =================

const AdminCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [stats, setStats] = useState({
        totalCustomers: 0,
        activeCustomers: 0,
        inactiveCustomers: 0,
        verifiedCustomers: 0,
        unverifiedCustomers: 0,
    });

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCustomers: 0,
        limit: 10,
    });

    const [filters, setFilters] = useState({
        search: "",
        status: "all",
        verification: "all",
        sort: "newest",
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [updatingCustomerId, setUpdatingCustomerId] = useState(null);

    // Fetch customers and summary statistics
    const fetchCustomers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getAdminCustomers({
                ...filters,
                page: pagination.currentPage,
                limit: pagination.limit,
            });

            setCustomers(response.customers || []);

            setStats({
                totalCustomers: response.stats?.totalCustomers ?? 0,
                activeCustomers: response.stats?.activeCustomers ?? 0,
                inactiveCustomers: response.stats?.inactiveCustomers ?? 0,
                verifiedCustomers: response.stats?.verifiedCustomers ?? 0,
                unverifiedCustomers: response.stats?.unverifiedCustomers ?? 0,
            });

            if (response.pagination) {
                setPagination((previous) => ({
                    ...previous,
                    ...response.pagination,
                }));
            }
        } catch (err) {
            console.error("Failed to fetch customers:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load customers. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.currentPage, pagination.limit]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    // Update filters and reset pagination
    const handleFilterChange = (name, value) => {
        setFilters((previous) => ({
            ...previous,
            [name]: value,
        }));

        setPagination((previous) => ({
            ...previous,
            currentPage: 1,
        }));
    };

    // Manual refresh
    const handleRefresh = () => {
        fetchCustomers();
    };

    // View customer details
    const handleViewCustomer = async (customerId) => {
        try {
            setDetailsLoading(true);
            setSelectedCustomer(null);

            const response = await getAdminCustomerById(customerId);

            setSelectedCustomer(response.customer);
        } catch (err) {
            console.error("Failed to fetch customer details:", err);

            alert(
                err.response?.data?.message ||
                "Unable to load customer details."
            );
        } finally {
            setDetailsLoading(false);
        }
    };

    // Activate / Deactivate customer
    const handleToggleStatus = async (customer) => {
        const newStatus = !customer.isActive;

        const action = newStatus ? "activate" : "deactivate";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${customer.name}'s account?`
        );

        if (!confirmed) return;

        try {
            setUpdatingCustomerId(customer._id);

            await updateAdminCustomerStatus(
                customer._id,
                newStatus
            );

            await fetchCustomers();

            if (selectedCustomer?._id === customer._id) {
                const response = await getAdminCustomerById(customer._id);
                setSelectedCustomer(response.customer);
            }
        } catch (err) {
            console.error("Failed to update customer status:", err);

            alert(
                err.response?.data?.message ||
                `Unable to ${action} customer. Please try again.`
            );
        } finally {
            setUpdatingCustomerId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* PAGE HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Customer Management
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage registered customers and their accounts.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                    />
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <SummaryCard
                    title="Total Customers"
                    value={stats.totalCustomers}
                    icon={Users}
                    iconBg="bg-indigo-50"
                    iconColor="text-indigo-600"
                />

                <SummaryCard
                    title="Active Customers"
                    value={stats.activeCustomers}
                    icon={UserCheck}
                    iconBg="bg-green-50"
                    iconColor="text-green-600"
                />

                <SummaryCard
                    title="Inactive Customers"
                    value={stats.inactiveCustomers}
                    icon={UserX}
                    iconBg="bg-red-50"
                    iconColor="text-red-600"
                />

                <SummaryCard
                    title="Verified Customers"
                    value={stats.verifiedCustomers}
                    icon={ShieldCheck}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                />

                <SummaryCard
                    title="Unverified Customers"
                    value={stats.unverifiedCustomers}
                    icon={UserRound}
                    iconBg="bg-yellow-50"
                    iconColor="text-yellow-600"
                />
            </div>

            {/* FILTERS */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                    <div className="relative lg:col-span-2">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) =>
                                handleFilterChange("search", e.target.value)
                            }
                            placeholder="Search by customer name or email..."
                            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    <select
                        value={filters.status}
                        onChange={(e) =>
                            handleFilterChange("status", e.target.value)
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-500"
                    >
                        <option value="all">All Account Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <select
                        value={filters.verification}
                        onChange={(e) =>
                            handleFilterChange("verification", e.target.value)
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-500"
                    >
                        <option value="all">All Verification Status</option>
                        <option value="verified">Verified</option>
                        <option value="unverified">Unverified</option>
                    </select>

                    <select
                        value={filters.sort}
                        onChange={(e) =>
                            handleFilterChange("sort", e.target.value)
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-500 lg:col-span-1"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* CUSTOMER TABLE */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-2 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-semibold text-gray-900">
                            All Customers
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {pagination.totalCustomers} customers found
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Customer
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Email
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Account Status
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Verification
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Joined Date
                                </th>

                                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-6 py-12 text-center text-sm text-gray-500"
                                    >
                                        Loading customers...
                                    </td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-6 py-12 text-center text-sm text-gray-500"
                                    >
                                        No customers found.
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr
                                        key={customer._id}
                                        className="transition hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {customer.avatar ? (
                                                    <img
                                                        src={customer.avatar}
                                                        alt={customer.name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                                                        {getInitials(customer.name)}
                                                    </div>
                                                )}

                                                <span className="text-sm font-medium text-gray-900">
                                                    {customer.name}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {customer.email}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    customer.isActive
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {customer.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    customer.isEmailVerified
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                }`}
                                            >
                                                {customer.isEmailVerified
                                                    ? "Verified"
                                                    : "Unverified"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {formatDate(customer.createdAt)}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-start gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleViewCustomer(customer._id)
                                                    }
                                                    title="View customer"
                                                    className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-100"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleToggleStatus(customer)
                                                    }
                                                    disabled={
                                                        updatingCustomerId === customer._id
                                                    }
                                                    className={`whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium transition disabled:opacity-50 ${
                                                        customer.isActive
                                                            ? "border-red-200 text-red-600 hover:bg-red-50"
                                                            : "border-green-200 text-green-600 hover:bg-green-50"
                                                    }`}
                                                >
                                                    {updatingCustomerId === customer._id
                                                        ? "Updating..."
                                                        : customer.isActive
                                                            ? "Deactivate"
                                                            : "Activate"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-500">
                        Page {pagination.currentPage} of{" "}
                        {Math.max(1, pagination.totalPages)}
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={
                                loading || pagination.currentPage <= 1
                            }
                            onClick={() =>
                                setPagination((previous) => ({
                                    ...previous,
                                    currentPage: previous.currentPage - 1,
                                }))
                            }
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>

                        <button
                            type="button"
                            disabled={
                                loading ||
                                pagination.currentPage >= pagination.totalPages
                            }
                            onClick={() =>
                                setPagination((previous) => ({
                                    ...previous,
                                    currentPage: previous.currentPage + 1,
                                }))
                            }
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* CUSTOMER DETAILS MODAL */}
            {selectedCustomer && (
                <CustomerDetailsModal
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                />
            )}

            {detailsLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="rounded-xl bg-white px-6 py-4 text-sm font-medium text-gray-700 shadow-lg">
                        Loading customer details...
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCustomers;
