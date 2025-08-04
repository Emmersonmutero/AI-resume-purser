
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Briefcase, User, Eye, EyeOff } from 'lucide-react';
import { signUpWithEmail, handleSocialSignIn } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/layout/theme-toggle';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" className="w-4 h-4 mr-2">
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.6 1.84-4.84 1.84-5.84 0-10.62-4.78-10.62-10.62s4.78-10.62 10.62-10.62c3.32 0 5.62 1.36 6.94 2.6l2.3-2.3C20.16 1.68 17.06 0 12.48 0 5.6 0 0 5.6 0 12.48s5.6 12.48 12.48 12.48c6.88 0 12.12-4.52 12.12-12.12 0-.8-.08-1.6-.22-2.4H12.48z"
      ></path>
    </svg>
  );

const FacebookIcon = () => (
    <svg role="img" viewBox="0 0 24 24" className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" fill="currentColor"/>
    </svg>
);


export default function RegisterPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState<'job-seeker' | 'recruiter'>('job-seeker');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const redirectToDashboard = (role: string | null) => {
        if (role === 'recruiter') {
            router.replace('/dashboard/recruiter');
        } else {
            router.replace('/dashboard/job-seeker');
        }
    };

    const handleEmailRegister = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm-password');
        formData.append('role', role);

        if (password !== confirmPassword) {
            toast({ title: 'Registration Failed', description: "Passwords don't match.", variant: 'destructive' });
            return;
        }

        setIsLoading(true);
        const result = await signUpWithEmail(formData);

        if (result?.error) {
            toast({ title: 'Registration Failed', description: result.error, variant: 'destructive' });
            setIsLoading(false);
        } else if (result.success) {
            toast({ title: 'Registration Successful', description: 'Redirecting to your dashboard...' });
            redirectToDashboard(result.role);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        setIsLoading(true);
        const authProvider = provider === 'google' ? googleProvider : facebookProvider;
        try {
            const result = await signInWithPopup(auth, authProvider);
            const socialResult = await handleSocialSignIn(result.user);
            if (socialResult.error) {
                throw new Error(socialResult.error);
            }
            toast({ title: 'Login Successful', description: 'Redirecting to your dashboard...' });
            redirectToDashboard(socialResult.role);
        } catch (error: any) {
            let description = error.message;
            if (error.code === 'auth/operation-not-allowed') {
                 description = `${provider.charAt(0).toUpperCase() + provider.slice(1)} Sign-in is not enabled. Please enable it in the Firebase console.`;
            } else if (error.code === 'auth/unauthorized-domain') {
                 description = `This domain is not authorized for ${provider.charAt(0).toUpperCase() + provider.slice(1)} Sign-in. Please add it to the list of authorized domains in the Firebase console.`;
            }
            toast({ title: 'Login Failed', description, variant: 'destructive' });
            setIsLoading(false);
        }
    };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-background p-4">
       <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <Link href="/" className="flex items-center space-x-2 text-primary">
                    <FileText className="h-8 w-8" />
                    <span className="text-2xl font-bold font-headline">AI Resume Parser</span>
                </Link>
            </div>
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>Select your role and enter your details to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailRegister} className="grid gap-4">
            <div className="grid gap-2">
                <Label>I am a...</Label>
                <RadioGroup defaultValue="job-seeker" onValueChange={(value) => setRole(value as 'job-seeker' | 'recruiter')} className="grid grid-cols-2 gap-4">
                     <div>
                        <RadioGroupItem value="job-seeker" id="job-seeker" className="peer sr-only" />
                        <Label
                          htmlFor="job-seeker"
                          className={cn(
                            "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                            role === 'job-seeker' && "border-primary"
                          )}
                        >
                          <User className="mb-3 h-6 w-6" />
                          Job Seeker
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="recruiter" id="recruiter" className="peer sr-only" />
                        <Label
                          htmlFor="recruiter"
                           className={cn(
                            "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                             role === 'recruiter' && "border-primary"
                          )}
                        >
                          <Briefcase className="mb-3 h-6 w-6" />
                          Recruiter
                        </Label>
                      </div>
                </RadioGroup>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
               <div className="relative">
                <Input id="password" name="password" type={showPassword ? 'text' : 'password'} required disabled={isLoading} />
                 <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">Toggle password visibility</span>
                </Button>
              </div>
            </div>
             <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
               <div className="relative">
                <Input id="confirm-password" name="confirm-password" type={showConfirmPassword ? 'text' : 'password'} required disabled={isLoading} />
                 <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">Toggle confirm password visibility</span>
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
            </form>
             <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                 <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('google')} disabled={isLoading}>
                    <GoogleIcon />
                    Google
                </Button>
                <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('facebook')} disabled={isLoading}>
                    <FacebookIcon />
                    Facebook
                </Button>
            </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
