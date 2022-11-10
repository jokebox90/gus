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
      const local = {
        status: "connected",
        username: action.payload.username,
      };

      localStorage.setItem("gus:local", JSON.stringify(local));
      state = _.assign(state, local);
    },

    disconnected: (state) => {
      localStorage.setItem("gus:local", JSON.stringify(initialState));
      _.assign(state, initialState);
    },

    synchronized: (state) => {
      const local = JSON.parse(localStorage.getItem("gus:local"));
      _.assign(state, local);
    },
  },
});

export const { connected, disconnected, synchronized } = authSlice.actions;

export const selectUser = (state) => state.auth;

export default authSlice.reducer;
