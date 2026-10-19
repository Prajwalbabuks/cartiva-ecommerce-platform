
import { useEffect, useState } from "react";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Home,
  BriefcaseBusiness,
  MapPinned,
  X,
  LoaderCircle,
} from "lucide-react";

import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../services/address.service";

const emptyAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  addressType: "home",
  isDefault: false,
};

const fields = [
  {
    name: "fullName",
    label: "Full name",
    placeholder: "Enter recipient's full name",
    required: true,
  },
  {
    name: "phone",
    label: "Phone number",
    placeholder: "10-digit Indian mobile number",
    required: true,
  },
  {
    name: "addressLine1",
    label: "Address line 1",
    placeholder: "House number, street, locality",
    required: true,
    fullWidth: true,
  },
  {
    name: "addressLine2",
    label: "Address line 2",
    placeholder: "Landmark, apartment, etc. (optional)",
    fullWidth: true,
  },
  {
    name: "city",
    label: "City",
    placeholder: "Enter city",
    required: true,
  },
  {
    name: "state",
    label: "State",
    placeholder: "Enter state",
    required: true,
  },
  {
    name: "postalCode",
    label: "PIN code",
    placeholder: "6-digit PIN code",
    required: true,
  },
  {
    name: "country",
    label: "Country",
    placeholder: "Enter country",
    required: true,
  },
];

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/20";

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong. Please try again."
  );
}

function AddressForm({
  initialAddress,
  onSubmit,
  onClose,
  saving,
}) {
  const [form, setForm] = useState(() => ({
    ...emptyAddress,
    ...(initialAddress || {}),
  }));

  const [formError, setFormError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const normalized = {
      ...form,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim(),
      country: form.country.trim(),
    };

    if (!/^[6-9]\d{9}$/.test(normalized.phone)) {
      setFormError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^[1-9]\d{5}$/.test(normalized.postalCode)) {
      setFormError("Enter a valid 6-digit Indian PIN code.");
      return;
    }

    try {
      await onSubmit(normalized);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.name}
            className={field.fullWidth ? "sm:col-span-2" : ""}
          >
            <label
              htmlFor={field.name}
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              {field.label}
              {field.required && (
                <span className="ml-1 text-red-500">*</span>
              )}
            </label>

            <input
              id={field.name}
              name={field.name}
              type="text"
              value={form[field.name] ?? ""}
              onChange={handleChange}
              placeholder={field.placeholder}
              required={field.required}
              maxLength={
                field.name === "addressLine1" ||
                field.name === "addressLine2"
                  ? 200
                  : field.name === "fullName"
                    ? 100
                    : undefined
              }
              autoComplete={
                {
                  fullName: "name",
                  phone: "tel",
                  addressLine1: "address-line1",
                  addressLine2: "address-line2",
                  city: "address-level2",
                  state: "address-level1",
                  postalCode: "postal-code",
                  country: "country-name",
                }[field.name]
              }
              className={inputClass}
            />
          </div>
        ))}
      </div>

      <div>
        <label
          htmlFor="addressType"
          className="mb-1.5 block text-sm font-semibold text-gray-700"
        >
          Address type
        </label>

        <select
          id="addressType"
          name="addressType"
          value={form.addressType}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="home">Home</option>
          <option value="work">Work</option>
          <option value="other">Other</option>
        </select>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3">
        <input
          type="checkbox"
          name="isDefault"
          checked={Boolean(form.isDefault)}
          onChange={handleChange}
          className="mt-1 accent-brand"
        />

        <span>
          <span className="block text-sm font-semibold text-gray-800">
            Set as default address
          </span>
          <span className="mt-1 block text-xs text-gray-500">
            Use this address as your preferred delivery address.
          </span>
        </span>
      </label>

      {formError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {formError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving && <LoaderCircle size={16} className="animate-spin" />}
          {saving
            ? "Saving..."
            : initialAddress
              ? "Save changes"
              : "Save address"}
        </button>
      </div>
    </form>
  );
}

