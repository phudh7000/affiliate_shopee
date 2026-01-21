
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from 'src/mongodb/schema/Post.schema';
import { PostService } from './post.service';
import { SourceAffiliateLink, SourceAffiliateLinkSchema } from 'src/mongodb/schema/SourceAffiliateLink.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }, { name: SourceAffiliateLink.name, schema: SourceAffiliateLinkSchema }]),
  ],
  providers: [PostService],
  exports: [PostService]
})
export class PostModule { }
