// src/app/client.tsx
'use client';

import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from "@tanstack/react-query";

type User = {
  id: number;
  email: string;
  name: string | null;
};
export const Client = () => {
  const trpc = useTRPC();
  const { data: users } = useSuspenseQuery(trpc.getUsers.queryOptions());

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <pre className="whitespace-pre-wrap break-words">
        {JSON.stringify(users, null, 2)}
      </pre>
    </div>
  );
};