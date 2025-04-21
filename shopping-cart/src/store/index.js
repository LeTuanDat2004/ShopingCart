import { createStore } from 'vuex';
import product from './modules/product';
import cart from './modules/cart';

// Create the store
const store = createStore({
  modules: {
    product,
    cart
  }
});

export default store;
