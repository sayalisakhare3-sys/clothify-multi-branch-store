"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Package,
  Layers,
  TrendingUp,
  ShoppingCart,
  Store,
  Users,
  BarChart3,
  Tag,
  SlidersHorizontal,
  FileText,
  RefreshCw,
  PackageSearch,
  ShieldCheck,
  Search,
  Bell,
  Clock,
  ChevronDown,
  LogOut,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const mainNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/inventory", label: "Inventory", icon: Layers },
  { href: "/sales", label: "Sales", icon: TrendingUp },
  { href: "/pos", label: "POS", icon: ShoppingCart },
  { href: "/branches", label: "Branches", icon: Store },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/categories", label: "Categories", icon: Tag },
  { href: "/variants", label: "Variants", icon: SlidersHorizontal },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/returns", label: "Returns", icon: RefreshCw },
  { href: "/restock", label: "Restock", icon: PackageSearch },
  { href: "/intelligence", label: "Reports & Intel", icon: BarChart3 },
  { href: "/users", label: "Users & Roles", icon: ShieldCheck },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [currentDate, setCurrentDate] = useState({ dateStr: "", dayStr: "" });

  useEffect(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const dayStr = now.toLocaleDateString("en-US", { weekday: "long" });
    queueMicrotask(() => {
      setCurrentDate({ dateStr, dayStr });
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.replace("/login");
  };

  return (
    <div className="dashboard">
      {/* ==========================================
          SIDEBAR
      ========================================== */}
      <aside className="sidebar">
        {/* Brand Header */}
        <Link href="/dashboard" className="sidebar-logo">
          <div className="brand-icon-box">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Stylized Coat Hanger */}
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v2" />
              <path d="M12 9l9 5.5a1 1 0 0 1 .5.86V16a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1v-.64a1 1 0 0 1 .5-.86L12 9z" />
            </svg>
          </div>
          <div className="sidebar-brand-text">
            <h2>Clothify</h2>
            <p>Style. Stock. Success.</p>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className="sidebar-menu" aria-label="Main navigation">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                href={item.href}
                className={isActive ? "active" : ""}
                key={item.href}
              >
                <Icon className="nav-icon" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Promo Card: Better Fashion Management */}
        <div className="sidebar-promo-card">
          <div className="sidebar-promo-media">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
              alt="Fashion Management"
            />
          </div>
          <h4>Better Fashion Management</h4>
          <p>Smarter tools for a growing business.</p>
          <Link href="/intelligence" className="sidebar-promo-btn">
            Upgrade Plan →
          </Link>
        </div>

        {/* Logout */}
        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ==========================================
          MAIN CONTENT AREA & TOP HEADER
      ========================================== */}
      <div className="dashboard-main admin-module-main">
        {/* Top Header Bar */}
        <header className="top-header">
          {/* Search bar */}
          <div className="top-header-search">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search products, categories, or anything..."
            />
          </div>

          {/* Right Header Actions */}
          <div className="top-header-actions">
            {/* Notification Bell */}
            <button className="header-icon-btn" title="Notifications" type="button">
              <Bell size={18} />
              <span className="header-badge">3</span>
            </button>

            {/* Clock / Schedule */}
            <button className="header-icon-btn" title="Schedule & Activity" type="button">
              <Clock size={18} />
            </button>

            {/* User Profile */}
            <div className="header-user-profile" title="Admin User">
              <div className="header-avatar">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                  alt="Admin Avatar"
                />
              </div>
              <div className="header-user-info">
                <span className="header-user-name">Admin</span>
                <span className="header-user-role">Super Admin</span>
              </div>
              <ChevronDown size={14} className="text-[#788195] ml-1" />
            </div>

            {/* Date Widget */}
            <div className="header-date-widget">
              <span className="header-date-day">
                {currentDate.dateStr || "Today"}
              </span>
              <span className="header-date-weekday">
                {currentDate.dayStr || "Live"}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-module-content">{children}</main>
      </div>
    </div>
  );
}
