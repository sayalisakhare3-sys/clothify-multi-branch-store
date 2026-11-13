"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Plus, Pencil, Trash2, X, AlertTriangle } from "lucide-react";
import { getBranches } from "../../lib/api";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

export default function Users() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CASHIER");
  const [branchId, setBranchId] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void fetchUsers();
    });
    getBranches()
      .then((result) => setBranches(result.data || []))
      .catch((loadError) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to fetch branches"
        );
      });
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          branchId: branchId ? Number(branchId) : null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create user");
      }

      setName("");
      setEmail("");
      setPassword("");
      setRole("CASHIER");
      setBranchId("");
      setShowForm(false);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add user");
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setError("");
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          role,
          branchId: branchId ? Number(branchId) : null,
          ...(password ? { password } : {}),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update user");
      }

      setEditingUser(null);
      setName("");
      setEmail("");
      setPassword("");
      setRole("CASHIER");
      setBranchId("");
      setShowForm(false);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff account?")) {
      return;
    }

    try {
      setError("");
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete user");
      }
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  const cashiersCount = users.filter((u) => u.role === "CASHIER").length;
  const managersCount = users.filter((u) => u.role === "MANAGER").length;
  const adminsCount = users.filter((u) => u.role === "OWNER" || u.role === "ADMIN").length;

  return (
    <div className="max-w-[1540px] mx-auto w-full">
      {/* Module Header */}
      <div className="module-header">
        <div className="module-page-title">
          <div className="module-title-icon">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1>Users & Role Permissions</h1>
            <p>Administer staff accounts, cashier terminal assignments, and role access levels.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingUser(null);
            setName("");
            setEmail("");
            setPassword("");
            setRole("CASHIER");
            setBranchId("");
            setShowForm(!showForm);
          }}
          className="operation-primary"
        >
          <Plus size={17} />
          <span>{showForm ? "Cancel" : "Add Staff User"}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-stats-grid mb-6">
        <div className="dashboard-stat-card purple">
          <p className="stat-card-title">Total Staff Users</p>
          <h3 className="stat-card-value">{users.length}</h3>
          <span className="stat-badge growth mt-2">Active credentials</span>
        </div>
        <div className="dashboard-stat-card mint">
          <p className="stat-card-title">POS Cashiers</p>
          <h3 className="stat-card-value">{cashiersCount}</h3>
          <span className="stat-badge growth mt-2">Branch assigned</span>
        </div>
        <div className="dashboard-stat-card peach">
          <p className="stat-card-title">Store Managers</p>
          <h3 className="stat-card-value">{managersCount}</h3>
          <span className="stat-badge neutral mt-2">Operations lead</span>
        </div>
        <div className="dashboard-stat-card blue">
          <p className="stat-card-title">Administrators</p>
          <h3 className="stat-card-value">{adminsCount}</h3>
          <span className="stat-badge growth mt-2">Full system access</span>
        </div>
      </div>

      {/* Alerts */}
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
      {(showForm || editingUser) && (
        <div className="card-surface mb-6 p-6 border-2 border-[#6750D9]/20 shadow-md">
          <div className="flex items-center justify-between border-b border-[#EEE8E5] pb-4 mb-5">
            <h3 className="text-lg font-bold text-[#172033]">
              {editingUser ? "Edit Staff Account" : "Create New Staff Account"}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingUser(null);
              }}
              className="p-1 rounded-lg text-[#788195] hover:bg-[#F1EEFE] hover:text-[#6750D9]"
            >
              <X size={18} />
            </button>
          </div>

          <form
            onSubmit={editingUser ? handleEditUser : handleAddUser}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="operation-field mb-0">
              <span>Full Name</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
              />
            </div>

            <div className="operation-field mb-0">
              <span>Email Address</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ramesh@clothify.com"
              />
            </div>

            <div className="operation-field mb-0">
              <span>
                Password {editingUser && "(Leave blank to keep current)"}
              </span>
              <input
                type="password"
                required={!editingUser}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="operation-field mb-0">
              <span>Role Permission</span>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="CASHIER">Cashier (POS & Sales)</option>
                <option value="MANAGER">Manager (Store & Inventory)</option>
                <option value="OWNER">Owner (Full Administration)</option>
              </select>
            </div>

            <div className="operation-field mb-0 md:col-span-2">
              <span>Branch Assignment</span>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                required={role === "CASHIER"}
              >
                <option value="">Select branch</option>
                {branches
                  .filter((b) => b.isActive)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} — {b.city}
                    </option>
                  ))}
              </select>
              {role === "CASHIER" && (
                <span className="text-[11px] text-[#E06D3B] mt-1 block">
                  * Cashiers must be assigned to an active branch to open POS registers.
                </span>
              )}
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-3 border-t border-[#EEE8E5]">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
                }}
                className="operation-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="operation-primary">
                {editingUser ? "Update Account" : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="card-surface p-0 overflow-hidden">
        {loading ? (
          <div className="operation-empty">Loading users & roles...</div>
        ) : users.length === 0 ? (
          <div className="operation-empty">No user accounts found.</div>
        ) : (
          <div className="operation-table-wrap border-0 rounded-none shadow-none">
            <table className="operation-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Assigned Branch</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const branch = branches.find((b) => b.id === user.branchId);
                  const initials = user.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "ST";

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#F1EEFE] text-[#6750D9] flex items-center justify-center font-bold text-xs">
                            {initials}
                          </div>
                          <div>
                            <span className="font-bold text-[#172033] block">{user.name}</span>
                            <span className="text-[11px] text-[#788195]">ID #{user.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-xs text-[#172033]">{user.email}</td>
                      <td>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            user.role === "OWNER" || user.role === "ADMIN"
                              ? "bg-[#F1EEFE] text-[#6750D9]"
                              : user.role === "MANAGER"
                              ? "bg-[#FFF1E8] text-[#E06D3B]"
                              : "bg-[#EAF8F1] text-[#0E9F6E]"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-medium text-[#172033]">
                          {branch?.name || (user.role === "OWNER" ? "All Outlets (Global)" : "Unassigned")}
                        </span>
                      </td>
                      <td>
                        <div className="operation-actions">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUser(user);
                              setName(user.name);
                              setEmail(user.email);
                              setRole(user.role);
                              setBranchId(user.branchId ? String(user.branchId) : "");
                              setPassword("");
                              setShowForm(false);
                            }}
                            title="Edit User"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user.id)}
                            className="user-delete-action"
                            title="Delete User"
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
