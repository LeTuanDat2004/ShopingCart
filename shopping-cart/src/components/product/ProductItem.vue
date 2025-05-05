<template>
  <section v-if="product" class="product-item box">
    <!-- Nút quay lại -->
    <span class="return-icon" @click="$router.go(-1)" title="Go Back">
      <font-awesome-icon :icon="faArrowLeft" />
    </span>
    <div class="product-item__details">
      <h1 class="title is-4">{{ product.title }}</h1>
      <!-- Hiển thị thêm chi tiết: type, description, created_at -->
      <span class="tag product-item__tag">{{ product.product_type }}</span>
      <p class="product-item__description">{{ product.description }}</p>
      <p v-if="product.created_at" class="product-item__created_at">
        Founded:
        <span class="has-text-weight-bold">{{ product.created_at }}</span>
      </p>
      <button
        class="button is-primary product-item__button"
        @click="addAndGoToCart(product)"
      >
        <font-awesome-icon :icon="faCartPlus" /> Add to Cart
      </button>
    </div>
    <!-- <div class="product-item__image">
      <img :src="getImageUrl(product.image_tag)" :alt="product.title" />
    </div> -->
  </section>
  <div v-else>Loading product details or product not found...</div>
</template>

<script setup>
import { computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faArrowLeft, faCartPlus } from "@fortawesome/free-solid-svg-icons";

const store = useStore();
const route = useRoute();
const router = useRouter();

// Lấy ID từ route param
const productId = computed(() => Number(route.params.id));

// Getter trả về hàm để lấy product theo ID
const getProductById = computed(
  () => store.getters["product/productItemFromId"]
);
// Lấy product cụ thể dựa trên ID từ route
const product = computed(() => getProductById.value(productId.value));

// // Hàm lấy URL ảnh (tương tự CartListItem)
// const getImageUrl = (imageTag) => {
//   // logic lấy URL ảnh
//   return ""; // Tạm
// };

// Hàm thêm vào giỏ và chuyển hướng
const addAndGoToCart = async (productToAdd) => {
  try {
    // Dispatch action và chờ nó hoàn thành (nếu action trả về Promise)
    await store.dispatch("cart/addCartItem", productToAdd);
    // Chuyển hướng đến trang giỏ hàng
    router.push("/cart");
  } catch (error) {
    console.error("Failed to add item and navigate:", error);
  }
};

// Đảm bảo danh sách sản phẩm đã được tải (nếu người dùng vào thẳng trang này)
onMounted(() => {
  if (!product.value && store.state.product.productItems.length === 0) {
    console.log("ProductItem mounted, fetching all products...");
    store.dispatch("product/getProductItems"); // Cần token nếu API yêu cầu
  }
});

// Theo dõi nếu productItems thay đổi (sau khi fetch) để đảm bảo product được cập nhật
watch(
  () => store.state.product.productItems,
  (newItems) => {
    if (!product.value && newItems.length > 0) {
      console.log("Product list updated, trying to find product again...");
    }
  }
);
</script>

<style scoped>
/* CSS cho trang chi tiết sản phẩm */
.product-item {
  display: flex;
  position: relative;
}
.product-item__details {
  flex: 1;
  padding-right: 20px;
}
/* .product-item__image img {
  max-width: 250px;
  max-height: 250px;
  object-fit: contain;
} */
.return-icon {
  position: absolute;
  top: 15px;
  left: 15px;
  cursor: pointer;
  color: #3273dc;
  font-size: 1.2em;
}
.product-item__tag {
  margin-left: 10px;
  vertical-align: middle;
}
.product-item__description,
.product-item__created_at {
  margin: 10px 0;
}
.product-item__button {
  margin-top: 15px;
}
.product-item__button svg {
  margin-right: 5px;
}
</style>
