import { Injectable } from '@nestjs/common';
import { CatalogItem } from '@app/shared';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { CatalogProvider } from '../providers/catalog-provider';

@Injectable()
export class GetCatalogItemUseCase {
  constructor(private readonly catalog: CatalogProvider) {}

  async execute(id: string): Promise<CatalogItem> {
    const item = await this.catalog.getById(id);
    if (!item) {
      throw new DomainException('Item de catálogo não encontrado', 'CATALOG_ITEM_NOT_FOUND', 404);
    }
    return item;
  }
}
