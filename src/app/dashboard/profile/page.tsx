
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/auth";
import type { User as AuthUser } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile, getUserRole, type User } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { onAuthStateChanged } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

export default function ProfilePage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: AuthUser | null) => {
      if (currentUser) {
        const role = await getUserRole(currentUser.uid) as User['role'];
        const fullUser: User = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            role: role
        };
        setUser(fullUser);
        setDisplayName(currentUser.displayName || '');
        setPhotoURL(currentUser.photoURL);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoURL(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData();
    formData.append('displayName', displayName);
    if(photoFile) {
        formData.append('photoFile', photoFile);
    }

    const result = await updateUserProfile(formData);
    if (result.error) {
      toast({
        title: "Update Failed",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
       if(user && result.photoURL) {
         setUser({...user, displayName: displayName, photoURL: result.photoURL});
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
                                <Skeleton className="h-24 w-24 rounded-full" />
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
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
                                <AvatarImage src={photoURL ?? `https://placehold.co/96x96.png`} alt={user?.displayName ?? 'User'} />
                                <AvatarFallback>{user?.displayName?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
                            </Avatar>
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer" onClick={handleAvatarClick}>
                                <Camera className="h-6 w-6 text-white" />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/png, image/jpeg, image/gif"
                            />
                        </div>
                        <div className="grid flex-1 gap-1.5">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input 
                            id="displayName" 
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            disabled={isSaving}
                            />
                        </div>
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
