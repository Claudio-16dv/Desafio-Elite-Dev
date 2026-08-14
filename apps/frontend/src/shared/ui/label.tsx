import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

export type LabelProps = ComponentProps<'label'>;

export function Label({ className, ...props }: LabelProps) {
  return <label className={cn('text-sm font-medium text-foreground', className)} {...props} />;
}
