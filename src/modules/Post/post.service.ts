import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from 'src/mongodb/schema/Post.schema';
import { SourceAffiliateLink } from 'src/mongodb/schema/SourceAffiliateLink.schema';
import { log } from 'src/utils';

@Injectable()
export class PostService {
    constructor(
        // @InjectModel(Post.name) private postModel: Model<Post>,
        @InjectModel(SourceAffiliateLink.name) private sourceAffiliateLinkModel: Model<SourceAffiliateLink>,
    ) {
        console.log("testttt");
        //     setTimeout(async() => {
        //         const result = await this.commentToPost(
        //   "1411752423987001",
        //   "Bình luận tự động bằng API ✨ https://s.shopee.vn/3LKg5xWW8A",
        // );

        setTimeout(() => {
            this.run();
        }, 1000)

        // setTimeout(() => {
        //     this.saveNewLink();
        // }, 1000)
    }

    async run() {

        // const posts = await this.postModel.find().lean();
        const sourceAffiliateLinks = await this.sourceAffiliateLinkModel.find().lean();
        // console.log("sourceAffiliateLinks: ", sourceAffiliateLinks);
        const post = sourceAffiliateLinks[1];
        if (post.url_link) {
            const description = `Link sản phẩm ở đây nhé 👉 ${post.my_new_link}`
            const result = await this.postVideoFB(
                "122095687118011618",
                "Bình luận tự động bằng API ✨", description, post.url_link,
                'hihi'
            );

            const video_id = result.id
            console.log("video_id: ", video_id);
            await this.sourceAffiliateLinkModel.updateOne({_id: post._id}, {video_id});
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

    async commentToPost(postId: string, message: string, pageAccessToken: string) {
        const url = `https://graph.facebook.com/v23.0/${postId}/comments`;
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
