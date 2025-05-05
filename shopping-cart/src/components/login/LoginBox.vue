<template>
  <div class="login-box box has-text-centered">
    <h2 class="title">Fullstack Clothing</h2>
    <button
      class="button is-primary"
      @click="performLogin"
      :class="{ 'is-loading': loading }"
      :disabled="loading"
    >
      Login
    </button>
    <p v-if="loginError" class="has-text-danger mt-2">
      Login failed. Please try again.
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

const store = useStore();
const router = useRouter();

// Trạng thái lỗi cục bộ
const loginError = ref(false);

// Lấy trạng thái loading từ store (với namespace)
const loading = computed(() => store.getters["login/loading"]); // Giả sử có getter 'loading'

const performLogin = async () => {
  loginError.value = false; // Reset lỗi
  try {
    // Dispatch action login và chờ nó hoàn thành
    await store.dispatch("login/loginAction"); // Đổi tên action nếu khác
    // Chuyển hướng đến trang products sau khi login thành công
    router.push("/products");
  } catch (error) {
    console.error("Login failed:", error);
    loginError.value = true; // Hiển thị lỗi
  }
};
</script>

<style scoped>
.login-box {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
}
.mt-2 {
  margin-top: 0.5rem;
}
</style>
