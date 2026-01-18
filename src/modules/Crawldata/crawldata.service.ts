import { Injectable } from '@nestjs/common';
import { GoogleSheetsService } from '../Google/google-sheets.service';
import { PuppeteerService } from '../Puppeteer/puppeteer.service';
import { ElementHandle, Page } from 'puppeteer-core';
import { IFanpage, IGroup, IProduct } from 'src/type';
import { convertToXlsx, getAbsolutePathByFileName, log, toSnakeCase } from 'src/utils';
import { ChatbotService } from '../Chatbot/chatbot.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from 'src/mongodb/schema/Post.schema';
import { SourceAffiliateLink } from 'src/mongodb/schema/SourceAffiliateLink.schema';
import * as fs from 'fs';
import * as csv from 'csv-parser';

@Injectable()
export class CrawldataService {
    private fanpages: IFanpage[] = [];
    private groups: IGroup[] = [];
    private products: IProduct[] = [];

    constructor(
        private readonly googleSheetsService: GoogleSheetsService,
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
                SourceUrl: post.Url,
                source_link: shopeeLink,
                Sub_id1: toSnakeCase(author).replaceAll('_', ''),
                Sub_id2: '',
                Sub_id3: '',
                Sub_id4: '',
                Sub_id5: '',

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


    async saveNewLink() {
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



    async sleep(ms: number) {
        log(`==== Waiting ${Math.round(ms / 1000)}s ====`);
        return new Promise(rs => setTimeout(rs, ms));
    }

}
