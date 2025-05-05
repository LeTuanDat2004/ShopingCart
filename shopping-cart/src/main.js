import { createApp } from "vue";
import App from "./App.vue";
import "bulma";
import store from "../src/store/index";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUser } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import "@fortawesome/fontawesome-free/css/all.min.css";
import router from "./router";

// Add icons to the library
library.add(faUser);

const app = createApp(App);
app.use(store);
app.use(router);
// Register the FontAwesomeIcon component globally
// app.component('font-awesome-icon', FontAwesomeIcon)

app.mount("#app");
