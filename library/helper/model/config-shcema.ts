import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConfigDocument = Config & Document;

@Schema({ collection: 'configs', timestamps: true })
export class Config {
  @Prop({ required: true})
  key: string;

  @Prop({ required: true })
  value: string;
}

export const ConfigSchema = SchemaFactory.createForClass(Config);