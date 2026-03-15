import { SCMMapperDashboard } from "@/features/scm-mapper/components/dashboard";
import Prismadb from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

export default async function SCMMapperPage() {
  await requireAuth();

  const results = await Prismadb.sCMMapperResult.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">SCM Mapper</h2>
      </div>
      <SCMMapperDashboard results={results} />
    </div>
  );
}
