
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IsString, IsInt } from 'class-validator';

export type SourceAffiliateLinkDocument = HydratedDocument<SourceAffiliateLink>;


@Schema({
    timestamps: true,
    strict: false,
})
export class SourceAffiliateLink {
    @IsString()
    @Prop({ required: true, unique: true })
    PostID: string;

    @IsString()
    @Prop()
    SourceUrl: string;

    @IsInt()
    @Prop({ type: String, alias: 'Liên kết gốc' })
    source_link: string;

    @IsString()
    @Prop()
    Sub_id1?: string;

    @IsString()
    @Prop()
    Sub_id2?: string;

    @IsString()
    @Prop()
    Sub_id3?: string;

    @IsString()
    @Prop()
    Sub_id4?: string;

    @IsString()
    @Prop()
    Sub_id5?: string;

    @Prop()
    createdAt?: Date

    @Prop()
    updatedAt?: Date
}

export const SourceAffiliateLinkSchema = SchemaFactory.createForClass(SourceAffiliateLink);
