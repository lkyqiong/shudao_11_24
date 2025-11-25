import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login',
  },
  // ==================== 认证相关路由 ====================
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
  },
  // ==================== 首页路由 ====================
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/HomeLayout.vue'),
  },
  // ==================== 古迹篇路由 ====================
  {
    path: '/heritage',
    name: 'Heritage',
    component: () => import('@/views/heritage/HeritageLayout.vue'),
  },
  // ==================== 新景篇路由 ====================
  {
    path: '/scenery',
    name: 'Scenery',
    component: () => import('@/views/scenery/SceneryLayout.vue'),
  },
  // ==================== 脉络篇路由 ====================
  {
    path: '/network',
    name: 'Network',
    component: () => import('@/views/network/NetworkLayout.vue'),
  },
  // ==================== 行迹篇路由 ====================
  {
    path: '/route',
    name: 'Route',
    component: () => import('@/views/route/RouteLayout.vue'),
  },
  // ==================== 用户中心路由 ====================
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/user/Profile.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// 路由守卫：检查登录状态
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  // 需要登录的页面
  const requiresAuth = !['Login', 'Register'].includes(to.name as string);

  if (requiresAuth && !isLoggedIn) {
    // 未登录，跳转到登录页
    next('/login');
  } else if ((to.name === 'Login' || to.name === 'Register') && isLoggedIn) {
    // 已登录，访问登录/注册页时跳转到首页
    next('/home');
  } else {
    next();
  }
});

export default router;
