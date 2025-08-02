import DashboardClient from "@/components/dashboard/dashboard-client";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <DashboardHeader />
      <main className="flex-1 py-8">
        <DashboardClient />
      </main>
    </div>
  );
}
