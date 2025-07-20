// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slices/counterSlices';

export const store = configureStore({
  reducer: {
    counter: counterReducer
  }
});
