import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class WalletHistory extends Document {
  @Prop({ required: true, unique: true })
  txSignature: string;

  @Prop({ required: true })
  sender: string;

  @Prop({ required: true })
  amountSol: number;

  @Prop({ required: true })
  amountToken: number;

  @Prop({ required: true })
  timestamp: number;
}

export const WalletHistorySchema = SchemaFactory.createForClass(WalletHistory);

// Unique index for safety
WalletHistorySchema.index({ txSignature: 1 }, { unique: true });
