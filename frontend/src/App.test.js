import { render, screen } from '@testing-library/react';
import App from './App';

test('renders loading internships text', () => {
  render(<App />);
  const loadingElement = screen.getByText(/loading internships/i);
  expect(loadingElement).toBeInTheDocument();
});