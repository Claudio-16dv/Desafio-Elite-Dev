'use client';

import { Role } from '@app/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarPlus, Check, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/cn';
import { Button, Input, Label } from '@/shared/ui';
import { register } from '../actions';
import { homeByRole } from '../routes';
import { registerSchema, type RegisterInput } from '../schema';

const accountTypes = [
  {
    role: Role.CLIENT,
    title: 'Quero comprar ingressos',
    description: 'Descubra eventos, acompanhe pedidos e acesse seus ingressos.',
    icon: Ticket,
  },
  {
    role: Role.ORGANIZER,
    title: 'Quero organizar eventos',
    description: 'Crie, publique e gerencie experiências para o seu público.',
    icon: CalendarPlus,
  },
] as const;

export function RegisterForm() {
  const router = useRouter();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', role: Role.CLIENT },
  });
  const selectedRole = form.watch('role');

  async function onSubmit(values: RegisterInput) {
    try {
      const user = await register(values);
      toast.success(
        user.role === Role.ORGANIZER
          ? 'Conta de organizador criada. Seu painel está pronto!'
          : 'Conta criada. Boas-vindas à CINENÉON!',
      );
      router.replace(homeByRole(user.role));
      router.refresh();
    } catch {
      toast.error('Não foi possível criar sua conta. Verifique os dados e tente novamente.');
    }
  }

  return (
    <form className="grid gap-6" noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <fieldset className="grid gap-3">
        <legend className="text-sm font-semibold text-foreground">
          Como você quer usar a CINENÉON?
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {accountTypes.map((accountType) => {
            const Icon = accountType.icon;
            const selected = selectedRole === accountType.role;
            return (
              <label
                key={accountType.role}
                className={cn(
                  'relative flex cursor-pointer gap-3 rounded-xl border p-4 transition-[border-color,background-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/50 focus-within:ring-2 focus-within:ring-primary',
                  selected
                    ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                    : 'border-border bg-background/30',
                )}
              >
                <input
                  type="radio"
                  value={accountType.role}
                  className="sr-only"
                  {...form.register('role')}
                />
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg',
                    selected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground',
                  )}
                >
                  <Icon aria-hidden="true" className="size-4.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">
                    {accountType.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    {accountType.description}
                  </span>
                </span>
                {selected ? (
                  <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-white">
                    <Check aria-hidden="true" className="size-3" />
                  </span>
                ) : null}
              </label>
            );
          })}
        </div>
        {form.formState.errors.role ? (
          <p className="text-sm text-danger">Escolha um tipo de conta.</p>
        ) : null}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="register-name">
            {selectedRole === Role.ORGANIZER ? 'Nome do responsável ou organização' : 'Nome'}
          </Label>
          <Input
            id="register-name"
            autoComplete="name"
            placeholder={selectedRole === Role.ORGANIZER ? 'Nome da organização' : 'Seu nome'}
            aria-invalid={Boolean(form.formState.errors.name)}
            {...form.register('name')}
          />
          {form.formState.errors.name ? (
            <p className="text-sm text-danger">{form.formState.errors.name.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="register-email">E-mail</Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register('email')}
          />
          {form.formState.errors.email ? (
            <p className="text-sm text-danger">{form.formState.errors.email.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="register-password">Senha</Label>
            <span className="text-xs text-muted-foreground">Mínimo de 8</span>
          </div>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            placeholder="Crie uma senha segura"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register('password')}
          />
          {form.formState.errors.password ? (
            <p className="text-sm text-danger">{form.formState.errors.password.message}</p>
          ) : null}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting
          ? 'Criando conta…'
          : selectedRole === Role.ORGANIZER
            ? 'Criar conta de organizador'
            : 'Criar conta de cliente'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Já possui uma conta?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
