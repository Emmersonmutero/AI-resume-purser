'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Facebook } from 'lucide-react';
import { signInWithEmail } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { app } from '@/lib/firebase';

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


export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const result = await signInWithEmail(formData);
    if (result?.error) {
      toast({ title: 'Login Failed', description: result.error, variant: 'destructive' });
      setIsLoading(false);
    } else {
      router.push('/dashboard');
    }
  };
  
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        toast({ title: 'Login Failed', description: 'Google Sign-in is not enabled for this project. Please enable it in the Firebase console.', variant: 'destructive' });
      } else if (error.code === 'auth/unauthorized-domain') {
          toast({ title: 'Login Failed', description: 'This domain is not authorized for Google Sign-in. Please add it to the list of authorized domains in the Firebase console.', variant: 'destructive' });
      } else {
        toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
      }
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, facebookProvider);
      router.push('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        toast({ title: 'Login Failed', description: 'Facebook Sign-in is not enabled for this project. Please enable it in the Firebase console.', variant: 'destructive' });
      } else if (error.code === 'auth/unauthorized-domain') {
          toast({ title: 'Login Failed', description: 'This domain is not authorized for Facebook Sign-in. Please add it to the list of authorized domains in the Firebase console and configure the OAuth redirect URI in your Facebook App settings.', variant: 'destructive' });
      } else {
        toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Link href="/" className="flex items-center space-x-2 text-primary">
                <FileText className="h-8 w-8" />
                <span className="text-2xl font-bold font-headline">ResumeFlow</span>
            </Link>
          </div>
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required disabled={isLoading} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
                    <GoogleIcon />
                    Google
                </Button>
                <Button variant="outline" className="w-full" onClick={handleFacebookLogin} disabled={isLoading}>
                    <FacebookIcon />
                    Facebook
                </Button>
            </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="underline">
              Register
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
