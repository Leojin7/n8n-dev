
import { requireAuth } from '@/lib/auth-utils';
import { caller } from '@/trpc/server';
import Logout from './logout';
const Page = async () => {
  await requireAuth();

  const data = await caller.getUsers();
  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center p-4 flex-col gap-4">
      protected server component
      <div className="flex flex-col gap-4">
        {JSON.stringify(data)}
      </div>
      <Logout />
    </div>
  );
};

// Add the export default statement
export default Page;