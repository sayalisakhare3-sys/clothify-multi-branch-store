"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  FileText,
  PackageSearch,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  type LucideIcon,
  Search,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Plus,
  Minus,
} from "lucide-react";
import AdminShell from "@/features/layout/AdminShell";
import {
  createReturn,
  createSale,
  getCustomers,
  getInvoice,
  getInvoices,
  getPosCatalog,
  getRestockRecommendations,
  getReturns,
  getSale,
  getSales,
  getVariantDemand,
  PosProduct,
  SaleRecord,
  getBranches,
} from "@/lib/api";

type View = "pos" | "sales" | "invoices" | "returns" | "restock" | "intelligence";
type Branch = { id: number; name: string; city: string; isActive: boolean };
type Customer = { id: number; name: string; phone?: string | null };
type CartItem = { variantId: number; quantity: number };
type PaymentMethod = "CASH" | "CARD" | "UPI" | "OTHER";

const titles: Record<View, { title: string; description: string }> = {
  pos: { title: "POS / Billing", description: "Create sales, scan items and update store stock in real-time." },
  sales: { title: "Sales Management", description: "Review completed transactions, receipts, and order histories." },
  invoices: { title: "Customer Invoices", description: "View, download and print formal retail receipts and tax invoices." },
  returns: { title: "Returns & Exchange", description: "Process return requests or exchange sold items for available variants." },
  restock: { title: "Smart Restock", description: "Identify low-stock variants with intelligent replenishment recommendations." },
  intelligence: { title: "Size & Color Intelligence", description: "Analyze variant sales velocity to pinpoint fast- and slow-moving fashion trends." },
};

const viewIcons: Record<View, LucideIcon> = {
  pos: ShoppingCart,
  sales: TrendingUp,
  invoices: FileText,
  returns: RefreshCw,
  restock: PackageSearch,
  intelligence: BarChart3,
};

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const formatMoney = (amount: number) => currency.format(amount || 0);
const formatDate = (date: string) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
const getReturnedQuantity = (item: SaleRecord["items"][number]) =>
  item.returns?.reduce((sum, record) => sum + record.quantity, 0) || 0;
const getRemainingReturnQuantity = (item: SaleRecord["items"][number]) =>
  Math.max(0, item.quantity - getReturnedQuantity(item));

