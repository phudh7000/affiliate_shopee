import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IsString, IsInt, IsArray, IsNumber } from 'class-validator';

export type ProductDocument = HydratedDocument<Product>;


export const LIST_CAR = {
  Hyundai: {
    "Libero": true,
    "Solaris": true,
    "I30": true,
    "Hyundai HD72 3 tấn 5": true,
    "Hyundai 2: true,5 tấn": true,
    "Hyundai 5 tấn": true,
    "Hyundai 6 tấn": true,
    "Hyundai 7 tấn": true,
    "Stargazer": true,
    "Venue": true,
    "EX8": true,
    "ELANTRA": true,
    "ACCENT": true,
    "AVANTE": true,
    "GETZ": true,
    "I10": true,
    "SANTAFE": true,
    "SONATA": true,
    "TUCSON": true,
    "STAREX": true,
    "PORTER H100": true,
    "VERNA": true,
    "CRETA": true,
    "KONA": true,
    "SOLATI 16 chỗ": true,
    "COUNTY 29 chỗ": true,
    "i20": true,
    // "I10": true,
    "HYUNDAI PORTER": true,
    "Hyundai HD65 2.5 Tấn": true,
    "Hyundai mighty N250": true,
    "Hyundai 1tấn2": true,
    "Hyundai Porter H150": true,
  },
  Kia: {
    "CARENS": true,
    "BONGO": true,
    "CD5": true,
    "OPTIMA": true,
    // ...
  }
}

@Schema({
  timestamps: true,
  strict: false,
})
export class Product {
  @IsString()
  @Prop({ required: true, unique: true })
  productId: string; // Gat mua sat

  @IsString()
  @Prop({ required: true })
  name: string; // Gat mua sat

  @IsString()
  @Prop()
  carBrand: string; // Toyota

  @IsString()
  @Prop()
  carModel: string; // Toyota camry

  @IsString()
  @Prop({type: String})
  type: string | null; // moc chu u

  @IsString()
  @Prop({type: String})
  size: string | null; // 22 24

  @IsString()
  @Prop()
  price: string

  @IsNumber()
  @Prop()
  unitPrice: number

  @Prop({type: String})
  note: string | null;

  @Prop({type: String})
  upsellMessage: string | null;

  // @IsArray()
  @Prop({ type: [String], require: false })
  video_link?: string[];

  @Prop({ type: Boolean })
  status: boolean; // True tức là vẫn bán
  
  @IsString()
  @Prop({type: String})
  description: string | null;

  @IsInt()
  @Prop({type: Number})
  year: number | null; // Năm sản xuất

  @Prop()
  createdAt?: Date

  @Prop()
  updatedAt?: Date
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({name: 'text'})

