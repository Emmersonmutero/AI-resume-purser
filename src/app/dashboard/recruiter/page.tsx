
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import RecruiterDashboardClient from "@/components/dashboard/recruiter-dashboard-client";
import { AIAssistantWidget } from "@/components/ai-assistant/ai-assistant-widget";

export default function RecruiterDashboardPage() {
  return (
    <SidebarProvider>
       <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <main className="flex-1">
          <DashboardHeader />
          <div className="p-4 sm:p-6 lg:p-8">
             <RecruiterDashboardClient />
          </div>
        </main>
        <AIAssistantWidget />
      </div>
    </SidebarProvider>
  );
}
