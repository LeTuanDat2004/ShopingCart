import axios from "axios";

const initialToken = localStorage.getItem("authToken");

const state = () => ({
  token: initialToken || null,
  loading: false,
  error: null,
});

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token;
  },
  SET_LOADING(state, isLoading) {
    state.loading = isLoading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  CLEAR_AUTH(state) {
    state.token = null;
    state.loading = false;
    state.error = null;
  },
};

const actions = {
  async loginAction({ commit }) {
    commit("SET_LOADING", true);
    commit("SET_ERROR", null);
    console.log("[Login Action] Attempting login via API...");
    try {
      // Gọi API thật, không cần gửi data body, không cần token
      const response = await axios.post("/api/login");
      const token = response.data.token;

      if (!token) {
        // Kiểm tra nếu API không trả về token như mong đợi
        throw new Error("Token not received from server");
      }

      localStorage.setItem("authToken", token);
      commit("SET_TOKEN", token);
      console.log("[Login Action] Login successful, token set.");
      // Không cần trả về gì, component tự chuyển hướng
    } catch (error) {
      console.error(
        "[Login Action] Login failed:",
        error.response?.data || error.message
      );
      localStorage.removeItem("authToken");
      commit("CLEAR_AUTH");
      commit("SET_ERROR", error.response?.data?.message || "Login failed");
      throw error; // Ném lỗi để component LoginBox có thể bắt và hiển thị thông báo
    } finally {
      commit("SET_LOADING", false);
    }
  },

  logoutAction({ commit }) {
    return new Promise((resolve) => {
      localStorage.removeItem("authToken");
      commit("CLEAR_AUTH");
      console.log("[Login Action] Logged out.");
      resolve();
    });
  },

  // Action để kiểm tra token khi khởi tạo (có thể gọi từ App.vue)
  checkAuth({ commit }) {
    const token = localStorage.getItem("authToken");
    if (token) {
      console.log(
        "[Login Action] Found token in localStorage, setting in store."
      );
      commit("SET_TOKEN", token);
      // Có thể thêm lệnh gọi API để xác thực token này với server ở đây nếu cần
    } else {
      console.log("[Login Action] No token found in localStorage.");
      commit("CLEAR_AUTH"); // Đảm bảo state sạch nếu không có token
    }
  },
};

const getters = {
  isAuthenticated: (state) => !!state.token,
  loading: (state) => state.loading,
  token: (state) => state.token,
  loginError: (state) => state.error, // Thêm getter cho lỗi login
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
