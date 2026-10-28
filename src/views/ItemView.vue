<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Artwork from '../components/Artwork.vue';
import Icon from '../components/Icon.vue';
import ItemCard from '../components/ItemCard.vue';
import NotFoundView from './NotFoundView.vue';
import {
  activeListings,
  getListing,
  isMine,
  market,
  toggleFavorite,
  toggleListingStatus
} from '../stores/market';
import { openChat, toast } from '../stores/ui';
import {
  categoryName,
  categoryOf,
  fmtPrice,
  timeAgo,
  variantTones
} from '../lib/format';

const route = useRoute();
const activeIndex = ref(0);

const item = computed(() => getListing(String(route.params.id)));

watch(
  () => route.params.id,
  () => {
    activeIndex.value = 0;
  }
);

watch(
  item,
  value => {
    document.title = value ? `${value.title} · 拾光集` : '商品不存在 · 拾光集';
  },
  { immediate: true }
);

const variants = computed(() => {
  if (!item.value) return [];
  if (item.value.images?.length) {
    return item.value.images.slice(0, 3).map(src => ({ type: 'img', src }));
  }
  return variantTones(item.value.tone || 'sage').map(tone => ({ type: 'art', tone }));
});

const currentVariant = computed(() => variants.value[activeIndex.value] || variants.value[0] || {});
const mine = computed(() => isMine(item.value));
const available = computed(() => item.value?.status !== 'paused');
const savedPercent = computed(() => {
  if (!item.value?.originalPrice) return 0;
  return Math.round((1 - item.value.price / item.value.originalPrice) * 100);
});

const related = computed(() => {
  if (!item.value) return [];
  return activeListings.value
    .filter(other => other.id !== item.value.id)
    .sort((a, b) => {
      const aSame = a.category === item.value.category ? 0 : 1;
      const bSame = b.category === item.value.category ? 0 : 1;
      return aSame - bSame || b.createdAt - a.createdAt;
    })
    .slice(0, 4);
});

function contactSeller() {
  if (!item.value) return;
  openChat(item.value.id, '你好，这件还在吗？');
}

function handleFavorite() {
  if (!item.value) return;
  const added = toggleFavorite(item.value.id);
  toast(added ? '已放进收藏夹' : '已取消收藏');
}

function handleStatus() {
  if (!item.value) return;
  toggleListingStatus(item.value.id);
  toast(item.value.status === 'paused' ? '已下架，可在个人中心重新上架' : '已重新上架');
}
</script>

