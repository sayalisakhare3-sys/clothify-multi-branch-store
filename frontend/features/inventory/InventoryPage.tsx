"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Layers,
  AlertTriangle,
  Minus,
  Plus as PlusIcon,
  CheckCircle2,
} from "lucide-react";

import {
  getInventory,
  createInventory,
  updateInventory,
  updateInventoryQuantity,
  deleteInventory,
  getBranches,
  getProducts,
  getVariants,
} from "../../lib/api";

type Branch = {
  id: number;
  name: string;
  city: string;
  isActive: boolean;
};

type Product = {
  id: number;
  name: string;
  sku: string;
};

type Variant = {
  id: number;
  productId: number;
  size: string;
  color: string;
  sku: string;
  price: number;
  isActive: boolean;
};

type InventoryItem = {
  id: number;
  branchId: number;
  variantId: number;
  quantity: number;
  reorderLevel: number;
  createdAt?: string;
  updatedAt?: string;
};

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState<InventoryItem | null>(null);

  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [quantityItem, setQuantityItem] = useState<InventoryItem | null>(null);
  const [quantityValue, setQuantityValue] = useState("");

  const [form, setForm] = useState({
    branchId: "",
    variantId: "",
    quantity: "",
    reorderLevel: "5",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [inventoryResult, branchResult, productResult, variantResult] =
        await Promise.all([
          getInventory(),
          getBranches(),
          getProducts(),
          getVariants(),
        ]);

      setInventory(inventoryResult.data || inventoryResult.inventory || []);
      setBranches(branchResult.data || branchResult.branches || []);
      setProducts(productResult.data || productResult.products || []);
      setVariants(variantResult.data || variantResult.variants || []);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load inventory data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadData();
    });
  }, []);

  const getBranch = useCallback(
    (branchId: number) => branches.find((b) => b.id === branchId),
    [branches]
  );

  const getBranchName = useCallback(
    (branchId: number) => {
      const branch = getBranch(branchId);
      return branch ? branch.name : "Unknown Branch";
    },
    [getBranch]
  );

  const getVariant = useCallback(
    (variantId: number) => variants.find((v) => v.id === variantId),
    [variants]
  );

  const getProduct = useCallback(
    (productId: number) => products.find((p) => p.id === productId),
    [products]
  );

  const getProductName = useCallback(
    (variantId: number) => {
      const variant = getVariant(variantId);
      if (!variant) return "Unknown Product";
      const product = getProduct(variant.productId);
      return product ? product.name : "Unknown Product";
    },
    [getVariant, getProduct]
  );

  const getVariantDetails = useCallback(
    (variantId: number) => {
      const variant = getVariant(variantId);
      if (!variant) return { size: "-", color: "-", sku: "-" };
      return { size: variant.size, color: variant.color, sku: variant.sku };
    },
    [getVariant]
  );

  const getStockStatus = (item: InventoryItem): "healthy" | "low" | "out" => {
    if (item.quantity === 0) return "out";
    if (item.quantity <= item.reorderLevel) return "low";
    return "healthy";
  };

  const summary = useMemo(() => {
    const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockCount = inventory.filter((item) => getStockStatus(item) === "low").length;
    const outOfStockCount = inventory.filter((item) => getStockStatus(item) === "out").length;
    const inStockCount = inventory.filter((item) => getStockStatus(item) === "healthy").length;

    return {
      totalRecords: inventory.length,
      totalItems,
      lowStockCount,
      outOfStockCount,
      inStockCount,
    };
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    const q = search.trim().toLowerCase();

    return inventory.filter((item) => {
      const branch = getBranch(item.branchId);
      const branchName = branch?.name.toLowerCase() || "";
      const branchCity = branch?.city.toLowerCase() || "";
      const productName = getProductName(item.variantId).toLowerCase();
      const variant = getVariantDetails(item.variantId);
      const status = getStockStatus(item);

      const matchesSearch =
        !q ||
        productName.includes(q) ||
        variant.sku.toLowerCase().includes(q) ||
        variant.size.toLowerCase().includes(q) ||
        variant.color.toLowerCase().includes(q) ||
        branchName.includes(q) ||
        branchCity.includes(q);

      const matchesBranch =
        branchFilter === "all" || item.branchId === Number(branchFilter);

      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [
    inventory,
    search,
    branchFilter,
    statusFilter,
    getBranch,
    getProductName,
    getVariantDetails,
  ]);

  const openAddModal = () => {
    setEditingInventory(null);
    setForm({
      branchId: branches[0]?.id ? String(branches[0].id) : "",
      variantId: variants[0]?.id ? String(variants[0].id) : "",
      quantity: "",
      reorderLevel: "5",
    });
    setMessage("");
    setError("");
    setShowModal(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingInventory(item);
    setForm({
      branchId: String(item.branchId),
      variantId: String(item.variantId),
      quantity: String(item.quantity),
      reorderLevel: String(item.reorderLevel),
    });
    setMessage("");
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const quantity = Number(form.quantity);
    const reorderLevel = Number(form.reorderLevel);

    if (!form.branchId || !form.variantId || isNaN(quantity) || isNaN(reorderLevel)) {
      setError("Please fill out all required fields.");
      return;
    }

    try {
      const payload = {
        branchId: Number(form.branchId),
        variantId: Number(form.variantId),
        quantity,
        reorderLevel,
      };

      if (editingInventory) {
        await updateInventory(editingInventory.id, payload);
        setMessage("Inventory record updated successfully.");
      } else {
        await createInventory(payload);
        setMessage("Inventory record created successfully.");
      }

      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save inventory.");
    }
  };

  const openQuantityModal = (item: InventoryItem) => {
    setQuantityItem(item);
    setQuantityValue(String(item.quantity));
    setMessage("");
    setError("");
    setShowQuantityModal(true);
  };

  const handleQuickQuantitySave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantityItem) return;
    const qty = Number(quantityValue);
    if (isNaN(qty) || qty < 0) {
      setError("Quantity must be a valid positive number.");
      return;
    }

    try {
      await updateInventoryQuantity(quantityItem.id, qty);
      setMessage("Stock count updated.");
      setShowQuantityModal(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update quantity.");
    }
  };

  const handleAdjustDelta = async (item: InventoryItem, delta: number) => {
    const nextQty = Math.max(0, item.quantity + delta);
    try {
      await updateInventoryQuantity(item.id, nextQty);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update stock quantity.");
    }
  };

  const handleDelete = async () => {
    if (!inventoryToDelete) return;
    try {
      await deleteInventory(inventoryToDelete.id);
      setMessage("Inventory record removed.");
      setShowDeleteModal(false);
      setInventoryToDelete(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete inventory record.");
    }
  };

  return (
    <div className="max-w-[1540px] mx-auto w-full">
      {/* Module Header */}
      <div className="module-header">
        <div className="module-page-title">
          <div className="module-title-icon">
            <Layers size={22} />
          </div>
          <div>
            <h1>Inventory Management</h1>
            <p>Track real-time stock levels, reorder thresholds, and warehouse balances across stores.</p>
          </div>
        </div>

        <button onClick={openAddModal} className="operation-primary">
          <Plus size={17} />
          <span>Add Stock Record</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="dashboard-stats-grid mb-6">
        <div className="dashboard-stat-card purple">
          <p className="stat-card-title">Total In-Stock Units</p>
          <h3 className="stat-card-value">{summary.totalItems.toLocaleString()}</h3>
          <span className="stat-badge growth mt-2">{summary.totalRecords} active SKU lines</span>
        </div>
        <div className="dashboard-stat-card mint">
          <p className="stat-card-title">Healthy Stock</p>
          <h3 className="stat-card-value">{summary.inStockCount}</h3>
          <span className="stat-badge growth mt-2">Optimal inventory level</span>
        </div>
        <div className="dashboard-stat-card peach">
          <p className="stat-card-title">Low Stock Warnings</p>
          <h3 className="stat-card-value">{summary.lowStockCount}</h3>
          <span className="stat-badge neutral mt-2 text-[#E06D3B]">Needs replenishment</span>
        </div>
        <div className="dashboard-stat-card bg-[#FEF2F2] border-[#FEE2E2]">
          <p className="stat-card-title">Out of Stock</p>
          <h3 className="stat-card-value text-[#DC2626]">{summary.outOfStockCount}</h3>
          <span className="stat-badge neutral mt-2 text-[#DC2626]">Urgent restock required</span>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className="operation-alert success mb-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage("")} className="operation-secondary text-xs py-1">
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

      {/* Filters Toolbar */}
      <div className="card-surface mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, SKU, color or branch..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#EEE8E5] bg-[#FBF8F6] text-xs text-[#172033] outline-none focus:border-[#6750D9]"
            />
          </div>

          <div>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-[#EEE8E5] bg-[#FBF8F6] text-xs font-semibold text-[#172033] outline-none cursor-pointer"
            >
              <option value="all">All Retail Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name} — {b.city}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-[#EEE8E5] bg-[#FBF8F6] text-xs font-semibold text-[#172033] outline-none cursor-pointer"
            >
              <option value="all">All Stock Statuses</option>
              <option value="healthy">Healthy Stock</option>
              <option value="low">Low Stock Warning</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card-surface p-0 overflow-hidden">
        {loading ? (
          <div className="operation-empty">Loading inventory stock records...</div>
        ) : filteredInventory.length === 0 ? (
          <div className="operation-empty">No stock records found matching your filters.</div>
        ) : (
          <div className="operation-table-wrap border-0 rounded-none shadow-none">
            <table className="operation-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Variant</th>
                  <th>SKU</th>
                  <th>Store Branch</th>
                  <th>On Hand</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                  <th>Adjust</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const details = getVariantDetails(item.variantId);
                  const status = getStockStatus(item);
                  return (
                    <tr key={item.id}>
                      <td><strong className="text-[#172033]">{getProductName(item.variantId)}</strong></td>
                      <td>
                        <span className="px-2 py-0.5 rounded-md text-xs bg-[#FBF8F6] border border-[#EEE8E5] font-semibold text-[#172033]">
                          {details.size} · {details.color}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-[#788195]">{details.sku}</td>
                      <td>{getBranchName(item.branchId)}</td>
                      <td><strong className="text-base text-[#172033]">{item.quantity}</strong></td>
                      <td className="text-[#788195]">{item.reorderLevel} units</td>
                      <td>
                        <span
                          className={`status-pill ${
                            status === "healthy"
                              ? "delivered"
                              : status === "low"
                              ? "processing"
                              : "low-stock"
                          }`}
                        >
                          {status === "healthy"
                            ? "Healthy"
                            : status === "low"
                            ? "Low Stock"
                            : "Out of Stock"}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAdjustDelta(item, -1)}
                            className="w-7 h-7 rounded-lg border border-[#EEE8E5] bg-white flex items-center justify-center text-[#172033] hover:bg-[#F1EEFE] hover:text-[#6750D9] transition"
                            title="Decrease quantity by 1"
                          >
                            <Minus size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openQuantityModal(item)}
                            className="px-2 h-7 rounded-lg border border-[#EEE8E5] bg-white text-xs font-semibold text-[#6750D9] hover:bg-[#F1EEFE] transition"
                            title="Set exact quantity"
                          >
                            Set
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustDelta(item, 1)}
                            className="w-7 h-7 rounded-lg border border-[#EEE8E5] bg-white flex items-center justify-center text-[#172033] hover:bg-[#F1EEFE] hover:text-[#6750D9] transition"
                            title="Increase quantity by 1"
                          >
                            <PlusIcon size={12} />
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="operation-actions">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            title="Edit Record"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setInventoryToDelete(item);
                              setShowDeleteModal(true);
                            }}
                            className="user-delete-action"
                            title="Delete Stock Record"
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

      {/* ===================================================================
          MODAL: ADD / EDIT INVENTORY
          =================================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
          <div className="card-surface w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EEE8E5] pb-4 mb-5">
              <h3 className="text-lg font-bold text-[#172033]">
                {editingInventory ? "Edit Inventory Record" : "Add Inventory Record"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-[#788195] hover:bg-[#F1EEFE] hover:text-[#6750D9]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="operation-field mb-0">
                <span>Branch Location</span>
                <select
                  required
                  value={form.branchId}
                  onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                >
                  <option value="" disabled>Select Branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} — {b.city}</option>
                  ))}
                </select>
              </div>

              <div className="operation-field mb-0">
                <span>Clothing Variant</span>
                <select
                  required
                  value={form.variantId}
                  onChange={(e) => setForm({ ...form, variantId: e.target.value })}
                >
                  <option value="" disabled>Select Variant</option>
                  {variants.map((v) => {
                    const prod = getProduct(v.productId);
                    return (
                      <option key={v.id} value={v.id}>
                        {prod?.name || "Product"} — {v.size} / {v.color} (SKU: {v.sku})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="operation-field mb-0">
                  <span>Quantity on Hand</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="e.g. 50"
                  />
                </div>
                <div className="operation-field mb-0">
                  <span>Reorder Level</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.reorderLevel}
                    onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
                    placeholder="e.g. 10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EEE8E5]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="operation-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="operation-primary">
                  {editingInventory ? "Update Stock" : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL: QUICK SET QUANTITY
          =================================================================== */}
      {showQuantityModal && quantityItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
          <div className="card-surface w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-[#172033] mb-1">Update Stock Count</h3>
            <p className="text-xs text-[#788195] mb-4">
              {getProductName(quantityItem.variantId)} · {getVariantDetails(quantityItem.variantId).size} ({getBranchName(quantityItem.branchId)})
            </p>

            <form onSubmit={handleQuickQuantitySave} className="flex flex-col gap-4">
              <div className="operation-field mb-0">
                <span>New Quantity</span>
                <input
                  type="number"
                  min="0"
                  required
                  autoFocus
                  value={quantityValue}
                  onChange={(e) => setQuantityValue(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuantityModal(false)}
                  className="operation-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="operation-primary">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL: DELETE CONFIRMATION
          =================================================================== */}
      {showDeleteModal && inventoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
          <div className="card-surface w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-[#DC2626] mb-3">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-[#172033]">Remove Stock Record?</h3>
            </div>
            <p className="text-xs text-[#788195] leading-relaxed mb-6">
              Are you sure you want to remove the inventory tracking entry for <strong>{getProductName(inventoryToDelete.variantId)}</strong> at <strong>{getBranchName(inventoryToDelete.branchId)}</strong>?
            </p>
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
                onClick={handleDelete}
                className="operation-primary bg-[#DC2626] hover:bg-[#B91C1C]"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
