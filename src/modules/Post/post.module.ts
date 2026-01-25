
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from 'src/mongodb/schema/Post.schema';
import { PostService } from './post.service';
import { SourceAffiliateLink, SourceAffiliateLinkSchema } from 'src/mongodb/schema/SourceAffiliateLink.schema';
import { Page, PageSchema } from 'src/mongodb/schema/Page.schema';
import { CommentSchema, Comment} from 'src/mongodb';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Page.name, schema: PageSchema },
      { name: SourceAffiliateLink.name, schema: SourceAffiliateLinkSchema },
      { name: Comment.name, schema: CommentSchema }
    ]),
  ],
  providers: [PostService],
  exports: [PostService]
})
export class PostModule { }
