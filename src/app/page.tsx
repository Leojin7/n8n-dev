// src/app/page.tsx
'use client';

import { Client } from '@/app/client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { makeQueryClient } from '@/trpc/query-client';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

const Page = async () => {
  const queryClient = makeQueryClient();

  // Prefetch the users query
  await queryClient.prefetchQuery({
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
        <Suspense fallback={<div>Loading...</div>}>
          <Client />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
};

export default Page;