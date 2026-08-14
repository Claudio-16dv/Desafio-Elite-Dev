import { Injectable, Logger } from '@nestjs/common';
import { CatalogItem } from '@app/shared';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { CatalogProvider } from './catalog-provider';

const TMDB_ATTEMPTS = 3;
const TMDB_TIMEOUT_MS = 8_000;

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
  private readonly logger = new Logger(TmdbCatalogProvider.name);

  async search(query: string): Promise<CatalogItem[]> {
    const response = await this.request<TmdbSearchResponse>('/search/movie', { query });
    return response.results.map((movie) => this.toCatalogItem(movie));
  }

  async getById(id: string): Promise<CatalogItem | null> {
    const url = this.createUrl('/movie/' + encodeURIComponent(id));
    const response = await this.fetchWithRetry(url);

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

    const response = await this.fetchWithRetry(url);
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

    const baseUrl = (process.env.TMDB_BASE_URL ?? 'https://api.themoviedb.org/3').replace(
      /\/$/,
      '',
    );
    const url = new URL(baseUrl + path);
    url.searchParams.set('api_key', apiKey);
    return url;
  }

  private async fetchWithRetry(url: URL): Promise<Response> {
    let lastFailure = 'falha desconhecida';

    for (let attempt = 1; attempt <= TMDB_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(TMDB_TIMEOUT_MS) });
        const retryable = response.status === 429 || response.status >= 500;

        if (!retryable) {
          return response;
        }

        lastFailure = 'HTTP ' + response.status;
        if (attempt === TMDB_ATTEMPTS) {
          this.logger.error('TMDb indisponível após tentativas (' + lastFailure + ')');
          return response;
        }
      } catch (error) {
        lastFailure = error instanceof Error ? error.name : 'erro desconhecido';
        if (attempt === TMDB_ATTEMPTS) {
          break;
        }
      }

      this.logger.warn(
        'TMDb tentativa ' + attempt + '/' + TMDB_ATTEMPTS + ' falhou (' + lastFailure + ')',
      );
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }

    this.logger.error('TMDb indisponível após tentativas (' + lastFailure + ')');
    throw new DomainException('Falha ao consultar o catálogo TMDb', 'TMDB_REQUEST_FAILED', 502);
  }

  private toCatalogItem(movie: TmdbMovie): CatalogItem {
    return {
      sourceId: String(movie.id),
      title: movie.title,
      overview: movie.overview ?? undefined,
      imageUrl: movie.poster_path
        ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path
        : undefined,
      releaseDate: movie.release_date ?? undefined,
    };
  }
}
