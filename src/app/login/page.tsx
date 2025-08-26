"use client";

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GithubIcon, GoogleIcon, Logo } from "@/components/icons";
import { signInWithGoogle, signInWithGitHub } from "@/lib/auth";
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);


  const handleGoogleSignIn = async () => {
    const user = await signInWithGoogle();
    if (user) {
      router.push('/');
    }
  };

  const handleGitHubSignIn = async () => {
    const user = await signInWithGitHub();
    if (user) {
      router.push('/');
    }
  };

  if (loading || (!loading && user)) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Expensify Zen</CardTitle>
          <CardDescription>
            Sign in to your account to manage your expenses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
              <GoogleIcon className="mr-2 h-5 w-5" />
              Sign in with Google
            </Button>
            <Button variant="outline" className="w-full" onClick={handleGitHubSignIn}>
              <GithubIcon className="mr-2 h-5 w-5" />
              Sign in with GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
