import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api";

const LOCAL_KEY = "car_wishlist_ids";

function readLocalIds() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(Number).filter((n) => n > 0) : [];
  } catch {
    return [];
  }
}

function writeLocalIds(ids) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
}

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (_, { getState }) => {
    const token = getState().auth.token;
    if (!token) {
      return { ids: readLocalIds(), items: [] };
    }
    const { data } = await api.get("/api/users/me/wishlist");
    return {
      ids: data.ids || [],
      items: data.data || [],
    };
  }
);

export const syncWishlistFromLocal = createAsyncThunk(
  "wishlist/syncLocal",
  async (_, { getState }) => {
    const token = getState().auth.token;
    if (!token) return { ids: readLocalIds() };
    const local = readLocalIds();
    if (local.length > 0) {
      await api.post("/api/users/me/wishlist/sync", { carIds: local });
      localStorage.removeItem(LOCAL_KEY);
    }
    const { data } = await api.get("/api/users/me/wishlist");
    return { ids: data.ids || [], items: data.data || [] };
  }
);

export const toggleWishlist = createAsyncThunk(
  "wishlist/toggle",
  async (carId, { getState }) => {
    const id = Number(carId);
    const token = getState().auth.token;
    const current = getState().wishlist.ids;

    if (token) {
      if (current.includes(id)) {
        await api.delete(`/api/users/me/wishlist/${id}`);
      } else {
        await api.post(`/api/users/me/wishlist/${id}`);
      }
      const { data } = await api.get("/api/users/me/wishlist");
      return { ids: data.ids || [], items: data.data || [] };
    }

    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    writeLocalIds(next);
    return { ids: next };
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    ids: readLocalIds(),
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearWishlist: (state) => {
      state.ids = [];
      state.items = [];
      localStorage.removeItem(LOCAL_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.ids = action.payload.ids;
        state.items = action.payload.items || state.items;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.ids = readLocalIds();
      })
      .addCase(syncWishlistFromLocal.fulfilled, (state, action) => {
        state.ids = action.payload.ids;
        state.items = action.payload.items || [];
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.ids = action.payload.ids;
        if (action.payload.items) {
          state.items = action.payload.items;
        }
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
