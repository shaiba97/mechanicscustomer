"use client";

import * as React from "react";
import { api } from "@/lib/api-client";
import type { LocalizedValue } from "@/lib/localized";
import { errorMessage } from "@/lib/utils";

export type Part = {
  id: string;
  sku: string;
  name: LocalizedValue;
  brandId: string;
  brandName: LocalizedValue;
  categoryId: string;
  categoryName: LocalizedValue;
  storeId: string;
  storeName: string | null;
  priceSar: number;
  stockQty: number;
  condition: string;
  imageUrl: string;
  isActive: boolean;
  compatibilityVins: string[];
};

export type PartsSearchResult = {
  results: Part[];
  count: number;
};

export function useParts() {
  const [parts, setParts] = React.useState<Part[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const search = React.useCallback(async (params: {
    vin?: string;
    make?: string;
    model?: string;
    year?: string;
    categoryId?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (params.vin) query.set("vin", params.vin);
      if (params.make) query.set("make", params.make);
      if (params.model) query.set("model", params.model);
      if (params.year) query.set("year", params.year);
      if (params.categoryId) query.set("categoryId", params.categoryId);

      const res = await api.get<PartsSearchResult>(`/api/parts/search?${query.toString()}`);
      setParts(res.results);
      setCount(res.count);
    } catch (err: unknown) {
      setError(errorMessage(err, "Failed to search parts."));
      setParts([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchByVIN = React.useCallback((vin: string) => {
    return search({ vin });
  }, [search]);

  const searchByFitment = React.useCallback(async (make: string, model: string, year: string, categoryId?: string) => {
    return search({ make, model, year, categoryId });
  }, [search]);

  return { parts, count, loading, error, search, searchByVIN, searchByFitment };
}

export function usePart(partId: string | null | undefined) {
  const [part, setPart] = React.useState<Part | null>(null);
  const [parts, setParts] = React.useState<Part[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!partId) {
      setLoading(false);
      setPart(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      api.get<Part>(`/api/parts/${partId}`),
      api
        .get<PartsSearchResult>("/api/parts/search")
        .catch(() => ({ results: [], count: 0 })),
    ])
      .then(([partData, res]) => {
        if (cancelled) return;
        setPart(partData);
        setParts(res.results);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(errorMessage(err, "Failed to load part."));
        setPart(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [partId]);

  return { part, parts, loading, error };
}
