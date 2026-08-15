'use client';

import type { EventSummary, ValidationResultResponse } from '@app/shared';
import { ValidationOutcome } from '@app/shared';
import { ScanLine } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Label } from '@/shared/ui';
import { validateTicket } from '../actions';
import { ManualCodeForm } from './manual-code-form';
import { QrScanner } from './qr-scanner';
import { ValidationResult } from './validation-result';

const toastByOutcome: Record<ValidationOutcome, { message: string; success?: boolean }> = {
  [ValidationOutcome.VALID]: { message: 'Ingresso válido. Entrada liberada.', success: true },
  [ValidationOutcome.INVALID]: { message: 'Ingresso inválido.' },
  [ValidationOutcome.ALREADY_USED]: { message: 'Este ingresso já foi utilizado.' },
  [ValidationOutcome.WRONG_EVENT]: { message: 'Este ingresso pertence a outro evento.' },
};

export function GateValidationPanel({ events }: { events: EventSummary[] }) {
  const [eventId, setEventId] = useState(events[0]?.id ?? '');
  const [result, setResult] = useState<ValidationResultResponse | null>(null);
  const [technicalError, setTechnicalError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(input: { token?: string; code?: string }) {
    setResult(null);
    setTechnicalError(null);

    if (!eventId) {
      const message = 'Selecione o evento que está sendo validado.';
      setTechnicalError(message);
      toast.error(message);
      return;
    }

    setPending(true);
    try {
      const validation = await validateTicket({ eventId, ...input });
      setResult(validation);
      const toastItem = toastByOutcome[validation.outcome];
      if (toastItem.success) {
        toast.success(toastItem.message);
      } else {
        toast.error(toastItem.message);
      }
    } catch {
      const message = 'Não foi possível validar este ingresso. Tente novamente.';
      setTechnicalError(message);
      toast.error(message);
    } finally {
      setPending(false);
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
                setResult(null);
                setTechnicalError(null);
              }}
              disabled={pending}
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
        <QrScanner onDetected={(token) => submit({ token })} disabled={pending} />
        <ManualCodeForm onSubmitCode={(code) => submit({ code })} disabled={pending} />
      </div>
      <aside className="lg:sticky lg:top-24">
        {pending ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-[--radius] border border-primary/30 bg-primary/5 p-8 text-center text-sm leading-6 text-muted-foreground"
          >
            Validando ingresso…
          </div>
        ) : result ? (
          <ValidationResult result={result} />
        ) : technicalError ? (
          <div
            role="alert"
            className="rounded-[--radius] border border-danger/40 bg-danger/10 p-8 text-center text-sm leading-6 text-danger"
          >
            {technicalError}
          </div>
        ) : (
          <div className="rounded-[--radius] border border-dashed border-border bg-card/40 p-8 text-center text-sm leading-6 text-muted-foreground">
            O resultado da validação aparecerá aqui em destaque.
          </div>
        )}
      </aside>
    </div>
  );
}
