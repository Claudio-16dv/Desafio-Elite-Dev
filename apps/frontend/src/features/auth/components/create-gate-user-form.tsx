'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, ShieldCheck, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button, Input, Label } from '@/shared/ui';
import { createGateUser } from '../actions';
import { createGateUserSchema, type CreateGateUserInput } from '../schema';

export function CreateGateUserForm() {
  const form = useForm<CreateGateUserInput>({
    resolver: zodResolver(createGateUserSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  async function onSubmit(values: CreateGateUserInput) {
    try {
      const gateUser = await createGateUser(values);
      form.reset();
      toast.success(`${gateUser.name} foi cadastrado na portaria.`);
    } catch {
      toast.error('Não foi possível cadastrar o porteiro. Confira os dados e o e-mail informado.');
    }
  }

  return (
    <form className="grid gap-5" noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <div className="rounded-xl border border-primary/25 bg-primary/8 p-4">
        <div className="flex gap-3">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Acesso restrito à portaria</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Esta conta poderá entrar somente na área de validação de ingressos. Seu acesso de
              organizador continuará conectado após o cadastro.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="gate-name">Nome do porteiro</Label>
        <Input
          id="gate-name"
          autoComplete="name"
          placeholder="Nome completo"
          aria-invalid={Boolean(form.formState.errors.name)}
          {...form.register('name')}
        />
        {form.formState.errors.name ? (
          <p className="text-sm text-danger">{form.formState.errors.name.message}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="gate-email">E-mail de acesso</Label>
        <Input
          id="gate-email"
          type="email"
          autoComplete="off"
          placeholder="portaria@seuevento.com"
          aria-invalid={Boolean(form.formState.errors.email)}
          {...form.register('email')}
        />
        {form.formState.errors.email ? (
          <p className="text-sm text-danger">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="gate-password">Senha inicial</Label>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <KeyRound aria-hidden="true" className="size-3" /> Mínimo de 8 caracteres
          </span>
        </div>
        <Input
          id="gate-password"
          type="password"
          autoComplete="new-password"
          placeholder="Defina uma senha segura"
          aria-invalid={Boolean(form.formState.errors.password)}
          {...form.register('password')}
        />
        {form.formState.errors.password ? (
          <p className="text-sm text-danger">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        <UserPlus aria-hidden="true" className="size-4" />
        {form.formState.isSubmitting ? 'Cadastrando…' : 'Cadastrar porteiro'}
      </Button>
    </form>
  );
}
