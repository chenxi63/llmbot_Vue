import Vue from 'vue'
import VueRouter from 'vue-router'
import HomePage from '../views/HomePage.vue'
import RegisterPage from '../views/auth/RegisterPage.vue'
import UserPage from '../views/user/UserPage.vue'
import RechargePage from '../views/user/RechargePage.vue'
import LogoutPage from '../views/user/LogoutPage.vue'
import ManagePage from '@/views/manage/ManagePage.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',  // 根路径
    redirect: '/home'  // 重定向到home页面
  },
  {
    path: '/home',  // 外部访问url路径
    name: 'HomePage',  //内部页面通过name跳转
    component: HomePage  //导入的组件名
  },
  {
    path: '/register',
    name: 'RegisterPage',
    component: RegisterPage
  },
  {
    path: '/user',
    name: 'UserPage',
    component: UserPage
  },
  {
    path: '/recharge',
    name: 'RechargePage',
    component: RechargePage
  },
  {
    path: '/logout',
    name: 'LogoutPage',
    component: LogoutPage
  },
  {
    path: '/manage',
    name: 'ManagePage',
    component: ManagePage
  },
  {
    path: '/index',
    redirect: '/home'
  },
  {
    path: '/index.html',
    redirect: '/home'
  },
  {
    path: '*',  // 捕获所有未匹配的路径
    redirect: '/home'  // 重定向到home页面
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 添加路由守卫来监控路由变化
router.beforeEach((to, from, next) => {
  // 如果是从home页面意外跳转到logout页面，阻止跳转
  if (from.path === '/home' && to.path === '/logout') {
    next(false); // 阻止导航
    return;
  }
  
  next();
});

export default router