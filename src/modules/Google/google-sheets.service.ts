import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as path from 'path';
import { IFanpage, IGroup, IProduct, ProductStatus } from 'src/type';

@Injectable()
export class GoogleSheetsService {
  private client;
  private sheets;

  // constructor() {
  //   this.init();
  // }

  async init() {
    // console.log(__dirname, '..', 'credentials.json')
    // return
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../..','credentials.json'), // chỉnh path nếu cần
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.client = await auth.getClient();
    this.sheets = google.sheets({ version: 'v4', auth: this.client });
    console.log('googlesheet init')

    // this.read('Fanpage!A1:E300')
    // const rs = await this.getFanpage('Phụ kiện xe hơi')
    // const rs = await this.getProducts()
    // const rs = await this.getGroups('nhóm test code')
    // console.log('rs: ', rs)
  }

  private spreadsheetId = '1MjOmaSlGBiYc-77LhpbZp9xRGK6QSGnzP6o_QB4GGPg';
  private convertTableToObject<T>(data: string[][]) : T[] {
    const results: any = [];
    for(let i = 1; i < data.length ; i++) {
      const dataItem = {};
      for (let j = 0; j < data[0].length ; j++) {
        dataItem[data[0][j]] = data[i][j];
      }
      results.push(dataItem);
    }

    return results;
  }

  async getFanpage(page_name?: string) {
    const rawData = await this.read('Fanpage!A1:J300');
    let convertData = this.convertTableToObject<IFanpage>(rawData);
    convertData = convertData.filter(item => item.status == 'live');

    if (!page_name) {
      return convertData;
    }
    return convertData.find(item => item.page_name == page_name);
  }

  async getProducts(product_name?: string) {
    const rawData = await this.read('Sản phẩm!A1:J300');
    let convertData = this.convertTableToObject<IProduct>(rawData);

    if (!product_name) {
      return convertData;
    }

    return convertData.find(item => (item.product_name == product_name));
  }

  async updateProductStatus(productId: number, status: ProductStatus) {
    const range = `Sản phẩm!H${productId+1}`;
    const values = [[status]];
    await this.write(range, values);
  }

  async getGroups(group_name?: string) {
    const rawData = await this.read('Nhóm đăng!A1:J300');
    let convertData = this.convertTableToObject<IGroup>(rawData);

    if (!group_name) {
      return convertData;
    }

    return convertData.find(item => (item.group_name == group_name));
  }


  async read(range: string) {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range,
    });

    return res.data.values;
  }

  async write(range: string, values: any[]) {
    const res = await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });

    return res.data;
  }

  async append(spreadsheetId: string, range: string, values: any[]) {
    const res = await this.sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    });

    return res.data;
  }
}
