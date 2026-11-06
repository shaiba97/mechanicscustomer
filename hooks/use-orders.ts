"use client";

import * as React from "react";
import { api } from "@/lib/api-client";
import { errorMessage } from "@/lib/utils";

export type Order = {
  id: string;
  store_name: string;
  status: string;
  payment_status: string;
  total_sar: number;
  delivery_fee_sar: number;
  grand_total_sar: number;
  city: string;
  street: string;
  payment_method: string;
  handover_otp: string;
  created_at: string;
  updated_at: string;
  items: Array<{
    id: string;
    inventory_item_id: string;
    part_number: string;
    part_name: string;
    quantity: number;
    unit_price_sar: number;
    line_total_sar: number;
  }>;
};

export type CheckoutResult = {
  orderId: string;
  clientSecret?: string;
  paymentUrl?: string;
  totalSar?: number;
  grandTotalSar?: number;
  deliveryFeeSar?: number;
  paymentMethod?: "moyasar" | "cod";
};

export function useOrders(enabled = true) {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(enabled);
  const [error, setError] = React.useState<string | null>(null);

  const fetchOrders = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Order[]>("/api/orders");
      setOrders(res);
    } catch (err: unknown) {
      setError(errorMessage(err, "Failed to load orders."));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!enabled) return;
    fetchOrders();
  }, [enabled, fetchOrders]);

  const checkout = async (input: {
    items: Array<{ inventory_item_id: string; quantity: number }>;
    store_id: string;
    vehicle_id?: string | null;
    city: string;
    street: string;
    payment_method: "moyasar" | "cod";
  }): Promise<CheckoutResult> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<CheckoutResult>("/api/orders/checkout", input);
      return res;
    } catch (err: unknown) {
      setError(errorMessage(err, "Checkout failed."));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchOrder = React.useCallback(async (orderId: string): Promise<Order> => {
    const res = await api.get<Order>(`/api/orders/${orderId}`);
    return res;
  }, []);

  return { orders, loading, error, checkout, fetchOrder, refetch: fetchOrders };
}
