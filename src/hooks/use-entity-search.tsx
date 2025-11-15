import { useEffect, useState } from 'react';
import { PAGINATION } from '@/config/constants';

interface useEntitySearchProps<T extends { search: string; page: number }> {


  params: T;
  setParams: (params: T) => void;
  debounceMs?: number;

}

export function useEntitySearch<T extends { search: string; page: number }>({ params, setParams, debounceMs }: useEntitySearchProps<T>) {
  const [localSearch, setLocalSearch] = useState(params.search);

  useEffect(() => {
    if (localSearch === "" && params.search !== "") {
      setParams({
        ...params,
        page: PAGINATION.DEFAULT_PAGE,
        search: ""
      });
      return;
    }
    const timer = setTimeout(() => {
      if (localSearch !== params.search) {
        setParams({
          ...params,
          page: PAGINATION.DEFAULT_PAGE,
          search: localSearch
        })
      }
    }, debounceMs);
    return () => {
      clearTimeout(timer);
    }

  }, [localSearch, params, debounceMs])

  useEffect(() => {
    setLocalSearch(params.search);
  }, [params.search]);
  return {
    searchValue: localSearch,
    setSearchValue: setLocalSearch
  }
};

