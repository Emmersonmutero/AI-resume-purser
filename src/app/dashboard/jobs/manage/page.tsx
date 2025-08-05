import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { JobManagementClient } from "@/components/jobs/job-management-client";

export default function JobManagementPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <main className="flex-1">
          <DashboardHeader />
          <div className="responsive-padding">
            <JobManagementClient />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}