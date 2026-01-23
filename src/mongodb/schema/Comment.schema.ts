import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IsString, IsInt, IsDate } from 'class-validator';

export type CommentDocument = HydratedDocument<Comment>;


@Schema({
    timestamps: true,
    strict: false,
})
export class Comment {
    @IsString()
    @Prop({ required: true })
    videoId: string;
    
    @IsString()
    @Prop({ required: true })
    pageId: string;

    @IsString()
    @Prop({ required: true })
    my_new_link: string;

    @IsString()
    @Prop()
    content: string;

    @Prop({ type: Boolean, default: false })
    commented?: boolean;

    @Prop()
    createdAt?: Date

    @Prop()
    updatedAt?: Date
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

