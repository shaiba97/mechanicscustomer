"use client";

import * as React from "react";
import { api } from "@/lib/api-client";
import { errorMessage } from "@/lib/utils";
import type { LocalizedValue } from "@/lib/localized";

export type Brand = {
  id: string;
  code: string;
  name: LocalizedValue;
  logoUrl: string;
  active: boolean;
};

export type Car = {
  id: string;
  model: LocalizedValue;
  year: number;
  brandId: string;
  active: boolean;
};

export type Category = {
  id: string;
  name: LocalizedValue;
  active: boolean;
};

type ListResponse<T> = T[] | { results: T[] };

function unwrapList<T>(value: ListResponse<T>): T[] {
  return Array.isArray(value) ? value : value.results ?? [];
}

export function useCatalogMeta() {
  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [cars, setCars] = React.useState<Car[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    Promise.all([
      api.get<ListResponse<Brand>>("/api/brands/"),
      api.get<ListResponse<Car>>("/api/cars/"),
      api.get<ListResponse<Category>>("/api/categories/"),
    ])
      .then(([brandData, carData, categoryData]) => {
        if (cancelled) return;
        setBrands(unwrapList(brandData).filter((brand) => brand.active !== false));
        setCars(unwrapList(carData).filter((car) => car.active !== false));
        setCategories(
          unwrapList(categoryData).filter((category) => category.active !== false),
        );
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(errorMessage(err, "Failed to load catalog metadata."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { brands, cars, categories, loading, error };
}
