import { Module } from '@nestjs/common';
import { GoogleSheetsModule } from '../Google/google-sheets.module';
import { PuppeteerModule } from '../Puppeteer/puppeteer.module';
import { ChatbotModule } from '../Chatbot/chatbot.module';
import { CrawldataService } from './crawldata.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from 'src/mongodb/schema/Post.schema';
import { SourceAffiliateLink, SourceAffiliateLinkSchema } from 'src/mongodb/schema/SourceAffiliateLink.schema';

@Module({
    imports: [MongooseModule.forFeature([
        { name: Post.name, schema: PostSchema },
        { name: SourceAffiliateLink.name, schema: SourceAffiliateLinkSchema }
    ]),
        GoogleSheetsModule, PuppeteerModule, ChatbotModule],
    providers: [CrawldataService],
    exports: [CrawldataService],
})
export class CrawldataModule { }
