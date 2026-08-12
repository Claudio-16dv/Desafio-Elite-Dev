import { CatalogItem } from '@app/shared';

export abstract class CatalogProvider {
  abstract search(query: string): Promise<CatalogItem[]>;
  abstract getById(id: string): Promise<CatalogItem | null>;
}
