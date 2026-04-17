import { ServerResponse } from "node:http";

type NotificationType =
  | "NEW_ORDER_FOR_SELLER"
  | "ORDER_ITEM_STATUS_UPDATED"
  | "ORDER_STATUS_UPDATED";

interface NotificationPayload {
  type: NotificationType;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

const clients = new Map<string, Set<ServerResponse>>();

const addClient = (email: string, response: ServerResponse) => {
  const existing = clients.get(email);

  if (existing) {
    existing.add(response);
  } else {
    clients.set(email, new Set([response]));
  }
};

const removeClient = (email: string, response: ServerResponse) => {
  const existing = clients.get(email);
  if (!existing) return;

  existing.delete(response);
  if (existing.size === 0) {
    clients.delete(email);
  }
};

const writeSseEvent = (
  response: ServerResponse,
  eventName: string,
  payload: NotificationPayload,
) => {
  if (response.writableEnded || response.destroyed) return;
  response.write(`event: ${eventName}\n`);
  response.write(`data: ${JSON.stringify(payload)}\n\n`);
};

const notifyUser = (
  email: string,
  payload: Omit<NotificationPayload, "timestamp">,
) => {
  const existing = clients.get(email);
  if (!existing || existing.size === 0) return;

  const eventPayload: NotificationPayload = {
    ...payload,
    timestamp: new Date().toISOString(),
  };

  existing.forEach((client) =>
    writeSseEvent(client, "notification", eventPayload),
  );
};

const notifyUsers = (
  emails: string[],
  payload: Omit<NotificationPayload, "timestamp">,
) => {
  const uniqueEmails = Array.from(new Set(emails));
  uniqueEmails.forEach((email) => notifyUser(email, payload));
};

export { addClient, notifyUser, notifyUsers, removeClient };
export type { NotificationPayload, NotificationType };
