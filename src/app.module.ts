import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from './modules/Product/product.module';
import { ChatbotModule } from './modules/Chatbot/chatbot.module';
import { WorkerrModule } from './modules/Worker/worker.module';
import { CrawldataModule } from './modules/Crawldata/crawldata.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {

        console.log('connect mongoodb')

        return ({
          uri: configService.get<string>('MONGODB_URI'),
        })
      },
      inject: [ConfigService],
    }),
    // ProductModule,
    // ChatbotModule,
    CrawldataModule,
    // WorkerrModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
