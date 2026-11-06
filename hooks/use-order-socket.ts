"use client";

import * as React from "react";

import { connectOrderSocket, type OrderStatusEvent } from "@/lib/socket";
import { getToken } from "@/lib/api-client";

export function useOrderSocket(
  orderId: string | undefined,
  onEvent: (event: OrderStatusEvent) => void,
) {
  const handler = React.useRef(onEvent);
  handler.current = onEvent;

  React.useEffect(() => {
    if (!orderId) return;
    const token = typeof window !== "undefined" ? getToken() : null;
    if (!token) return;

    const socket = connectOrderSocket(orderId, token, (event) => {
      handler.current(event);
    });

    return () => {
      socket.close();
    };
  }, [orderId]);
}
