
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { useEffect, useState } from "react";
import { auth } from "@/lib/auth";
import type { User as AuthUser } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile, getUserRole, type User } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser: AuthUser | null) => {
      if (currentUser) {
        const role = await getUserRole(currentUser.uid) as User['role'];
        setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            role: role
        });
        setDisplayName(currentUser.displayName || '');
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    const result = await updateUserProfile(displayName);
    if (result.error) {
      toast({
        title: "Update Failed",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your display name has been successfully updated.",
      });
      // Manually update the user state to reflect the change immediately
       if(user) {
         setUser({...user, displayName: displayName});
       }
    }
    setIsSaving(false);
  };
  
    if (isLoading) {
        return (
             <SidebarProvider>
                <div className="flex min-h-screen bg-background">
                    <DashboardSidebar />
                    <main className="flex-1">
                    <DashboardHeader />
                    <div className="p-4 sm:p-6 lg:p-8">
                         <Card>
                            <CardHeader>
                               <Skeleton className="h-8 w-1/4" />
                               <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                     <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                 <div className="space-y-2">
                                     <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </CardContent>
                             <CardFooter>
                                <Skeleton className="h-10 w-24" />
                            </CardFooter>
                        </Card>
                    </div>
                    </main>
                </div>
            </SidebarProvider>
        )
    }

  return (
     <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <main className="flex-1">
          <DashboardHeader />
           <div className="p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Manage your public profile information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input 
                      id="displayName" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      value={user?.email || ''} 
                      disabled 
                      readOnly
                    />
                     <p className="text-xs text-muted-foreground">Your email address cannot be changed.</p>
                  </div>
                   <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                     <Input 
                      id="role" 
                      value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
                      disabled 
                      readOnly
                      className="capitalize"
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