function BranchSelector({
  branches,
  branchId,
  onChange,
}: {
  branches: Branch[];
  branchId: number | null;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-[#788195] uppercase tracking-wider">Branch:</span>
      <select
        value={branchId ?? ""}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-10 px-3.5 rounded-xl border border-[#EEE8E5] bg-white text-sm font-semibold text-[#172033] shadow-sm outline-none focus:border-[#6750D9] focus:ring-2 focus:ring-[#6750D9]/10 cursor-pointer"
      >
        <option value="" disabled>Select a branch</option>
        {branches.filter((b) => b.isActive).map((b) => (
          <option key={b.id} value={b.id}>{b.name} — {b.city}</option>
        ))}
      </select>
    </div>
  );
}

export default function OperationsPage({ view }: { view: View }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [discount, setDiscount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [savingSale, setSavingSale] = useState(false);

  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [returns, setReturns] = useState<Array<{
    id: number; type: "RETURN" | "EXCHANGE"; refundAmount: number; amountDue: number;
    createdAt: string; sale: { id: number; invoiceNumber: string };
    replacementSale?: { id: number; invoiceNumber: string } | null;
  }>>([]);
  const [returnType, setReturnType] = useState<"RETURN" | "EXCHANGE">("RETURN");
  const [returnQuantities, setReturnQuantities] = useState<Record<number, number>>({});
  const [replacementVariantId, setReplacementVariantId] = useState("");
  const [replacementQuantity, setReplacementQuantity] = useState(1);
  const [returnReason, setReturnReason] = useState("");
  const [restockRows, setRestockRows] = useState<Awaited<ReturnType<typeof getRestockRecommendations>>["recommendations"]>([]);
  const [demandRows, setDemandRows] = useState<Awaited<ReturnType<typeof getVariantDemand>>["variants"]>([]);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.replace("/login");
      return;
    }
    queueMicrotask(() => setAuthorized(true));
  }, [router]);

  useEffect(() => {
    if (!authorized) return;
    let active = true;
    Promise.all([getBranches(), getCustomers()])
      .then(([branchResult, customerResult]) => {
        if (!active) return;
        const availableBranches: Branch[] = branchResult.data || branchResult.branches || [];
        setBranches(availableBranches);
        setCustomers(customerResult);
        setBranchId((current) => current ?? availableBranches.find((branch) => branch.isActive)?.id ?? null);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Failed to load store data.");
      });
    return () => { active = false; };
  }, [authorized]);

  useEffect(() => {
    if (!authorized || !branchId || (view !== "pos" && view !== "returns")) return;
    let active = true;
    queueMicrotask(() => { if (active) setLoading(true); });
    getPosCatalog(branchId)
      .then((result) => {
        if (!active) return;
        setProducts(result.products);
        if (result.branchId !== branchId) setBranchId(result.branchId);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Failed to load products.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authorized, branchId, view]);

  useEffect(() => {
    if (!authorized || view !== "returns") return;
    const invoice = new URLSearchParams(window.location.search).get("invoice");
    if (!invoice) return;
    queueMicrotask(() => setInvoiceSearch(invoice));
  }, [authorized, view]);

  useEffect(() => {
    if (!authorized || (view !== "sales" && view !== "invoices")) return;
    let active = true;
    queueMicrotask(() => { if (active) setLoading(true); });
    const loader = view === "invoices" ? getInvoices : getSales;
    loader(search)
      .then((result) => {
        if (!active) return;
        const list = result.sales || [];
        setSales(list);
        if (view === "invoices") {
          const direct = new URLSearchParams(window.location.search).get("invoice");
          const match = direct ? list.find((sale) => sale.invoiceNumber === direct) : list[0];
          if (match) setSelectedSale(match);
        }
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Failed to load sales.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authorized, view, search]);

  useEffect(() => {
    if (!authorized || view !== "returns") return;
    let active = true;
    getReturns()
      .then((result) => { if (active) setReturns(result.returns); })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Failed to load returns.");
      });
    return () => { active = false; };
  }, [authorized, view]);

  useEffect(() => {
    if (!authorized || view !== "restock" || !branchId) return;
    let active = true;
    queueMicrotask(() => { if (active) setLoading(true); });
    getRestockRecommendations(branchId)
      .then((result) => { if (active) setRestockRows(result.recommendations); })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Failed to load restock data.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authorized, view, branchId]);

  useEffect(() => {
    if (!authorized || view !== "intelligence") return;
    let active = true;
    queueMicrotask(() => { if (active) setLoading(true); });
    getVariantDemand(branchId ?? undefined, days)
      .then((result) => { if (active) setDemandRows(result.variants); })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Failed to load analytics.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authorized, view, branchId, days]);

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) => (
      product.name.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term) ||
      product.variants.some((variant) => (
        variant.sku.toLowerCase().includes(term) ||
        variant.color.toLowerCase().includes(term) ||
        variant.size.toLowerCase().includes(term)
      ))
    ));
  }, [products, search]);

  const variantLookup = useMemo(() => {
    const map = new Map<number, { product: PosProduct; variant: PosProduct["variants"][number] }>();
    for (const product of products) {
      for (const variant of product.variants) {
        map.set(variant.id, { product, variant });
      }
    }
    return map;
  }, [products]);

  const cartLines = useMemo(() => {
    return cart.flatMap((entry) => {
      const match = variantLookup.get(entry.variantId);
      return match ? [{ ...entry, ...match }] : [];
    });
  }, [cart, variantLookup]);

  const subtotal = useMemo(() => {
    return cartLines.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  }, [cartLines]);

  const saleDiscount = Math.min(subtotal, Math.max(0, Number(discount) || 0));

  function adjustCart(variantId: number, delta: number, maxStock: number) {
    setCart((current) => {
      const existing = current.find((item) => item.variantId === variantId);
      const nextQuantity = (existing?.quantity || 0) + delta;
      if (nextQuantity <= 0) return current.filter((item) => item.variantId !== variantId);
      const capped = Math.min(nextQuantity, maxStock);
      if (existing) {
        return current.map((item) => item.variantId === variantId ? { ...item, quantity: capped } : item);
      }
      return [...current, { variantId, quantity: capped }];
    });
  }

  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!branchId || !cart.length) return;
    setSavingSale(true);
    setError("");
    try {
      const result = await createSale({
        branchId,
        customerId: customerId ? Number(customerId) : null,
        paymentMethod,
        discount: saleDiscount,
        items: cart,
      });
      setCart([]);
      router.push(`/invoices?invoice=${encodeURIComponent(result.sale.invoiceNumber)}`);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout failed.");
    } finally {
      setSavingSale(false);
    }
  }

  async function searchSale(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSelectedSale(null);
    try {
      const matches = await getSales(invoiceSearch);
      const match = matches.sales[0];
      if (!match) {
        setError("No sale was found for that invoice number.");
        return;
      }
      const detail = await getSale(match.id);
      setSelectedSale(detail.sale);
      setBranchId(detail.sale.branchId);
      setReturnQuantities({});
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "Could not find this sale.");
    }
  }

  async function submitReturn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSale) return;
    const items = selectedSale.items.flatMap((item) => {
      const quantity = returnQuantities[item.id] || 0;
      return quantity ? [{ saleItemId: item.id, quantity }] : [];
    });
    if (!items.length) {
      const hasReturnableItems = selectedSale.items.some((item) => getRemainingReturnQuantity(item) > 0);
      setError(
        hasReturnableItems
          ? "Choose a quantity for at least one sold item."
          : "All quantities on this sale have already been returned. Search for another sale with items available to return."
      );
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await createReturn({
        saleId: selectedSale.id,
        type: returnType,
        items,
        replacementItems: returnType === "EXCHANGE" && replacementVariantId
          ? [{ variantId: Number(replacementVariantId), quantity: replacementQuantity }]
          : [],
        paymentMethod,
        reason: returnReason,
      });
      setNotice(
        returnType === "EXCHANGE"
          ? `Exchange processed. Balance due: ${formatMoney(result.return.amountDue)}; Refund: ${formatMoney(result.return.refundAmount)}.`
          : `Return processed successfully. Refund due: ${formatMoney(result.return.refundAmount)}.`
      );
      const updated = await getSale(selectedSale.id);
      setSelectedSale(updated.sale);
      setReturnQuantities({});
      const returnResult = await getReturns();
      setReturns(returnResult.returns);
    } catch (returnError) {
      setError(returnError instanceof Error ? returnError.message : "Could not process this return.");
    } finally {
      setLoading(false);
    }
  }

  async function openInvoice(saleId: number) {
    setError("");
    try {
      const result = await getInvoice(saleId);
      setSelectedSale(result.sale);
    } catch (invoiceError) {
      setError(invoiceError instanceof Error ? invoiceError.message : "Could not load invoice.");
    }
  }

  const header = titles[view];
  const HeaderIcon = viewIcons[view];
  const hasReturnableItems = selectedSale?.items.some((item) => getRemainingReturnQuantity(item) > 0) ?? false;
  if (!authorized) return null;

  return (
    <AdminShell>
      <div className="max-w-[1540px] mx-auto w-full">
        {/* Module Header */}
        <div className="module-header">
          <div className="module-page-title">
            <div className="module-title-icon">
              <HeaderIcon size={22} />
            </div>
            <div>
              <h1>{header.title}</h1>
              <p>{header.description}</p>
            </div>
          </div>

          {["pos", "restock", "returns"].includes(view) && (
            <BranchSelector branches={branches} branchId={branchId} onChange={setBranchId} />
          )}
        </div>

        {/* Notices & Alerts */}
        {error && (
          <div className="operation-alert error" role="alert">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} className="operation-secondary text-xs py-1">
              Dismiss
            </button>
          </div>
        )}

        {notice && (
          <div className="operation-alert success" role="status">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} />
              <span>{notice}</span>
            </div>
            <button onClick={() => setNotice("")} className="operation-secondary text-xs py-1">
              Dismiss
            </button>
          </div>
        )}

        {/* ===================================================================
            VIEW 1: POS / BILLING
            =================================================================== */}
        {view === "pos" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Product Catalog & Variants */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              <div className="card-surface">
                {/* Search Header */}
                <div className="relative mb-5">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search clothing by name, SKU, color or size..."
                    className="w-full h-11 pl-11 pr-4 rounded-xl border border-[#EEE8E5] bg-[#FBF8F6] text-sm text-[#172033] outline-none focus:border-[#6750D9] focus:ring-2 focus:ring-[#6750D9]/10"
                  />
                </div>

                {!branchId && (
                  <div className="operation-empty">
                    Please select an active store branch to start POS checkout.
                  </div>
                )}

                {/* Product Catalog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visibleProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border border-[#EEE8E5] rounded-2xl p-4 bg-white flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-base text-[#172033]">{product.name}</h4>
                          <span className="text-xs text-[#788195] font-mono">SKU: {product.sku}</span>
                        </div>
                        <p className="text-xs text-[#788195] mt-1">{product.variants.length} available variants</p>
                      </div>

                      {/* Variant Buttons */}
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {product.variants.map((v) => (
                          <button
                            key={v.id}
                            disabled={v.quantity < 1}
                            onClick={() => adjustCart(v.id, 1, v.quantity)}
                            className="p-2.5 rounded-xl border border-[#EEE8E5] bg-[#FBF8F6] hover:bg-[#F1EEFE] hover:border-[#6750D9]/40 text-left transition disabled:opacity-40 disabled:cursor-not-allowed group flex flex-col"
                          >
                            <span className="text-xs font-bold text-[#172033] group-hover:text-[#6750D9]">
                              {v.size} · {v.color}
                            </span>
                            <span className="text-sm font-extrabold text-[#172033] mt-1">
                              {formatMoney(v.price)}
                            </span>
                            <span className="text-[10px] text-[#0E9F6E] font-medium mt-0.5">
                              {v.quantity} in stock
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {!loading && branchId && visibleProducts.length === 0 && (
                  <div className="operation-empty">No products matched your search.</div>
                )}
              </div>
            </div>

            {/* Right Col: Cart & Checkout Form */}
            <form onSubmit={checkout} className="card-surface h-fit flex flex-col gap-4 sticky top-24">
              <div className="card-header-bar border-b border-[#EEE8E5] pb-3 mb-1">
                <div>
                  <h3 className="text-lg font-bold text-[#172033]">Current Sale Cart</h3>
                  <p className="text-xs text-[#788195]">{cart.length} item types</p>
                </div>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCart([])}
                    className="text-xs font-semibold text-[#DC2626] hover:underline"
                  >
                    Clear Cart
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
                {cartLines.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#FBF8F6] border border-[#EEE8E5]"
                  >
                    <div className="min-w-0 pr-2">
                      <h5 className="text-xs font-bold text-[#172033] truncate">{item.product.name}</h5>
                      <p className="text-[11px] text-[#788195]">{item.variant.size} · {item.variant.color}</p>
                      <p className="text-xs font-semibold text-[#6750D9]">{formatMoney(item.variant.price * item.quantity)}</p>
                    </div>

                    <div className="flex items-center gap-2 bg-white border border-[#EEE8E5] rounded-lg px-2 py-1">
                      <button
                        type="button"
                        onClick={() => adjustCart(item.variantId, -1, item.variant.quantity)}
                        className="text-[#172033] hover:text-[#6750D9] p-0.5"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        disabled={item.quantity >= item.variant.quantity}
                        onClick={() => adjustCart(item.variantId, 1, item.variant.quantity)}
                        className="text-[#172033] hover:text-[#6750D9] p-0.5 disabled:opacity-30"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                ))}

                {cartLines.length === 0 && (
                  <div className="py-8 text-center text-xs text-[#788195]">
                    Click on any variant above to add it to the cart.
                  </div>
                )}
              </div>

              {/* Customer selection */}
              <div className="operation-field mb-2">
                <span>Customer (Optional)</span>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="text-xs"
                >
                  <option value="">Walk-in Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Discount Input */}
              <div className="operation-field mb-2">
                <span>Discount (₹)</span>
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="text-xs"
                />
              </div>

              {/* Payment Method Selector */}
              <div className="operation-field mb-2">
                <span>Payment Method</span>
                <div className="grid grid-cols-4 gap-1.5 mt-1">
                  {(["CASH", "CARD", "UPI", "OTHER"] as PaymentMethod[]).map((pm) => (
                    <button
                      type="button"
                      key={pm}
                      onClick={() => setPaymentMethod(pm)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition ${
                        paymentMethod === pm
                          ? "bg-[#6750D9] text-white border-[#6750D9]"
                          : "bg-white text-[#172033] border-[#EEE8E5] hover:bg-[#FBF8F6]"
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              {/* Totals Breakdown */}
              <div className="border-t border-[#EEE8E5] pt-3 flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between text-[#788195]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#172033]">{formatMoney(subtotal)}</span>
                </div>
                {saleDiscount > 0 && (
                  <div className="flex justify-between text-[#DC2626]">
                    <span>Discount</span>
                    <span className="font-semibold">− {formatMoney(saleDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-[#172033] pt-1 border-t border-[#EEE8E5]">
                  <span>Total Due</span>
                  <span className="text-[#6750D9]">{formatMoney(subtotal - saleDiscount)}</span>
                </div>
              </div>

              {/* Complete Checkout Button */}
              <button
                type="submit"
                disabled={savingSale || !cart.length || !branchId}
                className="operation-primary w-full py-3 mt-2 disabled:opacity-50"
              >
                {savingSale ? "Completing Transaction..." : "Complete Sale & Print"}
              </button>
            </form>
          </div>
        )}

        {/* ===================================================================
            VIEW 2 & 3: SALES & INVOICES
            =================================================================== */}
        {(view === "sales" || view === "invoices") && (
          <div className="flex flex-col gap-6">
            <div className="card-surface">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="relative w-80">
                  <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by invoice number..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#EEE8E5] bg-[#FBF8F6] text-xs text-[#172033] outline-none focus:border-[#6750D9]"
                  />
                </div>
              </div>

              {sales.length === 0 && !loading ? (
                <div className="operation-empty">No sales or invoices found.</div>
              ) : (
                <div className="operation-table-wrap">
                  <table className="operation-table">
                    <thead>
                      <tr>
                        <th>Invoice</th>
                        <th>Date & Time</th>
                        <th>Branch</th>
                        <th>Customer</th>
                        <th>Payment</th>
                        <th>Total</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale) => (
                        <tr key={sale.id}>
                          <td><strong className="text-[#6750D9]">{sale.invoiceNumber}</strong></td>
                          <td>{formatDate(sale.createdAt)}</td>
                          <td>{sale.branch?.name || "Main Store"}</td>
                          <td>{sale.customer?.name || "Walk-in Customer"}</td>
                          <td>
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F1EEFE] text-[#6750D9]">
                              {sale.paymentMethod}
                            </span>
                          </td>
                          <td><strong className="text-[#172033]">{formatMoney(sale.total)}</strong></td>
                          <td>
                            <div className="operation-actions">
                              <button type="button" onClick={() => openInvoice(sale.id)}>
                                View
                              </button>
                              {view === "sales" && (
                                <Link href={`/returns?invoice=${encodeURIComponent(sale.invoiceNumber)}`}>
                                  Return
                                </Link>
                              )}
                              {view === "sales" && (
                                <Link href={`/invoices?invoice=${encodeURIComponent(sale.invoiceNumber)}`}>
                                  Invoice
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {selectedSale && (
              <Invoice sale={selectedSale} onPrint={() => window.print()} />
            )}
          </div>
        )}

        {/* ===================================================================
            VIEW 4: RETURNS & EXCHANGE
            =================================================================== */}
        {view === "returns" && (
          <div className="flex flex-col gap-6">
            <div className="card-surface">
              {/* Lookup by Invoice Form */}
              <form onSubmit={searchSale} className="flex items-center gap-3 mb-6">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    required
                    value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                    placeholder="Enter Invoice Number to Lookup (e.g. CLF-20261013)..."
                    className="w-full h-11 pl-11 pr-4 rounded-xl border border-[#EEE8E5] bg-[#FBF8F6] text-sm text-[#172033] outline-none focus:border-[#6750D9]"
                  />
                </div>
                <button type="submit" className="operation-primary h-11 px-6">
                  Find Sale
                </button>
              </form>

              {selectedSale && (
                <form onSubmit={submitReturn} className="border-t border-[#EEE8E5] pt-6 flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[#172033]">{selectedSale.invoiceNumber}</h3>
                      <p className="text-xs text-[#788195] mt-1">
                        {formatDate(selectedSale.createdAt)} · {selectedSale.branch?.name}
                      </p>
                    </div>

                    {/* Return vs Exchange Toggle */}
                    <div className="flex bg-[#F1EEFE] p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setReturnType("RETURN")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                          returnType === "RETURN"
                            ? "bg-[#6750D9] text-white shadow-sm"
                            : "text-[#6750D9]"
                        }`}
                      >
                        Refund / Return
                      </button>
                      <button
                        type="button"
                        onClick={() => setReturnType("EXCHANGE")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                          returnType === "EXCHANGE"
                            ? "bg-[#6750D9] text-white shadow-sm"
                            : "text-[#6750D9]"
                        }`}
                      >
                        Exchange Item
                      </button>
                    </div>
                  </div>

                  {!hasReturnableItems && (
                    <div
                      className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E]"
                      role="status"
                    >
                      All quantities on this sale have already been returned. Search for another sale with items available to return or exchange.
                    </div>
                  )}

                  {/* Sold items return table */}
                  <div className="operation-table-wrap">
                    <table className="operation-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Purchased</th>
                          <th>Already Returned</th>
                          <th>Price</th>
                          <th>Return Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSale.items.map((item) => {
                          const returned = getReturnedQuantity(item);
                          const remaining = getRemainingReturnQuantity(item);
                          return (
                            <tr key={item.id}>
                              <td>
                                <strong>{item.variant.product.name}</strong>
                                <span className="text-xs text-[#788195] block">{item.variant.size} · {item.variant.color}</span>
                              </td>
                              <td>{item.quantity}</td>
                              <td>{returned}</td>
                              <td>{formatMoney(item.unitPrice)}</td>
                              <td>
                                {remaining > 0 ? (
                                  <input
                                    type="number"
                                    min="0"
                                    max={remaining}
                                    value={returnQuantities[item.id] || 0}
                                    onChange={(e) =>
                                      setReturnQuantities((curr) => ({
                                        ...curr,
                                        [item.id]: Math.min(remaining, Math.max(0, Number(e.target.value))),
                                      }))
                                    }
                                    className="w-20 h-9 px-2 rounded-lg border border-[#EEE8E5] text-center text-xs"
                                  />
                                ) : (
                                  <span className="text-xs font-medium text-[#788195]">Fully returned</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Exchange controls */}
                  {returnType === "EXCHANGE" && hasReturnableItems && (
                    <div className="p-4 rounded-xl bg-[#FBF8F6] border border-[#EEE8E5] grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="operation-field mb-0 md:col-span-2">
                        <span>Replacement Variant</span>
                        <select
                          required
                          value={replacementVariantId}
                          onChange={(e) => setReplacementVariantId(e.target.value)}
                        >
                          <option value="">Select available clothing variant</option>
                          {products.flatMap((prod) =>
                            prod.variants.map((v) => (
                              <option key={v.id} value={v.id}>
                                {prod.name} — {v.size} / {v.color} ({formatMoney(v.price)} · {v.quantity} in stock)
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                      <div className="operation-field mb-0">
                        <span>Quantity</span>
                        <input
                          type="number"
                          min="1"
                          value={replacementQuantity}
                          onChange={(e) => setReplacementQuantity(Math.max(1, Number(e.target.value)))}
                        />
                      </div>
                    </div>
                  )}

                  <div className="operation-field">
                    <span>Reason for return (Optional)</span>
                    <input
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      placeholder="e.g. Wrong size, fabric defect, changed preference..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !hasReturnableItems || (returnType === "EXCHANGE" && !replacementVariantId)}
                    className="operation-primary self-start"
                  >
                    {returnType === "RETURN" ? "Process Return & Issue Refund" : "Complete Exchange"}
                  </button>
                </form>
              )}
            </div>

            {/* Recent returns table */}
            <div className="card-surface">
              <div className="card-header-bar">
                <div className="card-title-group">
                  <h3>Recent Returns & Exchanges</h3>
                  <p>Audit log of processed refunds and inventory restorations.</p>
                </div>
              </div>

              {!returns.length ? (
                <div className="operation-empty">No returns or exchanges recorded yet.</div>
              ) : (
                <div className="operation-table-wrap">
                  <table className="operation-table">
                    <thead>
                      <tr>
                        <th>Invoice</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Refund Amount</th>
                        <th>Balance Due</th>
                        <th>Replacement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returns.map((entry) => (
                        <tr key={entry.id}>
                          <td><strong>{entry.sale.invoiceNumber}</strong></td>
                          <td>
                            <span className={`status-pill ${entry.type === "RETURN" ? "warning" : "info"}`}>
                              {entry.type}
                            </span>
                          </td>
                          <td>{formatDate(entry.createdAt)}</td>
                          <td><strong className="text-[#DC2626]">{formatMoney(entry.refundAmount)}</strong></td>
                          <td><strong>{formatMoney(entry.amountDue)}</strong></td>
                          <td>{entry.replacementSale?.invoiceNumber || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
            VIEW 5: SMART RESTOCK
            =================================================================== */}
        {view === "restock" && (
          <div className="card-surface">
            <div className="card-header-bar">
              <div className="card-title-group">
                <h3>Replenishment Recommendations</h3>
                <p>Prioritizes low-stock variants and suggests replenishment to meet target inventory.</p>
              </div>
            </div>

            {!restockRows.length && !loading ? (
              <div className="operation-empty">All clothing variants are adequately stocked at this branch!</div>
            ) : (
              <div className="operation-table-wrap">
                <table className="operation-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Size & Color</th>
                      <th>SKU</th>
                      <th>Store Branch</th>
                      <th>On Hand</th>
                      <th>Reorder Level</th>
                      <th>Suggested Restock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restockRows.map((row) => (
                      <tr key={row.id}>
                        <td><strong>{row.variant.product.name}</strong></td>
                        <td>
                          <span className="px-2 py-0.5 rounded-md text-xs bg-[#FBF8F6] border border-[#EEE8E5] font-semibold">
                            {row.variant.size} · {row.variant.color}
                          </span>
                        </td>
                        <td className="font-mono text-xs">{row.variant.sku}</td>
                        <td>{row.branch.name}</td>
                        <td>
                          <span className="status-pill low-stock font-bold">
                            {row.quantity} units
                          </span>
                        </td>
                        <td>{row.reorderLevel} units</td>
                        <td>
                          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#E6F9F0] text-[#0E9F6E]">
                            + {row.suggestedQuantity} units
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            VIEW 6: SIZE & COLOR INTELLIGENCE
            =================================================================== */}
        {view === "intelligence" && (
          <div className="card-surface">
            <div className="card-header-bar">
              <div className="card-title-group">
                <h3>Size & Color Intelligence</h3>
                <p>Track sales velocity, customer size preferences, and color trends across branches.</p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="card-select-filter"
                >
                  <option value={30}>Last 30 Days</option>
                  <option value={90}>Last 90 Days</option>
                  <option value={180}>Last 6 Months</option>
                  <option value={365}>Last Year</option>
                </select>

                <select
                  value={branchId ?? ""}
                  onChange={(e) => setBranchId(e.target.value ? Number(e.target.value) : null)}
                  className="card-select-filter"
                >
                  <option value="">All Branches</option>
                  {branches.filter((b) => b.isActive).map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {!demandRows.length && !loading ? (
              <div className="operation-empty">No active sales demand data available for this timeframe.</div>
            ) : (
              <div className="operation-table-wrap">
                <table className="operation-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Size</th>
                      <th>Color</th>
                      <th>SKU</th>
                      <th>Units Sold</th>
                      <th>Avg Sales / Day</th>
                      <th>Demand Tier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demandRows.map((row) => (
                      <tr key={row.variantId}>
                        <td><strong>{row.product}</strong></td>
                        <td>
                          <span className="px-2 py-0.5 rounded-md text-xs bg-[#F1EEFE] text-[#6750D9] font-bold">
                            {row.size}
                          </span>
                        </td>
                        <td>
                          <span className="px-2 py-0.5 rounded-md text-xs bg-[#FFF1E8] text-[#E06D3B] font-semibold">
                            {row.color}
                          </span>
                        </td>
                        <td className="font-mono text-xs">{row.sku}</td>
                        <td><strong className="text-[#172033]">{row.unitsSold}</strong></td>
                        <td>{row.averageUnitsPerDay}</td>
                        <td>
                          <span
                            className={`status-pill ${
                              row.demand.toLowerCase().includes("high")
                                ? "delivered"
                                : row.demand.toLowerCase().includes("low")
                                ? "pending"
                                : "processing"
                            }`}
                          >
                            {row.demand.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function Invoice({ sale, onPrint }: { sale: SaleRecord; onPrint: () => void }) {
  return (
    <div className="card-surface mt-4 border-2 border-[#EEE8E5] p-8 max-w-3xl mx-auto w-full bg-white shadow-md">
      <div className="flex items-center justify-between border-b border-[#EEE8E5] pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#6750D9] text-white flex items-center justify-center font-extrabold text-sm">
              C
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#172033]">CLOTHIFY RETAIL</h2>
          </div>
          <p className="text-xs text-[#788195] font-mono">Invoice: {sale.invoiceNumber}</p>
        </div>
        <button
          onClick={onPrint}
          className="operation-primary flex items-center gap-2 print:hidden"
        >
          <Printer size={16} />
          Print Receipt
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#FBF8F6] border border-[#EEE8E5] text-xs mb-6">
        <div>
          <span className="text-[#788195] block">Branch Store</span>
          <strong className="text-[#172033] mt-0.5 block">{sale.branch?.name || "Clothify Main"}</strong>
        </div>
        <div>
          <span className="text-[#788195] block">Customer</span>
          <strong className="text-[#172033] mt-0.5 block">{sale.customer?.name || "Walk-in Customer"}</strong>
        </div>
        <div>
          <span className="text-[#788195] block">Payment Mode</span>
          <strong className="text-[#172033] mt-0.5 block">{sale.paymentMethod}</strong>
        </div>
        <div>
          <span className="text-[#788195] block">Date</span>
          <strong className="text-[#172033] mt-0.5 block">{formatDate(sale.createdAt)}</strong>
        </div>
      </div>

      <div className="operation-table-wrap mb-6">
        <table className="operation-table text-xs">
          <thead>
            <tr>
              <th>Item Description</th>
              <th>SKU</th>
              <th>Size / Color</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.variant.product.name}</strong></td>
                <td className="font-mono">{item.variant.sku}</td>
                <td>{item.variant.size} / {item.variant.color}</td>
                <td>{item.quantity}</td>
                <td>{formatMoney(item.unitPrice)}</td>
                <td><strong className="text-[#172033]">{formatMoney(item.total)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <div className="w-64 flex flex-col gap-2 text-xs border-t border-[#EEE8E5] pt-4">
          <div className="flex justify-between text-[#788195]">
            <span>Subtotal</span>
            <span className="font-semibold text-[#172033]">{formatMoney(sale.subtotal)}</span>
          </div>
          {sale.discount > 0 && (
            <div className="flex justify-between text-[#DC2626]">
              <span>Discount</span>
              <span className="font-semibold">− {formatMoney(sale.discount)}</span>
            </div>
          )}
          {sale.tax > 0 && (
            <div className="flex justify-between text-[#788195]">
              <span>Taxes (GST)</span>
              <span className="font-semibold text-[#172033]">{formatMoney(sale.tax)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-extrabold text-[#172033] border-t border-[#EEE8E5] pt-2">
            <span>Total Paid</span>
            <span className="text-[#6750D9]">{formatMoney(sale.total)}</span>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-[#788195] mt-10 italic">
        Thank you for shopping with Clothify. Style. Stock. Success.
      </p>
    </div>
  );
}
