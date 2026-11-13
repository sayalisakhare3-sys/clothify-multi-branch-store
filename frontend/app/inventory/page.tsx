import InventoryPage from "@/features/inventory/InventoryPage";
import AdminShell from "@/features/layout/AdminShell";

export default function Page() {
  return (
    <AdminShell>
      <InventoryPage />
    </AdminShell>
  );
}
