import ClubLayout from "@/components/ClubLayout";
import "../admin/admin.css";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClubLayout>{children}</ClubLayout>;
}
