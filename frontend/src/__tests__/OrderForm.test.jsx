import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrderForm from '../components/admin/OrderForm';
import userService from '../services/userService';
import productService from '../services/productService';
import materialService from '../services/materialService';

vi.mock('../services/userService');
vi.mock('../services/productService');
vi.mock('../services/materialService');
vi.mock('../services/orderService');

describe('OrderForm — Calcul agrégé des besoins multi-produits', () => {
  beforeEach(() => {
    userService.getAll.mockResolvedValue({
      data: { data: [{ _id: 'op1', name: 'Karim', email: 'karim@ff.ma', role: 'OPERATOR' }] },
    });
    materialService.getAll.mockResolvedValue({
      data: {
        data: [
          { _id: 'm1', name: 'Acier', unit: 'kg', quantity: 50 },
          { _id: 'm2', name: 'Vis M6', unit: 'pcs', quantity: 10 },
        ],
      },
    });
    productService.getAll.mockResolvedValue({
      data: {
        Products: [
          {
            _id: 'p1',
            reference: 'PRD-1',
            name: 'Boîtier A',
            composition: [
              { materialId: 'm1', quantity: 5 },
              { materialId: 'm2', quantity: 4 },
            ],
          },
          {
            _id: 'p2',
            reference: 'PRD-2',
            name: 'Couvercle B',
            composition: [{ materialId: 'm1', quantity: 3 }],
          },
        ],
      },
    });
  });

  it('agrège les besoins matières sur plusieurs produits et signale les manques', async () => {
    render(<OrderForm onClose={vi.fn()} onSaved={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('[PRD-1] Boîtier A')).toBeInTheDocument();
    });

    // Sélectionne Produit 1 (qté 3 => Acier: 15kg, Vis M6: 12pcs > 10 dispo => Insuffisant)
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'p1' } });
    const qtyInput = screen.getByRole('spinbutton');
    fireEvent.change(qtyInput, { target: { value: '3' } });

    // Ajoute Produit 2 (qté 2 => Acier: +6kg => Total Acier: 21kg <= 50 dispo => Suffisant)
    fireEvent.click(screen.getByRole('button', { name: /ajouter un produit/i }));
    const updatedSelects = screen.getAllByRole('combobox');
    fireEvent.change(updatedSelects[2], { target: { value: 'p2' } });
    const qtyInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(qtyInputs[1], { target: { value: '2' } });

    await waitFor(() => {
      expect(screen.getByText('21 kg')).toBeInTheDocument();
      expect(screen.getByText('12 pcs')).toBeInTheDocument();
      expect(screen.getByText('Suffisant')).toBeInTheDocument();
      expect(screen.getByText('Insuffisant')).toBeInTheDocument();
    });
  });
});
