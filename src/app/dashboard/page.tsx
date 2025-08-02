import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import DashboardClient from "@/components/dashboard/dashboard-client";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-8">
            <DashboardClient />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
