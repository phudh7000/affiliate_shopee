import { Injectable } from '@nestjs/common';
import { GoogleSheetsService } from '../Google/google-sheets.service';
import { PuppeteerService } from '../Puppeteer/puppeteer.service';
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
    private readonly googleSheetsService: GoogleSheetsService,
    private readonly puppeteerService: PuppeteerService,
    private readonly chatbotService: ChatbotService,
  ) {
    setTimeout(() => {
      this.run();
    }, 1000)

    // const rs = getAbsolutePathByFileName('quat_mini')
    // console.log({rs})
  }



  async run() {
    this.fanpages = (await this.googleSheetsService.getFanpage() as IFanpage[]) || [];
    this.groups = (await this.googleSheetsService.getGroups() as IGroup[]) || [];
    this.products = (await this.googleSheetsService.getProducts() as IProduct[]) || [];

    // log('fanpages: ', this.fanpages)
    // log('groups: ', this.groups)
    // log('products: ', this.products)

    const browser = await this.puppeteerService.openChrome();
    const pages = await browser.pages();
    const page = pages[0];
    await page.goto('https://www.facebook.com/');
    await this.sleep(2000);

    for (const product of this.products) {
      if (product.status !== 'pending') continue;
      try {
        log(`==== Step: Bắt đầu đăng ${product.product_name} ====`);
        const list_fanpage_product = product.fanpage?.split(', ') || [];
        const fanpages = this.fanpages.filter(item => list_fanpage_product.includes(item.page_name));

        // console.log({fanpages})
        for (const fanpage of fanpages) {
          let postContent = await this.chatbotService.getAffiliateContent(product.description);
          if (!postContent) {
            log(`==== Failed: Lỗi tạo nội dung cho ${product.product_name} ====`);
            break;
          }
          postContent += ` ${product.link_affiliate}`;

          console.log({ postContent })
          const worker1 = await this.startFanpageWork(page, fanpage, product, postContent);
          return; // Chỉ chạy cho 1 fanpage
        }




        // await this.googleSheetsService.updateProductStatus( +product.product_id, 'success');
        log(`==== Success: Đăng sản phẩm thành công ${product.product_name} ====`);
      } catch (error) {
        log(`==== Failed: Lỗi đăng sản phẩm ${product.product_name} ====`);
        console.log(error);
        // await this.googleSheetsService.updateProductStatus( +product.product_id, 'failed');
      }

      return; // Chỉ chạy cho 1 sản phẩm
    }

    return;

  }

  async startFanpageWork(page: Page, fanpage: IFanpage, product: IProduct, postContent: string) {
    await this.changeCurrentFanpage(page, fanpage.page_name);
    const groupNames = fanpage.group.split(', ');

    for (const groupName of groupNames) {
      const group = this.groups.find(item => item.group_name == groupName);
      if (group?.status != 'active') continue;

      log(`==== Step: Đi đến nhóm ${groupName} ====`);
      await page.goto(group.group_link);
      log(`==== Success: Đã ở nhóm ${groupName} ====`);
      await this.sleep(3000);

      await this.createPostInGroup(page, groupName, product, postContent)
      await this.sleep(3000);

      log('xong roi')

      return; // Chỉ chạy cho 1 group
    }

  }

  async createPostInGroup(page: Page, groupName: string, product: IProduct, postContent: string) {
    try {
      log(`==== Step: Đang tạo bài viết`);
      const el = await page.waitForFunction(() => {
        const element = document.querySelector('div[role="button"] > .xi81zsa.x1lkfr7t.xkjl1po.x1mzt3pk.xh8yej3.x13faqbe');
        if (element?.textContent == 'Bạn viết gì đi...') {
          return element;
        }
        return null;
      }) as ElementHandle<Element>;

      if (el) el.click();
      await this.sleep(1000);

      const element = await page.waitForSelector('div[aria-placeholder="Tạo bài viết công khai..."][role="textbox"]', { visible: true });
      await this.sleep(500);

      if (element) {
        await page.type('div[aria-placeholder="Tạo bài viết công khai..."][role="textbox"]', postContent); // Nội dung

        // const addMediaBtn = await page.waitForSelector('div[aria-label="Ảnh/video"][role="button"]'); // Thêm media
        // if (addMediaBtn) addMediaBtn.click();
        const absolutePath = getAbsolutePathByFileName(toSnakeCase(product.product_name));
        const fileInput = await page.waitForSelector('input[type="file"][multiple]');
        if (fileInput) {
          for (const mediaPath of absolutePath.slice(0, 4)) {
            await this.sleep(1000);
            await fileInput.uploadFile(mediaPath);
          }
        }
        await this.sleep(5000);

        // const submitBtn = await page.waitForSelector('div[aria-label="Đăng"][role="button"]'); // Đăng bài
        // if (submitBtn) submitBtn.click();
        // await this.sleep(1000);

        // log(`==== Step:Đang đăng bài lên nhóm ${groupName} ====`)
        // await page.waitForSelector('div[aria-label="Tạo bài viết"][role="dialog"]', { hidden: true });
        // const dialogExists = await page.evaluate(() => {
        //   return !!document.querySelector('div[aria-label="Tạo bài viết"][role="dialog"]');
        // });

        // if (!dialogExists) log(`==== Success: Đăng bài thành công ====`);
      }
    } catch (error) {
      log(`==== Failed: Lỗi tạo bài viết nhóm ${groupName}`);
      console.log(error)
      return;
    }
  }

  async changeCurrentFanpage(page: Page, fanpage_name: string) {
    try {
      log(`==== Step: Chuyển fanpage ${fanpage_name} ====`);

      let selector = 'div[aria-label="Trang cá nhân của bạn"][role="button"]';
      let el = await page.waitForSelector(selector, { visible: true });
      if (el) await el.click();
      await this.sleep(1000);

      selector = `a[href="/me/"][role="link"]`;
      el = await page.waitForSelector(selector, { visible: true });
      if (!el) {
        log('không tìm thấy page hiện tại')
        return
      };

      const current_fanpage_name = await el.evaluate(node => node.textContent);
      if (fanpage_name != current_fanpage_name) {
        selector = `div[aria-label="Chuyển sang ${fanpage_name}"][role="button"]`;
        el = await page.waitForSelector(selector, { visible: true });

        if (el) await el.click();
        await this.sleep(5000);
      }

      log(`==== Success: Đã ở fanpage ${fanpage_name} ====`);
    } catch (error) {
      log(`==== Failed: Lỗi khi chuyển fanpage ${fanpage_name} ====`);
      console.error(error);
      throw new Error(`==== Failed: Lỗi khi chuyển fanpage ${fanpage_name} ====`);
    }
  }

  async postVideoFB(
    page_id: string,
    title: string,
    description: string,
    file_url: string,
    access_token: string
  ) {
    try {
      if (!page_id || !access_token || !file_url) {
        return "Thiếu thông tin cần thiết";
      }
      // URL Graph API
      const fbUrl = `https://graph.facebook.com/v23.0/${page_id}/videos`;

      // Gọi fetch API để đăng video
      const response = await fetch(fbUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          file_url: file_url, // link video công khai
          title: title || "",
          description: description || "",
          published: true, // true = đăng luôn
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Không thể đăng video");
      }
      return data;
    } catch (error) {
      console.error("Lỗi khi đăng video:", error.message);
      return;
    }
  };

  async commentDao() {
    log('comment daoj')
  }

  async sleep(ms: number) {
    log(`==== Waiting ${Math.round(ms / 1000)}s ====`);
    return new Promise(rs => setTimeout(rs, ms));
  }

}
