import { useEffect } from 'react';

const refreshers = new Set<() => Promise<void>>();

/** Refresh only the chart sections that are currently mounted. */
export function refreshMountedSections(): Promise<void> {
  return Promise.all([...refreshers].map((refresh) => refresh())).then(() => undefined);
}

export function useRegisterSectionRefresh(refresh: () => Promise<void>) {
  useEffect(() => {
    refreshers.add(refresh);
    return () => {
      refreshers.delete(refresh);
    };
  }, [refresh]);
}
