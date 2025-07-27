import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { useAuth } from '../AuthContext';

// Mock the AuthContext
jest.mock('../AuthContext');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null })
}));

describe('Login Component', () => {
  let mockLogin, mockLoginAsGuest;

  beforeEach(() => {
    mockLogin = jest.fn();
    mockLoginAsGuest = jest.fn();
    mockNavigate.mockClear();

    useAuth.mockReturnValue({
      login: mockLogin,
      loginAsGuest: mockLoginAsGuest,
      user: null,
      loading: false
    });
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  describe('Critical Functionality', () => {
    test('shows validation errors for empty fields', async () => {
      renderLogin();

      await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    test('shows error for invalid email format', async () => {
      renderLogin();

      // Use placeholder text to find the email input
      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      await userEvent.type(emailInput, 'invalid-email');
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });

    test('successful login calls auth function', async () => {
      mockLogin.mockResolvedValue();

      renderLogin();

      // Use placeholder text to find inputs
      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    test('guest login works', async () => {
      renderLogin();

      await userEvent.click(screen.getByText(/continue as guest/i));

      expect(mockLoginAsGuest).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });

    test('password visibility toggle works', async () => {
      renderLogin();

      // Find password input by placeholder and toggle button by aria-label
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      expect(passwordInput).toHaveAttribute('type', 'password');

      await userEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      await userEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('shows loading state during submission', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderLogin();

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByText('Signing In...')).toBeInTheDocument();
    });

    test('handles login errors', async () => {
      const error401 = new Error('Unauthorized');
      error401.response = { status: 401 };
      mockLogin.mockRejectedValue(error401);

      renderLogin();

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
      });
    });
  });
});