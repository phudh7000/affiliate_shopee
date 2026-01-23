import { Injectable } from '@nestjs/common';
import { GoogleSheetsService } from '../Google/google-sheets.service';
import { PuppeteerService } from '../Puppeteer/puppeteer.service';
import { ElementHandle, Page } from 'puppeteer-core';
import { IFanpage, IGroup, IProduct } from 'src/type';
import { convertToXlsx, getAbsolutePathByFileName, log, searchFilesInFolder, toSnakeCase } from 'src/utils';
import { ChatbotService } from '../Chatbot/chatbot.service';
import { DriveService } from '../Drive/drive.service';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from 'src/mongodb/schema/Post.schema';
import { Model } from 'mongoose';
import { SourceAffiliateLink } from 'src/mongodb/schema/SourceAffiliateLink.schema';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CrawldataService {
    private fanpages: IFanpage[] = [];
    private groups: IGroup[] = [];
    private products: IProduct[] = [];

    constructor(
        private readonly configService: ConfigService,
        private readonly googleSheetsService: GoogleSheetsService,
        private readonly driveService: DriveService,
        private readonly puppeteerService: PuppeteerService,
        private readonly chatbotService: ChatbotService,

        @InjectModel(Post.name) private postModel: Model<Post>,
        @InjectModel(SourceAffiliateLink.name) private sourceAffiliateLinkModel: Model<SourceAffiliateLink>,
    ) {
        // setTimeout(() => {
        //     this.run();
        // }, 1000)

        // setTimeout(() => {
        //     this.saveNewLink();
        // }, 1000)

        // setTimeout(() => {
        //     this.updateProductNameByNewLink();
        // }, 1000)

        // setTimeout(() => {
        //     this.updateMediaPath();
        // }, 1000)

    }

    async run() {
        const posts = await this.postModel.find().lean();

        const sourceAffiliateLinkArray: SourceAffiliateLink[] = [];
        for (const post of posts) {
            const author = post.Author;
            const comments = post.Comments;

            // 1. Lấy comment của shop
            const shopComment = comments
                .split('\n')
                .find(line => line.startsWith(author + ':'));

            // 2. Lấy link Shopee
            const shopeeRegex = /https:\/\/s\.shopee\.vn\/\S+/g;
            const shopeeLink = shopComment?.match(shopeeRegex)?.[0] || null;

            if (shopeeLink == null) {
                console.log('Không thể lấy aff link từ comments: ', post.Url)
                continue;
            }

            sourceAffiliateLinkArray.push({
                PostID: post.PostID,
                Author: post.Author,
                SourceUrl: post.Url,
                source_link: shopeeLink,
                Sub_id1: toSnakeCase(author).replaceAll('_', ''),
                Sub_id2: '',
                Sub_id3: '',
                Sub_id4: '',
                Sub_id5: '',
                status: false
            })
        }

        try {
            const done = await this.sourceAffiliateLinkModel.insertMany(sourceAffiliateLinkArray);
            console.log('Đã thêm thành công: ', done.length)

            const data = sourceAffiliateLinkArray.map(u => ({
                "Liên kết gốc": u.source_link,
                Sub_id1: u.Sub_id1,
                Sub_id2: u.Sub_id2,
                Sub_id3: u.Sub_id3,
                Sub_id4: u.Sub_id4,
                Sub_id5: u.Sub_id5,
            }))

            convertToXlsx(data, 'source_affiliate_link.xlsx');
        } catch (error) {
            console.error(error)
        }
    }

    async exportAffiliateWithoutNewlinkToXlsxFile() { // Hàm này lấy danh sách affiliate item chưa có my_new_link

        // const data = sourceAffiliateLinkArray.map(u => ({
        //         "Liên kết gốc": u.source_link,
        //         Sub_id1: u.Sub_id1,
        //         Sub_id2: u.Sub_id2,
        //         Sub_id3: u.Sub_id3,
        //         Sub_id4: u.Sub_id4,
        //         Sub_id5: u.Sub_id5,
        //     }))
        //     convertToXlsx(data, 'source_affiliate_link.xlsx');
    }


    async saveNewLink() { // Hàm này cập nhật link affiliate mới từ file dựa theo link cũ
        fs.createReadStream("AffiliateBatchCustomLinks.csv")
            .pipe(csv({
                mapHeaders: ({ header }) =>
                    header
                        .replace(/^\uFEFF/, '')
                        .trim()
                        .normalize("NFC")
            }))
            .on("data", async (row) => {
                try {
                    console.log(`'Liên kết gốc: ${row['Liên kết gốc']} --> Liên kết chuyển đổi: ${row['Liên kết chuyển đổi']}`)
                    // console.log(row['\ufeffLiên kết gốc'])
                    if (row['Liên kết gốc'] && row['Liên kết chuyển đổi']) {
                        await this.sourceAffiliateLinkModel.updateOne({
                            source_link: row['Liên kết gốc']
                        }, {
                            my_new_link: row['Liên kết chuyển đổi']
                        });
                    }
                } catch (e) {
                    console.error(e);
                }
            });
    }


    async updateProductNameByNewLink() { // Hàm này để update tên sản phẩm
        const withoutNameList = await this.sourceAffiliateLinkModel.find({ ProductName: null }).limit(100);
        console.log(withoutNameList)
        if (withoutNameList.length == 0) {
            return;
        }

        const browser = await this.puppeteerService.openChrome();
        const pages = await browser.pages();
        const page = pages[0];
        for (const item of withoutNameList) {
            if (item.my_new_link) {
                await page.goto(item.source_link);

                await page.waitForSelector('div.container[role="main"] section section h1');

                const title = await page.$eval(
                    'div.container[role="main"] section section h1',
                    el => el.textContent.trim()
                );

                console.log("title:", title);
                if (title) {
                    try {
                        item.ProductName = title;
                        console.log(item.my_new_link, ' --> ', title);
                        await item.save();
                    } catch (error) {
                        console.error('Faild to fetch product name: ', item.my_new_link, error)
                    }
                    await this.sleep(4000);
                }
            }
        }
    }


    async updateMediaPath() { // Hàm này cập nhật đường dẫn media local cho sản phẩm
        const affiliate_list = await this.sourceAffiliateLinkModel.find({ MediaPath: null }).limit(100);
        if (affiliate_list.length == 0) {
            return;
        }

        const MEDIA_FOLDER_PATH = this.configService.get('MEDIA_FOLDER_PATH');

        for (const item of affiliate_list) {
            if (!item.SourceUrl) {
                console.error(`[SourceUrl not found] Không thể lấy media cho ${item.SourceUrl} - ${item.ProductName}`)
                continue;
            }
            const url = item.SourceUrl;
            // const id = url.match(/\d+/)[0];
            const match = url.match(/reel\/(\d+)/);
            const id = match ? match[1] : null;

            if (!id) {
                console.error(`[ID not found] Không thể lấy media cho ${item.SourceUrl} - ${item.ProductName}`)
                continue;
            }

            const folderPath = MEDIA_FOLDER_PATH + item.Author;
            const mediaPath = searchFilesInFolder(folderPath, id)
            if (mediaPath) {
                item.MediaPath = mediaPath;

                const file_info = await this.driveService.uploadFile(mediaPath, "1xElKN_uhzxFBlkeFOGPv_Gw7cZwfoKf_");
                console.log("file_info: ", file_info);
                const { id, name } = file_info;
                item.url_link = `https://drive.google.com/uc?id=${id}&export=download`;
                await item.save();
                console.log({ mediaPath })
            } else {
                console.log(`[File not found] Không thể lấy media cho ${item.SourceUrl} - ${item.ProductName}`)
            }
        }
    }



    async sleep(ms: number) {
        log(`==== Waiting ${Math.round(ms / 1000)}s ====`);
        return new Promise(rs => setTimeout(rs, ms));
    }

}
