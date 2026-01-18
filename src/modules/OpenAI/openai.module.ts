import { Global, Module } from '@nestjs/common';
import { openaiProvider } from './openai.provider';

@Global()
@Module({
  providers: [openaiProvider],
  exports: [openaiProvider],
})
export class OpenAIModule {}