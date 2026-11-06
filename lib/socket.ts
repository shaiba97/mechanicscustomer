const WS_URL = (process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:8000").replace(
  /\/+$/,
  "");

export type OrderStatusEvent = {
  type: "order:status";
  orderId: string;
  status: string;
  handoverOtp?: string;
};

export type OrderSocket = {
  close: () => void;
  readyState: number;
};

export function connectOrderSocket(
  orderId: string,
  token: string,
  onEvent: (event: OrderStatusEvent) => void,
): OrderSocket {
  const url = `${WS_URL}/ws/customer/orders/${orderId}/?token=${encodeURIComponent(
    token,
  )}`;
  let ws: WebSocket | null = null;
  let manualClose = false;
  let attempts = 0;
  const MAX_ATTEMPTS = 5;

  const open = () => {
    if (manualClose) return;
    ws = new WebSocket(url);
    ws.onopen = () => {
      attempts = 0;
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as OrderStatusEvent;
        if (data.type === "order:status") onEvent(data);
      } catch {
        // Ignore malformed frames.
      }
    };
    ws.onclose = () => {
      ws = null;
      if (manualClose) return;
      if (attempts < MAX_ATTEMPTS) {
        attempts += 1;
        setTimeout(open, 1000 * attempts);
      }
    };
    ws.onerror = () => {
      ws?.close();
    };
  };

  open();

  return {
    close: () => {
      manualClose = true;
      ws?.close();
      ws = null;
    },
    get readyState() {
      return ws?.readyState ?? WebSocket.CLOSED;
    },
  };
}
