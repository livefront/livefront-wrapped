'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "next-auth/react";

export default function HomePage() {
  const handleSignIn = () => {
    signIn("github", { callbackUrl: "/dashboard" });
  };

  return (
    <main className="home-page min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <Card className="home-page__card w-[90%] max-w-[600px]">
        <CardHeader className="home-page__header text-center">
          <CardTitle className="home-page__title text-4xl font-bold">GitHub Wrapped</CardTitle>
          <CardDescription className="home-page__description text-xl mt-2">
            Your year on GitHub, wrapped up beautifully
          </CardDescription>
        </CardHeader>
        <CardContent className="home-page__content flex justify-center">
          <Button 
            size="lg" 
            className="home-page__sign-in-button font-semibold"
            onClick={handleSignIn}
          >
            Sign in with GitHub
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
