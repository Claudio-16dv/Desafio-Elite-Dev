import { Sparkles } from 'lucide-react';
import { RegisterForm } from '@/features/auth/components/register-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Container } from '@/shared/ui';

export const metadata = {
  title: 'Criar conta | CINENÉON',
};

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.2),_transparent_36%)] py-10 sm:py-16">
      <Container className="max-w-2xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Seu lugar na CINENÉON
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Uma conta do seu jeito.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Escolha se você quer viver os próximos eventos ou criar experiências para outras
            pessoas.
          </p>
        </div>
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-card/90">
            <Sparkles aria-hidden="true" className="mb-3 size-7 text-primary" />
            <CardTitle>Crie seu acesso</CardTitle>
            <CardDescription>
              A modalidade escolhida define as ferramentas disponíveis na sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <RegisterForm />
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
