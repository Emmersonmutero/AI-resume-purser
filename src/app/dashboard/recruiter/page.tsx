import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export default function RecruiterDashboardPage() {
  return (
    <SidebarProvider>
       <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <main className="flex-1">
          <DashboardHeader />
          <div className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-primary"/>
                        <CardTitle>Recruiter Dashboard</CardTitle>
                    </div>
                    <CardDescription>Welcome to the Recruiter view. Candidate management and job posting features are coming soon.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">This area is under construction.</p>
                </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
