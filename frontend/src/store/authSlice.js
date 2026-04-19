import { createSlice } from "@reduxjs/toolkit";
import { TOKEN_KEY, USER_KEY } from "../authStorage";

function readPersistedAuth() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    const user = raw ? JSON.parse(raw) : null;
    return { token: token || null, user };
  } catch {
    return { token: null, user: null };
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState: readPersistedAuth(),
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
