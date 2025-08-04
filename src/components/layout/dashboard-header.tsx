
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
import { getApplicantsForRecruiter, getUserRole, signOut } from '@/lib/actions';
import { Bell, LogOut, User, Search, Settings, Briefcase, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { auth } from '@/lib/auth';
import { useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';

// Remove local Application type, use imported one
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui/badge';

export function DashboardHeader() {
  const { toast } = useToast();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]); // Use any[] to avoid type conflicts
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRole = await getUserRole(firebaseUser.uid);
        setRole(userRole);
        if (userRole === 'recruiter') {
          const fetchedApplicants = await getApplicantsForRecruiter(firebaseUser.uid);
          setNotifications(fetchedApplicants);
        }
        // Add more notification logic for jobseeker, admin, etc. as needed
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <SidebarTrigger className="lg:hidden mr-2" />
        <h1 className="font-bold text-xl flex-1">Dashboard</h1>
        <div className="flex items-center gap-4">
          {/* Search */}
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute top-0 right-0 text-xs bg-red-500 text-white">{notifications.length}</Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <DropdownMenuItem>No new notifications</DropdownMenuItem>
              ) : (
                notifications.map((notif, idx) => (
                  <DropdownMenuItem key={idx}>
                    <span>{notif.status ?? 'Update'} - {notif.updatedAt ? formatDistanceToNow(new Date(notif.updatedAt)) : ''} ago</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar>
                <AvatarImage src={user?.photoURL || ''} />
                <AvatarFallback>{user?.displayName?.[0] ?? 'U'}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.displayName || 'User'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">View Profile</Link>
              </DropdownMenuItem>
              {role === 'admin' && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/admin">Switch Role</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
    );
}
