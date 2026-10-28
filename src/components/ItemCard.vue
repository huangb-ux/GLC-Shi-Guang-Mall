<script setup>
import { computed } from 'vue';
import Artwork from './Artwork.vue';
import Icon from './Icon.vue';
import { market, toggleFavorite } from '../stores/market';
import { toast } from '../stores/ui';
import { fmtPrice, timeAgo } from '../lib/format';

const props = defineProps({
  item: { type: Object, required: true }
});

const isFavorite = computed(() => market.favorites.has(props.item.id));

function handleFavorite() {
  const added = toggleFavorite(props.item.id);
  toast(added ? '已放进收藏夹' : '已取消收藏');
}
</script>

<template>
  <article class="item-card">
    <div class="card-media">
      <RouterLink class="media-link" :to="`/item/${item.id}`" :aria-label="item.title">
        <Artwork :item="item" />
      </RouterLink>
      <span class="condition-badge">{{ item.condition }}</span>
      <button
        class="fav-btn"
        :class="{ 'is-active': isFavorite }"
        type="button"
        :aria-label="isFavorite ? '取消收藏' : '收藏'"
        :aria-pressed="isFavorite"
        @click.stop="handleFavorite"
      >
        <Icon name="heart" />
      </button>
      <span class="card-campus">{{ item.area || market.school.name }}</span>
    </div>
    <div class="card-body">
      <RouterLink class="card-title" :to="`/item/${item.id}`">{{ item.title }}</RouterLink>
      <div class="price-row">
        <span class="price"><em>¥</em>{{ fmtPrice(item.price) }}</span>
        <s v-if="item.originalPrice" class="price-original">¥{{ fmtPrice(item.originalPrice) }}</s>
      </div>
      <div class="card-meta">
        <span class="avatar-mini">{{ item.seller.initial }}</span>
        <span class="card-seller">{{ item.seller.name }}</span>
        <span class="sep">·</span>
        <span class="card-time">{{ timeAgo(item.createdAt) }}</span>
      </div>
    </div>
  </article>
</template>
