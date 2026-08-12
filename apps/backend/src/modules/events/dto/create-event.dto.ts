import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, IsUrl, Max, Min, MinLength } from 'class-validator';
import { CreateEventRequest } from '@app/shared';

export class CreateEventDto implements CreateEventRequest {
  @IsOptional()
  @IsString()
  sourceId?: string;

  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @MinLength(2)
  venue!: string;

  @IsDateString()
  startsAt!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceCents!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(26)
  rows!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  columns!: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
