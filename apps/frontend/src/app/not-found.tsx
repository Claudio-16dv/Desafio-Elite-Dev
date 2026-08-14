import { Film, Home } from 'lucide-react';
import Link from 'next/link';
import { Button, Container } from '@/shared/ui';

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center">
      <Container className="max-w-xl py-16 text-center">
        <Film aria-hidden="true" className="mx-auto size-12 text-primary" />
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Cena não encontrada
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold">Esta página não está em cartaz.</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          O endereço pode ter mudado ou o conteúdo não está mais disponível.
        </p>
        <Button asChild className="mt-7">
          <Link href="/">
            <Home className="size-4" /> Voltar ao início
          </Link>
        </Button>
      </Container>
    </main>
  );
}
