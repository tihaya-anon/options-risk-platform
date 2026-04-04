import { useEffect, useState } from "react";
import type { OptionSnapshotFile } from "../../types";

function loadSnapshot(): Promise<OptionSnapshotFile> {
  return fetch("./data/latest.json", { cache: "no-store" }).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to load option snapshot: ${response.status}`);
    }
    return response.json() as Promise<OptionSnapshotFile>;
  });
}

export function useSnapshot() {
  const [snapshot, setSnapshot] = useState<OptionSnapshotFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    loadSnapshot()
      .then((data) => {
        if (isActive) setSnapshot(data);
      })
      .catch((err: unknown) => {
        if (isActive) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return { snapshot, error };
}
