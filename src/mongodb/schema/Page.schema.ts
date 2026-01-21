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

    @IsString()
    @Prop()
    media: string;

    @Prop({ type: [String], require: false })
    Types?: string[];

    @IsString()
    @Prop()
    access_token: string;

    @Prop({ type: Boolean })
    status: boolean;

    @Prop()
    createdAt?: Date

    @Prop()
    updatedAt?: Date
}

export const PageSchema = SchemaFactory.createForClass(Page);

