'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  FileText,
  LayoutGrid,
  Briefcase,
  File,
  Settings,
  LifeBuoy,
  LogOut,
  Bot,
  User,
} from 'lucide-react';

import { Button } from '../ui/button';
import Link from 'next/link';
import { signOut, getUserRole } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { ThemeToggle } from './theme-toggle';

export function DashboardSidebar() {
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: FirebaseUser | null) => {
      if (user) {
        const role = await getUserRole(user.uid);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Logout Failed',
        description: error,
      });
    } else {
      router.push('/login');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  const commonItems = [
    { href: '/dashboard', label: 'Dashboard Overview', icon: <LayoutGrid /> },
    { href: '/dashboard/profile', label: 'Profile', icon: <User /> },
    { href: '/dashboard/analytics', label: 'Analytics', icon: <FileText /> },
  ];
  const hrItems = [
    { href: '/dashboard/resumes', label: 'Resumes', icon: <File /> },
    { href: '/dashboard/jobs', label: 'Job Descriptions', icon: <Briefcase /> },
    { href: '/dashboard/match', label: 'Match Engine', icon: <Bot /> },
    { href: '/dashboard/gmail-import', label: 'Gmail Fetcher', icon: <FileText /> },
    { href: '/dashboard/reports', label: 'Reports', icon: <FileText /> },
  ];
  const jobSeekerItems = [
    { href: '/dashboard/upload', label: 'Upload Resume', icon: <File /> },
    { href: '/dashboard/matches', label: 'Matched Jobs', icon: <Briefcase /> },
    { href: '/dashboard/applications', label: 'Application Tracker', icon: <FileText /> },
  ];
  const adminItems = [
    { href: '/dashboard/admin', label: 'Admin Panel', icon: <LifeBuoy /> },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <span className="font-bold text-lg">AI Resume Parser</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {[...commonItems,
            ...(userRole === 'recruiter' ? hrItems : []),
            ...(userRole === 'jobseeker' ? jobSeekerItems : []),
            ...(userRole === 'admin' ? adminItems : []),
          ].map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} className={pathname === item.href ? 'font-bold text-primary' : ''}>
                {item.icon} {item.label}
              </Link>
            </SidebarMenuItem>
          ))}

          <SidebarMenuItem>
            <Link href="/dashboard/settings" className={pathname === '/dashboard/settings' ? 'font-bold text-primary flex items-center gap-2' : 'flex items-center gap-2'}>
              <Settings /> Settings
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <ThemeToggle />
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Button variant="ghost" className="w-full flex items-center gap-2" onClick={handleLogout}>
              <LogOut /> Logout
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