function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingAddress, setEditingAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [actionAddressId, setActionAddressId] = useState(null);

  const loadAddresses = async () => {
    try {
      setPageError("");
      const response = await getAddresses();
      setAddresses(response.addresses || []);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const openAddForm = () => {
    setEditingAddress(null);
    setNotice("");
    setShowForm(true);
  };

  const openEditForm = (address) => {
    setEditingAddress(address);
    setNotice("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleSave = async (addressData) => {
    setSaving(true);
    setPageError("");

    try {
      if (editingAddress) {
        await updateAddress(editingAddress._id, addressData);
        setNotice("Address updated successfully.");
      } else {
        await createAddress(addressData);
        setNotice("Address added successfully.");
      }

      setShowForm(false);
      setEditingAddress(null);
      await loadAddresses();
    } catch (error) {
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    setActionAddressId(addressId);
    setPageError("");
    setNotice("");

    try {
      await setDefaultAddress(addressId);
      setNotice("Default address updated successfully.");
      await loadAddresses();
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setActionAddressId(null);
    }
  };

  const handleDelete = async (address) => {
    const confirmed = window.confirm(
      `Delete the address for ${address.fullName}?`
    );

    if (!confirmed) return;

    setActionAddressId(address._id);
    setPageError("");
    setNotice("");

    try {
      await deleteAddress(address._id);
      setNotice("Address deleted successfully.");
      await loadAddresses();
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setActionAddressId(null);
    }
  };

  const addressIcon = (type) => {
    if (type === "work") return BriefcaseBusiness;
    if (type === "home") return Home;
    return MapPinned;
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold text-brand">
            YOUR ACCOUNT
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            My addresses
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your saved shipping and delivery addresses.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
        >
          <Plus size={18} />
          Add address
        </button>
      </div>

      {notice && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          {notice}
        </div>
      )}

      {pageError && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {pageError}
        </div>
      )}

      {showForm && (
        <section className="mb-7 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {editingAddress ? "Edit address" : "Add a new address"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Fields marked with * are required.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              aria-label="Close address form"
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <X size={20} />
            </button>
          </div>

          <AddressForm
            key={editingAddress?._id || "new-address"}
            initialAddress={editingAddress}
            onSubmit={handleSave}
            onClose={closeForm}
            saving={saving}
          />
        </section>
      )}

      {loading ? (
        <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-gray-500">
          <LoaderCircle size={22} className="animate-spin text-brand" />
          Loading your addresses...
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
          <MapPin size={36} className="mx-auto text-gray-400" />
          <h2 className="mt-4 text-lg font-bold text-gray-900">
            No saved addresses yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
            Add your first address to make checkout quicker and easier.
          </p>
          <button
            type="button"
            onClick={openAddForm}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
          >
            <Plus size={17} />
            Add your first address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {addresses.map((address) => {
            const TypeIcon = addressIcon(address.addressType);
            const busy = actionAddressId === address._id;

            return (
              <article
                key={address._id}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                  address.isDefault
                    ? "border-brand/50 ring-1 ring-brand/10"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="rounded-xl bg-indigo-50 p-2.5 text-brand">
                      <TypeIcon size={20} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="break-words font-bold text-gray-900">
                          {address.fullName}
                        </h2>

                        {address.isDefault && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-brand">
                            <Star size={12} fill="currentColor" />
                            Default
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {address.addressType || "other"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="ml-0 mt-4 space-y-1.5 text-sm leading-relaxed text-gray-600 sm:ml-1">
                  <p>{address.addressLine1}</p>

                  {address.addressLine2 && (
                    <p>{address.addressLine2}</p>
                  )}

                  <p>
                    {address.city}, {address.state} - {address.postalCode}
                  </p>
                  <p>{address.country}</p>
                  <p className="pt-1 font-medium text-gray-800">
                    Phone: {address.phone}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(address._id)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-brand hover:text-brand disabled:opacity-50"
                    >
                      <Star size={14} />
                      Set default
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => openEditForm(address)}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-brand hover:text-brand disabled:opacity-50"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(address)}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    {busy ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default Addresses;
