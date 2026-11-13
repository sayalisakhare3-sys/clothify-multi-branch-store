"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Package,
  Layers,
  Store,
  ArrowUpRight,
  ChevronRight,
  ShoppingCart,
  MoreVertical,
  Plus,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { getDashboardData } from "../../lib/api";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getDashboardData()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((loadError) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load dashboard data."
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const stats = data || {
    totalSales: 248630,
    totalOrders: 184,
    totalCustomers: 540,
    totalProducts: 184,
    lowStockProducts: 12,
    totalBranches: 5,
    todaySales: 18450,
    todayOrders: 14,
    recentSales: [],
    lowStockItems: [],
  };

  const topSelling = [
    {
      name: "Denim Jacket",
      price: 2499,
      growth: "12%",
      img: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=240&q=80",
    },
    {
      name: "Women's Top",
      price: 1299,
      growth: "8%",
      img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=240&q=80",
    },
    {
      name: "Cargo Pants",
      price: 1999,
      growth: "14%",
      img: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=240&q=80",
    },
    {
      name: "Sneakers",
      price: 2799,
      growth: "10%",
      img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=240&q=80",
    },
    {
      name: "Formal Shirt",
      price: 2499,
      growth: "6%",
      img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=240&q=80",
    },
  ];

  const recentOrdersFallback = [
    {
      name: "Denim Jacket",
      code: "#ORD00421",
      price: 2499,
      status: "Delivered",
      statusClass: "delivered",
      img: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=120&q=80",
    },
    {
      name: "Women's Top",
      code: "#ORD00420",
      price: 1299,
      status: "Processing",
      statusClass: "processing",
      img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=120&q=80",
    },
    {
      name: "Cargo Pants",
      code: "#ORD00419",
      price: 1999,
      status: "Shipped",
      statusClass: "shipped",
      img: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=120&q=80",
    },
    {
      name: "Sneakers",
      code: "#ORD00418",
      price: 2799,
      status: "Delivered",
      statusClass: "delivered",
      img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=120&q=80",
    },
    {
      name: "Formal Shirt",
      code: "#ORD00417",
      price: 2499,
      status: "Pending",
      statusClass: "pending",
      img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=120&q=80",
    },
  ];

  const stockAlertsFallback = [
    {
      name: "Women's Top",
      left: "12 left",
      status: "Low Stock",
      statusClass: "low-stock",
      img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=120&q=80",
    },
    {
      name: "Denim Jacket",
      left: "8 left",
      status: "Low Stock",
      statusClass: "low-stock",
      img: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=120&q=80",
    },
    {
      name: "Cargo Pants",
      left: "24 left",
      status: "In Stock",
      statusClass: "delivered",
      img: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=120&q=80",
    },
    {
      name: "Sneakers",
      left: "6 left",
      status: "Low Stock",
      statusClass: "low-stock",
      img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=120&q=80",
    },
    {
      name: "Formal Shirt",
      left: "15 left",
      status: "In Stock",
      statusClass: "delivered",
      img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=120&q=80",
    },
  ];

  return (
    <div className="dashboard-content">
      {/* Alert if any */}
      {error && (
        <div className="operation-alert error" role="alert">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={() => window.location.reload()} className="operation-secondary">
            Retry
          </button>
        </div>
      )}

      {/* ===================================================================
          1. WELCOME HERO BANNER (MATCHING SCREENSHOT)
          =================================================================== */}
      <section className="welcome-banner">
        <div className="welcome-content">
          <span className="welcome-tag">WELCOME BACK, ADMIN!</span>
          <h1>Fashion is not just what you wear, it&apos;s how you express yourself.</h1>
          <p>
            Manage your store, track sales, and grow your business — all in one
            place.
          </p>
          <Link href="/products" className="welcome-btn">
            <span>Explore Products</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="welcome-image-wrap">
          <img
            src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80"
            alt="Clothify Collection"
          />
        </div>
      </section>

      {/* ===================================================================
          2. 4 METRIC STAT CARDS (PASTEL ACCENTS)
          =================================================================== */}
      <section className="dashboard-stats-grid">
        {/* Total Sales */}
        <div className="dashboard-stat-card purple">
          <div className="stat-card-header">
            <div className="stat-card-icon-wrap">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div>
            <p className="stat-card-title">Total Sales</p>
            <h3 className="stat-card-value">
              {currency.format(stats.totalSales || 248630)}
            </h3>
          </div>
          <div className="stat-card-footer">
            <span className="stat-badge growth">↑ 12.5% vs. last week</span>
            <svg className="stat-sparkline" viewBox="0 0 100 30" fill="none">
              <path
                d="M5 25 C 25 25, 35 15, 55 18 C 75 22, 85 8, 95 6"
                stroke="#6750D9"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Total Products */}
        <div className="dashboard-stat-card peach">
          <div className="stat-card-header">
            <div className="stat-card-icon-wrap">
              <Package size={20} />
            </div>
          </div>
          <div>
            <p className="stat-card-title">Total Products</p>
            <h3 className="stat-card-value">{stats.totalProducts || 184}</h3>
          </div>
          <div className="stat-card-footer">
            <span className="stat-badge growth">↑ 8.3% vs. last week</span>
            <svg className="stat-sparkline" viewBox="0 0 100 30" fill="none">
              <path
                d="M5 22 C 20 22, 35 26, 50 18 C 65 10, 80 20, 95 12"
                stroke="#E06D3B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Total Stock */}
        <div className="dashboard-stat-card mint">
          <div className="stat-card-header">
            <div className="stat-card-icon-wrap">
              <Layers size={20} />
            </div>
          </div>
          <div>
            <p className="stat-card-title">Total Stock</p>
            <h3 className="stat-card-value">1,245</h3>
          </div>
          <div className="stat-card-footer">
            <span className="stat-badge growth">↑ 5.2% vs. last week</span>
            <svg className="stat-sparkline" viewBox="0 0 100 30" fill="none">
              <path
                d="M5 24 C 25 24, 40 12, 60 16 C 75 20, 85 8, 95 6"
                stroke="#0E9F6E"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Branches */}
        <div className="dashboard-stat-card blue">
          <div className="stat-card-header">
            <div className="stat-card-icon-wrap">
              <Store size={20} />
            </div>
          </div>
          <div>
            <p className="stat-card-title">Branches</p>
            <h3 className="stat-card-value">{stats.totalBranches || 5}</h3>
          </div>
          <div className="stat-card-footer">
            <span className="stat-badge neutral">No change vs. last week</span>
            <svg className="stat-sparkline" viewBox="0 0 100 30" fill="none">
              <path
                d="M5 22 C 25 22, 35 14, 55 18 C 75 22, 85 12, 95 14"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* ===================================================================
          3. ROW 2: SALES OVERVIEW + SALES BY CATEGORY + RECENT ORDERS
          =================================================================== */}
      <section className="dashboard-grid-row-2">
        {/* Sales Overview Chart */}
        <div className="card-surface">
          <div className="card-header-bar">
            <div className="card-title-group">
              <h3>Sales Overview</h3>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-xs text-[#172033] font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6750D9]" /> This Week
                </span>
                <span className="flex items-center gap-1.5 text-xs text-[#788195]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#93C5FD]" /> Last Week
                </span>
              </div>
            </div>
            <select className="card-select-filter" defaultValue="7days">
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="year">This Year</option>
            </select>
          </div>

          {/* Area Line Chart SVG */}
          <div className="w-full h-56 mt-2 relative">
            <svg viewBox="0 0 500 200" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6750D9" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#6750D9" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="30" y1="40" x2="480" y2="40" stroke="#EEE8E5" strokeDasharray="3 3" />
              <line x1="30" y1="80" x2="480" y2="80" stroke="#EEE8E5" strokeDasharray="3 3" />
              <line x1="30" y1="120" x2="480" y2="120" stroke="#EEE8E5" strokeDasharray="3 3" />
              <line x1="30" y1="160" x2="480" y2="160" stroke="#EEE8E5" />

              {/* Axis Labels */}
              <text x="5" y="44" fill="#9CA3AF" fontSize="10">40K</text>
              <text x="5" y="84" fill="#9CA3AF" fontSize="10">30K</text>
              <text x="5" y="124" fill="#9CA3AF" fontSize="10">20K</text>
              <text x="5" y="164" fill="#9CA3AF" fontSize="10">10K</text>

              {/* Last Week Line (Light blue) */}
              <path
                d="M 40 145 Q 110 115, 180 135 T 320 120 T 460 90"
                fill="none"
                stroke="#93C5FD"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* This Week Area Fill */}
              <path
                d="M 40 140 Q 110 90, 180 130 T 320 85 T 460 50 L 460 160 L 40 160 Z"
                fill="url(#purpleGradient)"
              />

              {/* This Week Main Line */}
              <path
                d="M 40 140 Q 110 90, 180 130 T 320 85 T 460 50"
                fill="none"
                stroke="#6750D9"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Dots */}
              <circle cx="40" cy="140" r="4" fill="#6750D9" stroke="#FFF" strokeWidth="2" />
              <circle cx="110" cy="115" r="4" fill="#6750D9" stroke="#FFF" strokeWidth="2" />
              <circle cx="180" cy="130" r="4" fill="#6750D9" stroke="#FFF" strokeWidth="2" />
              <circle cx="250" cy="105" r="4" fill="#6750D9" stroke="#FFF" strokeWidth="2" />
              <circle cx="320" cy="120" r="4" fill="#6750D9" stroke="#FFF" strokeWidth="2" />
              <circle cx="390" cy="80" r="4" fill="#6750D9" stroke="#FFF" strokeWidth="2" />
              <circle cx="460" cy="50" r="5" fill="#6750D9" stroke="#FFF" strokeWidth="2.5" />

              {/* X Labels */}
              <text x="35" y="185" fill="#788195" fontSize="10.5">Apr 21</text>
              <text x="105" y="185" fill="#788195" fontSize="10.5">Apr 22</text>
              <text x="175" y="185" fill="#788195" fontSize="10.5">Apr 23</text>
              <text x="245" y="185" fill="#788195" fontSize="10.5">Apr 24</text>
              <text x="315" y="185" fill="#788195" fontSize="10.5">Apr 25</text>
              <text x="385" y="185" fill="#788195" fontSize="10.5">Apr 26</text>
              <text x="450" y="185" fill="#788195" fontSize="10.5">Apr 27</text>
            </svg>
          </div>
        </div>

        {/* Sales by Category (Donut Chart) */}
        <div className="card-surface">
          <div className="card-header-bar">
            <div className="card-title-group">
              <h3>Sales by Category</h3>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center flex-1 my-2">
            <div className="relative w-44 h-44">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* 35% Men's Wear (Purple #6750D9) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#6750D9"
                  strokeWidth="15"
                  strokeDasharray="83.5 155.5"
                  strokeDashoffset="0"
                />
                {/* 28% Women's Wear (Lavender #A78BFA) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#A78BFA"
                  strokeWidth="15"
                  strokeDasharray="66.8 172.2"
                  strokeDashoffset="-83.5"
                />
                {/* 16% Kids Wear (Coral #F97316) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="15"
                  strokeDasharray="38.2 200.8"
                  strokeDashoffset="-150.3"
                />
                {/* 12% Accessories (Teal #06B6D4) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="15"
                  strokeDasharray="28.6 210.4"
                  strokeDashoffset="-188.5"
                />
                {/* 9% Footwear (Yellow/Orange #FBBF24) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#FBBF24"
                  strokeWidth="15"
                  strokeDasharray="21.5 217.5"
                  strokeDashoffset="-217.1"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-bold text-[#172033]">
                  ₹ 2,48,630
                </span>
                <span className="text-[10px] text-[#788195]">Total Sales</span>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 text-xs w-full max-w-xs px-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#172033]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6750D9]" /> Men&apos;s Wear
                </span>
                <span className="font-semibold text-[#172033]">35%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#172033]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A78BFA]" /> Women&apos;s Wear
                </span>
                <span className="font-semibold text-[#172033]">28%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#172033]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" /> Kids Wear
                </span>
                <span className="font-semibold text-[#172033]">16%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#172033]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" /> Accessories
                </span>
                <span className="font-semibold text-[#172033]">12%</span>
              </div>
              <div className="flex items-center justify-between col-span-2">
                <span className="flex items-center gap-1.5 text-[#172033]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" /> Footwear
                </span>
                <span className="font-semibold text-[#172033]">9%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card-surface">
          <div className="card-header-bar">
            <div className="card-title-group">
              <h3>Recent Orders</h3>
            </div>
            <Link href="/sales" className="card-action-link">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="recent-orders-list">
            {stats.recentSales && stats.recentSales.length > 0
              ? stats.recentSales.slice(0, 5).map((sale) => (
                <Link
                  key={sale.id}
                  href={`/invoices?invoice=${encodeURIComponent(sale.invoiceNumber)}`}
                  className="order-row-item"
                >
                  <div className="order-thumb-wrap">
                    <div className="order-thumb">
                      <ShoppingBag size={18} className="text-[#6750D9]" />
                    </div>
                    <div className="order-details">
                      <h4>{sale.customer?.name || "Retail Customer"}</h4>
                      <p>{sale.invoiceNumber}</p>
                    </div>
                  </div>
                  <div className="order-price-status">
                    <span className="order-price">
                      {currency.format(sale.total)}
                    </span>
                    <span className="status-pill delivered">Delivered</span>
                    <ChevronRight size={14} className="text-[#9CA3AF]" />
                  </div>
                </Link>
              ))
              : recentOrdersFallback.map((item) => (
                <Link key={item.code} href="/sales" className="order-row-item">
                  <div className="order-thumb-wrap">
                    <div className="order-thumb">
                      <img src={item.img} alt={item.name} />
                    </div>
                    <div className="order-details">
                      <h4>{item.name}</h4>
                      <p>{item.code}</p>
                    </div>
                  </div>
                  <div className="order-price-status">
                    <span className="order-price">
                      {currency.format(item.price)}
                    </span>
                    <span className={`status-pill ${item.statusClass}`}>
                      {item.status}
                    </span>
                    <ChevronRight size={14} className="text-[#9CA3AF]" />
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          4. ROW 3: TOP SELLING PRODUCTS + STOCK ALERTS
          =================================================================== */}
      <section className="dashboard-grid-row-3">
        {/* Top Selling Products */}
        <div className="card-surface">
          <div className="card-header-bar">
            <div className="card-title-group">
              <h3>Top Selling Products</h3>
            </div>
            <Link href="/products" className="card-action-link">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="top-products-grid">
            {topSelling.map((prod) => (
              <div key={prod.name} className="top-product-card">
                <div className="top-product-media">
                  <img src={prod.img} alt={prod.name} />
                </div>
                <div className="top-product-info">
                  <div className="flex items-center justify-between">
                    <h5>{prod.name}</h5>
                    <MoreVertical size={13} className="text-[#9CA3AF]" />
                  </div>
                  <div className="top-product-price-row">
                    <span className="top-product-price">
                      {currency.format(prod.price)}
                    </span>
                  </div>
                  <div className="top-product-bottom-row">
                    <span className="product-growth-pill">↑ {prod.growth}</span>
                    <button className="product-cart-btn" title="Add to POS Cart">
                      <ShoppingCart size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="card-surface">
          <div className="card-header-bar">
            <div className="card-title-group">
              <h3>Stock Alerts</h3>
            </div>
            <Link href="/restock" className="card-action-link">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="stock-alerts-list">
            {stats.lowStockItems && stats.lowStockItems.length > 0
              ? stats.lowStockItems.slice(0, 5).map((alert) => (
                <div key={alert.id} className="stock-alert-row">
                  <div className="stock-alert-thumb-wrap">
                    <div className="stock-alert-thumb">
                      <Package size={16} className="text-[#6750D9]" />
                    </div>
                    <span className="stock-alert-name">
                      {alert.variant.product.name} ({alert.variant.size})
                    </span>
                  </div>
                  <div className="stock-alert-meta">
                    <span className="stock-alert-qty">
                      {alert.quantity} left
                    </span>
                    <span className="status-pill low-stock">Low Stock</span>
                  </div>
                </div>
              ))
              : stockAlertsFallback.map((alert) => (
                <div key={alert.name} className="stock-alert-row">
                  <div className="stock-alert-thumb-wrap">
                    <div className="stock-alert-thumb">
                      <img src={alert.img} alt={alert.name} />
                    </div>
                    <span className="stock-alert-name">{alert.name}</span>
                  </div>
                  <div className="stock-alert-meta">
                    <span className="stock-alert-qty">{alert.left}</span>
                    <span className={`status-pill ${alert.statusClass}`}>
                      {alert.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          5. ROW 4: INVENTORY SUMMARY + BRANCH PERFORMANCE + QUICK ACTIONS
          =================================================================== */}
      <section className="dashboard-grid-row-4">
        {/* Inventory Summary */}
        <div className="card-surface">
          <div className="card-header-bar">
            <div className="card-title-group">
              <h3>Inventory Summary</h3>
            </div>
          </div>

          <div className="inventory-summary-gauges">
            {/* In Stock 78% */}
            <div className="gauge-item">
              <div className="gauge-circle">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E6F9F0"
                    strokeWidth="3.2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#0E9F6E"
                    strokeWidth="3.2"
                    strokeDasharray="78, 100"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="gauge-percent">78%</span>
                </div>
              </div>
              <span className="gauge-label">In Stock</span>
              <span className="gauge-sublabel">1,245 items</span>
            </div>

            {/* Low Stock 12% */}
            <div className="gauge-item">
              <div className="gauge-circle">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#FFF1E8"
                    strokeWidth="3.2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E06D3B"
                    strokeWidth="3.2"
                    strokeDasharray="12, 100"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="gauge-percent">12%</span>
                </div>
              </div>
              <span className="gauge-label">Low Stock</span>
              <span className="gauge-sublabel">184 items</span>
            </div>

            {/* Out of Stock 10% */}
            <div className="gauge-item">
              <div className="gauge-circle">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#FEE2E2"
                    strokeWidth="3.2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#DC2626"
                    strokeWidth="3.2"
                    strokeDasharray="10, 100"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="gauge-percent">10%</span>
                </div>
              </div>
              <span className="gauge-label">Out of Stock</span>
              <span className="gauge-sublabel">125 items</span>
            </div>
          </div>
        </div>

        {/* Branch Performance */}
        <div className="card-surface">
          <div className="card-header-bar">
            <div className="card-title-group">
              <h3>Branch Performance</h3>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-[#172033]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6750D9]" /> Sales
              </span>
              <span className="flex items-center gap-1.5 text-[#172033]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" /> Orders
              </span>
            </div>
          </div>

          <div className="h-44 w-full relative mt-2">
            <svg viewBox="0 0 400 140" className="w-full h-full" preserveAspectRatio="none">
              {/* Y Axis Grid */}
              <line x1="30" y1="20" x2="390" y2="20" stroke="#EEE8E5" strokeDasharray="3 3" />
              <line x1="30" y1="55" x2="390" y2="55" stroke="#EEE8E5" strokeDasharray="3 3" />
              <line x1="30" y1="90" x2="390" y2="90" stroke="#EEE8E5" strokeDasharray="3 3" />
              <line x1="30" y1="120" x2="390" y2="120" stroke="#EEE8E5" />

              <text x="5" y="24" fill="#9CA3AF" fontSize="9">30K</text>
              <text x="5" y="59" fill="#9CA3AF" fontSize="9">20K</text>
              <text x="5" y="94" fill="#9CA3AF" fontSize="9">10K</text>

              {/* Branch 1: Main Store */}
              <rect x="52" y="45" width="12" height="75" rx="3" fill="#6750D9" />
              <rect x="67" y="65" width="12" height="55" rx="3" fill="#F97316" />

              {/* Branch 2: City Center */}
              <rect x="122" y="35" width="12" height="85" rx="3" fill="#6750D9" />
              <rect x="137" y="55" width="12" height="65" rx="3" fill="#F97316" />

              {/* Branch 3: West End */}
              <rect x="192" y="40" width="12" height="80" rx="3" fill="#6750D9" />
              <rect x="207" y="60" width="12" height="60" rx="3" fill="#F97316" />

              {/* Branch 4: Riverside */}
              <rect x="262" y="50" width="12" height="70" rx="3" fill="#6750D9" />
              <rect x="277" y="70" width="12" height="50" rx="3" fill="#F97316" />

              {/* Branch 5: Grand Mall */}
              <rect x="332" y="42" width="12" height="78" rx="3" fill="#6750D9" />
              <rect x="347" y="60" width="12" height="60" rx="3" fill="#F97316" />

              {/* Labels */}
              <text x="45" y="135" fill="#788195" fontSize="8.5">Main Store</text>
              <text x="115" y="135" fill="#788195" fontSize="8.5">City Center</text>
              <text x="187" y="135" fill="#788195" fontSize="8.5">West End</text>
              <text x="257" y="135" fill="#788195" fontSize="8.5">Riverside</text>
              <text x="325" y="135" fill="#788195" fontSize="8.5">Grand Mall</text>
            </svg>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-surface">
          <div className="card-header-bar">
            <div className="card-title-group">
              <h3>Quick Actions</h3>
            </div>
          </div>

          <div className="quick-actions-grid">
            <Link href="/products" className="quick-action-card">
              <div className="quick-action-icon">
                <Plus size={18} />
              </div>
              <div className="quick-action-text">
                <h4>Add Product</h4>
                <p>Add new product to catalog</p>
              </div>
            </Link>

            <Link href="/pos" className="quick-action-card">
              <div className="quick-action-icon">
                <ShoppingCart size={18} />
              </div>
              <div className="quick-action-text">
                <h4>New Sale</h4>
                <p>Create a new sale / POS</p>
              </div>
            </Link>

            <Link href="/inventory" className="quick-action-card">
              <div className="quick-action-icon">
                <Layers size={18} />
              </div>
              <div className="quick-action-text">
                <h4>Manage Inventory</h4>
                <p>Update stock levels</p>
              </div>
            </Link>

            <Link href="/intelligence" className="quick-action-card">
              <div className="quick-action-icon">
                <BarChart3 size={18} />
              </div>
              <div className="quick-action-text">
                <h4>View Reports</h4>
                <p>Sales, inventory & more</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
