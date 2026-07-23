import { requireAdminPage } from "@/lib/admin-auth";
import AdminDashboard from "@/components/admin/AdminDashboard";
import "./admin.css";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireAdminPage("/admin");
  return <AdminDashboard userName={user.displayName} />;
}
