import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class File {
  @Prop({ required: true })
  publicId: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  format: string;

  @Prop({ required: true })
  resourceType: string;

  @Prop()
  originalName: string;

  @Prop()
  size: number;
}

export type FileDocument = File & Document;
export const FileSchema = SchemaFactory.createForClass(File);
