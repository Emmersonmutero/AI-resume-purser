
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateUserPassword, deleteUserAccount, User } from "@/lib/actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, EyeOff } from "lucide-react";
import { auth } from "@/lib/auth";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showDeletePassword, setShowDeletePassword] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsPasswordLoading(true);
        const result = await updateUserPassword(currentPassword, newPassword);
        if (result.error) {
            toast({ title: 'Password Change Failed', description: result.error, variant: 'destructive' });
        } else {
            toast({ title: 'Success', description: 'Your password has been changed.' });
            setCurrentPassword('');
            setNewPassword('');
        }
        setIsPasswordLoading(false);
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            toast({ title: 'Error', description: "Please enter your password to confirm deletion.", variant: 'destructive' });
            return;
        }
        setIsDeleteLoading(true);
        const result = await deleteUserAccount(deletePassword);
        if (result.error) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
            setIsDeleteLoading(false);
        } else {
            toast({ title: 'Account Deleted', description: 'Your account has been permanently deleted.' });
            router.push('/register');
        }
    };

    const isFormDisabled = isLoading || !user;

    if (isLoading) {
         return (
            <SidebarProvider>
                <div className="flex min-h-screen bg-background">
                    <DashboardSidebar />
                    <main className="flex-1">
                    <DashboardHeader />
                    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
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
           <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                <form onSubmit={handleChangePassword}>
                    <Card>
                        <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your account's password. It's recommended to use a strong, unique password.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <div className="relative">
                                    <Input id="current-password" type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required disabled={isFormDisabled || isPasswordLoading} />
                                    <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowCurrentPassword(!showCurrentPassword)} disabled={isFormDisabled || isPasswordLoading}>
                                        {showCurrentPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                        <span className="sr-only">Toggle current password visibility</span>
                                    </Button>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <div className="relative">
                                    <Input id="new-password" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={isFormDisabled || isPasswordLoading} />
                                    <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowNewPassword(!showNewPassword)} disabled={isFormDisabled || isPasswordLoading}>
                                        {showNewPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                        <span className="sr-only">Toggle new password visibility</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button type="submit" disabled={isFormDisabled || isPasswordLoading}>
                                {isPasswordLoading ? 'Updating...' : 'Update Password'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>

                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Delete Account</CardTitle>
                        <CardDescription>Permanently delete your account and all associated data. This action is irreversible.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <Label htmlFor="delete-password">Confirm Password</Label>
                        <div className="relative">
                            <Input 
                                id="delete-password" 
                                type={showDeletePassword ? 'text' : 'password'}
                                value={deletePassword} 
                                onChange={(e) => setDeletePassword(e.target.value)} 
                                placeholder="Enter your password to confirm"
                                disabled={isFormDisabled || isDeleteLoading}
                                className="pr-10"
                            />
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="absolute inset-y-0 right-0 h-full px-3"
                                onClick={() => setShowDeletePassword(!showDeletePassword)}
                                disabled={isFormDisabled || isDeleteLoading}
                            >
                                {showDeletePassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                <span className="sr-only">Toggle password visibility</span>
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-start">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={isFormDisabled || isDeleteLoading || !deletePassword}>Delete My Account</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    account and remove all your data from our servers.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleteLoading}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleteLoading || !deletePassword}>
                                    {isDeleteLoading ? 'Deleting...' : 'Continue'}
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
           </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
