import { ScanLine } from 'lucide-react';
import { GateValidationPanel } from '@/features/gate/components/gate-validation-panel';
import { listGateEvents } from '@/features/gate/queries';
import { Container, EmptyState, PageHeader } from '@/shared/ui';

export const dynamic = 'force-dynamic';

export default async function ValidatePage() {
  const events = await listGateEvents();

  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Portaria"
        title="Validação de ingressos"
        description="Use a câmera ou o código manual. O resultado sempre aparece de forma clara para a equipe."
      />
      {events.length ? (
        <div className="mt-8">
          <GateValidationPanel events={events} />
        </div>
      ) : (
        <EmptyState
          className="mt-8"
          icon={ScanLine}
          title="Nenhum evento do seu organizador"
          description="A portaria poderá validar ingressos assim que houver um evento publicado do seu organizador."
        />
      )}
    </Container>
  );
}
