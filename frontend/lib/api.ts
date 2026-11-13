const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, { ...init, headers, cache: "no-store" });
}

// ==========================================
// AUTH API
// ==========================================
export async function login(email: string, password: string) {
  const response = await apiFetch(`${API_URL}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Login failed");
  return result;
}

export interface DashboardData {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  totalBranches: number;
  todaySales: number;
  todayOrders: number;
  recentSales: SaleRecord[];
  lowStockItems: Array<{
    id: number;
    branch: { id: number; name: string };
    quantity: number;
    reorderLevel: number;
    variant: {
      id: number;
      size: string;
      color: string;
      sku: string;
      product: { id: number; name: string; sku: string };
    };
  }>;
}

export async function getDashboardData() {
  const response = await apiFetch(`${API_URL}/dashboard`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to load dashboard data");
  }
  return result as { success: boolean } & DashboardData;
}

// ==========================================
// BRANCH API
// ==========================================

export async function getBranches() {
  const response = await apiFetch(`${API_URL}/branches`);

  if (!response.ok) {
    throw new Error("Failed to fetch branches");
  }

  return response.json();
}

export async function createBranch(data: {
  name: string;
  city: string;
  address?: string;
  phone?: string;
}) {
  const response = await apiFetch(`${API_URL}/branches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create branch");
  }

  return response.json();
}

export async function updateBranch(
  id: number,
  data: {
    name: string;
    city: string;
    address?: string;
    phone?: string;
  }
) {
  const response = await apiFetch(`${API_URL}/branches/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update branch");
  }

  return response.json();
}

export async function updateBranchStatus(
  id: number,
  isActive: boolean
) {
  const response = await apiFetch(`${API_URL}/branches/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isActive }),
  });

  if (!response.ok) {
    throw new Error("Failed to update branch status");
  }

  return response.json();
}

export async function deleteBranch(id: number) {
  const response = await apiFetch(`${API_URL}/branches/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete branch");
  }

  return response.json();
}

// ==========================================
// CATEGORY API
// ==========================================

export async function getCategories() {
  const response = await apiFetch(`${API_URL}/categories`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to fetch categories"
    );
  }

  return result;
}

export async function getCategoryById(id: number) {
  const response = await apiFetch(`${API_URL}/categories/${id}`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to fetch category"
    );
  }

  return result;
}

export async function createCategory(data: {
  name: string;
  description?: string;
}) {
  const response = await apiFetch(`${API_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to create category"
    );
  }

  return result;
}

export async function updateCategory(
  id: number,
  data: {
    name: string;
    description?: string;
  }
) {
  const response = await apiFetch(`${API_URL}/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to update category"
    );
  }

  return result;
}

export async function deleteCategory(id: number) {
  const response = await apiFetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to delete category"
    );
  }

  return result;
}

// ==========================================
// PRODUCT API
// ==========================================

export async function getProducts() {
  const response = await apiFetch(`${API_URL}/products`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to fetch products"
    );
  }

  return result;
}

export async function getProductById(id: number) {
  const response = await apiFetch(`${API_URL}/products/${id}`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to fetch product"
    );
  }

  return result;
}

export async function createProduct(data: {
  name: string;
  sku: string;
  description?: string;
  categoryId: number;
}) {
  const response = await apiFetch(`${API_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to create product"
    );
  }

  return result;
}

export async function updateProduct(
  id: number,
  data: {
    name: string;
    sku: string;
    description?: string;
    categoryId: number;
  }
) {
  const response = await apiFetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to update product"
    );
  }

  return result;
}

export async function deleteProduct(id: number) {
  const response = await apiFetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to delete product"
    );
  }

  return result;
}

// ==========================================
// VARIANT API
// ==========================================

export async function getVariants() {
  const response = await apiFetch(`${API_URL}/variants`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to fetch variants"
    );
  }

  return result;
}

export async function getVariantById(id: number) {
  const response = await apiFetch(`${API_URL}/variants/${id}`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to fetch variant"
    );
  }

  return result;
}

