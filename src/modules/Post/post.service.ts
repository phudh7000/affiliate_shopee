import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
// import * as dayjs from "dayjs";
import { Model } from 'mongoose';
import { Page, Comment } from 'src/mongodb';
import { SourceAffiliateLink } from 'src/mongodb/schema/SourceAffiliateLink.schema';

@Injectable()
export class PostService {
    constructor(
        // @InjectModel(Post.name) private postModel: Model<Post>,
        @InjectModel(Page.name) private pageModel: Model<Page>,
        @InjectModel(SourceAffiliateLink.name) private sourceAffiliateLinkModel: Model<SourceAffiliateLink>,
        @InjectModel(Comment.name) private commentModel: Model<Comment>,
    ) {
        console.log("testttt");
        //     setTimeout(async() => {
        //         const result = await this.commentToPost(
        //   "1411752423987001",
        //   "Bình luận tự động bằng API ✨ https://s.shopee.vn/3LKg5xWW8A",
        // );

        // setTimeout(() => {
        //     this.run();
        // }, 1000)

        // setTimeout(() => {
        //     this.saveNewLink();
        // }, 1000)
    }

    async PostToFacebookOneProduct() { // Hàm này đăng lần lượt sản phẩm theo thời gian. Cái nào lâu không đăng thì được đăng
        // const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const twoHoursAgo = dayjs().subtract(2, 'hour').toDate();
        const sevenDaysAgo = dayjs().subtract(7, 'day').toDate();

        const sourceAffiliateLinks = await this.sourceAffiliateLinkModel.find({
            $or: [
                { postedAt: { $lt: sevenDaysAgo } },  // chỉ lấy affiliate cũ hơn 7 ngày. Vừa đăng rồi thì 7 ngày sau mới được đăng tiếp
                { postedAt: null }
            ]
        }).sort({ postedAt: 1 });            // tăng dần => cũ nhất trước;


        // console.log("sourceAffiliateLinks: ", sourceAffiliateLinks);
        for (const aff_item of sourceAffiliateLinks) {
            try {
                console.log("post.Author: ", aff_item.Author);
                if (!aff_item.url_link) {
                    console.log(`${aff_item.ProductName}: Aff này không có link liên kết => Bỏ qua`)
                    continue;
                }

                const pageToPost = await this.pageModel.findOne({
                    dependent: aff_item.Author,
                    $or: [
                        { postedAt: { $lt: twoHoursAgo } },
                        { postedAt: null }
                    ]
                }).sort({ postedAt: 1 });           // tăng dần => cũ nhất trước

                if (!pageToPost) {
                    console.log(`Không có page phù hợp cho sản phẩm ${aff_item.ProductName} => Bỏ qua`)
                    continue;
                }

                console.log("pageToPost: ", pageToPost);
                const isSuccess = await this.handlePost(pageToPost, aff_item);
                if (isSuccess) {
                    const now = new Date();
                    aff_item.postedAt = now;
                    await aff_item.save();
                    pageToPost.postedAt = now;
                    await pageToPost.save();
                }
            } catch (error) {
                console.error(`Lỗi đăng sản phẩm ${aff_item.ProductName}`)
                console.error(error)
            }
        }
    }


    async handlePost(page: Page, affiliateLink: SourceAffiliateLink) {  // Hàm này để đăng bài lên fanpage
        try {
            if (!page.page_id || !affiliateLink.url_link) {
                console.log('Không thể đăng bài do thiếu page_id hoặc url_link')
                return false;
            }
    
            const content = affiliateLink.ProductName + '\n' + `Link sản phẩm ở đây mọi người ơi 👉 ${affiliateLink.my_new_link}`;
            const result = await this.postVideoFB(
                page.page_id,
                "Sản phẩm hot trend nè mọi người", content, affiliateLink.url_link,
                page.access_token
            );
    
            const video_id = result.id
            console.log("video_id: ", video_id);
            await this.commentModel.create({
                videoId: video_id,
                pageId: page.page_id,
                my_new_link: affiliateLink.my_new_link,
                content: content,
            });
    
            return true;
        } catch (error) {
            console.error(error)
            return false;
        }
    }


    async runComment() {
        const comment_list = await this.commentModel.find({commented: false});
        
        for (const comment_item of comment_list) {
            try {
                const page = await this.pageModel.findOne({page_id: comment_item.pageId});
                if (!page) {
                    console.log('Không tìm thấy page để comment');
                    continue;
                }

                const comment_message = `Mua sản phẩm ở đây nè ${comment_item.my_new_link}`
                await this.commentToPost(comment_item.videoId, comment_message, page.access_token);
                comment_item.commented = true;
                await comment_item.save();
            } catch (error) {
                console.error(error)
            }
        }
    }

    async postVideoFB(page_id: string, title: string, description: string, file_url: string, access_token: string) {
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
    }

    async commentToPost(videoId: string, message: string, pageAccessToken: string) {
        const url = `https://graph.facebook.com/v23.0/${videoId}/comments`;
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message,
                access_token: pageAccessToken
            })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(
                `Facebook API error: ${data.error?.message || "Unknown error"}`
            );
        }

        return data; // { id: 'comment_id' }
    }
}
