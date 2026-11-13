"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Filter,
} from "lucide-react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from "@/lib/api";

type Category = {
  id: number;
  name: string;
  description?: string | null;
};

type Product = {
  id: number;
  name: string;
  sku: string;
  description?: string | null;
  categoryId: number;
  createdAt?: string;
  updatedAt?: string;
};

type ProductForm = {
  name: string;
  sku: string;
  description: string;
  categoryId: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState<ProductForm>({
    name: "",
    sku: "",
    description: "",
    categoryId: "",
  });

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setError("");
        const [productResult, categoryResult] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);

        if (!cancelled) {
          setProducts(productResult.products || []);
          setCategories(categoryResult.categories || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load products");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !searchValue ||
        product.name.toLowerCase().includes(searchValue) ||
        product.sku.toLowerCase().includes(searchValue);

      const matchesCategory =
        categoryFilter === "all" ||
        product.categoryId === Number(categoryFilter);

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((item) => item.id === categoryId);
    return category?.name || "Unassigned";
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      sku: "",
      description: "",
      categoryId: categories[0]?.id ? String(categories[0].id) : "",
    });
    setError("");
    setMessage("");
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      sku: product.sku,
      description: product.description || "",
      categoryId: String(product.categoryId),
    });
    setError("");
    setMessage("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const name = form.name.trim();
    const sku = form.sku.trim();
    const description = form.description.trim();
    const categoryId = Number(form.categoryId);

    if (!name || !sku) {
      setError("Product name and SKU are required.");
      return;
    }

    if (!form.categoryId || Number.isNaN(categoryId)) {
      setError("Please select a category.");
      return;
    }

    try {
      setSaving(true);
      const productData = { name, sku, description, categoryId };

      if (editingProduct) {
        const result = await updateProduct(editingProduct.id, productData);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? result.product : p))
        );
        setMessage("Product updated successfully.");
      } else {
        const result = await createProduct(productData);
        setProducts((prev) => [result.product, ...prev]);
        setMessage("Product created successfully.");
      }
      setShowModal(false);
      setEditingProduct(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setError("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      setError("");
      await deleteProduct(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setMessage("Product deleted successfully.");
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product.");
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
            <Package size={22} />
          </div>
          <div>
            <h1>Products Catalog</h1>
            <p>Manage your clothing lines, SKUs, seasonal collections, and retail tags.</p>
          </div>
        </div>

        <button onClick={openAddModal} className="operation-primary">
          <Plus size={17} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-stats-grid mb-6">
        <div className="dashboard-stat-card purple">
          <p className="stat-card-title">Total Products</p>
          <h3 className="stat-card-value">{products.length}</h3>
          <span className="stat-badge growth mt-2">Active in catalog</span>
        </div>
        <div className="dashboard-stat-card peach">
          <p className="stat-card-title">Categories</p>
          <h3 className="stat-card-value">{categories.length}</h3>
          <span className="stat-badge neutral mt-2">Product lines</span>
        </div>
        <div className="dashboard-stat-card mint">
          <p className="stat-card-title">Filtered Results</p>
          <h3 className="stat-card-value">{filteredProducts.length}</h3>
          <span className="stat-badge growth mt-2">Matching query</span>
        </div>
        <div className="dashboard-stat-card blue">
          <p className="stat-card-title">Status</p>
          <h3 className="stat-card-value">Live</h3>
          <span className="stat-badge neutral mt-2">Ready for POS</span>
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

      {error && !showModal && !showDeleteModal && (
        <div className="operation-alert error mb-5">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="operation-secondary text-xs py-1">
            Dismiss
          </button>
        </div>
      )}

      {/* Toolbar: Search + Category Filter */}
      <div className="card-surface mb-6 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by title or SKU code..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#EEE8E5] bg-[#FBF8F6] text-xs text-[#172033] outline-none focus:border-[#6750D9] focus:ring-2 focus:ring-[#6750D9]/10"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-[#788195] hidden sm:block" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 px-3.5 rounded-xl border border-[#EEE8E5] bg-[#FBF8F6] text-xs font-semibold text-[#172033] outline-none cursor-pointer w-full sm:w-56"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card-surface p-0 overflow-hidden">
        {loading ? (
          <div className="operation-empty flex items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#6750D9]" size={20} />
            <span>Loading fashion catalog...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="operation-empty">
            {products.length === 0
              ? "No products added yet. Click '+ Add Product' to start building your catalog."
              : "No products matched your search or category filter."}
          </div>
        ) : (
          <div className="operation-table-wrap border-0 rounded-none shadow-none">
            <table className="operation-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#F1EEFE] text-[#6750D9] flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {product.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-[#172033]">{product.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-xs px-2 py-1 rounded bg-[#FBF8F6] border border-[#EEE8E5] text-[#172033]">
                        {product.sku}
                      </span>
                    </td>
                    <td>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF1E8] text-[#E06D3B]">
                        {getCategoryName(product.categoryId)}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-[#788195] max-w-xs truncate block">
                        {product.description || "—"}
                      </span>
                    </td>
                    <td>
                      <div className="operation-actions">
                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                          title="Edit product"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(product)}
                          className="user-delete-action"
                          title="Delete product"
                        >
                          <Trash2 size={14} />
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
          ADD / EDIT PRODUCT MODAL
          =================================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
          <div className="card-surface w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#EEE8E5] pb-4 mb-5">
              <h3 className="text-lg font-bold text-[#172033]">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={closeModal}
                disabled={saving}
                className="p-1 rounded-lg text-[#788195] hover:bg-[#F1EEFE] hover:text-[#6750D9]"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="operation-alert error mb-4 text-xs">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="operation-field mb-0">
                <span>Product Name</span>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Classic Linen Shirt"
                />
              </div>

              <div className="operation-field mb-0">
                <span>SKU Code</span>
                <input
                  type="text"
                  required
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="e.g. CLF-SHIRT-001"
                />
              </div>

              <div className="operation-field mb-0">
                <span>Category</span>
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="operation-field mb-0">
                <span>Description (Optional)</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Fabric details, fit, and seasonal notes..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EEE8E5]">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="operation-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="operation-primary"
                >
                  {saving ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          DELETE CONFIRMATION MODAL
          =================================================================== */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
          <div className="card-surface w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-[#DC2626] mb-3">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold text-[#172033]">Delete Product?</h3>
            </div>
            <p className="text-xs text-[#788195] leading-relaxed mb-6">
              Are you sure you want to delete <strong>{productToDelete.name}</strong> (SKU: {productToDelete.sku})? This action cannot be undone and will remove associated catalog entries.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="operation-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
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
