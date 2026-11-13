"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle2,
  Filter,
} from "lucide-react";

import {
  getVariants,
  createVariant,
  updateVariant,
  updateVariantStatus,
  deleteVariant,
  getProducts,
} from "../../lib/api";

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
  costPrice?: number | null;
  isActive: boolean;
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function VariantsPage() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<Variant | null>(null);

  const [form, setForm] = useState({
    productId: "",
    size: "",
    color: "",
    sku: "",
    price: "",
    costPrice: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setError("");
      const [variantResult, productResult] = await Promise.all([
        getVariants(),
        getProducts(),
      ]);

      setVariants(variantResult.data || variantResult.variants || []);
      setProducts(productResult.data || productResult.products || []);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load variant data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchData();
    });
  }, [fetchData]);

  const getProductName = useCallback(
    (productId: number) => {
      const prod = products.find((p) => p.id === productId);
      return prod?.name || "Unknown Product";
    },
    [products]
  );

  const filteredVariants = useMemo(() => {
    const q = search.trim().toLowerCase();

    return variants.filter((item) => {
      const productName = getProductName(item.productId).toLowerCase();
      const matchesSearch =
        !q ||
        productName.includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.size.toLowerCase().includes(q) ||
        item.color.toLowerCase().includes(q);

      const matchesProduct =
        productFilter === "all" || item.productId === Number(productFilter);

      return matchesSearch && matchesProduct;
    });
  }, [variants, search, productFilter, getProductName]);

  const summary = useMemo(() => {
    const uniqueSizes = new Set(variants.map((v) => v.size)).size;
    const uniqueColors = new Set(variants.map((v) => v.color)).size;
    const activeCount = variants.filter((v) => v.isActive).length;

    return {
      total: variants.length,
      active: activeCount,
      sizes: uniqueSizes,
      colors: uniqueColors,
    };
  }, [variants]);

  const openAddModal = () => {
    setEditingVariant(null);
    setForm({
      productId: products[0]?.id ? String(products[0].id) : "",
      size: "",
      color: "",
      sku: "",
      price: "",
      costPrice: "",
    });
    setMessage("");
    setError("");
    setShowModal(true);
  };

  const openEditModal = (variant: Variant) => {
    setEditingVariant(variant);
    setForm({
      productId: String(variant.productId),
      size: variant.size,
      color: variant.color,
      sku: variant.sku,
      price: String(variant.price),
      costPrice: variant.costPrice ? String(variant.costPrice) : "",
    });
    setMessage("");
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const price = Number(form.price);
    const costPrice = form.costPrice ? Number(form.costPrice) : null;

    if (!form.productId || !form.size || !form.color || !form.sku || isNaN(price)) {
      setError("Please fill out all required fields.");
      return;
    }

    try {
      const payload = {
        productId: Number(form.productId),
        size: form.size.trim(),
        color: form.color.trim(),
        sku: form.sku.trim(),
        price,
        costPrice: costPrice ?? undefined,
      };

      if (editingVariant) {
        await updateVariant(editingVariant.id, payload);
        setMessage("Variant updated successfully.");
      } else {
        await createVariant(payload);
        setMessage("Variant created successfully.");
      }

      setShowModal(false);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save variant.");
    }
  };

  const handleToggleStatus = async (variant: Variant) => {
    try {
      await updateVariantStatus(variant.id, !variant.isActive);
      setMessage(variant.isActive ? "Variant deactivated." : "Variant activated.");
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  const handleDelete = async () => {
    if (!variantToDelete) return;
    try {
      await deleteVariant(variantToDelete.id);
      setMessage("Variant deleted successfully.");
      setShowDeleteModal(false);
      setVariantToDelete(null);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete variant.");
    }
  };

  return (
    <div className="max-w-[1540px] mx-auto w-full">
      {/* Module Header */}
      <div className="module-header">
        <div className="module-page-title">
          <div className="module-title-icon">
            <SlidersHorizontal size={22} />
          </div>
          <div>
            <h1>Product Variants</h1>
            <p>Manage sizes, colors, SKUs, and pricing specifications for your fashion collections.</p>
          </div>
        </div>

        <button onClick={openAddModal} className="operation-primary">
          <Plus size={17} />
          <span>Add Variant</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-stats-grid mb-6">
        <div className="dashboard-stat-card purple">
          <p className="stat-card-title">Total Variants</p>
          <h3 className="stat-card-value">{summary.total}</h3>
          <span className="stat-badge growth mt-2">{summary.active} active</span>
        </div>
        <div className="dashboard-stat-card mint">
          <p className="stat-card-title">Sizes Available</p>
          <h3 className="stat-card-value">{summary.sizes}</h3>
          <span className="stat-badge growth mt-2">XS through XXL</span>
        </div>
        <div className="dashboard-stat-card peach">
          <p className="stat-card-title">Colorways</p>
          <h3 className="stat-card-value">{summary.colors}</h3>
          <span className="stat-badge neutral mt-2">Unique shades</span>
        </div>
        <div className="dashboard-stat-card blue">
          <p className="stat-card-title">Parent Products</p>
          <h3 className="stat-card-value">{products.length}</h3>
          <span className="stat-badge neutral mt-2">Catalog models</span>
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

      {/* Toolbar */}
      <div className="card-surface mb-6 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, SKU, color or size..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#EEE8E5] bg-[#FBF8F6] text-xs text-[#172033] outline-none focus:border-[#6750D9]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-[#788195] hidden sm:block" />
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="h-10 px-3.5 rounded-xl border border-[#EEE8E5] bg-[#FBF8F6] text-xs font-semibold text-[#172033] outline-none cursor-pointer w-full sm:w-56"
            >
              <option value="all">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Variants Table */}
      <div className="card-surface p-0 overflow-hidden">
        {loading ? (
          <div className="operation-empty">Loading variant specifications...</div>
        ) : filteredVariants.length === 0 ? (
          <div className="operation-empty">No variants found matching your search.</div>
        ) : (
          <div className="operation-table-wrap border-0 rounded-none shadow-none">
            <table className="operation-table">
              <thead>
                <tr>
                  <th>Parent Product</th>
                  <th>Size</th>
                  <th>Color</th>
                  <th>SKU Code</th>
                  <th>Retail Price</th>
                  <th>Cost Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVariants.map((item) => (
                  <tr key={item.id}>
                    <td><strong className="text-[#172033]">{getProductName(item.productId)}</strong></td>
                    <td>
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#F1EEFE] text-[#6750D9]">
                        {item.size}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E06D3B]" />
                        <span className="text-xs font-semibold text-[#172033]">{item.color}</span>
                      </div>
                    </td>
                    <td className="font-mono text-xs text-[#788195]">{item.sku}</td>
                    <td><strong className="text-base text-[#172033]">{currency.format(item.price)}</strong></td>
                    <td className="text-xs text-[#788195]">
                      {item.costPrice ? currency.format(item.costPrice) : "—"}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        className={`status-pill cursor-pointer transition ${
                          item.isActive ? "delivered" : "pending"
                        }`}
                        title="Click to toggle status"
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td>
                      <div className="operation-actions">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          title="Edit Variant"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setVariantToDelete(item);
                            setShowDeleteModal(true);
                          }}
                          className="user-delete-action"
                          title="Delete Variant"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================================================================
          MODAL: ADD / EDIT VARIANT
          =================================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
          <div className="card-surface w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EEE8E5] pb-4 mb-5">
              <h3 className="text-lg font-bold text-[#172033]">
                {editingVariant ? "Edit Variant" : "Add New Variant"}
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
                <span>Associated Product</span>
                <select
                  required
                  value={form.productId}
                  onChange={(e) => setForm({ ...form, productId: e.target.value })}
                >
                  <option value="" disabled>Select Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="operation-field mb-0">
                  <span>Size (e.g. S, M, L, XL, 32, 34)</span>
                  <input
                    type="text"
                    required
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                    placeholder="M"
                  />
                </div>
                <div className="operation-field mb-0">
                  <span>Color (e.g. Navy, Beige, Olive)</span>
                  <input
                    type="text"
                    required
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    placeholder="Beige"
                  />
                </div>
              </div>

              <div className="operation-field mb-0">
                <span>Variant SKU Code</span>
                <input
                  type="text"
                  required
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="e.g. CLF-SHIRT-M-BEIGE"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="operation-field mb-0">
                  <span>Retail Price (₹)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="1999"
                  />
                </div>
                <div className="operation-field mb-0">
                  <span>Cost Price (₹) (Optional)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.costPrice}
                    onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                    placeholder="850"
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
                  {editingVariant ? "Update Variant" : "Save Variant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL: DELETE VARIANT
          =================================================================== */}
      {showDeleteModal && variantToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
          <div className="card-surface w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-[#DC2626] mb-3">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-[#172033]">Delete Variant?</h3>
            </div>
            <p className="text-xs text-[#788195] leading-relaxed mb-6">
              Are you sure you want to delete variant <strong>{variantToDelete.size} / {variantToDelete.color}</strong> for <strong>{getProductName(variantToDelete.productId)}</strong>?
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
