import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../users/entities/user.entity';

export type VideoDocument = HydratedDocument<Video>;

@Schema()
export class Video {
  @Prop()
  title: string;
  @Prop()
  video: string;
  @Prop()
  coverImage: string;
  @Prop({ default: Date.now() })
  uploadAt: Date;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: User;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
