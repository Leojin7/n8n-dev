import prisma from "@/lib/db";

export const dynamic = 'force-dynamic';

export default async function Page() {
  try {
    const users = await prisma.user.findMany();
    
    return (
      <div className="min-h-screen min-w-screen flex items-center justify-center">
        <pre>{JSON.stringify(users, null, 2)}</pre>
      </div>
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return (
      <div className="min-h-screen min-w-screen flex items-center justify-center">
        <div>Error loading users: {error instanceof Error ? error.message : 'Unknown error'}</div>
      </div>
    );
  }
}