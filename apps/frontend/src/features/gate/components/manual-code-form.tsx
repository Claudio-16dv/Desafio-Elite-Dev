'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Keyboard } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button, Input, Label } from '@/shared/ui';
import { manualCodeSchema, type ManualCodeInput } from '../schema';

export function ManualCodeForm({
  onSubmitCode,
  disabled = false,
}: {
  onSubmitCode: (code: string) => void;
  disabled?: boolean;
}) {
  const form = useForm<ManualCodeInput>({
    resolver: zodResolver(manualCodeSchema),
    defaultValues: { code: '' },
  });

  function submit(values: ManualCodeInput) {
    onSubmitCode(values.code);
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(submit)}
      className="rounded-[--radius] border border-border bg-card/60 p-4 sm:p-6"
    >
      <div className="flex items-center gap-3">
        <Keyboard aria-hidden="true" className="size-5 text-accent" />
        <div>
          <h2 className="font-display text-xl font-semibold">Código manual</h2>
          <p className="text-sm text-muted-foreground">
            Use esta opção quando a câmera não estiver disponível.
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="grid flex-1 gap-2">
          <Label htmlFor="ticket-code">Código do ingresso</Label>
          <Input
            id="ticket-code"
            placeholder="Ex.: A1B2C3D4"
            autoCapitalize="characters"
            {...form.register('code')}
          />
          {form.formState.errors.code ? (
            <p className="text-sm text-danger">{form.formState.errors.code.message}</p>
          ) : null}
        </div>
        <Button type="submit" disabled={disabled}>
          Validar código
        </Button>
      </div>
    </form>
  );
}
