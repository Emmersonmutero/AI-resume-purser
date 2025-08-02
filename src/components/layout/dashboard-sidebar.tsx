'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { FileText, LayoutGrid, Briefcase, File, BarChart, Settings, LifeBuoy, LogOut, ChevronRight, Bot } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { signOut } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '../ui/card';
import { usePathname } from 'next/navigation';

export function DashboardSidebar() {
    const { toast } = useToast();
    const pathname = usePathname();

    const handleLogout = async () => {
        const { error } = await signOut();
        if (error) {
          toast({
            title: 'Logout Failed',
            description: error,
            variant: 'destructive',
          });
        }
      };

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold">ResumeFlow</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard/job-seeker" isActive={pathname.startsWith('/dashboard/job-seeker')}>
                <LayoutGrid />
                Overview
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard/recruiter" isActive={pathname.startsWith('/dashboard/recruiter')}>
                <Briefcase />
                Recruiter
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" isDisabled>
                <File />
                My Resumes
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
         <SidebarGroup>
          <SidebarGroupLabel>Analysis</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" isDisabled>
                <BarChart />
                Reports
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" isDisabled>
                <Bot />
                AI Insights
                 <ChevronRight className="ml-auto" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarMenu>
             <SidebarMenuItem>
              <SidebarMenuButton href="#" isDisabled>
                <LifeBuoy />
                Help & Supports
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" isDisabled>
                <Settings />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className='gap-4'>
        <Card className='bg-card/80 border-primary/20'>
            <CardContent className='p-4 text-center'>
                <div className='w-8 h-8 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center'>
                    <Bot className='w-5 h-5 text-primary'/>
                </div>
                <p className='text-sm font-medium'>Get deeper insights</p>
                <Button size="sm" className="w-full mt-2">Upgrade to Pro</Button>
            </CardContent>
        </Card>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut />
              Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
