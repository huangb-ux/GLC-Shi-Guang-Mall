<script setup>
import { computed } from 'vue';
import EmptyState from '../components/EmptyState.vue';
import ItemCard from '../components/ItemCard.vue';
import { favoriteListings, favoriteCount } from '../stores/market';

const items = computed(() => favoriteListings.value);
</script>

<template>
  <div class="page page-fade wrap">
    <div class="page-head">
      <p class="eyebrow">SAVED · 收藏夹</p>
      <h1>喜欢的好物，先放在这里。</h1>
      <p>{{ favoriteCount }} 件收藏 · 记得早点约卖家看货</p>
    </div>

    <div v-if="items.length" class="item-grid">
      <ItemCard v-for="item in items" :key="item.id" :item="item" />
    </div>
    <EmptyState
      v-else
      icon="heart"
      title="收藏夹还是空的"
      text="逛集市时点一下小爱心，喜欢的宝贝就会出现在这里。"
    >
      <RouterLink class="btn btn-primary" to="/">去逛集市</RouterLink>
    </EmptyState>
  </div>
</template>
