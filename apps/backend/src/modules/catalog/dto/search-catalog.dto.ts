import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchCatalogDto {
  @Transform(({ value }: { value: string }) => value.trim())
  @IsString()
  @IsNotEmpty()
  query!: string;
}
