import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Layout from '../pages/Layout';
import Map from '../pages/Map/Map';

test('header of map', () => {
  render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Map />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
  const linkElement = screen.getByText(/UF Cat Tracker/i);
  expect(linkElement).toBeInTheDocument();
});
