'use client';

import type { CatalogItem } from '@app/shared';
import { Film, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button, Dialog, DialogContent, DialogDescription, DialogTitle } from '@/shared/ui';
import { searchEventCatalog } from '../actions';
import { CatalogSearchForm } from './catalog-search-form';
import { EventCreateForm } from './event-create-form';

export function EventCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!open) {
      setCatalogItems([]);
      setSelectedItem(null);
      setSearched(false);
    }
  }, [open]);

  async function handleSearch(query: string) {
    try {
      const items = await searchEventCatalog({ query });
      setCatalogItems(items);
      setSearched(true);
      if (!items.length) {
        toast.info('Nenhum item encontrado no catálogo.');
      }
    } catch {
      setCatalogItems([]);
      setSearched(true);
      toast.error('Não foi possível consultar o catálogo agora.');
    }
  }

  function handleCreated() {
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] max-w-6xl overflow-y-auto p-0">
        <div className="sticky top-0 z-20 border-b border-border bg-card/95 p-6 pr-14 backdrop-blur-xl">
          <DialogTitle className="font-display text-2xl font-semibold">
            Criar novo evento
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            Use o catálogo para começar com conteúdo preenchido ou cadastre manualmente.
          </DialogDescription>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-semibold">Informações do evento</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  O evento será criado como rascunho.
                </p>
              </div>
              {selectedItem ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItem(null)}
                >
                  <RotateCcw aria-hidden="true" className="size-4" />
                  Preencher manualmente
                </Button>
              ) : null}
            </div>
            <EventCreateForm
              key={selectedItem?.sourceId ?? 'manual'}
              catalogItem={selectedItem}
              onCreated={handleCreated}
            />
          </div>

          <aside className="rounded-[--radius] border border-border bg-background/35 p-4 lg:sticky lg:top-28">
            <h3 className="font-display text-lg font-semibold">Buscar no catálogo</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Selecione uma referência para preencher título, descrição e imagem.
            </p>
            <div className="mt-4">
              <CatalogSearchForm onSearch={handleSearch} />
            </div>

            {catalogItems.length ? (
              <div className="mt-5 grid max-h-80 gap-3 overflow-y-auto pr-1">
                {catalogItems.map((item) => {
                  const selected = selectedItem?.sourceId === item.sourceId;
                  return (
                    <button
                      key={item.sourceId}
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      aria-pressed={selected}
                      className={`rounded-[--radius] border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        selected
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card/50 hover:border-primary/50'
                      }`}
                    >
                      <Film aria-hidden="true" className="mb-3 size-5 text-accent" />
                      <span className="block font-medium">{item.title}</span>
                      {item.releaseDate ? (
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {item.releaseDate}
                        </span>
                      ) : null}
                      {item.overview ? (
                        <span className="mt-2 line-clamp-3 block text-sm text-muted-foreground">
                          {item.overview}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : searched ? (
              <p className="mt-5 rounded-[--radius] border border-dashed border-border p-4 text-sm text-muted-foreground">
                Nenhum resultado para esta busca. Você pode preencher o evento manualmente.
              </p>
            ) : null}
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
