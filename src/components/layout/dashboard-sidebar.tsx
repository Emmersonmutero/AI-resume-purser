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
  Search,
  Target,
  Send,
  Building,
  Users,
  BarChart3,
  TrendingUp,
  UserCheck,
  FileBarChart,
  ChevronDown,
  ChevronRight,
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['main']));

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

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  if (isLoading) return <div>Loading...</div>;

  const navigationStructure = {
    'job-seeker': {
      main: [
        { href: '/dashboard/job-seeker', label: 'Dashboard', icon: <LayoutGrid />, description: 'Overview and statistics' },
        { href: '/dashboard/ai-assistant', label: 'AI Assistant', icon: <Bot />, description: 'Get career guidance' },
      ],
      'Job Search': [
        { href: '/dashboard/resumes', label: 'My Resumes', icon: <FileText />, description: 'Upload and manage resumes' },
        { href: '/dashboard/jobs', label: 'Browse Jobs', icon: <Search />, description: 'Find available positions' },
        { href: '/dashboard/job-seeker/matches', label: 'Job Matches', icon: <Target />, description: 'AI-powered recommendations' },
        { href: '/dashboard/job-seeker/applications', label: 'My Applications', icon: <Send />, description: 'Track applications' },
      ],
      'Account': [
        { href: '/dashboard/profile', label: 'Profile', icon: <User />, description: 'Manage your profile' },
        { href: '/dashboard/analytics', label: 'Analytics', icon: <BarChart3 />, description: 'View your statistics' },
        { href: '/dashboard/settings', label: 'Settings', icon: <Settings />, description: 'Account settings' },
      ]
    },
    'recruiter': {
      main: [
        { href: '/dashboard/recruiter', label: 'Dashboard', icon: <LayoutGrid />, description: 'Recruitment overview' },
        { href: '/dashboard/ai-assistant', label: 'AI Assistant', icon: <Bot />, description: 'Get hiring guidance' },
      ],
      'Recruitment': [
        { href: '/dashboard/jobs/manage', label: 'Manage Jobs', icon: <Briefcase />, description: 'Create and edit postings' },
        { href: '/dashboard/recruiter/applications', label: 'Applications', icon: <Users />, description: 'Review candidates' },
        { href: '/dashboard/candidates', label: 'Candidates', icon: <UserCheck />, description: 'Browse profiles' },
      ],
      'Analytics': [
        { href: '/dashboard/analytics', label: 'Hiring Analytics', icon: <BarChart3 />, description: 'Recruitment metrics' },
        { href: '/dashboard/reports', label: 'Reports', icon: <FileBarChart />, description: 'Generate reports' },
      ],
      'Account': [
        { href: '/dashboard/profile', label: 'Profile', icon: <User />, description: 'Manage your profile' },
        { href: '/dashboard/settings', label: 'Settings', icon: <Settings />, description: 'Account settings' },
      ]
    }
  };

  const currentNav = navigationStructure[userRole as keyof typeof navigationStructure] || navigationStructure['job-seeker'];

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg hover:text-primary transition-colors">
          <Bot className="h-6 w-6 text-primary" />
          AI Resume Parser
        </Link>
        <p className="text-xs text-muted-foreground mt-1">
          {userRole === 'recruiter' ? 'Recruitment Platform' : 'Career Development Platform'}
        </p>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu className="space-y-1">
          {Object.entries(currentNav).map(([sectionName, items]) => (
            <div key={sectionName} className="space-y-1">
              {sectionName !== 'main' && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => toggleSection(sectionName)}
                    className="w-full justify-between text-sm font-medium text-muted-foreground hover:text-foreground px-2 py-1.5"
                  >
                    <span>{sectionName}</span>
                    {expandedSections.has(sectionName) ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {(sectionName === 'main' || expandedSections.has(sectionName)) && (
                <div className={sectionName !== 'main' ? 'ml-2 space-y-1' : 'space-y-1'}>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild>
                        <Link 
                          href={item.href} 
                          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors group ${
                            pathname === item.href 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          <span className="flex-shrink-0">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.label}</p>
                            {item.description && (
                              <p className="text-xs opacity-70 truncate hidden lg:block">{item.description}</p>
                            )}
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </div>
              )}
            </div>
          ))}
        </SidebarMenu>

        <div className="mt-auto pt-4 border-t space-y-1">
          <SidebarMenuItem>
            <div className="px-2 py-1">
              <ThemeToggle />
            </div>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard/help" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                <LifeBuoy className="h-4 w-4" />
                <span>Help & Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-destructive hover:text-destructive-foreground w-full"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
