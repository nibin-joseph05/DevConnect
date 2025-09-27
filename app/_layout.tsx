import { Slot } from 'expo-router';
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from '../redux/store';

/**
 * Root layout component
 * Provides Redux store and persistence to the entire app
 * Wraps all child pages with Redux Provider and PersistGate for state persistence
 */
export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Slot />
      </PersistGate>
    </Provider>
  );
}