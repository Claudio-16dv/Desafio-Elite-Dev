'use client';

import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { PaymentIntent } from '@stripe/stripe-js';
import { useMemo, useState } from 'react';
import { Button } from '@/shared/ui';
import { stripePromise } from '../stripe';

interface PaymentElementFormProps {
  clientSecret: string;
  disabled?: boolean;
  onConfirmed: (paymentIntent: PaymentIntent | null) => void;
  onSubmittingChange: (submitting: boolean) => void;
  onError: (message: string) => void;
}

function PaymentForm({
  disabled = false,
  onConfirmed,
  onSubmittingChange,
  onError,
}: Omit<PaymentElementFormProps, 'clientSecret'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  async function submitPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements || !ready || submitting || disabled) {
      return;
    }

    setSubmitting(true);
    onSubmittingChange(true);
    setInlineError(null);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        const message = result.error.message ?? 'Não foi possível confirmar o pagamento.';
        setInlineError(message);
        onError(message);
        return;
      }

      onConfirmed(result.paymentIntent ?? null);
    } catch {
      const message = 'Não foi possível confirmar o pagamento. Tente novamente.';
      setInlineError(message);
      onError(message);
    } finally {
      setSubmitting(false);
      onSubmittingChange(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={submitPayment} noValidate>
      <div
        aria-busy={!ready}
        className="relative min-h-56 rounded-[--radius] border border-border bg-background/60 p-4"
      >
        {!ready ? (
          <div
            aria-label="Carregando formas de pagamento"
            className="motion-safe:animate-pulse space-y-4"
          >
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-12 rounded-md bg-muted" />
            <div className="h-12 rounded-md bg-muted" />
            <div className="h-12 rounded-md bg-muted" />
          </div>
        ) : null}
        <div className={ready ? undefined : 'opacity-0'}>
          <PaymentElement onReady={() => setReady(true)} options={{ layout: 'tabs' }} />
        </div>
      </div>
      {inlineError ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {inlineError}
        </p>
      ) : null}
      <p className="text-xs leading-5 text-muted-foreground">
        Pagamento seguro por cartão ou Pix. Os dados do cartão são enviados diretamente ao Stripe.
      </p>
      <Button
        className="w-full"
        type="submit"
        disabled={!stripe || !elements || !ready || submitting || disabled}
        aria-busy={submitting}
      >
        {submitting ? (
          <span
            aria-hidden="true"
            className="size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin"
          />
        ) : null}
        {submitting ? 'Confirmando pagamento…' : 'Pagar'}
      </Button>
    </form>
  );
}

export function PaymentElementForm({ clientSecret, ...props }: PaymentElementFormProps) {
  const options = useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: 'stripe' as const,
        variables: {
          colorPrimary: '#2563eb',
          borderRadius: '10px',
        },
      },
    }),
    [clientSecret],
  );

  if (!stripePromise) {
    return (
      <p className="text-sm font-medium text-danger" role="alert">
        A chave pública do Stripe não está configurada neste ambiente.
      </p>
    );
  }

  return (
    <Elements options={options} stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
}
