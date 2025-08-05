import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { AIChat } from "@/components/ai-assistant/ai-chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Sparkles, FileText, Briefcase, TrendingUp, MessageCircle } from "lucide-react";

export default function AIAssistantPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <main className="flex-1">
          <DashboardHeader />
          <div className="responsive-padding">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* AI Chat - Takes 2/3 of the space */}
              <div className="lg:col-span-2">
                <Card className="h-[calc(100vh-200px)]">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <div className="relative">
                        <Bot className="h-6 w-6 text-primary" />
                        <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-500" />
                      </div>
                      AI Career Assistant
                    </CardTitle>
                    <CardDescription>
                      Get personalized career advice, resume feedback, and job matching insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 h-[calc(100%-100px)]">
                    <AIChat className="h-full border-0 shadow-none" />
                  </CardContent>
                </Card>
              </div>

              {/* Assistant Info Sidebar */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      How I Can Help
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">Resume Optimization</h4>
                        <p className="text-sm text-muted-foreground">
                          Get detailed feedback on your resume and suggestions for improvement
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">Job Matching</h4>
                        <p className="text-sm text-muted-foreground">
                          Find the best job opportunities based on your skills and experience
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">Career Guidance</h4>
                        <p className="text-sm text-muted-foreground">
                          Get advice on career advancement and skill development
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        Be specific about your goals and current situation
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        Ask follow-up questions to get more detailed advice
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        Upload your resume for personalized feedback
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        Share your industry and experience level for better advice
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">AI Powered</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This assistant uses advanced AI to provide personalized career advice based on your profile and goals.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}