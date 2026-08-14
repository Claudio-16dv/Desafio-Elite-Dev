'use client';

import { RotateCcw, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui';
import { cancelOrder } from '../actions';

export function CancelOrderDialog({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function confirmCancellation() {
    setPending(true);
    try {
      await cancelOrder({ orderId });
      toast.success('Pedido cancelado, assentos devolvidos ao estoque.');
      setOpen(false);
      router.refresh();
    } catch {
      toast.error('Não foi possível cancelar o pedido. Ele pode não estar mais elegível.');
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="danger" size="sm">
          <RotateCcw className="size-4" /> Cancelar pedido
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="font-display text-xl font-semibold">Cancelar pedido?</DialogTitle>
        <DialogDescription className="mt-3 text-sm leading-6 text-muted-foreground">
          Tem certeza? Os assentos voltam ao estoque e o valor pago é estornado de forma simulada.
          Esta ação não pode ser desfeita.
        </DialogDescription>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              <X className="size-4" /> Manter pedido
            </Button>
          </DialogClose>
          <Button type="button" variant="danger" disabled={pending} onClick={confirmCancellation}>
            <RotateCcw className="size-4" />
            {pending ? 'Cancelando…' : 'Confirmar cancelamento'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
