import { PlusIcon, SearchIcon } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

type EntityHeaderProps = {

  title: string;
  description?: string;
  newButtonLabel: string;
  disabled?: boolean;
  isCreating?: boolean;
} & (
    | { onNew: () => void; newButtonHref?: never }
    | { newButtonHref: string; onNew?: never }
    | { onNew?: never; newButtonHref?: never }
  );



export const EntityHeader = ({
  title,
  description,
  newButtonLabel,
  disabled,
  isCreating,
  onNew,
  newButtonHref,
}: EntityHeaderProps) => {

  return (
    <div className="flex flex-row items-center justify-between gap-x-4">
      <div className="flex flex-col">
        <h1 className="text-lg md:text-xl font-semibold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {onNew && !newButtonHref && (
        <Button onClick={onNew} disabled={disabled}>
          <PlusIcon className="size-4" />
          {newButtonLabel}
        </Button>
      )}
      {newButtonHref && !onNew && (
        <Button size="sm" asChild><Link href={newButtonHref} prefetch>
          <PlusIcon className="size-4" />
          {newButtonLabel}
        </Link></Button>
      )}
    </div>
  )

}

type EntityContainerProps = {
  header: React.ReactNode;
  children: React.ReactNode;
  search?: React.ReactNode;
  pagination?: React.ReactNode;
}
export const EntityContainer = ({
  header,
  children,
  search,
  pagination
}: EntityContainerProps) => {
  return (
    <div className="p-4 md:px-10 md:py-6 h-[calc(100vh-64px)] flex flex-col">
      <div className="mx-auto max-w-screen-xl w-full h-full flex flex-col">
        {header}
        {search}
        <div className="flex-1 min-h-0 overflow-auto">
          {children}
        </div>
        {pagination && (
          <div className="border-t pt-4 mt-4">
            {pagination}
          </div>
        )}
      </div>
    </div>
  )
}

interface EntitySearchProps {


  value: string;
  onChange: (value: string) => void;

  placeholder?: string;
};

export const EntitySearch = ({
  value,
  onChange,
  placeholder
}: EntitySearchProps) => {
  return (
    <div className="relative ml-auto">
      <SearchIcon className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />

    </div>
  );
};

interface EntityPaginationProps {

  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export const EntityPagination = ({
  page,
  totalPages,
  onPageChange,
  disabled,
}: EntityPaginationProps) => {
  return (
    <div className="flex items-center justify-between gap-x-2 w-full">
      <div className="flex-1 text-sm text-muted-foreground">
        {page} of {totalPages || 1}
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button disabled={page === 1 || disabled} variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, page - 1))}>Previous</Button>
        <Button disabled={page === totalPages || disabled} variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages, page + 1))}>Next</Button>


      </div>
    </div>
  )
}
