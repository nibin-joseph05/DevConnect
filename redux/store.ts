import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import authSlice from './slices/authSlice';
import customerSlice from './slices/customerSlice';
import leadSlice from './slices/leadSlice';

// Redux persist configuration for authentication state
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist authentication state
};

// Combine all reducers
const rootReducer = combineReducers({
  auth: authSlice,
  customers: customerSlice,
  leads: leadSlice,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with middleware
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Create persistor for AsyncStorage
export const persistor = persistStore(store);

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;