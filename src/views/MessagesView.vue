<script setup>
import { computed } from 'vue';
import Artwork from '../components/Artwork.vue';
import EmptyState from '../components/EmptyState.vue';
import { getListing, market } from '../stores/market';
import { openChat } from '../stores/ui';
import { timeAgo } from '../lib/format';

const threads = computed(() =>
  Object.entries(market.chats)
    .map(([id, thread]) => ({ item: getListing(id), thread }))
    .filter(entry => entry.item && entry.thread.messages?.length)
    .sort((a, b) => (b.thread.updatedAt || 0) - (a.thread.updatedAt || 0))
);

function lastMessage(thread) {
  return thread.messages[thread.messages.length - 1];
}
</script>

<template>
  <div class="page page-fade wrap">
    <div class="page-head">
      <p class="eyebrow">MESSAGES · 私信</p>
      <h1>聊聊这件好物。</h1>
      <p>{{ threads.length }} 个对话 · 建议在站内确认好成色与面交时间</p>
    </div>

    <div v-if="threads.length" class="thread-list">
      <button
        v-for="entry in threads"
        :key="entry.item.id"
        class="thread"
        type="button"
        @click="openChat(entry.item.id, '')"
      >
        <span class="thread-art"><Artwork :item="entry.item" /></span>
        <span class="thread-main">
          <span class="thread-top">
            <span class="thread-name">{{ entry.item.seller.name }}</span>
            <span class="thread-item">· {{ entry.item.title }}</span>
          </span>
          <span class="thread-preview">
            {{ lastMessage(entry.thread).from === 'me' ? '我：' : '' }}{{ lastMessage(entry.thread).text }}
          </span>
        </span>
        <span class="thread-side">
          <span>{{ timeAgo(entry.thread.updatedAt || lastMessage(entry.thread).ts) }}</span>
          <span v-if="entry.thread.unread" class="unread-pill">{{ entry.thread.unread }}</span>
        </span>
      </button>
    </div>

    <EmptyState
      v-else
      icon="chat"
      title="还没有对话"
      text="在商品详情页点「我想要」，就能和卖家聊聊成色与面交时间。"
    >
      <RouterLink class="btn btn-primary" to="/">去逛集市</RouterLink>
    </EmptyState>
  </div>
</template>
