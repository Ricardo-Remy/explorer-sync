import { AbstractDocument } from '@app/common';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class Explorer extends AbstractDocument {
  @Prop({ required: true })
  blockHeight: number;

  @Prop({ required: true })
  blockTx: number;

  @Prop({ required: true })
  txHashes: string[];

  @Prop({ required: true })
  timestamp: string;
}

export const ExplorerSchema = SchemaFactory.createForClass(Explorer);
