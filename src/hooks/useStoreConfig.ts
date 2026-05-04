"use client";

import { useEffect, useState } from "react";
import type { store_config } from "@prisma/client";

export function useStoreConfig() {
  const [config, setConfig] = useState<store_config | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => setConfig(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { config, loading };
}
