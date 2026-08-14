'use client';

import { Check, Copy, Share2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Input } from '@/shared/ui';
import { createShareLink } from '../actions';

export function TicketShareButton({ ticketId }: { ticketId: string }) {
  const [pending, setPending] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  async function share() {
    setPending(true);
    try {
      const link = await createShareLink({ ticketId });
      setUrl(link.url);
      await navigator.clipboard.writeText(link.url);
      toast.success('Link copiado para a área de transferência.');
    } catch {
      toast.error('Não foi possível criar ou copiar o link. Copie o endereço exibido manualmente.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-3">
      <Button onClick={share} disabled={pending} variant="outline" className="w-full">
        {url ? <Check className="size-4 text-success" /> : <Share2 className="size-4" />}
        {pending ? 'Gerando link…' : url ? 'Link gerado' : 'Compartilhar ingresso'}
      </Button>
      {url ? (
        <div className="flex gap-2">
          <Input aria-label="Link público do ingresso" readOnly value={url} />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Copiar link"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
                toast.success('Link copiado.');
              } catch {
                toast.error('Não foi possível copiar o link.');
              }
            }}
          >
            <Copy className="size-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
