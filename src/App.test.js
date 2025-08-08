import { render, screen } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => element,
  Link: ({ children }) => <a>{children}</a>,
  useNavigate: () => jest.fn(),
  Navigate: ({ to }) => <div>navigate-{to}</div>,
}), { virtual: true });

jest.mock('lucide-react', () => new Proxy({}, { get: () => () => null }), { virtual: true });

import App from './App';

test('renders landing banner', () => {
  render(<App />);
  const heading = screen.getByText(/Welcome to One Doctor App/i);
  expect(heading).toBeInTheDocument();
});
