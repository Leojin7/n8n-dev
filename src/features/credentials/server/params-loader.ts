import { parseAsInteger, parseAsString } from "nuqs/server";
import { PAGINATION } from "@/config/constants";

export const getCredentialsParams = (searchParams: { [key: string]: string | string[] | undefined }) => {
  const pageParser = parseAsInteger.withDefault(PAGINATION.DEFAULT_PAGE);
  const pageSizeParser = parseAsInteger.withDefault(PAGINATION.DEFAULT_PAGE_SIZE);
  const searchParser = parseAsString.withDefault('');

  return {
    page: searchParams.page ? pageParser.parseServerSide(searchParams.page) : PAGINATION.DEFAULT_PAGE,
    pageSize: searchParams.pageSize ? pageSizeParser.parseServerSide(searchParams.pageSize) : PAGINATION.DEFAULT_PAGE_SIZE,
    search: searchParams.search ? searchParser.parseServerSide(searchParams.search) : '',
  };
};
