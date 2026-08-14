import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { LoginForm } from '@/features/auth/components/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Container } from '@/shared/ui';

export const metadata = {
  title: 'Entrar | CINENÉON',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(139,92,246,0.22),_transparent_36%),radial-gradient(circle_at_bottom_left,_rgba(236,72,153,0.15),_transparent_34%)] py-10 sm:py-16">
      <Container className="max-w-md">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para eventos
        </Link>
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-card/90">
            <Sparkles aria-hidden="true" className="mb-3 size-7 text-accent" />
            <CardTitle>Que bom ter você de volta.</CardTitle>
            <CardDescription>
              Entre para reservar seu lugar nas próximas experiências.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <LoginForm />
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
