import BranchesPage from "@/features/branches/BranchesPage";
import AdminShell from "@/features/layout/AdminShell";

export default function Page() {
  return (
    <AdminShell>
      <BranchesPage />
    </AdminShell>
  );
}
