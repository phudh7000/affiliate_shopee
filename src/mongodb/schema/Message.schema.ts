import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { ObjectId } from 'mongoose';

export enum SenderTypeEnum {
  ASSISTANT = 'assistant',
  USER = 'user',
}

export enum MessageStatusEnum {
  ANSWERED = 'answered',
  STOPPED = 'stopped',
  ERROR = 'error',
}

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  strict: false,
})
export class Message {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  conversation_id: ObjectId; // (id in Conversation collection)

  // @Prop({ required: true })
  // user_id: number;

  @Prop({enum: MessageStatusEnum, required: false})
  status?: MessageStatusEnum;
  
  @Prop({type: mongoose.Schema.Types.Mixed, require: false})
  extra_input?: {[k in string]: any};

  @Prop({ enum: SenderTypeEnum, type: String })
  sender_type: SenderTypeEnum;

  @Prop()
  question: string;

  @Prop({type: String})
  answer: string | null;

  @Prop({type: String}) // can create index
  thoigian: string | null;

  @Prop({type: String})
  replied_agent?: string | null;

  @Prop()
  created_at: Date;

  @Prop()
  updated_at: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
