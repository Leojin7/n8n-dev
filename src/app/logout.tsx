'use client';

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

/**
 * Renders a button that signs the current user out and, on successful sign-out, redirects to the login page.
 *
 * @returns The React element for the logout button.
 */
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