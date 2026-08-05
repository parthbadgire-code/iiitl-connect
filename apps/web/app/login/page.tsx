"use client";

import { signIn } from "@/lib/auth-client";
import { Button } from "@parthbadgire/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@parthbadgire/ui/components/card";
import { Terminal } from "lucide-react";

export default function LoginPage() {
  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await signIn.social({
        provider: "google",
        callbackURL: "http://localhost:3000/academic",
      });
      if (error) {
        alert("Sign in error: " + error.message || error.statusText);
        console.error("Auth error:", error);
      }
    } catch (err: any) {
      alert("Network error: " + err.message);
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900">
            <Terminal className="h-6 w-6 text-zinc-50" />
          </div>
          <CardTitle className="text-2xl font-bold">IIITL Connect</CardTitle>
          <CardDescription>
            The exclusive CampusOS for IIIT Lucknow.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            className="w-full font-medium"
            onClick={handleGoogleSignIn}
          >
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            Sign in with Google
          </Button>
          <p className="text-center text-xs text-zinc-500">
            * Restricted to @iiitl.ac.in domain emails only.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
