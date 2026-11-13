"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/features/dashboard/Dashboard";
import AdminShell from "@/features/layout/AdminShell";

export default function Page() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const timer = setTimeout(() => {
      setAuthorized(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [router]);

  if (!authorized) {
    return null;
  }

  return (
    <AdminShell>
      <Dashboard />
    </AdminShell>
  );
}
