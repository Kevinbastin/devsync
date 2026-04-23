import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

// Debounce saves per document
const saveTimers = new Map<string, NodeJS.Timeout>();

export function setupDocumentHandlers(io: Server, socket: AuthenticatedSocket) {
  // Join a document room
  socket.on('document:join', ({ documentId }) => {
    socket.join(`document:${documentId}`);
    socket.to(`document:${documentId}`).emit('document:user-joined', {
      userId: socket.userId,
    });
  });

  // Leave a document room
  socket.on('document:leave', ({ documentId }) => {
    socket.leave(`document:${documentId}`);
    socket.to(`document:${documentId}`).emit('document:user-left', {
      userId: socket.userId,
    });
  });

  // Content update — broadcast to others and debounce save
  socket.on('document:update', ({ documentId, content, title }) => {
    // Broadcast to others in the room
    socket.to(`document:${documentId}`).emit('document:updated', {
      content,
      title,
      userId: socket.userId,
    });

    // Debounced save to DB (save after 2 seconds of inactivity)
    if (saveTimers.has(documentId)) {
      clearTimeout(saveTimers.get(documentId)!);
    }

    saveTimers.set(
      documentId,
      setTimeout(async () => {
        try {
          await prisma.document.update({
            where: { id: documentId },
            data: {
              ...(content !== undefined && { content }),
              ...(title !== undefined && { title }),
            },
          });
          saveTimers.delete(documentId);
        } catch (error) {
          console.error(`[Socket] Failed to save document ${documentId}:`, error);
        }
      }, 2000)
    );
  });

  // Title update
  socket.on('document:title-update', ({ documentId, title }) => {
    socket.to(`document:${documentId}`).emit('document:title-updated', {
      title,
      userId: socket.userId,
    });
  });
}
