import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, IsUrl, Min, MinLength } from 'class-validator';
import { UpdateEventRequest } from '@app/shared';

export class UpdateEventDto implements UpdateEventRequest {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  venue?: string;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceCents?: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
