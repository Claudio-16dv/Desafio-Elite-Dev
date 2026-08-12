import { Injectable } from '@nestjs/common';
import { CatalogItem } from '@app/shared';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { CatalogProvider } from './catalog-provider';

type TmdbMovie = {
  id: number;
  title: string;
  overview?: string | null;
  poster_path?: string | null;
  release_date?: string | null;
};

type TmdbSearchResponse = {
  results: TmdbMovie[];
};

@Injectable()
export class TmdbCatalogProvider extends CatalogProvider {
  async search(query: string): Promise<CatalogItem[]> {
    const response = await this.request<TmdbSearchResponse>('/search/movie', { query });
    return response.results.map((movie) => this.toCatalogItem(movie));
  }

  async getById(id: string): Promise<CatalogItem | null> {
    const url = this.createUrl(`/movie/${encodeURIComponent(id)}`);
    const response = await fetch(url);

    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new DomainException('Falha ao consultar o catálogo TMDb', 'TMDB_REQUEST_FAILED', 502);
    }

    return this.toCatalogItem((await response.json()) as TmdbMovie);
  }

  private async request<T>(path: string, query: Record<string, string>): Promise<T> {
    const url = this.createUrl(path);
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new DomainException('Falha ao consultar o catálogo TMDb', 'TMDB_REQUEST_FAILED', 502);
    }

    return (await response.json()) as T;
  }

  private createUrl(path: string): URL {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new DomainException('TMDb não configurado', 'TMDB_NOT_CONFIGURED', 503);
    }

    const baseUrl = (process.env.TMDB_BASE_URL ?? 'https://api.themoviedb.org/3').replace(/\/$/, '');
    const url = new URL(`${baseUrl}${path}`);
    url.searchParams.set('api_key', apiKey);
    return url;
  }

  private toCatalogItem(movie: TmdbMovie): CatalogItem {
    return {
      sourceId: String(movie.id),
      title: movie.title,
      overview: movie.overview ?? undefined,
      imageUrl: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : undefined,
      releaseDate: movie.release_date ?? undefined,
    };
  }
}
