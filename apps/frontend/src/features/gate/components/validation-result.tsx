import type { ValidationResultResponse } from '@app/shared';
import { ValidationOutcome } from '@app/shared';
import { AlertCircle, CheckCircle2, CircleSlash2, TicketX } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const presentation: Record<
  ValidationOutcome,
  { title: string; description: string; icon: typeof CheckCircle2; className: string }
> = {
  [ValidationOutcome.VALID]: {
    title: 'Entrada liberada',
    description: 'Ingresso válido para este evento.',
    icon: CheckCircle2,
    className: 'border-success/40 bg-success/10 text-success',
  },
  [ValidationOutcome.INVALID]: {
    title: 'Ingresso inválido',
    description: 'O QR ou código não corresponde a um ingresso válido.',
    icon: TicketX,
    className: 'border-danger/40 bg-danger/10 text-danger',
  },
  [ValidationOutcome.ALREADY_USED]: {
    title: 'Ingresso já utilizado',
    description: 'Este ingresso já foi validado anteriormente.',
    icon: CircleSlash2,
    className: 'border-warning/40 bg-warning/10 text-warning',
  },
  [ValidationOutcome.WRONG_EVENT]: {
    title: 'Evento incorreto',
    description: 'Este ingresso pertence a outro evento.',
    icon: AlertCircle,
    className: 'border-primary/40 bg-primary/10 text-primary',
  },
};

export function ValidationResult({ result }: { result: ValidationResultResponse }) {
  const item = presentation[result.outcome];
  const Icon = item.icon;

  return (
    <section
      aria-live="polite"
      className={cn('rounded-[--radius] border p-6 text-center', item.className)}
    >
      <Icon aria-hidden="true" className="mx-auto size-12" />
      <h2 className="mt-4 font-display text-2xl font-bold">{item.title}</h2>
      <p className="mt-2 text-sm leading-6 text-foreground/80">{item.description}</p>
      {result.seatLabel ? (
        <p className="mt-4 text-sm font-semibold text-foreground">Assento {result.seatLabel}</p>
      ) : null}
    </section>
  );
}
