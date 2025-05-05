import axios from "axios"; // Import axios

const state = () => ({
  productItems: [],
  loading: false, // Thêm trạng thái loading nếu cần
  error: null, // Thêm trạng thái lỗi nếu cần
});

const mutations = {
  UPDATE_PRODUCT_ITEMS(state, payload) {
    state.productItems = payload;
  },
  SET_PRODUCT_LOADING(state, isLoading) {
    state.loading = isLoading;
  },
  SET_PRODUCT_ERROR(state, error) {
    state.error = error;
  },
};

const actions = {
  async getProductItems({ commit, rootState }) {
    // Lấy token từ login module state
    const token = rootState.login.token;
    if (!token) {
      console.warn("[Product Actions] No token, cannot fetch products.");
      commit("SET_PRODUCT_ERROR", "Authentication required");
      // Có thể dispatch logout hoặc yêu cầu đăng nhập lại
      return;
    }

    commit("SET_PRODUCT_LOADING", true); // Báo bắt đầu tải
    commit("SET_PRODUCT_ERROR", null); // Xóa lỗi cũ
    console.log("[Product Actions] Fetching products with token...");

    try {
      // Gọi API thật bằng axios, truyền token qua params
      const response = await axios.get("/api/products", {
        params: { token: token },
      });
      commit("UPDATE_PRODUCT_ITEMS", response.data); // Cập nhật state
      console.log("[Product Actions] Products fetched successfully.");
    } catch (error) {
      console.error(
        "[Product Actions] Error fetching products:",
        error.response?.data || error.message
      );
      commit(
        "SET_PRODUCT_ERROR",
        error.response?.data?.message || "Failed to fetch products"
      );
      // Xử lý lỗi xác thực (ví dụ: token hết hạn)
      if (error.response && error.response.status === 401) {
        // Cần dispatch action logout ở module login
        // Lưu ý cách dispatch action của module khác: { root: true }
        // dispatch('login/logoutAction', null, { root: true }); // Cần import { dispatch } nếu dùng cách này
        // Hoặc component sẽ xử lý chuyển hướng dựa trên lỗi
      }
    } finally {
      // Luôn commit loading false dù thành công hay thất bại
      commit("SET_PRODUCT_LOADING", false);
    }
  },
};

const getters = {
  productItems: (state) => state.productItems,
  productLoading: (state) => state.loading, // Thêm getter nếu cần
  productError: (state) => state.error, // Thêm getter nếu cần
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
