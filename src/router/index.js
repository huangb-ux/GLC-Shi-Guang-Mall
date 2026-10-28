import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import SearchView from '../views/SearchView.vue';
import ItemView from '../views/ItemView.vue';
import PublishView from '../views/PublishView.vue';
import MeView from '../views/MeView.vue';
import FavoritesView from '../views/FavoritesView.vue';
import MessagesView from '../views/MessagesView.vue';
import AboutView from '../views/AboutView.vue';
import LoginView from '../views/LoginView.vue';
import SellerView from '../views/SellerView.vue';
import CartView from '../views/CartView.vue';
import OrdersView from '../views/OrdersView.vue';
import AdminView from '../views/AdminView.vue';
import ForumView from '../views/ForumView.vue';
import GamesView from '../views/GamesView.vue';
import NotFoundView from '../views/NotFoundView.vue';
import { market } from '../stores/market';

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: '逛集市' } },
  { path: '/search', name: 'search', component: SearchView, meta: { title: '逛集市' } },
  { path: '/forum', name: 'forum', component: ForumView, meta: { title: '校友论坛' } },
  { path: '/games', name: 'games', component: GamesView, meta: { title: '游戏天地' } },
  { path: '/item/:id', name: 'item', component: ItemView, meta: { title: '商品详情' } },
  { path: '/seller/:id', name: 'seller', component: SellerView, meta: { title: '卖家主页' } },
  { path: '/login', name: 'login', component: LoginView, meta: { title: '登录 / 注册' } },
  { path: '/publish', name: 'publish', component: PublishView, meta: { title: '发布闲置', requiresAuth: true } },
  { path: '/cart', name: 'cart', component: CartView, meta: { title: '购物车', requiresAuth: true } },
  { path: '/orders', name: 'orders', component: OrdersView, meta: { title: '我的订单', requiresAuth: true } },
  { path: '/me', name: 'me', component: MeView, meta: { title: '个人中心', requiresAuth: true } },
  { path: '/favorites', name: 'favorites', component: FavoritesView, meta: { title: '我的收藏', requiresAuth: true } },
  { path: '/messages', name: 'messages', component: MessagesView, meta: { title: '消息', requiresAuth: true } },
  { path: '/admin', name: 'admin', component: AdminView, meta: { title: '管理后台', requiresAdmin: true } },
  { path: '/about', name: 'about', component: AboutView, meta: { title: '关于拾光集' } },
  { path: '/:pathMatch(.*)*', name: 'notfound', component: NotFoundView, meta: { title: '页面不存在' } }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

router.beforeEach(to => {
  if (to.meta.requiresAdmin) {
    if (!market.currentUser) {
      return { name: 'login', query: { redirect: to.fullPath } };
    }
    if (market.currentUser.role !== 'admin') return { name: 'home' };
  }

  if (to.meta.requiresAuth && !market.currentUser) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.name === 'login' && market.currentUser) {
    return market.currentUser.role === 'admin' ? { name: 'admin' } : { name: 'home' };
  }

  return true;
});

router.afterEach(to => {
  const title = to.meta.title ? `${to.meta.title} · 拾光集` : '拾光集 · 桂林学院校园二手集市';
  document.title = title;
});

export default router;
