// frontend/src/store.js

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";

const rootReducer = combineReducers({
  auth: authReducer,
})

export const store = configureStore({
  reducer: rootReducer,
});
