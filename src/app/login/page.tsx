import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GithubIcon, GoogleIcon, Logo } from "@/components/icons";

export default function LoginPage() {
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
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">
                <GoogleIcon className="mr-2 h-5 w-5" />
                Sign in with Google
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">
                <GithubIcon className="mr-2 h-5 w-5" />
                Sign in with GitHub
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
