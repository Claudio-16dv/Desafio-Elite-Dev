import { ShieldCheck } from 'lucide-react';
import { CreateGateUserForm } from '@/features/auth/components/create-gate-user-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Container,
  PageHeader,
} from '@/shared/ui';

export const metadata = {
  title: 'Cadastrar porteiro | CINENÉON',
};

export default function CreateGateUserPage() {
  return (
    <Container className="max-w-3xl py-10 sm:py-14">
      <PageHeader
        eyebrow="Equipe de acesso"
        title="Cadastrar porteiro"
        description="Crie um acesso específico para quem fará a validação dos ingressos na entrada."
      />
      <Card className="mt-8 overflow-hidden">
        <CardHeader className="border-b border-border bg-card/90">
          <ShieldCheck aria-hidden="true" className="mb-2 size-7 text-primary" />
          <CardTitle>Novo acesso de portaria</CardTitle>
          <CardDescription>
            Informe os dados que o porteiro usará para entrar na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <CreateGateUserForm />
        </CardContent>
      </Card>
    </Container>
  );
}
