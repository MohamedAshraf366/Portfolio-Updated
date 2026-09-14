import React from 'react';
import { act, render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./components/Scene3D', () => {
  return function MockScene3D() {
    return null;
  };
});

test('renders the main portfolio sections', async () => {
  await act(async () => {
    render(<App />);
  });

  expect(
    screen.getByRole('heading', { name: /hi, i'm mohamed ashraf/i })
  ).toBeInTheDocument();
  expect(screen.getByText(/available for work/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /my skills/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /my projects/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /let's connect/i })).toBeInTheDocument();
});