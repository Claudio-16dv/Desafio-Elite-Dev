'use client';

import type {
  EventSummary,
  TicketInspectionResponse,
  ValidateTicketRequest,
  ValidationResultResponse,
} from '@app/shared';
import { ValidationOutcome } from '@app/shared';
import { ScanLine } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Label } from '@/shared/ui';
import { inspectTicket, validateTicket } from '../actions';
import { ManualCodeForm } from './manual-code-form';
import { QrScanner } from './qr-scanner';
import { ValidationResult } from './validation-result';

const toastByOutcome: Record<ValidationOutcome, { message: string; success?: boolean }> = {
  [ValidationOutcome.VALID]: { message: 'Ingresso válido. Entrada liberada.', success: true },
  [ValidationOutcome.INVALID]: { message: 'Ingresso inválido.' },
  [ValidationOutcome.ALREADY_USED]: { message: 'Este ingresso já foi utilizado.' },
  [ValidationOutcome.WRONG_EVENT]: { message: 'Este ingresso pertence a outro evento.' },
};

type TicketInput = Pick<ValidateTicketRequest, 'token' | 'code'>;
type PendingStep = 'inspect' | 'validate' | null;

function notifyOutcome(outcome: ValidationOutcome) {
  const toastItem = toastByOutcome[outcome];
  if (toastItem.success) {
    toast.success(toastItem.message);
  } else {
    toast.error(toastItem.message);
  }
}

function toValidationResult(inspection: TicketInspectionResponse): ValidationResultResponse {
  return {
    outcome: inspection.outcome,
    ticketId: inspection.ticketId,
    seatLabel: inspection.seatLabel,
  };
}

export function GateValidationPanel({ events }: { events: EventSummary[] }) {
  const [eventId, setEventId] = useState(events[0]?.id ?? '');
  const [inspection, setInspection] = useState<TicketInspectionResponse | null>(null);
  const [pendingInput, setPendingInput] = useState<TicketInput | null>(null);
  const [result, setResult] = useState<ValidationResultResponse | null>(null);
  const [technicalError, setTechnicalError] = useState<string | null>(null);
  const [pendingStep, setPendingStep] = useState<PendingStep>(null);

  const inputDisabled = pendingStep !== null || inspection !== null;

  function resetForNextRead() {
    setInspection(null);
    setPendingInput(null);
    setResult(null);
    setTechnicalError(null);
    setPendingStep(null);
  }

  async function submit(input: TicketInput) {
    if (pendingStep !== null) {
      return;
    }

    setInspection(null);
    setPendingInput(null);
    setResult(null);
    setTechnicalError(null);

    if (!eventId) {
      const message = 'Selecione o evento que está sendo validado.';
      setTechnicalError(message);
      toast.error(message);
      return;
    }

    setPendingStep('inspect');
    try {
      const inspected = await inspectTicket({ eventId, ...input });
      setInspection(inspected);
      setPendingInput(input);

      if (inspected.outcome === ValidationOutcome.VALID) {
        toast.success('Ingresso identificado. Confirme a entrada.');
      } else {
        notifyOutcome(inspected.outcome);
      }
    } catch {
      const message = 'Não foi possível ler este ingresso. Tente novamente.';
      setTechnicalError(message);
      toast.error(message);
    } finally {
      setPendingStep(null);
    }
  }

  async function confirmEntry() {
    if (
      pendingStep !== null ||
      !pendingInput ||
      !inspection ||
      inspection.outcome !== ValidationOutcome.VALID
    ) {
      return;
    }

    setTechnicalError(null);
    setResult(null);
    setPendingStep('validate');

    try {
      const validation = await validateTicket({ eventId, ...pendingInput });
      setResult(validation);
      setInspection(null);
      setPendingInput(null);
      notifyOutcome(validation.outcome);
    } catch {
      const message = 'Não foi possível confirmar a entrada. Tente novamente.';
      setInspection(null);
      setPendingInput(null);
      setTechnicalError(message);
      toast.error(message);
    } finally {
      setPendingStep(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div className="space-y-6">
        <section className="rounded-[--radius] border border-border bg-card/60 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <ScanLine aria-hidden="true" className="size-6 text-primary" />
            <div>
              <h2 className="font-display text-xl font-semibold">Evento em operação</h2>
              <p className="text-sm text-muted-foreground">
                Escolha a sessão que está recebendo o público.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-2">
            <Label htmlFor="gate-event">Evento</Label>
            <select
              id="gate-event"
              value={eventId}
              onChange={(event) => {
                setEventId(event.target.value);
                resetForNextRead();
              }}
              disabled={pendingStep !== null || inspection !== null}
              className="h-11 rounded-[--radius] border border-border bg-muted/40 px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} — {event.venue}
                </option>
              ))}
            </select>
          </div>
        </section>
        <QrScanner onDetected={(token) => submit({ token })} disabled={inputDisabled} />
        <ManualCodeForm onSubmitCode={(code) => submit({ code })} disabled={inputDisabled} />
      </div>
      <aside className="lg:sticky lg:top-24">
        {pendingStep === 'inspect' ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-[--radius] border border-primary/30 bg-primary/5 p-8 text-center text-sm leading-6 text-muted-foreground"
          >
            Lendo ingresso…
          </div>
        ) : pendingStep === 'validate' ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-[--radius] border border-primary/30 bg-primary/5 p-8 text-center text-sm leading-6 text-muted-foreground"
          >
            Confirmando entrada…
          </div>
        ) : inspection ? (
          <section className="space-y-4 rounded-[--radius] border border-border bg-card/60 p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Resultado da leitura
              </p>
              {inspection.eventTitle ? (
                <h2 className="mt-3 font-display text-2xl font-bold">{inspection.eventTitle}</h2>
              ) : null}
              {inspection.seatLabel ? (
                <p className="mt-2 text-sm font-semibold text-foreground">
                  Assento {inspection.seatLabel}
                </p>
              ) : null}
            </div>
            {inspection.outcome === ValidationOutcome.VALID ? (
              <div className="rounded-[--radius] border border-success/40 bg-success/10 p-4">
                <p className="text-sm leading-6 text-success">
                  Ingresso válido. Confirme a entrada para marcar o ingresso como utilizado.
                </p>
                <Button
                  type="button"
                  className="mt-4 w-full"
                  onClick={confirmEntry}
                  disabled={pendingStep !== null}
                >
                  Confirmar entrada
                </Button>
              </div>
            ) : (
              <ValidationResult result={toValidationResult(inspection)} />
            )}
            <Button type="button" variant="outline" className="w-full" onClick={resetForNextRead}>
              Nova leitura
            </Button>
          </section>
        ) : result ? (
          <div className="space-y-3">
            <ValidationResult result={result} />
            <Button type="button" variant="outline" className="w-full" onClick={resetForNextRead}>
              Nova leitura
            </Button>
          </div>
        ) : technicalError ? (
          <div className="space-y-3">
            <div
              role="alert"
              className="rounded-[--radius] border border-danger/40 bg-danger/10 p-8 text-center text-sm leading-6 text-danger"
            >
              {technicalError}
            </div>
            <Button type="button" variant="outline" className="w-full" onClick={resetForNextRead}>
              Nova leitura
            </Button>
          </div>
        ) : (
          <div className="rounded-[--radius] border border-dashed border-border bg-card/40 p-8 text-center text-sm leading-6 text-muted-foreground">
            O resultado da leitura aparecerá aqui antes da confirmação.
          </div>
        )}
      </aside>
    </div>
  );
}
