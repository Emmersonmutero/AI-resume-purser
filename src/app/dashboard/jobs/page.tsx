import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { JobsListingClient } from "@/components/jobs/jobs-listing-client";

export default function JobsPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <main className="flex-1">
          <DashboardHeader />
          <div className="responsive-padding">
            <JobsListingClient />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}