import axios from "axios";

const state = () => ({
  cartItems: [],
  loading: false, // Có thể thêm loading/error riêng cho cart
  error: null,
});

const mutations = {
  UPDATE_CART_ITEMS(state, payload) {
    state.cartItems = payload;
  },
  SET_CART_LOADING(state, isLoading) {
    state.loading = isLoading;
  },
  SET_CART_ERROR(state, error) {
    state.error = error;
  },
  // Không cần các mutation riêng cho add/remove vì server luôn trả về cart mới
};

const actions = {
  async getCartItems({ commit, rootState }) {
    const token = rootState.login.token;
    if (!token) {
      console.warn("[Cart Actions] No token, cannot fetch cart.");
      commit("SET_CART_ERROR", "Authentication required");
      // commit('UPDATE_CART_ITEMS', []); // Có thể reset cart về rỗng
      return;
    }
    commit("SET_CART_LOADING", true);
    commit("SET_CART_ERROR", null);
    console.log("[Cart Actions] Fetching cart items...");
    try {
      const response = await axios.get("/api/cart", { params: { token } });
      commit("UPDATE_CART_ITEMS", response.data);
      console.log("[Cart Actions] Cart fetched.");
    } catch (error) {
      console.error(
        "[Cart Actions] Error fetching cart:",
        error.response?.data || error.message
      );
      commit(
        "SET_CART_ERROR",
        error.response?.data?.message || "Failed to fetch cart"
      );

      if (error.response && error.response.status === 401) {
        // dispatch('login/logoutAction', null, { root: true });
      }
    } finally {
      commit("SET_CART_LOADING", false);
    }
  },

  async addCartItem({ commit, rootState }, product) {
    const token = rootState.login.token;
    if (!token) return Promise.reject("Authentication required"); // Trả về lỗi

    commit("SET_CART_LOADING", true); // Có thể set loading khi thao tác
    commit("SET_CART_ERROR", null);
    console.log("[Cart Actions] Adding item via API:", product);
    try {
      // Gửi yêu cầu POST, data là product, token trong params
      const response = await axios.post("/api/cart", product, {
        params: { token },
      });
      commit("UPDATE_CART_ITEMS", response.data); // Cập nhật state bằng response từ server
      console.log("[Cart Actions] Item added, cart updated from server.");
      return Promise.resolve(); // Báo thành công
    } catch (error) {
      console.error(
        "[Cart Actions] Error adding item:",
        error.response?.data || error.message
      );
      commit(
        "SET_CART_ERROR",
        error.response?.data?.message || "Failed to add item"
      );
      if (error.response && error.response.status === 401) {
        // dispatch('login/logoutAction', null, { root: true });
      }
      return Promise.reject(error); // Báo thất bại
    } finally {
      commit("SET_CART_LOADING", false);
    }
  },

  async removeCartItem({ commit, rootState }, product) {
    const token = rootState.login.token;
    if (!token) return Promise.reject("Authentication required");

    commit("SET_CART_LOADING", true);
    commit("SET_CART_ERROR", null);
    console.log("[Cart Actions] Removing item via API:", product);
    try {
      // Gửi yêu cầu POST đến /api/cart/delete
      const response = await axios.post("/api/cart/delete", product, {
        params: { token },
      });
      commit("UPDATE_CART_ITEMS", response.data);
      console.log(
        "[Cart Actions] Item removed/decreased, cart updated from server."
      );
      return Promise.resolve();
    } catch (error) {
      console.error(
        "[Cart Actions] Error removing item:",
        error.response?.data || error.message
      );
      commit(
        "SET_CART_ERROR",
        error.response?.data?.message || "Failed to remove item"
      );
      if (error.response && error.response.status === 401) {
        // dispatch('login/logoutAction', null, { root: true });
      }
      return Promise.reject(error);
    } finally {
      commit("SET_CART_LOADING", false);
    }
  },

  async removeAllCartItems({ commit, rootState }) {
    const token = rootState.login.token;
    if (!token) return Promise.reject("Authentication required");

    commit("SET_CART_LOADING", true);
    commit("SET_CART_ERROR", null);
    console.log("[Cart Actions] Clearing cart via API...");
    try {
      // Gửi yêu cầu POST đến /api/cart/delete/all
      const response = await axios.post(
        "/api/cart/delete/all",
        {},
        { params: { token } }
      ); // Không cần gửi data body
      commit("UPDATE_CART_ITEMS", response.data); // Nên là mảng rỗng
      console.log("[Cart Actions] Cart cleared, updated from server.");
      return Promise.resolve();
    } catch (error) {
      console.error(
        "[Cart Actions] Error clearing cart:",
        error.response?.data || error.message
      );
      commit(
        "SET_CART_ERROR",
        error.response?.data?.message || "Failed to clear cart"
      );
      if (error.response && error.response.status === 401) {
        // dispatch('login/logoutAction', null, { root: true });
      }
      return Promise.reject(error);
    } finally {
      commit("SET_CART_LOADING", false);
    }
  },
};

const getters = {
  cartItems: (state) => state.cartItems,
  cartQuantity: (state) =>
    state.cartItems.reduce((sum, item) => sum + item.quantity, 0),
  cartTotal: (state) => {
    return state.cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  },
  cartLoading: (state) => state.loading, // Thêm getter nếu cần
  cartError: (state) => state.error, // Thêm getter nếu cần
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
