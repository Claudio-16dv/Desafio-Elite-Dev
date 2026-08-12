import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogProvider } from './providers/catalog-provider';
import { TmdbCatalogProvider } from './providers/tmdb-catalog.provider';
import { GetCatalogItemUseCase } from './use-cases/get-catalog-item.use-case';
import { SearchCatalogUseCase } from './use-cases/search-catalog.use-case';

@Module({
  controllers: [CatalogController],
  providers: [
    SearchCatalogUseCase,
    GetCatalogItemUseCase,
    { provide: CatalogProvider, useClass: TmdbCatalogProvider },
  ],
  exports: [CatalogProvider],
})
export class CatalogModule {}
