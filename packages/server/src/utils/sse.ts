import { Response } from 'express';

const clients = new Map<number, Set<Response>>();

export function addSSEClient(userId: number, res: Response) {
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  clients.get(userId)!.add(res);

  res.on('close', () => {
    const userClients = clients.get(userId);
    if (userClients) {
      userClients.delete(res);
      if (userClients.size === 0) {
        clients.delete(userId);
      }
    }
  });
}

export function sendSSEToUser(userId: number, event: string, data: unknown) {
  const userClients = clients.get(userId);
  if (userClients) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of userClients) {
      try {
        client.write(message);
      } catch {
        userClients.delete(client);
      }
    }
  }
}

export function sendSSEToUsers(userIds: number[], event: string, data: unknown) {
  for (const userId of userIds) {
    sendSSEToUser(userId, event, data);
  }
}
