import {
  IsArray,
  IsPositive,
  IsNumber,
  IsString,
  IsDateString,
} from 'class-validator';

export class ExplorerInsertBlockDto {
  @IsPositive()
  @IsNumber()
  blockHeight: number;

  @IsNumber()
  blockTx: number;

  @IsArray()
  @IsString({ each: true })
  txHashes: string[];

  @IsDateString()
  timestamp: string;
}