export async function getVariantsByProduct(productId: number) {
  const response = await apiFetch(
    `${API_URL}/variants/product/${productId}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to fetch product variants"
    );
  }

  return result;
}

export async function createVariant(data: {
  productId: number;
  size: string;
  color: string;
  sku: string;
  price: number;
  costPrice?: number;
}) {
  const response = await apiFetch(`${API_URL}/variants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to create variant"
    );
  }

  return result;
}

export async function updateVariant(
  id: number,
  data: {
    productId: number;
    size: string;
    color: string;
    sku: string;
    price: number;
    costPrice?: number;
  }
) {
  const response = await apiFetch(`${API_URL}/variants/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to update variant"
    );
  }

  return result;
}

export async function updateVariantStatus(
  id: number,
  isActive: boolean
) {
  const response = await apiFetch(
    `${API_URL}/variants/${id}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isActive,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to update variant status"
    );
  }

  return result;
}

export async function deleteVariant(id: number) {
  const response = await apiFetch(`${API_URL}/variants/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to delete variant"
    );
  }

  return result;
}

// ==========================================
// INVENTORY API
// ==========================================

export interface Inventory {
  id: number;
  branchId: number;
  variantId: number;
  quantity: number;
  reorderLevel: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInventoryData {
  branchId: number;
  variantId: number;
  quantity: number;
  reorderLevel: number;
}

export interface UpdateInventoryData {
  branchId?: number;
  variantId?: number;
  quantity?: number;
  reorderLevel?: number;
}

// Get all inventory
export async function getInventory() {
  const response = await apiFetch(`${API_URL}/inventory`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to fetch inventory"
    );
  }

  return result;
}

// Get inventory by ID
export async function getInventoryById(id: number) {
  const response = await apiFetch(`${API_URL}/inventory/${id}`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to fetch inventory"
    );
  }

  return result;
}

// Get inventory by branch
export async function getInventoryByBranch(branchId: number) {
  const response = await apiFetch(
    `${API_URL}/inventory/branch/${branchId}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to fetch branch inventory"
    );
  }

  return result;
}

// Get inventory by variant
export async function getInventoryByVariant(variantId: number) {
  const response = await apiFetch(
    `${API_URL}/inventory/variant/${variantId}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to fetch variant inventory"
    );
  }

  return result;
}

// Create inventory
export async function createInventory(
  data: CreateInventoryData
) {
  const response = await apiFetch(`${API_URL}/inventory`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to create inventory"
    );
  }

  return result;
}

// Update inventory
export async function updateInventory(
  id: number,
  data: UpdateInventoryData
) {
  const response = await apiFetch(`${API_URL}/inventory/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to update inventory"
    );
  }

  return result;
}

// Update only inventory quantity
export async function updateInventoryQuantity(
  id: number,
  quantity: number
) {
  const response = await apiFetch(
    `${API_URL}/inventory/${id}/quantity`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to update inventory quantity"
    );
  }

  return result;
}

