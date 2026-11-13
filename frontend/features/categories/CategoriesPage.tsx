"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Tag,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  FolderOpen,
} from "lucide-react";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api";

type Category = {
  id: number;
  name: string;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type CategoryFormData = {
  name: string;
  description: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [addForm, setAddForm] = useState<CategoryFormData>({
    name: "",
    description: "",
  });

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editForm, setEditForm] = useState<CategoryFormData>({
    name: "",
    description: "",
  });

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const result = await getCategories();
      setCategories(result.categories || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadCategories();
    });
  }, []);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;

    return categories.filter((category) => {
      const name = category.name?.toLowerCase() || "";
      const description = category.description?.toLowerCase() || "";
      return name.includes(q) || description.includes(q);
    });
  }, [categories, search]);

  const openAddModal = () => {
    setAddForm({ name: "", description: "" });
    setAddError("");
    setShowAddModal(true);
  };

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      setAddError("Category name is required.");
      return;
    }

    try {
      setAdding(true);
      setAddError("");
      await createCategory({
        name: addForm.name.trim(),
        description: addForm.description.trim(),
      });
      setShowAddModal(false);
      await loadCategories();
    } catch (error) {
      setAddError(
        error instanceof Error ? error.message : "Failed to create category."
      );
    } finally {
      setAdding(false);
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setEditForm({
      name: category.name,
      description: category.description || "",
    });
    setEditError("");
    setShowEditModal(true);
  };

  const openDeleteModal = (category: Category) => {
    setDeletingCategory(category);
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const handleEditCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCategory || !editForm.name.trim()) {
      setEditError("Category name is required.");
      return;
    }

    try {
      setEditing(true);
      setEditError("");
      await updateCategory(editingCategory.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
      });
      setShowEditModal(false);
      await loadCategories();
    } catch (error) {
      setEditError(
        error instanceof Error ? error.message : "Failed to update category."
      );
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      setDeleting(true);
      setDeleteError("");
      await deleteCategory(deletingCategory.id);
      setShowDeleteModal(false);
      setDeletingCategory(null);
      await loadCategories();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete category."
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
            <Tag size={22} />
          </div>
          <div>
            <h1>Categories Management</h1>
            <p>Structure your apparel lines into intuitive categories for POS browsing and inventory.</p>
          </div>
        </div>

        <button onClick={openAddModal} className="operation-primary">
          <Plus size={17} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-stats-grid mb-6">
        <div className="dashboard-stat-card purple">
          <p className="stat-card-title">Total Categories</p>
          <h3 className="stat-card-value">{categories.length}</h3>
          <span className="stat-badge growth mt-2">Active clothing lines</span>
        </div>
        <div className="dashboard-stat-card peach">
          <p className="stat-card-title">Search Matches</p>
          <h3 className="stat-card-value">{filteredCategories.length}</h3>
          <span className="stat-badge neutral mt-2">Filter results</span>
        </div>
        <div className="dashboard-stat-card mint">
          <p className="stat-card-title">Catalog Integration</p>
          <h3 className="stat-card-value">100%</h3>
          <span className="stat-badge growth mt-2">POS & Web Ready</span>
        </div>
        <div className="dashboard-stat-card blue">
          <p className="stat-card-title">Organization</p>
          <h3 className="stat-card-value">Standard</h3>
          <span className="stat-badge neutral mt-2">Hierarchical</span>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="card-surface mb-6 p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name or description..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#EEE8E5] bg-[#FBF8F6] text-xs text-[#172033] outline-none focus:border-[#6750D9]"
          />
        </div>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full operation-empty">Loading fashion categories...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-full operation-empty">No categories found.</div>
        ) : (
          filteredCategories.map((category) => (
            <div
              key={category.id}
              className="card-surface flex flex-col justify-between hover:border-[#D3CCE8] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F1EEFE] text-[#6750D9] flex items-center justify-center font-bold">
                    <FolderOpen size={20} />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF8F1] text-[#0E9F6E]">
                    Active
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#172033] mb-1">{category.name}</h3>
                <p className="text-xs text-[#788195] line-clamp-2">
                  {category.description || "No description provided for this collection."}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-[#EEE8E5] pt-3 mt-4">
                <span className="text-[11px] text-[#9CA3AF]">
                  ID #{category.id}
                </span>
                <div className="operation-actions">
                  <button
                    type="button"
                    onClick={() => openEditModal(category)}
                    title="Edit Category"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteModal(category)}
                    className="user-delete-action"
                    title="Delete Category"
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
          MODAL: ADD CATEGORY
          =================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
          <div className="card-surface w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EEE8E5] pb-4 mb-5">
              <h3 className="text-lg font-bold text-[#172033]">Add Category</h3>
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

            <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
              <div className="operation-field mb-0">
                <span>Category Name</span>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Formal Wear, Denim, Knitwear"
                />
              </div>

              <div className="operation-field mb-0">
                <span>Description (Optional)</span>
                <textarea
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  placeholder="Notes about styles, fabrics, target age group..."
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
                  {adding ? "Creating..." : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL: EDIT CATEGORY
          =================================================================== */}
      {showEditModal && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
          <div className="card-surface w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EEE8E5] pb-4 mb-5">
              <h3 className="text-lg font-bold text-[#172033]">Edit Category</h3>
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

            <form onSubmit={handleEditCategory} className="flex flex-col gap-4">
              <div className="operation-field mb-0">
                <span>Category Name</span>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div className="operation-field mb-0">
                <span>Description</span>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
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
                <button type="submit" disabled={editing} className="operation-primary">
                  {editing ? "Saving..." : "Update Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL: DELETE CATEGORY
          =================================================================== */}
      {showDeleteModal && deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-xs p-4">
          <div className="card-surface w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-[#DC2626] mb-3">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-[#172033]">Delete Category?</h3>
            </div>
            <p className="text-xs text-[#788195] leading-relaxed mb-6">
              Are you sure you want to delete <strong>{deletingCategory.name}</strong>? Any products assigned to this category will need to be re-categorized.
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
                onClick={handleDeleteCategory}
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
