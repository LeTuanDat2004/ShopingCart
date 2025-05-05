import { createRouter, createWebHistory } from "vue-router";
import store from "../store"; // Import store để kiểm tra trạng thái đăng nhập

// Import các component sẽ dùng làm trang
import ProductList from "../components/product/ProductList.vue";
import ProductItem from "../components/product/ProductItem.vue";
import CartList from "../components/cart/CartList.vue";
import LoginBox from "../components/login/LoginBox.vue";
import NotFound from "../components/NotFound.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: LoginBox,
    // Guard: Nếu đã đăng nhập thì chuyển về trang sản phẩm
    beforeEnter: (to, from, next) => {
      if (store.getters["login/isAuthenticated"]) {
        next("/products");
      } else {
        next(); // Cho phép vào trang login
      }
    },
  },
  {
    // Route gốc chuyển hướng về products nếu đã login, về login nếu chưa
    path: "/",
    redirect: () => {
      return store.getters["login/isAuthenticated"] ? "/products" : "/login";
    },
  },
  {
    path: "/products",
    name: "ProductList",
    component: ProductList,
    meta: { requiresAuth: true }, // Đánh dấu route này cần đăng nhập
  },
  {
    path: "/products/:id", // Route động cho chi tiết sản phẩm
    name: "ProductDetail",
    component: ProductItem,
    props: true, // Cho phép truyền :id vào làm prop cho component
    meta: { requiresAuth: true }, // Cũng cần đăng nhập
    // Guard kiểm tra ID hợp lệ (ví dụ)
    // beforeEnter: (to, from, next) => { ... kiểm tra to.params.id ... }
  },
  {
    path: "/cart",
    name: "Cart",
    component: CartList,
    meta: { requiresAuth: true }, // Cần đăng nhập
  },
  {
    path: "/:pathMatch(.*)*", // Bắt tất cả các route không khớp (404)
    name: "NotFound",
    component: NotFound,
    // Không cần requiresAuth cho trang 404
  },
];

const router = createRouter({
  history: createWebHistory(), // History mode
  routes,
});

// Global Navigation Guard - Chạy trước mỗi lần chuyển route
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const isAuthenticated = store.getters["login/isAuthenticated"]; // Kiểm tra trạng thái đăng nhập từ store

  if (requiresAuth && !isAuthenticated) {
    // Nếu route yêu cầu đăng nhập mà người dùng chưa đăng nhập
    next("/login"); // Chuyển hướng về trang login
  } else {
    next(); // Cho phép đi tiếp
  }
});

export default router;
