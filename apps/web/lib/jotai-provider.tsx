"use client";

import { Provider } from 'jotai';
import { createStore } from 'jotai';
import { ReactNode } from 'react';

// Create a single store instance
const store = createStore();

interface JotaiProviderProps {
  children: ReactNode;
}

export function JotaiProvider({ children }: JotaiProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}