// Delete inventory
export async function deleteInventory(id: number) {
  const response = await apiFetch(`${API_URL}/inventory/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to delete inventory"
    );
  }

  return result;
}

// ==========================================
// POINT OF SALE, SALES AND INVOICES
// ==========================================

export interface PosVariant {
  id: number;
  size: string;
  color: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface PosProduct {
  id: number;
  name: string;
  sku: string;
  variants: PosVariant[];
}

export interface SaleItem {
  id: number;
  variantId: number;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  variant: {
    id: number;
    size: string;
    color: string;
    sku: string;
    product: { id: number; name: string; sku: string };
  };
  returns?: Array<{ quantity: number; refundAmount: number }>;
}

export interface SaleRecord {
  id: number;
  invoiceNumber: string;
  branchId: number;
  cashierId: number;
  customerId: number | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  branch?: { id: number; name: string; city?: string };
  customer?: { id: number; name: string; phone?: string | null } | null;
  cashier?: { id: number; name: string };
  items: SaleItem[];
  returns?: Array<{
    id: number;
    type: "RETURN" | "EXCHANGE";
    refundAmount: number;
    amountDue: number;
    createdAt?: string;
    items?: Array<{ id: number; saleItemId: number; quantity: number; refundAmount: number }>;
    replacementSale?: { id: number; invoiceNumber: string; total: number } | null;
  }>;
}

async function commerceRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(`${API_URL}${path}`, init);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || result.error || "Request failed");
  }
  return result as T;
}

export async function getPosCatalog(branchId: number, search = "") {
  const params = new URLSearchParams({ branchId: String(branchId) });
  if (search.trim()) params.set("search", search.trim());
  return commerceRequest<{ success: boolean; branchId: number; products: PosProduct[] }>(
    `/pos/catalog?${params.toString()}`
  );
}

export async function createSale(data: {
  branchId: number;
  customerId?: number | null;
  paymentMethod: "CASH" | "CARD" | "UPI" | "OTHER";
  discount: number;
  items: Array<{ variantId: number; quantity: number }>;
}) {
  return commerceRequest<{ success: boolean; sale: SaleRecord }>("/sales", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getSales(search = "") {
  const params = new URLSearchParams();
  if (search.trim()) params.set("search", search.trim());
  return commerceRequest<{ success: boolean; sales: SaleRecord[] }>(
    `/sales${params.size ? `?${params.toString()}` : ""}`
  );
}

export async function getSale(id: number) {
  return commerceRequest<{ success: boolean; sale: SaleRecord }>(`/sales/${id}`);
}

export async function getInvoices(search = "") {
  const params = new URLSearchParams();
  if (search.trim()) params.set("search", search.trim());
  return commerceRequest<{ success: boolean; sales: SaleRecord[] }>(
    `/invoices${params.size ? `?${params.toString()}` : ""}`
  );
}

export async function getInvoice(id: number) {
  return commerceRequest<{ success: boolean; sale: SaleRecord }>(`/invoices/${id}`);
}

export async function createReturn(data: {
  saleId: number;
  type: "RETURN" | "EXCHANGE";
  items: Array<{ saleItemId: number; quantity: number }>;
  replacementItems?: Array<{ variantId: number; quantity: number }>;
  paymentMethod: "CASH" | "CARD" | "UPI" | "OTHER";
  reason?: string;
}) {
  return commerceRequest<{
    success: boolean;
    return: {
      id: number;
      type: "RETURN" | "EXCHANGE";
      refundAmount: number;
      amountDue: number;
      replacementSale?: { invoiceNumber: string } | null;
    };
  }>(`/sales/${data.saleId}/returns`, {
    method: "POST",
    body: JSON.stringify({
      type: data.type,
      items: data.items,
      replacementItems: data.replacementItems,
      paymentMethod: data.paymentMethod,
      reason: data.reason,
    }),
  });
}

export async function getReturns() {
  return commerceRequest<{ success: boolean; returns: Array<{
    id: number;
    type: "RETURN" | "EXCHANGE";
    refundAmount: number;
    amountDue: number;
    createdAt: string;
    sale: { id: number; invoiceNumber: string };
    replacementSale?: { id: number; invoiceNumber: string } | null;
  }> }>("/returns");
}

export async function getCustomers() {
  const customers = await commerceRequest<Array<{ id: number; name: string; phone?: string | null }>>(
    "/customers"
  );
  return customers;
}

export async function getRestockRecommendations(branchId?: number) {
  const params = new URLSearchParams();
  if (branchId) params.set("branchId", String(branchId));
  return commerceRequest<{ success: boolean; recommendations: Array<{
    id: number;
    quantity: number;
    reorderLevel: number;
    suggestedQuantity: number;
    branch: { id: number; name: string };
    variant: {
      id: number;
      size: string;
      color: string;
      sku: string;
      product: { id: number; name: string; sku: string };
    };
  }> }>(`/analytics/restock${params.size ? `?${params.toString()}` : ""}`);
}

export async function getVariantDemand(branchId: number | undefined, days = 30) {
  const params = new URLSearchParams({ days: String(days) });
  if (branchId) params.set("branchId", String(branchId));
  return commerceRequest<{ success: boolean; days: number; totalUnitsSold: number; variants: Array<{
    variantId: number;
    productId: number;
    product: string;
    productSku: string;
    size: string;
    color: string;
    sku: string;
    unitsSold: number;
    averageUnitsPerDay: number;
    demand: "FAST" | "STEADY" | "SLOW" | "NO_SALES";
  }> }>(`/analytics/variant-demand?${params.toString()}`);
}