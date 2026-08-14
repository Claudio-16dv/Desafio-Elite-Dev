'use client';

import type { AuthUser } from '@app/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Save, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button, Input, Label } from '@/shared/ui';
import { updateProfile } from '../actions';
import { updateProfileSchema, type UpdateProfileInput } from '../schema';

export function AccountForm({ user }: { user: AuthUser }) {
  const router = useRouter();
  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: UpdateProfileInput) {
    try {
      const updated = await updateProfile(values);
      form.reset({
        name: updated.name,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Conta atualizada com sucesso.');
      router.refresh();
    } catch {
      toast.error('Não foi possível atualizar a conta. Confira sua senha atual.');
    }
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
      <section className="grid gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <UserRound className="size-4 text-primary" />
          Dados pessoais
        </div>
        <div className="grid gap-2">
          <Label htmlFor="account-name">Nome</Label>
          <Input
            id="account-name"
            autoComplete="name"
            aria-invalid={Boolean(form.formState.errors.name)}
            {...form.register('name')}
          />
          {form.formState.errors.name ? (
            <p className="text-sm text-danger">{form.formState.errors.name.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="account-email">E-mail</Label>
          <Input id="account-email" value={user.email} readOnly disabled />
          <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado.</p>
        </div>
      </section>

      <section className="grid gap-4 border-t border-border pt-6">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <KeyRound className="size-4 text-accent" />
          Alterar senha <span className="font-normal text-muted-foreground">(opcional)</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="current-password">Senha atual</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(form.formState.errors.currentPassword)}
              {...form.register('currentPassword')}
            />
            {form.formState.errors.currentPassword ? (
              <p className="text-sm text-danger">{form.formState.errors.currentPassword.message}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-password">Nova senha</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(form.formState.errors.newPassword)}
              {...form.register('newPassword')}
            />
            {form.formState.errors.newPassword ? (
              <p className="text-sm text-danger">{form.formState.errors.newPassword.message}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirmar nova senha</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(form.formState.errors.confirmPassword)}
              {...form.register('confirmPassword')}
            />
            {form.formState.errors.confirmPassword ? (
              <p className="text-sm text-danger">{form.formState.errors.confirmPassword.message}</p>
            ) : null}
          </div>
        </div>
      </section>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        <Save className="size-4" />
        {form.formState.isSubmitting ? 'Salvando…' : 'Salvar alterações'}
      </Button>
    </form>
  );
}
