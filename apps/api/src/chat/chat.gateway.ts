import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { webOrigins } from '../lib/constants';

function tokenFromHandshake(client: Socket) {
  const fromAuth = client.handshake.auth?.token;
  if (typeof fromAuth === 'string' && fromAuth) return fromAuth;

  const header = client.handshake.headers.authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.slice(7);
  }

  const cookie = client.handshake.headers.cookie;
  if (typeof cookie === 'string') {
    const match = cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
    if (match?.[1]) return decodeURIComponent(match[1]);
  }

  return undefined;
}

@WebSocketGateway({
  cors: {
    origin: webOrigins(),
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly chat: ChatService,
  ) {}

  emitToConversation(conversationId: string, event: string, payload: unknown) {
    this.server?.to(conversationId).emit(event, payload);
  }

  emitToUser(userId: string, event: string, payload: unknown) {
    this.server?.to(`user:${userId}`).emit(event, payload);
  }

  async handleConnection(client: Socket) {
    try {
      const token = tokenFromHandshake(client);
      if (!token) {
        this.logger.warn('Socket rejected: missing token');
        client.disconnect();
        return;
      }
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      client.data.userId = payload.sub;
      await client.join(`user:${payload.sub}`);
    } catch (error) {
      this.logger.warn(`Socket rejected: ${error instanceof Error ? error.message : 'invalid token'}`);
      client.disconnect();
    }
  }

  @SubscribeMessage('join')
  async join(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    await this.chat.requireParticipant(client.data.userId, data.conversationId);
    await client.join(data.conversationId);
    return { ok: true };
  }

  @SubscribeMessage('message')
  async message(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; body: string },
  ) {
    const { message, otherUserId } = await this.chat.send(client.data.userId, data.conversationId, data.body);
    this.server.to(data.conversationId).emit('message', message);
    this.emitToUser(otherUserId, 'inbox', { conversationId: data.conversationId, message });
    return message;
  }

}
