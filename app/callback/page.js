// app/callback/page.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import userManager from "@/utils/oidc";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    userManager
      .signinRedirectCallback()
      .then(() => {
        router.push("/erd");
      })
      .catch((error) => {
        console.error("Error handling callback:", error);
        router.push("/erd");
      });
  }, [router]);

  return <div>Loading...</div>;
}
