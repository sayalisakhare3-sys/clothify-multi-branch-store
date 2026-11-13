"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load customers");
      }
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void fetchCustomers();
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setNotice("");
      const token = localStorage.getItem("token");
      const url = editingCustomer
        ? `${API_URL}/customers/${editingCustomer.id}`
        : `${API_URL}/customers`;
      const method = editingCustomer ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save customer");
      }

      setNotice(
        editingCustomer
          ? "Customer profile updated successfully."
          : "New customer added to directory."
      );
      setFormData({ name: "", phone: "", email: "", address: "" });
      setEditingCustomer(null);
      setShowForm(false);
      await fetchCustomers();
    } catch (err) {
      setError(err.message || "Unable to save customer profile");
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
    });
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm("Are you sure you want to delete this customer record?")) {
      return;
    }

    try {
      setError("");
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/customers/${customerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete customer");
      }

      setNotice("Customer removed successfully.");
      await fetchCustomers();
    } catch (err) {
      setError(err.message || "Unable to delete customer");
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const q = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(q) ||
      customer.phone?.toLowerCase().includes(q) ||
      customer.email?.toLowerCase().includes(q) ||
      customer.address?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-[1540px] mx-auto w-full">
      {/* Module Header */}
      <div className="module-header">
        <div className="module-page-title">
          <div className="module-title-icon">
            <Users size={22} />
          </div>
          <div>
            <h1>Customers & Loyalty</h1>
            <p>Maintain your shopper directory, contact information, and retail purchase history.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingCustomer(null);
            setFormData({ name: "", phone: "", email: "", address: "" });
            setShowForm(!showForm);
          }}
          className="operation-primary"
        >
          <Plus size={17} />
          <span>{showForm ? "Close Form" : "Add Customer"}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-stats-grid mb-6">
        <div className="dashboard-stat-card purple">
          <p className="stat-card-title">Total Customers</p>
          <h3 className="stat-card-value">{customers.length}</h3>
          <span className="stat-badge growth mt-2">Registered shoppers</span>
        </div>
        <div className="dashboard-stat-card mint">
          <p className="stat-card-title">Active Contacts</p>
          <h3 className="stat-card-value">
            {customers.filter((c) => c.phone || c.email).length}
          </h3>
          <span className="stat-badge growth mt-2">Phone / Email on file</span>
        </div>
        <div className="dashboard-stat-card peach">
          <p className="stat-card-title">Filtered</p>
          <h3 className="stat-card-value">{filteredCustomers.length}</h3>
          <span className="stat-badge neutral mt-2">Search query matches</span>
        </div>
        <div className="dashboard-stat-card blue">
          <p className="stat-card-title">Loyalty Program</p>
          <h3 className="stat-card-value">Enabled</h3>
          <span className="stat-badge growth mt-2">Active in POS</span>
        </div>
      </div>

      {/* Notices */}
      {notice && (
        <div className="operation-alert success mb-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice("")} className="operation-secondary text-xs py-1">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="operation-alert error mb-5">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="operation-secondary text-xs py-1">
            Dismiss
          </button>
        </div>
      )}

      {/* Form Card */}
      {showForm && (
        <div className="card-surface mb-6 p-6 border-2 border-[#6750D9]/20 shadow-md">
          <div className="flex items-center justify-between border-b border-[#EEE8E5] pb-4 mb-5">
            <h3 className="text-lg font-bold text-[#172033]">
              {editingCustomer ? "Edit Customer Record" : "Add New Customer"}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 rounded-lg text-[#788195] hover:bg-[#F1EEFE] hover:text-[#6750D9]"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="operation-field mb-0">
              <span>Full Name</span>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Priya Sharma"
              />
            </div>

            <div className="operation-field mb-0">
              <span>Phone Number</span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
              />
            </div>

            <div className="operation-field mb-0">
              <span>Email Address</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="priya@example.com"
              />
            </div>

            <div className="operation-field mb-0">
              <span>Delivery / Billing Address</span>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Apartment 4B, MG Road, Mumbai"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-3 border-t border-[#EEE8E5]">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="operation-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="operation-primary">
                {editingCustomer ? "Update Customer" : "Save Customer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="card-surface mb-6 p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers by name, phone, email, or address..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#EEE8E5] bg-[#FBF8F6] text-xs text-[#172033] outline-none focus:border-[#6750D9]"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="card-surface p-0 overflow-hidden">
        {loading ? (
          <div className="operation-empty">Loading customers directory...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="operation-empty">No customers found.</div>
        ) : (
          <div className="operation-table-wrap border-0 rounded-none shadow-none">
            <table className="operation-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone Number</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => {
                  const initials = c.name
                    ? c.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "CU";

                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#F1EEFE] text-[#6750D9] flex items-center justify-center font-bold text-xs">
                            {initials}
                          </div>
                          <div>
                            <span className="font-bold text-[#172033] block">{c.name}</span>
                            <span className="text-[11px] text-[#788195]">ID #{c.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {c.phone ? (
                          <div className="flex items-center gap-1.5 text-xs text-[#172033]">
                            <Phone size={13} className="text-[#9CA3AF]" />
                            <span>{c.phone}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#9CA3AF]">—</span>
                        )}
                      </td>
                      <td>
                        {c.email ? (
                          <div className="flex items-center gap-1.5 text-xs text-[#172033]">
                            <Mail size={13} className="text-[#9CA3AF]" />
                            <span>{c.email}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#9CA3AF]">—</span>
                        )}
                      </td>
                      <td>
                        <span className="text-xs text-[#788195] max-w-xs truncate block">
                          {c.address || "—"}
                        </span>
                      </td>
                      <td>
                        <div className="operation-actions">
                          <button
                            type="button"
                            onClick={() => handleEdit(c)}
                            title="Edit customer"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id)}
                            className="user-delete-action"
                            title="Delete customer"
                          >
                            <Trash2 size={13} />
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
      </div>
    </div>
  );
}
