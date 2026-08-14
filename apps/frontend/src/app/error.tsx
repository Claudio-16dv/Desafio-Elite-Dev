'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button, Container } from '@/shared/ui';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center">
      <Container className="max-w-xl py-16 text-center">
        <AlertTriangle aria-hidden="true" className="mx-auto size-12 text-warning" />
        <h1 className="mt-5 font-display text-3xl font-bold">Algo saiu de cena.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Não foi possível carregar esta experiência agora. Tente novamente; se o problema
          persistir, volte em alguns instantes.
        </p>
        <Button className="mt-7" onClick={reset}>
          <RefreshCw className="size-4" /> Tentar novamente
        </Button>
      </Container>
    </main>
  );
}
