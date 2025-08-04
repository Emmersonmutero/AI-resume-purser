
'use client';

import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { getApplicantsForRecruiter, getUserRole, signOut, type Application } from '@/lib/actions';
import { Bell, LogOut, User, Search, Settings, Briefcase, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { auth } from '@/lib/auth';
import { useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui/badge';

export function DashboardHeader() {
  const { toast } = useToast();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        const userRole = await getUserRole(user.uid);
        setRole(userRole);
        if (userRole === 'recruiter') {
          const fetchedApplicants = await getApplicantsForRecruiter(user.uid);
          setNotifications(fetchedApplicants);
        }
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
        variant: 'destructive',
      });
    } else {
      router.push('/login');
    }
  };

  const hasUnread = notifications.length > 0;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="sm:hidden" />
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
           <Button variant="ghost" size="icon" className="relative">
             <Bell className="h-5 w-5" />
             {hasUnread && <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-primary" />}
             <span className="sr-only">Toggle notifications</span>
           </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isLoading ? (
             <DropdownMenuItem>Loading...</DropdownMenuItem>
          ) : role === 'recruiter' && notifications.length > 0 ? (
             notifications.slice(0, 5).map(app => (
                <DropdownMenuItem key={app.id} className="flex gap-2 items-start" onSelect={() => router.push('/dashboard/recruiter')}>
                   <div className="bg-primary/10 p-2 rounded-full mt-1">
                     <Briefcase className="h-4 w-4 text-primary"/>
                   </div>
                   <div className="flex-1">
                      <p className="font-medium text-sm">{app.applicantName} <span className="text-muted-foreground font-normal">applied for</span> {app.jobTitle}</p>
                      <p className="text-xs text-muted-foreground">{formatDistanceToNow(app.appliedAt.toDate(), { addSuffix: true })}</p>
                   </div>
                </DropdownMenuItem>
             ))
          ) : role === 'job-seeker' ? (
             <DropdownMenuItem className="flex gap-2 items-start">
               <div className="bg-primary/10 p-2 rounded-full mt-1">
                  <CheckCircle className="h-4 w-4 text-primary"/>
               </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Welcome to AI Resume Parser!</p>
                  <p className="text-xs text-muted-foreground">Upload your resume to get started.</p>
                </div>
             </DropdownMenuItem>
          ) : (
            <DropdownMenuItem>No new notifications</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-9 w-9 rounded-full"
          >
            <Avatar className="h-9 w-9">
              {user?.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName ?? 'User'} />}
              <AvatarFallback>
                {user?.displayName?.[0].toUpperCase() ?? user?.email?.[0].toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.displayName ?? 'User'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
             <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
             </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
