import AdminLayout from "@/components/AdminLayout";
import "./admin.css";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
