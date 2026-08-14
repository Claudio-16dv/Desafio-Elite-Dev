import { AccountForm } from '@/features/account/components/account-form';
import { getSession } from '@/shared/session/get-session';
import { Card, CardContent, CardHeader, CardTitle, Container, PageHeader } from '@/shared/ui';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Sua conta"
        title="Editar perfil"
        description="Atualize seu nome ou troque a senha usada para acessar a plataforma."
      />
      <Card className="mt-8 max-w-2xl">
        <CardHeader>
          <CardTitle>Informações da conta</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountForm user={session.user} />
        </CardContent>
      </Card>
    </Container>
  );
}
