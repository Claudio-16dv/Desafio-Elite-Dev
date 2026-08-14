'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetTitle = DialogPrimitive.Title;
export const SheetDescription = DialogPrimitive.Description;

type SheetSide = 'left' | 'right';

export interface SheetContentProps extends ComponentProps<typeof DialogPrimitive.Content> {
  side?: SheetSide;
}

export function SheetContent({ className, children, side = 'right', ...props }: SheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-sheet-overlay=""
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=closed]:animate-[sheet-overlay-out_160ms_ease-in] data-[state=open]:animate-[sheet-overlay-in_180ms_ease-out]"
      />
      <DialogPrimitive.Content
        data-sheet-content=""
        data-side={side}
        className={cn(
          'fixed inset-y-0 z-50 flex w-full max-w-sm flex-col border-border bg-card p-6 shadow-2xl shadow-black/40 outline-none will-change-transform data-[state=closed]:animate-[sheet-content-out_220ms_cubic-bezier(0.4,0,1,1)] data-[state=open]:animate-[sheet-content-in_300ms_cubic-bezier(0.22,1,0.36,1)]',
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Fechar menu"
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
