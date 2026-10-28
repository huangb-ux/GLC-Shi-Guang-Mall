<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Icon from './Icon.vue';
import {
  cartCount,
  clearSearches,
  favoriteCount,
  isAdmin,
  market,
  rememberSearch,
  unreadTotal
} from '../stores/market';
import { POPULAR_SEARCHES, SCHOOL } from '../data/site';

const route = useRoute();
const router = useRouter();

const query = ref('');
const searchOpen = ref(false);
const searchInput = ref(null);
const recent = computed(() => market.searches);
const currentUser = computed(() => market.currentUser);

watch(
  () => route.query.q,
  value => {
    if (route.name === 'search') query.value = String(value || '');
  },
  { immediate: true }
);

function openPanel() {
  searchOpen.value = true;
}

function closePanel() {
  searchOpen.value = false;
}

function submitSearch() {
  const value = query.value.trim();
  rememberSearch(value);
  closePanel();
  router.push({ name: 'search', query: value ? { q: value } : {} });
}

function pickTerm(term) {
  query.value = term;
  rememberSearch(term);
  closePanel();
  router.push({ name: 'search', query: { q: term } });
}

function onInput() {
  if (query.value.trim()) closePanel();
  else openPanel();
}

function handleDocumentClick(event) {
  if (!event.target.closest('.header-search')) closePanel();
}

function handleKeydown(event) {
  const tag = (event.target.tagName || '').toLowerCase();
  const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || event.target.isContentEditable;

  if (event.key === 'Escape') closePanel();

  if ((event.key === '/' || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) && !typing) {
    event.preventDefault();
    if (searchInput.value) {
      searchInput.value.focus();
      openPanel();
    } else {
      router.push({ name: 'search' });
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick);
  document.removeEventListener('keydown', handleKeydown);
});

const isHome = computed(() => route.name === 'home');
const isForum = computed(() => route.name === 'forum');
const isGames = computed(() => route.name === 'games');
const isMessages = computed(() => route.name === 'messages');
const isMe = computed(() => route.name === 'me' || route.name === 'favorites');
</script>

<template>
  <div class="topbar">
    <div class="wrap topbar-inner">
      <span class="topbar-note"><i class="dot"></i>{{ SCHOOL.name }} · 校内实名认证 · 当面验货 · 全场 0 服务费</span>
      <span class="topbar-right">只服务桂林学院 · 校内真实好物</span>
    </div>
  </div>

  <header class="site-header">
    <div class="wrap header-inner">
      <RouterLink class="brand" to="/" aria-label="拾光集首页">
        <span class="brand-mark">拾</span>
        <span class="brand-text"><b>拾光集</b><em>SHIGUANG MARKET</em></span>
      </RouterLink>

      <span class="school-pill">{{ SCHOOL.name }}</span>

      <nav class="main-nav" aria-label="主导航">
        <RouterLink to="/" class="nav-link" :class="{ 'is-active': isHome }">集市</RouterLink>
        <RouterLink to="/forum" class="nav-link" :class="{ 'is-active': isForum }">论坛</RouterLink>
        <RouterLink to="/games" class="nav-link" :class="{ 'is-active': isGames }">游戏</RouterLink>
        <RouterLink to="/messages" class="nav-link" :class="{ 'is-active': isMessages }">
          消息
          <span v-if="unreadTotal" class="nav-dot"></span>
        </RouterLink>
        <RouterLink to="/me" class="nav-link" :class="{ 'is-active': isMe }">我的</RouterLink>
        <RouterLink v-if="isAdmin" to="/admin" class="nav-link" :class="{ 'is-active': route.name === 'admin' }">管理</RouterLink>
      </nav>

      <form class="header-search" role="search" autocomplete="off" @submit.prevent="submitSearch">
        <Icon name="search" />
        <input
          ref="searchInput"
          v-model="query"
          type="search"
          placeholder="搜教材、单车、耳机…"
          aria-label="搜索闲置"
          @focus="openPanel"
          @click="openPanel"
          @input="onInput"
        >
        <kbd>/</kbd>

        <div v-if="searchOpen" class="search-panel">
          <div class="search-panel-title"><span>热门搜索</span></div>
          <div class="search-chips">
            <button
              v-for="term in POPULAR_SEARCHES"
              :key="term"
              class="search-chip"
              type="button"
              @click="pickTerm(term)"
            >
              {{ term }}
            </button>
          </div>

          <template v-if="recent.length">
            <div class="search-panel-title" style="margin-top: 16px;">
              <span>最近搜索</span>
              <button type="button" @click="clearSearches">清空</button>
            </div>
            <div class="search-chips">
              <button
                v-for="term in recent"
                :key="term"
                class="search-chip"
                type="button"
                @click="pickTerm(term)"
              >
                {{ term }}
              </button>
            </div>
          </template>
          <p v-else class="search-panel-empty" style="margin-top: 14px;">搜索教材、单车、耳机，找到同校的好物。</p>
        </div>
      </form>

      <div class="header-actions">
        <RouterLink class="icon-btn cart-link" to="/cart" aria-label="购物车">
          <Icon name="cart" />
          <span class="count-badge" :data-zero="cartCount === 0">{{ cartCount }}</span>
        </RouterLink>
        <RouterLink class="icon-btn fav-link" to="/favorites" aria-label="我的收藏">
          <Icon name="heart" />
          <span id="fav-count" class="count-badge" :data-zero="favoriteCount === 0">{{ favoriteCount }}</span>
        </RouterLink>
        <RouterLink class="btn btn-primary publish-btn" to="/publish"><span class="plus">+</span> 发布闲置</RouterLink>
        <RouterLink class="icon-btn mobile-search-btn" to="/search" aria-label="搜索好物">
          <Icon name="search" />
        </RouterLink>
        <RouterLink
          class="avatar-btn"
          :to="currentUser ? '/me' : '/login'"
          :aria-label="currentUser ? '个人中心' : '登录 / 注册'"
          :title="currentUser ? currentUser.name : '登录 / 注册'"
        >
          <span class="avatar">{{ currentUser ? currentUser.initial : '登' }}</span>
        </RouterLink>
      </div>
    </div>
  </header>
</template>
