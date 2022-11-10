// frontend/src/components/Login/AuthSlice.js

import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";

const initialState = {
  status: "not-connected",
  username: "anonyme",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    connected: (state, action) => {
      state = _.assign(state, {
        status: "connected",
        username: action.payload.username,
      });
    },

    disconnected: (state) => {
      _.assign(state, initialState);
    },
  },
});

export const { connected, disconnected } = authSlice.actions

export const selectUser = (state) => state.auth;

export default authSlice.reducer;
