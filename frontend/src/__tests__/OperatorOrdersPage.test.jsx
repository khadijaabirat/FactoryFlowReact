import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OperatorOrdersPage from '../pages/operator/OperatorOrdersPage';
import orderService from '../services/orderService';

vi.mock('../services/orderService');

const mockOrders = [
  {
    _id: 'ord-1',
    status: 'PLANIFIE',
    createdAt: '2026-11-25T08:00:00Z',
    items: [
      {
        _id: 'it-1',
        productId: { name: 'Boîtier A', reference: 'PRD-1' },
        quantity: 2,
        snapshot: [{ materialId: 'm1', reference: 'MAT-1', name: 'Acier', unit: 'kg', quantityPerUnit: 5 }],
      },
    ],
  },
];

describe('OperatorOrdersPage — Cycle de fabrication', () => {
  beforeEach(() => {
    orderService.getMyOrders.mockResolvedValue({ data: { orders: mockOrders } });
  });

  it('démarre un ordre avec succès après confirmation', async () => {
    orderService.start.mockResolvedValue({ data: { success: true } });

    render(<OperatorOrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('Boîtier A')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /démarrer la fabrication/i }));
    expect(screen.getByText('10 kg')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /confirmer et démarrer/i }));

    await waitFor(() => {
      expect(orderService.start).toHaveBeenCalledWith('ord-1');
    });
  });

  it("affiche l'erreur de stock insuffisant renvoyée par l'API", async () => {
    orderService.start.mockRejectedValue({
      response: {
        data: {
          message: 'stock insuffisant pour la matière MAT-1 (Acier). disponible: 4, requis: 10',
        },
      },
    });

    render(<OperatorOrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('Boîtier A')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /démarrer la fabrication/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirmer et démarrer/i }));

    await waitFor(() => {
      expect(screen.getByText('Stock insuffisant')).toBeInTheDocument();
      expect(screen.getByText(/disponible: 4, requis: 10/i)).toBeInTheDocument();
    });
  });
});
