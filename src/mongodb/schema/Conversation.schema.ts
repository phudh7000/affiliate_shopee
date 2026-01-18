import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;


@Schema({timestamps: {
  createdAt: 'created_at',
  updatedAt: 'updated_at'
}})
export class Conversation {
  // @Prop({ required: true })
  // user_id: number;
  id: string;

  @Prop()
  conversation_name: string;

  @Prop({type: SchemaTypes.Mixed})
  thread: any

  @Prop()
  note: string;

  @Prop()
  status: boolean;

  @Prop()
  created_at: Date;

  @Prop()
  updated_at: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
