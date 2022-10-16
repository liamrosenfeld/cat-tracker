import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../pages/Home';

test('example home test', () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
  const linkElement = screen.getByText(/This is the home page/i);
  expect(linkElement).toBeInTheDocument();
});
