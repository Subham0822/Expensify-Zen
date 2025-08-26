"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 animate-in fade-in-50">
        <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold md:text-2xl">Profile</h1>
        </div>
        <Card className="w-full max-w-2xl mx-auto transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>View and manage your account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.photoURL || "https://picsum.photos/100/100"} alt={user.displayName || "User Avatar"} data-ai-hint="user avatar" />
                <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{user.displayName}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="space-y-2">
                <h3 className="font-semibold">Account Information</h3>
                <div className="text-sm text-muted-foreground">
                    <p><strong>User ID:</strong> {user.uid}</p>
                    <p><strong>Provider:</strong> {user.providerData[0]?.providerId}</p>
                </div>
            </div>
             <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
