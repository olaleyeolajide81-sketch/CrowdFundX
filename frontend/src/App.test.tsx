import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders CrowdFundX app', () => {
  render(<App />);
  const linkElement = screen.getByText(/CrowdFundX/i);
  expect(linkElement).toBeInTheDocument();
});
