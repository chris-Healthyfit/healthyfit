import FinanceNav from "@/components/FinanceNav";

export default function FinancesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="hf-finance-root">
      <FinanceNav />
      {children}
    </div>
  );
}
