'use client';

import { formatDistanceToNow } from "date-fns";
import { EntityHeader, EntityContainer, EntitySearch, EntityPagination, LoadingView, ErrorView, EmptyView, EntityItem } from "@/components/entity-components";
import { useRemoveCredential, useSuspenseCredentials } from "../hooks/use-credentials";
import { useCreateCredentials } from "../hooks/use-credentials";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { EntityList } from "@/components/entity-components";
import type { Credential } from "@/generated/prisma";
import { PackageOpenIcon, CreditCardIcon } from "lucide-react";
import { CredentialType } from "@/generated/prisma";
import Image from "next/image";
export const CredentialsSearch = () => {
  const [params, setParams] = useCredentialsParams();
  const { searchValue, setSearchValue } = useEntitySearch({
    params,
    setParams,
  })

  return (
    <EntitySearch
      value={searchValue}
      onChange={(value) => setSearchValue(value)}
      placeholder="             Search Credentials"
    />
  );
};

export const CredentialsList = () => {

  const credentials = useSuspenseCredentials();

  return (
    <EntityList
      items={credentials.data.item}
      getKey={(credential) => credential.id}
      renderItem={(credential) => <CredentialItem data={credential} />}
      emptyView={<CredentialsEmpty />}
      loadingView={<CredentialsLoading />}
      errorView={<CredentialsError />}
    />
  );
};

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {

  return (


    <EntityHeader
      title="Credential"
      description="Create and manage your credentials"
      disabled={disabled}
      newButtonHref="/credentials/new"
      newButtonLabel="New Credentials"
    />
  );
}

export const CredentialsPagination = () => {
  const Credentials = useSuspenseCredentials();
  const [params, setParams] = useCredentialsParams();
  return (
    <EntityPagination
      disabled={Credentials.isPending}
      page={params.page}
      totalPages={Credentials.data.totalPages}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
}

export const CredentialsContainer = ({ children }: {
  children: React.ReactNode;
}) => {
  return (
    <div className="h-full">
      <EntityContainer
        header={<CredentialsHeader />}
        search={<CredentialsSearch />}
        pagination={<CredentialsPagination />}
      >
        {children}
      </EntityContainer>
    </div>
  );
}


export const CredentialsLoading = () => {
  return (
    <LoadingView entity="Credentials" message="Loading Credentials..." />
  );
}

export const CredentialsError = () => {
  return (
    <ErrorView message=" Error Loading Credentials..." />
  );
}


export const CredentialsEmpty = () => {



  const router = useRouter();
  const handleCreate = () => {
    router.push('/credentials/new');
  }
  return (

    <EmptyView
      onNew={handleCreate}
      message="No Credentials found, Create your First Credential"

    />
  );
};

const credentialLogos: Record<CredentialType, string> = {
  [CredentialType.OPENAI]: "/logos/openai.svg",
  [CredentialType.ANTHROPIC]: "/logos/anthropic.svg",
  [CredentialType.GEMINI]: "/logos/gemini.svg"
}
export const CredentialItem = ({ data }: { data: Credential }) => {
  const removeCredential = useRemoveCredential();

  const handleRemove = () => {
    removeCredential.mutate({ id: data.id });
  }

  const logo = credentialLogos[data.type] || "/logos/openai.svg"
  return (
    <EntityItem
      href={`/credentials/${data.id}`}
      item={data}
      title={data.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(new Date(data.updatedAt), { addSuffix: true })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(new Date(data.createdAt), { addSuffix: true })}
        </>
      } image={
        <div className="size-8 flex-center justify-center">
          <Image src={logo} alt={data.type} width={20} height={20} />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeCredential.isPending}
    />
  )
}

