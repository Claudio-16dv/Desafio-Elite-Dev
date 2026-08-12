import { Injectable } from '@nestjs/common';
import { CatalogItem } from '@app/shared';
import { CatalogProvider } from '../providers/catalog-provider';

@Injectable()
export class SearchCatalogUseCase {
  constructor(private readonly catalog: CatalogProvider) {}

  execute(query: string): Promise<CatalogItem[]> {
    return this.catalog.search(query);
  }
}
