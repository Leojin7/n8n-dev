import { HydrateClient } from "@/components/HydrateClient";
import { getCredentialsParams } from "@/features/credentials/server/params-loader";
import { prefetchCredentials } from "@/features/credentials/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { prefetch } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { SearchParams } from "nuqs";
import { Suspense } from "react";
import { CredentialsError, CredentialsList, CredentialsLoading } from "@/features/credentials/components/credentials";
import { CredentialsContainer } from "@/features/credentials/components/credentials";
type Props = {

  searchParams: Promise<SearchParams>;

}

const Page = async ({ searchParams }: Props) => {
  const params = getCredentialsParams(await searchParams);
  await prefetchCredentials(params);
  return (
    <CredentialsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<CredentialsError />}>
          <Suspense fallback={<CredentialsLoading />}>
            <CredentialsList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </CredentialsContainer>
  );
};
export default Page;