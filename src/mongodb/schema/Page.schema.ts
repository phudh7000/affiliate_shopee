import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IsString, IsInt, IsDate } from 'class-validator';

export type PageDocument = HydratedDocument<Page>;


@Schema({
    timestamps: true,
    strict: false,
})
export class Page {
    @IsString()
    @Prop({ required: true, unique: true })
    page_id: string;

    @IsString()
    @Prop({ required: true })
    name: string;

    @IsString()
    @Prop()
    url_page: string;

    @Prop({ type: [String], require: false })
    media?: string[];

    @Prop({ type: [String], require: false })
    types?: string[];
    
    @Prop({ type: [String], require: false })
    dependent?: string[];

    @IsString()
    @Prop()
    access_token: string;

    @Prop({ type: Boolean, default: true })
    status: boolean;

    @IsDate()
    @Prop({ type: Date })
    postedAt?: Date

    @Prop()
    createdAt?: Date

    @Prop()
    updatedAt?: Date
}

export const PageSchema = SchemaFactory.createForClass(Page);

