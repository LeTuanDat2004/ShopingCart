<template>
  <div id="app">
    <div class="container">
      <div class="columns">
        <div class="column is-3">
          <CartList />
        </div>
        <div class="column is-9">
          <ProductList />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import CartList from "./components/cart/CartList.vue";
import ProductList from "./components/product/ProductList.vue";
export default {
  name: "App",
  components: {
    CartList,
    ProductList,
  },
};
</script>
