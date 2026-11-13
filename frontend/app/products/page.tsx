import ProductsPage from "@/features/products/ProductsPage";
import AdminShell from "@/features/layout/AdminShell";

export default function Page() {
  return (
    <AdminShell>
      <ProductsPage />
    </AdminShell>
  );
}
