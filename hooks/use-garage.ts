"use client";

import * as React from "react";
import { api } from "@/lib/api-client";
import { errorMessage } from "@/lib/utils";

export type Vehicle = {
  id: string;
  nickname: string;
  vin: string;
  make: string;
  model: string;
  year: number | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export function useGarage(enabled = true) {
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [loading, setLoading] = React.useState(enabled);
  const [error, setError] = React.useState<string | null>(null);

  const fetchVehicles = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Vehicle[]>("/api/garage");
      setVehicles(res);
    } catch (err: unknown) {
      setError(errorMessage(err, "Failed to load vehicles."));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!enabled) return;
    fetchVehicles();
  }, [enabled, fetchVehicles]);

  const addVehicle = async (input: {
    nickname?: string;
    vin?: string;
    make: string;
    model: string;
    year?: number | null;
    is_primary?: boolean;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<Vehicle>("/api/garage", input);
      setVehicles((prev) => [res, ...prev]);
      return res;
    } catch (err: unknown) {
      setError(errorMessage(err, "Failed to add vehicle."));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeVehicle = async (vehicleId: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/api/garage/${vehicleId}`);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
    } catch (err: unknown) {
      setError(errorMessage(err, "Failed to remove vehicle."));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { vehicles, loading, error, addVehicle, removeVehicle, refetch: fetchVehicles };
}
