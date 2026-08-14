'use client';

import type { SeatResponse } from '@app/shared';
import { motion, useReducedMotion } from 'motion/react';
import { useMemo } from 'react';
import { cn } from '@/shared/lib/cn';

export function SeatMap({
  seats,
  selectedIds,
  onToggle,
  disabled = false,
}: {
  seats: SeatResponse[];
  selectedIds: string[];
  onToggle: (seatId: string) => void;
  disabled?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const rows = useMemo(() => {
    const grouped = new Map<string, SeatResponse[]>();

    for (const seat of seats) {
      const row = grouped.get(seat.rowLabel) ?? [];
      row.push(seat);
      grouped.set(seat.rowLabel, row);
    }

    return [...grouped.entries()].map(
      ([label, rowSeats]) => [label, rowSeats.sort((a, b) => a.column - b.column)] as const,
    );
  }, [seats]);

  return (
    <section
      aria-labelledby="seat-map-title"
      className="rounded-[--radius] border border-border bg-card/60 p-4 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="seat-map-title" className="font-display text-xl font-semibold">
            Escolha seus lugares
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedIds.length
              ? `${selectedIds.length} assento${selectedIds.length === 1 ? '' : 's'} selecionado${selectedIds.length === 1 ? '' : 's'}`
              : 'Selecione um ou mais assentos livres.'}
          </p>
        </div>
        <div
          aria-label="Legenda do mapa de assentos"
          className="flex flex-wrap gap-3 text-xs text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <i className="size-3 rounded-sm bg-muted ring-1 ring-border" /> Livre
          </span>
          <span className="flex items-center gap-1.5">
            <i className="size-3 rounded-sm bg-primary" /> Selecionado
          </span>
          <span className="flex items-center gap-1.5">
            <i className="size-3 rounded-sm bg-background ring-1 ring-border" /> Ocupado
          </span>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-2xl rounded-[--radius] border border-border bg-background/50 p-4 sm:p-6">
        <p className="mb-6 rounded-md bg-muted py-2 text-center text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Palco
        </p>
        <div className="grid gap-4">
          {rows.map(([rowLabel, rowSeats]) => (
            <div
              key={rowLabel}
              className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-3"
            >
              <span className="text-center text-xs font-semibold text-muted-foreground">
                {rowLabel}
              </span>
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${Math.max(rowSeats.length, 1)}, minmax(0, 1fr))`,
                }}
              >
                {rowSeats.map((seat) => {
                  const selected = selectedIds.includes(seat.id);
                  const unavailable = seat.taken || disabled;

                  return (
                    <motion.button
                      key={seat.id}
                      type="button"
                      aria-label={`Assento ${seat.label}, ${seat.taken ? 'ocupado' : selected ? 'selecionado' : 'livre'}`}
                      aria-pressed={selected}
                      disabled={unavailable}
                      whileTap={reduceMotion || unavailable ? undefined : { scale: 0.92 }}
                      onClick={() => {
                        if (!unavailable) {
                          onToggle(seat.id);
                        }
                      }}
                      className={cn(
                        'aspect-square min-w-0 rounded-md text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed',
                        seat.taken
                          ? 'bg-background text-muted-foreground ring-1 ring-border'
                          : selected
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                            : 'bg-muted text-foreground hover:bg-muted/70 ring-1 ring-border',
                      )}
                    >
                      {seat.label.replace(rowLabel, '')}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
