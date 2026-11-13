import Customers from "@/features/customers/Customers";
import AdminShell from "@/features/layout/AdminShell";

export default function Page() {
  return (
    <AdminShell>
      <Customers />
    </AdminShell>
  );
}
