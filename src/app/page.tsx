// src/app/page.tsx
'use client';

import { Client } from '@/app/client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { makeQueryClient } from '@/trpc/query-client';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

const Page = () => {
  const [isClient, setIsClient] = useState(false);
  const queryClient = makeQueryClient();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // or a loading spinner
  }

  // Client-side data fetching
  queryClient.prefetchQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/trpc/getUsers');
      const data = await response.json();
      return data;
    },
  });

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center p-4">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Client />
      </HydrationBoundary>
    </div>
  );
};

export default Page;