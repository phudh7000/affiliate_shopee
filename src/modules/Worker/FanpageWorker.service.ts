import { Injectable } from '@nestjs/common';
// import { GoogleSheetsService } from '../Google/google-sheets.service';
// import { PuppeteerService } from '../Puppeteer/puppeteer.service';
import { ElementHandle, Page } from 'puppeteer-core';
import { IFanpage, IGroup, IProduct } from 'src/type';
import { getAbsolutePathByFileName, log, toSnakeCase } from 'src/utils';
import { ChatbotService } from '../Chatbot/chatbot.service';

@Injectable()
export class WorkerService {
  private fanpages: IFanpage[] = [];
  private groups: IGroup[] = [];
  private products: IProduct[] = [];

  constructor(
    // private readonly googleSheetsService: GoogleSheetsService,
    // private readonly puppeteerService: PuppeteerService,
    private readonly chatbotService: ChatbotService,
  ) {
    // setTimeout(() => {
    //   this.run();
    // }, 1000)

    // const rs = getAbsolutePathByFileName('quat_mini')
    // console.log({rs})
  }



  async run() {
   

  }
}
