import { Module } from '@nestjs/common';
import { WorkerService } from './worker.service';
import { GoogleSheetsModule } from '../Google/google-sheets.module';
import { PuppeteerModule } from '../Puppeteer/puppeteer.module';
import { ChatbotModule } from '../Chatbot/chatbot.module';

@Module({
  imports: [GoogleSheetsModule, PuppeteerModule, ChatbotModule],
  providers: [WorkerService],
  exports: [WorkerService],
})
export class WorkerrModule {}
