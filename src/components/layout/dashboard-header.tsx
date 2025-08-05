
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
import { dataService } from '@/lib/data-service';

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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const router = useRouter();

  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const notifs = await dataService.getNotifications();
      setNotifications(notifs);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRole = await getUserRole(firebaseUser.uid);
        setRole(userRole);
        // Fetch notifications for any authenticated user
        await fetchNotifications();
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Refresh notifications every 30 seconds
  useEffect(() => {
    if (user) {
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="lg:hidden" />
          <h1 className="font-bold text-lg sm:text-xl">Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search - Hidden on mobile */}
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-5 w-5" />
          </Button>
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-red-500 text-white p-0 flex items-center justify-center rounded-full">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[280px] sm:w-[320px] max-h-[400px] overflow-y-auto">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {isLoadingNotifications && (
                  <div className="animate-spin h-3 w-3 border border-muted-foreground border-t-transparent rounded-full" />
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <DropdownMenuItem className="text-center text-muted-foreground py-8">
                  {isLoadingNotifications ? 'Loading notifications...' : 'No new notifications'}
                </DropdownMenuItem>
              ) : (
                notifications.slice(0, 8).map((notif) => (
                  <DropdownMenuItem key={notif.id} className="flex flex-col items-start p-3 space-y-1 hover:bg-accent cursor-pointer">
                    <div className="flex items-start justify-between w-full">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {notif.type === 'application' && <Briefcase className="h-3 w-3 text-blue-500" />}
                          {notif.type === 'job_match' && <CheckCircle className="h-3 w-3 text-green-500" />}
                          {notif.type === 'resume_processed' && <User className="h-3 w-3 text-purple-500" />}
                          <span className="font-medium text-sm truncate">{notif.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notif.createdAt))} ago
                        </span>
                      </div>
                      {!notif.read && (
                        <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))
              )}
              {notifications.length > 8 && (
                <DropdownMenuItem className="text-center text-primary font-medium">
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => router.push('/dashboard/notifications')}>
                    View all {notifications.length} notifications
                  </Button>
                </DropdownMenuItem>
              )}
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-center">
                    <Button variant="ghost" size="sm" className="w-full text-xs" onClick={fetchNotifications}>
                      Refresh notifications
                    </Button>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || ''} />
                  <AvatarFallback className="text-xs">
                    {user?.displayName?.[0] ?? 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel className="text-sm">
                <div className="flex flex-col space-y-1">
                  <p className="font-medium">{user?.displayName || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="text-sm">
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </Link>
              </DropdownMenuItem>
              {role === 'admin' && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/admin" className="text-sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="text-sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-sm text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Theme Toggle - Hidden on small screens */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
    );
}
