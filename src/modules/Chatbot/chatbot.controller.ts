import { Body, Controller, Get, Post } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('api/chatbot')
export class ChatbotController {
  constructor(
    private readonly chatbotService: ChatbotService,

    ) {}


  // @Post('ask')
  // ask(@Body() body: { message: string, conversation_id?: string}) {
  //   const { message, conversation_id } = body;
  //   return this.chatbotService.askChatbotNoStreaming(message, conversation_id);
  // }

  // @Post('converstation-content')
  // getConverstationContent(@Body() body: { conversation_id: string}) {
  //   const { conversation_id } = body;
  //   return this.chatbotService.getConverstationContent(conversation_id);
  // }
}