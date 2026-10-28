<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Icon from './Icon.vue';
import { unreadTotal } from '../stores/market';

const route = useRoute();
const isHome = computed(() => route.name === 'home');
const isMessages = computed(() => route.name === 'messages');
const isFavorites = computed(() => route.name === 'favorites');
const isMe = computed(() => route.name === 'me');
</script>

<template>
  <nav class="mobile-nav" aria-label="移动端导航">
    <RouterLink to="/" :class="{ 'is-active': isHome }">
      <Icon name="home" />
      <span>集市</span>
    </RouterLink>
    <RouterLink to="/messages" :class="{ 'is-active': isMessages }">
      <Icon name="chat" />
      <span>消息</span>
      <i v-if="unreadTotal" class="mobile-red-dot"></i>
    </RouterLink>
    <RouterLink to="/publish" class="mobile-publish" aria-label="发布闲置">+</RouterLink>
    <RouterLink to="/favorites" :class="{ 'is-active': isFavorites }">
      <Icon name="heart" />
      <span>收藏</span>
    </RouterLink>
    <RouterLink to="/me" :class="{ 'is-active': isMe }">
      <Icon name="user" />
      <span>我的</span>
    </RouterLink>
  </nav>
</template>
