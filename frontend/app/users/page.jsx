import Users from "@/features/users/Users";
import AdminShell from "@/features/layout/AdminShell";

export default function Page() {
  return (
    <AdminShell>
      <Users />
    </AdminShell>
  );
}
