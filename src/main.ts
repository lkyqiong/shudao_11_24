import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router'; // 引入路由

//createApp(App).mount('#app');
createApp(App)
  .use(router) // 🔑 挂载路由
  .mount('#app');
