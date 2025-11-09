'use client';

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Logout() {
  const router = useRouter();
  return (
    <Button variant="dark" onClick={() => authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login');
        }
      },

    })}>Logout</Button>
  );
}