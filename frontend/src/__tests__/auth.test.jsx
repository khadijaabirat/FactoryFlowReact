import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';
import LoginPage from '../pages/auth/LoginPage';

describe('Authentification & ProtectedRoute', () => {
  it('redirige vers /login si non authentifié', () => {
    render(
      <AuthContext.Provider value={{ isAuthenticated: false, loading: false }}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/login" element={<div>Page Login</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<div>Espace Admin</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Page Login')).toBeInTheDocument();
  });

  it('affiche le contenu protégé si authentifié', () => {
    render(
      <AuthContext.Provider value={{ isAuthenticated: true, loading: false }}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/login" element={<div>Page Login</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<div>Espace Admin</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Espace Admin')).toBeInTheDocument();
  });

  it('appelle login et redirige un ADMIN vers /admin', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ role: 'ADMIN', name: 'Admin Test' });

    render(
      <AuthContext.Provider value={{ login: mockLogin, isAuthenticated: false, loading: false }}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<div>Dashboard Admin</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText('ex: operateur@factoryflow.com'), {
      target: { value: 'admin@factoryflow.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@factoryflow.com', 'password123');
      expect(screen.getByText('Dashboard Admin')).toBeInTheDocument();
    });
  });
});