<template>
  <NotFoundView v-if="!item" />
  <div v-else class="page page-fade detail-page wrap">
    <nav class="breadcrumb">
      <RouterLink to="/">集市</RouterLink><span class="sep">/</span>
      <RouterLink :to="{ name: 'search', query: { cat: item.category } }">{{ categoryName(item.category) }}</RouterLink>
      <span class="sep">/</span>
      <span>{{ item.title }}</span>
    </nav>

    <div class="detail-grid">
      <div class="detail-media">
        <div class="gallery-main">
          <Artwork
            :item="item"
            :src="currentVariant.src"
            :tone="currentVariant.tone"
            :art="item.art"
            eager
          />
        </div>
        <div class="gallery-thumbs">
          <button
            v-for="(variant, index) in variants"
            :key="index"
            class="gallery-thumb"
            :class="{ 'is-active': index === activeIndex }"
            type="button"
            :aria-label="`查看第 ${index + 1} 张图片`"
            @click="activeIndex = index"
          >
            <Artwork :item="item" :src="variant.src" :tone="variant.tone" :art="item.art" />
          </button>
        </div>
        <p class="detail-note">
          <Icon name="camera" />
          {{ item.images?.length ? `共 ${item.images.length} 张实物图 · 支持当面验货` : '封面为分类手绘插画 · 实物以面交为准' }}
        </p>
      </div>

      <div class="detail-info">
        <div class="detail-badges">
          <span class="cat">{{ categoryName(item.category) }}</span>
          <span class="tag">{{ item.condition }}</span>
          <span v-if="mine" class="status-pill">我的闲置</span>
          <span v-if="!available" class="status-pill paused">已下架</span>
        </div>

        <h1 class="detail-title">{{ item.title }}</h1>

        <div class="detail-price-row">
          <span class="detail-price"><em>¥</em>{{ fmtPrice(item.price) }}</span>
          <s v-if="item.originalPrice" class="detail-original">原价 ¥{{ fmtPrice(item.originalPrice) }}</s>
          <span v-if="savedPercent > 0" class="detail-save">省 {{ savedPercent }}%</span>
        </div>

        <p class="detail-desc">{{ item.description }}</p>

        <div v-if="item.tags?.length" class="detail-tags">
          <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <dl class="detail-specs">
          <div class="spec"><dt>成色</dt><dd>{{ item.condition }}</dd></div>
          <div class="spec"><dt>分类</dt><dd>{{ categoryName(item.category) }}</dd></div>
          <div class="spec"><dt>交易地点</dt><dd><Icon name="pin" />{{ item.location }}</dd></div>
          <div class="spec"><dt>发布时间</dt><dd>{{ timeAgo(item.createdAt) }}</dd></div>
        </dl>

        <div class="seller-card">
          <span class="seller-avatar">{{ item.seller.initial }}</span>
          <div class="seller-meta">
            <div class="seller-name">
              {{ item.seller.name }}
              <span v-if="item.seller.verified" class="verified-badge"><Icon name="check" /> 校园实名</span>
            </div>
            <div class="seller-sub">{{ market.school.name }} · {{ item.seller.dept }} · 成交 {{ item.seller.deals }} 件</div>
          </div>
          <div class="seller-rating">
            <b><Icon name="star" />{{ Number(item.seller.rating).toFixed(1) }}</b>
            卖家评分
          </div>
        </div>

        <div v-if="!available" class="search-note">
          <Icon name="info" /> 这件好物已由卖家下架，暂时无法联系。
        </div>

        <div v-if="mine" class="detail-owner-actions">
          <RouterLink class="btn btn-outline" :to="{ name: 'publish', query: { id: item.id } }">
            <Icon name="edit" /> 编辑
          </RouterLink>
          <button class="btn btn-outline" type="button" @click="handleStatus">
            {{ item.status === 'paused' ? '重新上架' : '下架' }}
          </button>
        </div>

        <div v-else class="detail-actions">
          <button class="btn btn-primary" type="button" :disabled="!available" @click="contactSeller">
            <Icon name="chat" /> {{ available ? '我想要 · 联系卖家' : '该好物已下架' }}
          </button>
          <button
            class="fav-btn fav-lg"
            :class="{ 'is-active': market.favorites.has(item.id) }"
            type="button"
            :aria-label="market.favorites.has(item.id) ? '取消收藏' : '收藏'"
            @click="handleFavorite"
          >
            <Icon name="heart" />
          </button>
        </div>

        <div class="safety-card">
          <p class="safety-title"><Icon name="shield" /> 交易小贴士</p>
          <ul class="safety-list">
            <li>优先选择图书馆、食堂、宿舍楼下等校内公共场所面交。</li>
            <li>当面确认成色与功能，满意后再付款，不提前转账。</li>
            <li>遇到异常低价或索要押金的情况，请立即停止交易并反馈。</li>
          </ul>
        </div>
      </div>
    </div>

    <section class="recommend">
      <div class="section-head">
        <div>
          <p class="eyebrow">YOU MAY ALSO LIKE</p>
          <h2 class="section-title">你可能也喜欢</h2>
        </div>
        <RouterLink class="section-link" :to="{ name: 'search', query: { cat: item.category } }">
          更多同类 <Icon name="arrow" />
        </RouterLink>
      </div>
      <div class="item-grid">
        <ItemCard v-for="other in related" :key="other.id" :item="other" />
      </div>
    </section>
  </div>
</template>
