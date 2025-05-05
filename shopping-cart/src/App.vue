<template>
  <div id="app-container">
    <!-- Navigation chỉ hiển thị khi đã đăng nhập -->
    <nav class="navigation-buttons" v-if="isAuthenticated">
      <router-link to="/products" class="nav-link">
        <font-awesome-icon :icon="faStore" /> Shop
      </router-link>
      <router-link to="/cart" class="nav-link cart-link">
        <font-awesome-icon :icon="faShoppingCart" />
        <span v-if="cartQuantity > 0" class="cart-count">{{
          cartQuantity
        }}</span>
      </router-link>
      <button @click="performLogout" class="button is-text is-pulled-right">
        Logout
      </button>
    </nav>

    <div class="layout">
      <!-- Nội dung trang sẽ được render ở đây -->
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { computed, watch } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faStore, faShoppingCart } from "@fortawesome/free-solid-svg-icons"; // Import icon cần dùng

const store = useStore();
const router = useRouter();

// Lấy các getters cần thiết
const isAuthenticated = computed(() => store.getters["login/isAuthenticated"]);
const cartQuantity = computed(() => store.getters["cart/cartQuantity"]);
const token = computed(() => store.getters["login/token"]); // Để watch

// Hàm logout
const performLogout = async () => {
  try {
    await store.dispatch("login/logoutAction");
    // Chuyển về trang login sau khi logout thành công
    router.push("/login");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

// Hàm cập nhật state ban đầu (tương tự trước)
const updateInitialState = (currentToken) => {
  if (currentToken) {
    console.log("Updating initial state with token...");
    store.dispatch("cart/getCartItems"); // Giờ action cart/product sẽ tự lấy token từ state
    store.dispatch("product/getProductItems");
  }
};
onMounted(() => {
  store.dispatch("login/checkAuth");
  // Chỉ gọi fetch dữ liệu nếu ĐÃ xác thực (token hợp lệ)
  // Việc fetch này nên được chuyển vào watch token hoặc làm trong checkAuth nếu cần xác thực token
  // const token = store.getters['login/token'];
  // if (token) {
  //   store.dispatch('cart/getCartItems');
  //   store.dispatch('product/getProductItems');
  // }
});

// Watch token thay đổi (khi đăng nhập/logout) để fetch dữ liệu
watch(token, (newToken, oldToken) => {
  console.log("Token changed:", oldToken, "->", newToken);
  if (newToken && !oldToken) {
    // Chỉ fetch khi vừa đăng nhập (từ null -> có token)
    updateInitialState(newToken);
  }
  // Không cần fetch lại nếu logout (token -> null)
});

// Không cần created() để fetch nữa vì guard sẽ chuyển hướng nếu chưa login,
// và watch token sẽ fetch khi vừa login xong.
// Nếu muốn fetch ngay khi App tạo ra *và* đã có token (duy trì đăng nhập):
// import { onMounted } from 'vue';
// onMounted(() => {
//    const existingToken = store.getters['login/token']; // Lấy token từ store
//    if (existingToken) {
//        updateInitialState(existingToken);
//    }
// });
</script>

<style>
/* ... styles ... */
</style>
