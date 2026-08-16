import type { SeatResponse } from '@app/shared';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SeatMap } from './seat-map';

function makeSeat(index: number, taken = false): SeatResponse {
  return {
    id: `seat-${index}`,
    label: `A${index}`,
    rowLabel: 'A',
    column: index,
    taken,
  };
}

describe('SeatMap', () => {
  it('chama onToggle ao clicar em um assento livre', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(<SeatMap seats={[makeSeat(1)]} selectedIds={[]} onToggle={onToggle} />);

    await user.click(screen.getByRole('button', { name: 'Assento A1, livre' }));

    expect(onToggle).toHaveBeenCalledWith('seat-1');
  });

  it('desabilita assento ocupado e não chama onToggle', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(<SeatMap seats={[makeSeat(1, true)]} selectedIds={[]} onToggle={onToggle} />);

    const occupiedSeat = screen.getByRole('button', { name: 'Assento A1, ocupado' });
    expect(occupiedSeat).toBeDisabled();

    await user.click(occupiedSeat);

    expect(onToggle).not.toHaveBeenCalled();
  });

  it('mostra o contador de assentos selecionados', () => {
    render(
      <SeatMap
        seats={[makeSeat(1), makeSeat(2)]}
        selectedIds={['seat-1', 'seat-2']}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByText('2 de 10 assentos selecionados.')).toBeInTheDocument();
  });

  it('mostra o aviso ao atingir o limite de dez assentos', () => {
    const seats = Array.from({ length: 10 }, (_, index) => makeSeat(index + 1));
    const selectedIds = seats.map((seat) => seat.id);

    render(<SeatMap seats={seats} selectedIds={selectedIds} onToggle={vi.fn()} />);

    expect(screen.getByText(/Limite atingido/)).toBeInTheDocument();
    expect(screen.getByText(/Desmarque um assento para escolher outro/)).toBeInTheDocument();
  });
});
