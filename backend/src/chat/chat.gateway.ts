import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from '../messages/messages.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly messagesService: MessagesService) {}

  @SubscribeMessage('joinChat')
  handleJoin(@MessageBody() chatId: string, @ConnectedSocket() client: Socket) {
    client.join(chatId);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() body: { chatId: string; senderId: string; content: string },
  ) {
    const message = await this.messagesService.send(
      body.chatId,
      body.senderId,
      body.content,
    );
    this.server.to(body.chatId).emit('newMessage', message);
  }
}
