import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from "openai";


export type OpenAIClient = OpenAI;

export const openaiProvider: Provider = {
  useFactory: (configService: ConfigService) => {

    return new OpenAI({
      apiKey: configService.get('OPENAI_API_KEY'),
    });
  },
  provide: "OPENAI",
  inject: [ConfigService],
};

