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
import { FileText, LayoutGrid, AlertTriangle, File, BarChart, Shield, Settings, LifeBuoy, LogOut, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { signOut } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '../ui/card';

const VertexGuardIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 22V12" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 7L12 12" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 7L12 12" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 12L7 9.5" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 12L17 9.5" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)


export function DashboardSidebar() {
    const { toast } = useToast();
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
        <div className="flex items-center gap-2">
            <VertexGuardIcon />
            <span className="text-lg font-semibold">VertexGuard</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard" isActive>
                <LayoutGrid />
                Overview
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <AlertTriangle />
                Issues
                <ChevronRight className="ml-auto" />
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <File />
                Files
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
         <SidebarGroup>
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <BarChart />
                Threat Details
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Shield />
                Threats
                 <ChevronRight className="ml-auto" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarMenu>
             <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <LifeBuoy />
                Help & Supports
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
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
                    <Shield className='w-5 h-5 text-primary'/>
                </div>
                <p className='text-sm font-medium'>Enhance your security</p>
                <Button size="sm" className="w-full mt-2">Upgrade</Button>
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
