<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Artwork from '../components/Artwork.vue';
import EmptyState from '../components/EmptyState.vue';
import Icon from '../components/Icon.vue';
import ItemCard from '../components/ItemCard.vue';
import {
  deleteListing,
  favoriteCount,
  favoriteListings,
  logoutAccount,
  market,
  myOrders,
  toggleListingStatus
} from '../stores/market';
import { closeChat, confirmAction, toast } from '../stores/ui';
import { fmtPrice, timeAgo } from '../lib/format';

const route = useRoute();
const router = useRouter();
const tab = computed(() => (route.query.tab === 'favorites' ? 'favorites' : 'listings'));
const myListings = computed(() => market.myListings);
const favorites = computed(() => favoriteListings.value);
const user = computed(() => market.currentUser);
const maskedPhone = computed(() => {
  const phone = user.value?.phone || '';
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
});
const joinedText = computed(() => {
  if (user.value?.joined) return user.value.joined;
  if (!user.value?.createdAt) return '';
  const date = new Date(user.value.createdAt);
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月加入`;
});

async function removeListing(listing) {
  const confirmed = await confirmAction({
    title: '确定删除这件闲置吗？',
    text: `「${listing.title}」删除后无法恢复，相关私信记录会一并隐藏。`,
    confirmText: '删除',
    danger: true
  });
  if (!confirmed) return;
  await deleteListing(listing.id);
  toast('已删除');
}

async function toggleStatus(listing) {
  await toggleListingStatus(listing.id);
  toast(listing.status === 'paused' ? '已下架，可随时重新上架' : '已重新上架');
}

function logout() {
  closeChat();
  logoutAccount();
  toast('已退出登录');
  router.push('/');
}
</script>

<template>
  <div v-if="user" class="page page-fade me-page wrap">
    <div class="profile-card">
      <span class="profile-avatar">{{ user.initial }}</span>
      <div class="profile-main">
        <h1 class="profile-name">
          {{ user.name }}
          <span class="verified-badge"><Icon name="check" /> 校园实名</span>
          <span v-if="user.role === 'admin'" class="admin-badge">管理员</span>
          <span v-if="user.publishBanned" class="risk-badge">已暂停发布</span>
        </h1>
        <div class="profile-meta">
          <span>{{ user.school }}</span><span class="sep">/</span>
          <span>{{ user.dept }}</span><span class="sep">·</span>
          <span>{{ joinedText }}</span>
          <span v-if="user.phone" class="sep">·</span>
          <span v-if="user.phone">{{ maskedPhone }}</span>
        </div>
        <p class="profile-bio">{{ user.bio || '校园实名用户 · 让闲置继续发光。' }}</p>
      </div>
      <div class="profile-stats">
        <div class="profile-stat"><b>{{ myListings.length }}</b><span>发布</span></div>
        <div class="profile-stat"><b>{{ favoriteCount }}</b><span>收藏</span></div>
        <div class="profile-stat"><b>{{ myOrders.length }}</b><span>订单</span></div>
      </div>
    </div>

    <div v-if="user.publishBanned" class="risk-banner">
      <Icon name="shield" />
      <div>
        <b>发布权限已暂停</b>
        <p>{{ user.banReason || '因收到 3 位买家举报并核实，平台已暂停你的发布权限。' }}</p>
      </div>
      <RouterLink class="btn btn-outline btn-sm" :to="`/seller/${user.id}`">查看卖家主页</RouterLink>
    </div>

    <div class="profile-toolbar">
      <RouterLink class="btn btn-outline btn-sm" to="/cart"><Icon name="cart" /> 购物车</RouterLink>
      <RouterLink class="btn btn-outline btn-sm" to="/orders"><Icon name="bag" /> 我的订单</RouterLink>
      <RouterLink class="btn btn-outline btn-sm" :to="`/seller/${user.id}`"><Icon name="user" /> 卖家主页</RouterLink>
      <RouterLink v-if="user.role === 'admin'" class="btn btn-primary btn-sm" to="/admin"><Icon name="shield" /> 管理后台</RouterLink>
      <button class="btn btn-ghost btn-sm logout-btn" type="button" @click="logout"><Icon name="logout" /> 退出登录</button>
    </div>

    <div class="tabs" role="tablist">
      <RouterLink class="tab" :class="{ 'is-active': tab === 'listings' }" to="/me">
        我的发布 <span class="num">{{ myListings.length }}</span>
      </RouterLink>
      <RouterLink class="tab" :class="{ 'is-active': tab === 'favorites' }" to="/me?tab=favorites">
        我的收藏 <span class="num">{{ favoriteCount }}</span>
      </RouterLink>
    </div>

    <div v-if="tab === 'listings'">
      <div v-if="myListings.length" class="manage-list">
        <div v-for="listing in myListings" :key="listing.id" class="manage-row">
          <RouterLink class="manage-thumb" :to="`/item/${listing.id}`"><Artwork :item="listing" /></RouterLink>
          <div class="manage-info">
            <RouterLink class="manage-title" :to="`/item/${listing.id}`">{{ listing.title }}</RouterLink>
            <div class="manage-meta">
              <span class="manage-price">¥{{ fmtPrice(listing.price) }}</span>
              <span>{{ listing.condition }}</span>
              <span>{{ timeAgo(listing.createdAt) }}</span>
              <span class="status-pill" :class="{ paused: listing.status === 'paused' }">
                {{ listing.status === 'paused' ? '已下架' : '在售' }}
              </span>
            </div>
          </div>
          <div class="manage-actions">
            <RouterLink class="icon-act" :to="{ name: 'publish', query: { id: listing.id } }">
              <Icon name="edit" /> 编辑
            </RouterLink>
            <button class="icon-act" type="button" @click="toggleStatus(listing)">
              <Icon :name="listing.status === 'paused' ? 'play' : 'pause'" />
              {{ listing.status === 'paused' ? '上架' : '下架' }}
            </button>
            <button class="icon-act danger" type="button" @click="removeListing(listing)">
              <Icon name="trash" /> 删除
            </button>
          </div>
        </div>
      </div>
      <EmptyState
        v-else
        icon="bag"
        title="还没有发布闲置"
        text="宿舍里总有几件用不上的好东西，让它们继续发光吧。"
      >
        <RouterLink class="btn btn-primary" to="/publish">发布第一件闲置</RouterLink>
      </EmptyState>
    </div>

    <div v-else>
      <div v-if="favorites.length" class="item-grid">
        <ItemCard v-for="item in favorites" :key="item.id" :item="item" />
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
  </div>
</template>
