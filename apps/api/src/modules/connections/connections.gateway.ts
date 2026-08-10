import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConnectionsService } from './connections.service';
import { UseGuards } from '@nestjs/common';
// Depending on auth, you might need a WebSocket specific guard or just pass the token.
// For now, we'll keep it simple and assume the client sends the userId in handshake auth.

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/connections',
})
export class ConnectionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map to store connected users: userId -> socketId
  private connectedUsers = new Map<string, string>();

  constructor(private readonly connectionsService: ConnectionsService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId;
    if (userId) {
      this.connectedUsers.set(userId, client.id);
      client.data.userId = userId;
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.connectedUsers.delete(client.data.userId);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { matchId: string; receiverId: string; content: string },
  ) {
    const senderId = client.data.userId;
    if (!senderId) return;

    try {
      // Save to DB
      const message = await this.connectionsService.sendMessage(
        payload.matchId,
        { content: payload.content },
        senderId,
      );

      // If receiver is connected, emit the message to them
      const receiverSocketId = this.connectedUsers.get(payload.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('newMessage', message);
      }

      // Send back to sender for confirmation
      client.emit('newMessage', message);
    } catch (error: any) {
      if (error?.status === 400 || error?.message?.includes("inappropriate")) {
        client.emit('error', { message: 'Inappropriate content detected. Please remove offensive words.' });
      } else {
        client.emit('error', { message: 'Failed to send message.' });
      }
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { matchId: string; receiverId: string },
  ) {
    const receiverSocketId = this.connectedUsers.get(payload.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('typing', { matchId: payload.matchId, senderId: client.data.userId });
    }
  }
}
