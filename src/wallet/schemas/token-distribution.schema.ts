import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class TokenDistribution extends Document {
  @Prop({ required: true })
  wallet: string;

  @Prop({ required: true })
  amountSol: number;

  @Prop({ required: true })
  amountToken: number;

  @Prop({ required: true })
  txSignature: string; // token transfer signature
}

export const TokenDistributionSchema = SchemaFactory.createForClass(TokenDistribution);
TokenDistributionSchema.index({ wallet: 1 }, { unique: true });
