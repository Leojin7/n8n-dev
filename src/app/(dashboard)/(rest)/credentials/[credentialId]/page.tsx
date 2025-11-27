import { HydrateClient } from "@/components/HydrateClient";
import { CredentialView } from "@/features/credentials/components/credential";
import { CredentialsError } from "@/features/credentials/components/credentials";
import { prefetchCredential } from "@/features/credentials/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
  params: Promise<{ credentialId: string }>
}
const Page = async ({ params }: PageProps) => {
  await requireAuth();
  const { credentialId } = await params;
  prefetchCredential(credentialId);

  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-screen-md w-full flex flex-col gap-y-8 h-full">
        <HydrateClient>
          <ErrorBoundary fallback={<CredentialsError />}>
            <CredentialView credentialId={credentialId} />
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
};
export default Page;