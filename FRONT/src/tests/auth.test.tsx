import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from '../features/auth/LoginPage';
import { authService } from '../features/auth/auth.service';

vi.mock('../features/auth/auth.service');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('LoginPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra error en login fallido', async () => {
    vi.mocked(authService.login).mockRejectedValue({ message: 'Credenciales inválidas' });
    render(<LoginPage />, { wrapper: Wrapper });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));
    await waitFor(() => expect(screen.getByText(/credenciales inválidas/i)).toBeTruthy());
  });

  it('toggle visibilidad contraseña cambia type a text', () => {
    render(<LoginPage />, { wrapper: Wrapper });
    const input = screen.getByLabelText(/contraseña/i);
    expect(input).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByText(/ver/i));
    expect(input).toHaveAttribute('type', 'text');
  });
});
