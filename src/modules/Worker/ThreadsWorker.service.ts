import { Injectable } from '@nestjs/common';
// import { GoogleSheetsService } from '../Google/google-sheets.service';
import { IFanpage, IGroup, IProduct } from 'src/type';
import { ChatbotService } from '../Chatbot/chatbot.service';
import { PuppeteerService } from '../Puppeteer/puppeteer.service';
import { log } from 'src/utils/core';
import { InjectModel } from '@nestjs/mongoose';
import { SourceAffiliateLink } from 'src/mongodb/schema/SourceAffiliateLink.schema';
import { Model } from 'mongoose';

@Injectable()
export class ThreadsWorkerService {
  private fanpages: IFanpage[] = [];
  private groups: IGroup[] = [];
  private products: IProduct[] = [];

  constructor(
    // private readonly googleSheetsService: GoogleSheetsService,
    private readonly puppeteerService: PuppeteerService,
    private readonly chatbotService: ChatbotService,
    @InjectModel(SourceAffiliateLink.name) private sourceAffiliateLinkModel: Model<SourceAffiliateLink>,
  ) {
    // setTimeout(() => {
    //   this.run();
    // }, 1000)

    // setTimeout(() => {
    //   console.log('chay vao day')
    //   this.uploadToThreads();
    // }, 1000)


  }



  async uploadToThreads() {
    const aff_list = await this.sourceAffiliateLinkModel.find({PostID: '122204256386558271'}).limit(10)
    console.log({ aff_list })
    const call_to_action = "Link sản phẩm em để dưới phần bình luận nha."

    for (const aff_item of aff_list) {
      if (!aff_item.ProductName) {
        console.log('Không có tên sản phẩm để đăng')
        continue;
      }
      if (!aff_item.my_new_link) {
        console.log('Không có link liên kết sản phẩm để đăng')
        continue;
      }
      if (!aff_item.MediaPath) {
        console.log('Không có video/hình ảnh sản phẩm để đăng')
        continue;
      }

      const browser = await this.puppeteerService.openChrome();
      const pages = await browser.pages();
      const page = pages[0];
      await page.goto('https://www.threads.com/');

      const textFieldBtn = await page.waitForSelector('div[role="button"][aria-label="Empty text field. Type to compose a new post."]');
      if (textFieldBtn) await textFieldBtn.click();

      const textBox = await page.waitForSelector(`div[role="textbox"][aria-placeholder="What's new?"][contenteditable="true"]`);
      await this.sleep(500);

      if (textBox) {
        const content = aff_item.ProductName + '\n' + call_to_action;
        await page.type(`div[role="textbox"][aria-placeholder="What's new?"][contenteditable="true"]`, content); // Nội dung
      }

      const fileInput = await page.waitForSelector('input[type="file"][multiple]');
      if (fileInput) {
        await this.sleep(1000);
        await fileInput.uploadFile(aff_item.MediaPath);
        await this.sleep(2000);
        const postSubmitBtn = await page.waitForSelector('div[role="dialog"] div[role="button"][tabindex="0"]');
        if (postSubmitBtn) await postSubmitBtn.click();
      }

      return;
    }
  }

  async sleep(ms: number) {
    log(`==== Waiting ${Math.round(ms / 1000)}s ====`);
    return new Promise(rs => setTimeout(rs, ms));
  }
}
