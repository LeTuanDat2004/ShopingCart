import { createStore } from "vuex";
import productModule from "./modules/product";
import cartModule from "./modules/cart";
import loginModule from "./modules/login/login"; // <-- Import module login

const store = createStore({
  modules: {
    product: productModule,
    cart: cartModule,
    login: loginModule, // <-- Đăng ký module login
  },
});

export default store;
