/**
 * Erro de domínio. As actions/entidades lançam isso; o DomainExceptionFilter
 * traduz para o status HTTP. Nada de HttpException dentro do domínio.
 */
export class DomainException extends Error {
  constructor(
    message: string,
    readonly code: string = 'DOMAIN_ERROR',
    readonly status: number = 400,
  ) {
    super(message);
    this.name = new.target.name;
  }
}
