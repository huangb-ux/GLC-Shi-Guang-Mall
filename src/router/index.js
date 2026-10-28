import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import SearchView from '../views/SearchView.vue';
import ItemView from '../views/ItemView.vue';
import PublishView from '../views/PublishView.vue';
import MeView from '../views/MeView.vue';
import FavoritesView from '../views/FavoritesView.vue';
import MessagesView from '../views/MessagesView.vue';
import AboutView from '../views/AboutView.vue';
import NotFoundView from '../views/NotFoundView.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: '逛集市' } },
  { path: '/search', name: 'search', component: SearchView, meta: { title: '逛集市' } },
  { path: '/item/:id', name: 'item', component: ItemView, meta: { title: '商品详情' } },
  { path: '/publish', name: 'publish', component: PublishView, meta: { title: '发布闲置' } },
  { path: '/me', name: 'me', component: MeView, meta: { title: '个人中心' } },
  { path: '/favorites', name: 'favorites', component: FavoritesView, meta: { title: '我的收藏' } },
  { path: '/messages', name: 'messages', component: MessagesView, meta: { title: '消息' } },
  { path: '/about', name: 'about', component: AboutView, meta: { title: '关于拾光集' } },
  { path: '/:pathMatch(.*)*', name: 'notfound', component: NotFoundView, meta: { title: '页面不存在' } }
];

const router = createRouter({
  // GitHub Pages 是静态托管，用 hash 路由不需要配置 404 重写。
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

router.afterEach(to => {
  const title = to.meta.title ? `${to.meta.title} · 拾光集` : '拾光集 · 桂林学院校园二手集市';
  document.title = title;
});

export default router;
