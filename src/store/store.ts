import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import userReducer from './slices/userSlice';
import appReducer from './slices/appSlice';
import patientReducer from './slices/patientSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    user: userReducer,
    app: appReducer,
    patients: patientReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
