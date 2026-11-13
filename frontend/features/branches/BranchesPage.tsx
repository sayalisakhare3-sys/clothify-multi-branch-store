"use client";

import { useEffect, useState } from "react";
import {
  Store,
  MapPin,
  Phone,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";

import {
  getBranches,
  createBranch,
  updateBranch,
  updateBranchStatus,
  deleteBranch,
} from "@/lib/api";

type Branch = {
  id: number;
  name: string;
  city: string;
  address?: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type BranchFormData = {
  name: string;
  city: string;
  address: string;
  phone: string;
};

const emptyForm: BranchFormData = {
  name: "",
  city: "",
  address: "",
  phone: "",
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Add branch
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<BranchFormData>(emptyForm);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // Edit branch
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<BranchFormData>(emptyForm);
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete branch
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Status changing
  const [changingStatusId, setChangingStatusId] = useState<number | null>(null);

  const loadBranches = async () => {
    try {
      setLoading(true);
      const result = await getBranches();
      setBranches(result.data || []);
    } catch (error) {
      console.error("Error loading branches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadBranches();
    });
  }, []);

  const filteredBranches = branches.filter((branch) => {
    const q = searchTerm.toLowerCase();
    return (
      branch.name.toLowerCase().includes(q) ||
      branch.city.toLowerCase().includes(q) ||
      (branch.address || "").toLowerCase().includes(q) ||
      (branch.phone || "").includes(q)
    );
  });

  const activeBranchesCount = branches.filter((b) => b.isActive).length;
  const uniqueCities = new Set(branches.map((b) => b.city)).size;

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");

    if (!formData.name.trim() || !formData.city.trim()) {
      setAddError("Branch name and city are required.");
      return;
    }

    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      setAddError("Phone number must contain exactly 10 digits.");
      return;
    }

    try {
      setAdding(true);
      await createBranch({
        name: formData.name.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
      });
      setFormData(emptyForm);
      setShowAddModal(false);
      await loadBranches();
    } catch (error) {
      setAddError(
        error instanceof Error ? error.message : "Failed to create branch."
      );
    } finally {
      setAdding(false);
    }
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranchId(branch.id);
    setEditFormData({
      name: branch.name || "",
      city: branch.city || "",
      address: branch.address || "",
      phone: branch.phone || "",
    });
    setEditError("");
    setShowEditModal(true);
  };

  const handleUpdateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranchId === null) return;
    setEditError("");

    if (!editFormData.name.trim() || !editFormData.city.trim()) {
      setEditError("Branch name and city are required.");
      return;
    }

    if (editFormData.phone && !/^[0-9]{10}$/.test(editFormData.phone)) {
      setEditError("Phone number must contain exactly 10 digits.");
      return;
    }

    try {
      setUpdating(true);
      await updateBranch(editingBranchId, {
        name: editFormData.name.trim(),
        city: editFormData.city.trim(),
        address: editFormData.address.trim(),
        phone: editFormData.phone.trim(),
      });
      setShowEditModal(false);
      setEditingBranchId(null);
      setEditFormData(emptyForm);
      await loadBranches();
    } catch (error) {
      setEditError(
        error instanceof Error ? error.message : "Failed to update branch."
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (branch: Branch) => {
    try {
      setChangingStatusId(branch.id);
      await updateBranchStatus(branch.id, !branch.isActive);
      await loadBranches();
    } catch (error) {
      console.error("Error updating branch status:", error);
    } finally {
      setChangingStatusId(null);
    }
  };

  const handleDeleteBranch = async () => {
    if (!deletingBranch) return;
    try {
      setDeleting(true);
      setDeleteError("");
      await deleteBranch(deletingBranch.id);
      setShowDeleteModal(false);
      setDeletingBranch(null);
      await loadBranches();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete branch."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-[1540px] mx-auto w-full">
      {/* Module Header */}
      <div className="module-header">
        <div className="module-page-title">
          <div className="module-title-icon">
            <Store size={22} />
          </div>
          <div>
            <h1>Branches & Stores</h1>
            <p>Manage physical retail outlets, boutique stores, locations, and contact info.</p>
          </div>
        </div>

        <button onClick={() => setShowAddModal(true)} className="operation-primary">
          <Plus size={17} />
          <span>Add Branch</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-stats-grid mb-6">
        <div className="dashboard-stat-card purple">
          <p className="stat-card-title">Total Branches</p>
          <h3 className="stat-card-value">{branches.length}</h3>
          <span className="stat-badge growth mt-2">{activeBranchesCount} operational</span>
        </div>
        <div className="dashboard-stat-card mint">
          <p className="stat-card-title">Active Outlets</p>
          <h3 className="stat-card-value">{activeBranchesCount}</h3>
          <span className="stat-badge growth mt-2">Serving customers</span>
        </div>
        <div className="dashboard-stat-card peach">
          <p className="stat-card-title">Cities Covered</p>
          <h3 className="stat-card-value">{uniqueCities}</h3>
          <span className="stat-badge neutral mt-2">Regional coverage</span>
        </div>
        <div className="dashboard-stat-card blue">
          <p className="stat-card-title">POS Terminals</p>
          <h3 className="stat-card-value">Online</h3>
          <span className="stat-badge growth mt-2">Synchronized</span>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="card-surface mb-6 p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search branches by store name, city, address or phone..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#EEE8E5] bg-[#FBF8F6] text-xs text-[#172033] outline-none focus:border-[#6750D9]"
          />
        </div>
      </div>

      {/* Branches Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full operation-empty">Loading retail store branches...</div>
        ) : filteredBranches.length === 0 ? (
          <div className="col-span-full operation-empty">No branches found.</div>
        ) : (
          filteredBranches.map((branch) => (
            <div
              key={branch.id}
              className="card-surface flex flex-col justify-between hover:border-[#D3CCE8] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F1EEFE] text-[#6750D9] flex items-center justify-center font-bold">
                    <Store size={20} />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(branch)}
                    disabled={changingStatusId === branch.id}
                    className={`status-pill cursor-pointer transition ${
                      branch.isActive ? "delivered" : "pending"
                    }`}
                    title="Toggle active status"
                  >
                    {branch.isActive ? "Active" : "Inactive"}
                  </button>
                </div>

                <div className="flex items-baseline justify-between">
                  <h3 className="text-base font-bold text-[#172033]">{branch.name}</h3>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#FFF1E8] text-[#E06D3B]">
                    {branch.city}
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-2 text-xs text-[#788195]">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-[#9CA3AF] shrink-0 mt-0.5" />
                    <span>{branch.address || "No physical street address specified."}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-[#9CA3AF] shrink-0" />
                    <span>{branch.phone || "No phone listed."}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#EEE8E5] pt-3 mt-5">
                <span className="text-[11px] text-[#9CA3AF]">
                  Branch ID #{branch.id}
                </span>
                <div className="operation-actions">
                  <button
                    type="button"
                    onClick={() => openEditModal(branch)}
                    title="Edit Store"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingBranch(branch);
                      setDeleteError("");
                      setShowDeleteModal(true);
                    }}
                    className="user-delete-action"
                    title="Delete Store"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ===================================================================
          MODAL: ADD BRANCH
          =================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
          <div className="card-surface w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EEE8E5] pb-4 mb-5">
              <h3 className="text-lg font-bold text-[#172033]">Add Retail Branch</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-[#788195] hover:bg-[#F1EEFE] hover:text-[#6750D9]"
              >
                <X size={18} />
              </button>
            </div>

            {addError && (
              <div className="operation-alert error mb-4 text-xs">
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddBranch} className="flex flex-col gap-4">
              <div className="operation-field mb-0">
                <span>Branch Name</span>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Clothify Flagship — Downtown"
                />
              </div>

              <div className="operation-field mb-0">
                <span>City</span>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Mumbai, Bangalore, Delhi"
                />
              </div>

              <div className="operation-field mb-0">
                <span>Address</span>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Suite 104, High Street Mall"
                />
              </div>

              <div className="operation-field mb-0">
                <span>Phone (10 Digits)</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9876543210"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EEE8E5]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="operation-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={adding} className="operation-primary">
                  {adding ? "Creating..." : "Create Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL: EDIT BRANCH
          =================================================================== */}
      {showEditModal && editingBranchId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
          <div className="card-surface w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EEE8E5] pb-4 mb-5">
              <h3 className="text-lg font-bold text-[#172033]">Edit Retail Branch</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-[#788195] hover:bg-[#F1EEFE] hover:text-[#6750D9]"
              >
                <X size={18} />
              </button>
            </div>

            {editError && (
              <div className="operation-alert error mb-4 text-xs">
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateBranch} className="flex flex-col gap-4">
              <div className="operation-field mb-0">
                <span>Branch Name</span>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </div>

              <div className="operation-field mb-0">
                <span>City</span>
                <input
                  type="text"
                  required
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                />
              </div>

              <div className="operation-field mb-0">
                <span>Address</span>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                />
              </div>

              <div className="operation-field mb-0">
                <span>Phone (10 Digits)</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EEE8E5]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="operation-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={updating} className="operation-primary">
                  {updating ? "Saving..." : "Update Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL: DELETE BRANCH
          =================================================================== */}
      {showDeleteModal && deletingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
          <div className="card-surface w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-[#DC2626] mb-3">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-[#172033]">Delete Retail Branch?</h3>
            </div>
            <p className="text-xs text-[#788195] leading-relaxed mb-6">
              Are you sure you want to remove <strong>{deletingBranch.name}</strong> ({deletingBranch.city})? Associated POS registers and branch records must be reassigned.
            </p>
            {deleteError && (
              <div className="operation-alert error mb-4 text-xs">
                <span>{deleteError}</span>
              </div>
            )}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="operation-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBranch}
                disabled={deleting}
                className="operation-primary bg-[#DC2626] hover:bg-[#B91C1C]"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
