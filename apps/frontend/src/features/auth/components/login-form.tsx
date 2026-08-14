'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button, Input, Label } from '@/shared/ui';
import { login } from '../actions';
import { homeByRole } from '../routes';
import { loginSchema, type LoginInput } from '../schema';

export function LoginForm() {
  const router = useRouter();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginInput) {
    try {
      const user = await login(values);
      toast.success(`Bem-vindo, ${user.name.split(' ')[0]}!`);
      router.replace(homeByRole(user.role));
      router.refresh();
    } catch {
      toast.error('E-mail ou senha inválidos. Tente novamente.');
    }
  }

  return (
    <form className="grid gap-5" noValidate onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <Label htmlFor="login-email">E-mail</Label>
        <Input
          id="login-email"
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
          <Label htmlFor="login-password">Senha</Label>
          <span className="text-xs text-muted-foreground">Mínimo de 8 caracteres</span>
        </div>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="Sua senha"
          aria-invalid={Boolean(form.formState.errors.password)}
          {...form.register('password')}
        />
        {form.formState.errors.password ? (
          <p className="text-sm text-danger">{form.formState.errors.password.message}</p>
        ) : null}
      </div>
      <Button type="submit" className="mt-2 w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Entrando…' : 'Entrar na plataforma'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem uma conta?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
