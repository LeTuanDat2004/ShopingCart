<template>
  <div>
    <p class="cart-item--title is-inline">{{ cartItem.title }}</p>
    <div class="is-pulled-right">
      <i
        @click="addCartItem(cartItem)"
        class="fa fa-arrow-circle-up cart-item--modify"
      ></i>
      <i
        @click="removeCartItem(cartItem)"
        class="fa fa-arrow-circle-down cart-item--modify"
      ></i>
    </div>
    <div class="cart-item--content">
      <span class="cart-item--price has-text-primary has-text-weight-bold">
        {{ cartItem.price }}$ each
      </span>
      <span class="cart-item--quantity has-text-grey is-pulled-right">
        Quantity: {{ cartItem.quantity }}
      </span>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "CartListItem",
  props: ["cartItem"],
  methods: {
    ...mapActions("cart", ["addCartItem", "removeCartItem"]),
  },
};
</script>

<style scoped>
.cart-item--modify {
  cursor: pointer;
}
</style>
