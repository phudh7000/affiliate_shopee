import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IsString, IsInt, IsDate } from 'class-validator';

export type PostDocument = HydratedDocument<Post>;


@Schema({
    timestamps: true,
    strict: false,
})
export class Post {
    @IsString()
    @Prop({ required: true, unique: true })
    PostID: string;

    @IsString()
    @Prop({ required: true })
    AuthorId: string;

    @IsString()
    @Prop()
    Author: string;

    @IsString()
    @Prop()
    Content: string;
    
    @IsString()
    @Prop()
    Comments: string;

    @IsString()
    @Prop()
    Url: string;

    @IsDate()
    @Prop({ type: Date, default: Date.now, alias: 'Posted At' })
    PostedAt: Date;

    @IsInt()
    @Prop({ type: Number, default: 0, alias: 'Comment Count' })
    CommentCount: number;

    @IsInt()
    @Prop({ type: Number, default: 0, alias: 'Reaction Count' })
    ReactionCount: number;

    @IsInt()
    @Prop({ type: Number, default: 0, alias: 'Shared Count' })
    SharedCount: number;

    @Prop({ type: Boolean })
    status: boolean;

    @Prop()
    createdAt?: Date

    @Prop()
    updatedAt?: Date
}

export const PostSchema = SchemaFactory.createForClass(Post);

