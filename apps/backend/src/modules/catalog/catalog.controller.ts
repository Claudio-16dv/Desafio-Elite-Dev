import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CatalogItem, Role } from '@app/shared';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SearchCatalogDto } from './dto/search-catalog.dto';
import { GetCatalogItemUseCase } from './use-cases/get-catalog-item.use-case';
import { SearchCatalogUseCase } from './use-cases/search-catalog.use-case';

@Controller('catalog')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ORGANIZER)
export class CatalogController {
  constructor(
    private readonly searchCatalog: SearchCatalogUseCase,
    private readonly getCatalogItem: GetCatalogItemUseCase,
  ) {}

  @Get('search')
  search(@Query() dto: SearchCatalogDto): Promise<CatalogItem[]> {
    return this.searchCatalog.execute(dto.query);
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<CatalogItem> {
    return this.getCatalogItem.execute(id);
  }
}
