import { Server, Socket } from 'socket.io';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

// Track online users per workspace
const workspaceUsers = new Map<string, Map<string, { socketId: string; name: string; avatar?: string; cursor?: any }>>();

export function setupPresenceHandlers(io: Server, socket: AuthenticatedSocket) {
  // Join workspace
  socket.on('workspace:join', ({ workspaceId, userName, avatar }) => {
    socket.join(`workspace:${workspaceId}`);

    if (!workspaceUsers.has(workspaceId)) {
      workspaceUsers.set(workspaceId, new Map());
    }

    workspaceUsers.get(workspaceId)!.set(socket.userId!, {
      socketId: socket.id,
      name: userName,
      avatar,
    });

    // Broadcast updated user list
    const users = Array.from(workspaceUsers.get(workspaceId)!.entries()).map(([id, data]) => ({
      id,
      ...data,
    }));

    io.to(`workspace:${workspaceId}`).emit('workspace:users', users);
  });

  // Leave workspace
  socket.on('workspace:leave', ({ workspaceId }) => {
    socket.leave(`workspace:${workspaceId}`);
    workspaceUsers.get(workspaceId)?.delete(socket.userId!);

    const users = Array.from(workspaceUsers.get(workspaceId)?.entries() || []).map(([id, data]) => ({
      id,
      ...data,
    }));

    io.to(`workspace:${workspaceId}`).emit('workspace:users', users);
  });

  // Cursor update
  socket.on('cursor:update', ({ workspaceId, documentId, cursor }) => {
    socket.to(`document:${documentId}`).emit('cursor:updated', {
      userId: socket.userId,
      cursor,
    });
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    workspaceUsers.forEach((users, workspaceId) => {
      if (users.has(socket.userId!)) {
        users.delete(socket.userId!);
        const userList = Array.from(users.entries()).map(([id, data]) => ({ id, ...data }));
        io.to(`workspace:${workspaceId}`).emit('workspace:users', userList);
      }
    });
  });
}
