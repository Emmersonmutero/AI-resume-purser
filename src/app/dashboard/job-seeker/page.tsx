
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardClient from "@/components/dashboard/dashboard-client";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default function JobSeekerDashboardPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <main className="flex-1">
          <DashboardHeader />
          <div className="p-4 sm:p-6 lg:p-8">
            <DashboardClient />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
