"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Immediately redirect to the single phone auth page
  React.useEffect(() => {
    router.replace("/auth/login");
  }, [user, router]);

  return null;
}