<template>
  <div id="products" class="box">
    <div class="products--header has-text-centered">
      <i class="fa fa-2x fa-user-circle"></i>
    </div>
    <div class="product-list">
      <div
        v-for="productItem in productItems"
        :key="productItem.id"
        class="product-list--item"
      >
        <ProductListItem :productItem="productItem" />
      </div>
    </div>
    <div class="product-count has-text-right">
      <span class="has-text-weight-bold"># of products: 4</span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ProductListItem from "./ProductListItem.vue";

export default {
  name: "ProductList",
  computed: {
    ...mapGetters("product", ["productItems"]),
  },
  created() {
    this.$store.dispatch("product/getProductItems");
  },
  components: {
    ProductListItem,
  },
};
</script>

<style scoped>
.products--header {
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 15px;
}

.product-list {
  padding-top: 10px;
}

.product-list--item {
  padding: 10px 0;
}
</style>
