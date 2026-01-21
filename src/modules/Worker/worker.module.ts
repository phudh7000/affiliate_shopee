import { Module } from '@nestjs/common';
import { WorkerService } from './worker.service';
import { GoogleSheetsModule } from '../Google/google-sheets.module';
import { PuppeteerModule } from '../Puppeteer/puppeteer.module';
import { ChatbotModule } from '../Chatbot/chatbot.module';
import { ThreadsWorkerService } from './ThreadsWorker.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SourceAffiliateLink, SourceAffiliateLinkSchema } from 'src/mongodb/schema/SourceAffiliateLink.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SourceAffiliateLink.name, schema: SourceAffiliateLinkSchema }
    ]),
    GoogleSheetsModule, PuppeteerModule, ChatbotModule],
  providers: [WorkerService, ThreadsWorkerService],
  exports: [WorkerService],
})
export class WorkerrModule { }
