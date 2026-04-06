import { useEffect, useState } from "react";
import {
  fetchStaticDatasetInfo,
  isStaticDemoMode,
  type StaticDatasetInfo,
} from "../../lib/staticWorkbench";

export function useStaticDatasetInfo(apiBaseUrl: string) {
  const [info, setInfo] = useState<StaticDatasetInfo | null>(null);

  useEffect(() => {
    let isActive = true;

    if (!isStaticDemoMode(apiBaseUrl)) {
      setInfo(null);
      return;
    }

    fetchStaticDatasetInfo()
      .then((result) => {
        if (isActive) setInfo(result);
      })
      .catch(() => {
        if (isActive) setInfo(null);
      });

    return () => {
      isActive = false;
    };
  }, [apiBaseUrl]);

  return info;
}
