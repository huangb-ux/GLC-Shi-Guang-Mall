<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Artwork from '../components/Artwork.vue';
import Icon from '../components/Icon.vue';
import ItemCard from '../components/ItemCard.vue';
import NotFoundView from './NotFoundView.vue';
import {
  activeListings,
  addToCart,
  getListing,
  getSeller,
  isMine,
  market,
  toggleFavorite,
  toggleListingStatus
} from '../stores/market';
import { openChat, toast } from '../stores/ui';
import {
  categoryName,
  fmtPrice,
  timeAgo,
  variantTones
} from '../lib/format';

const route = useRoute();
const router = useRouter();
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
const sellerProfile = computed(() => (item.value ? getSeller(item.value.sellerId) : null));
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

function requireLogin() {
  if (market.currentUser) return true;
  toast('请先登录');
  router.push({ name: 'login', query: { redirect: route.fullPath } });
  return false;
}

function contactSeller() {
  if (!item.value || !requireLogin()) return;
  openChat(item.value.id, '你好，这件还在吗？');
}

function handleFavorite() {
  if (!item.value || !requireLogin()) return;
  const result = toggleFavorite(item.value.id);
  toast(result === 'added' ? '已放进收藏夹' : '已取消收藏');
}

async function handleCart() {
  if (!item.value || !requireLogin()) return;
  const result = await addToCart(item.value.id);
  if (result.status === 'own') toast('这是你自己发布的闲置');
  else if (result.status === 'exists') toast('这件好物已经在购物车里了');
  else if (result.status === 'ok') toast('已加入购物车');
  else toast('这件好物暂时无法加入购物车');
}

async function handleStatus() {
  if (!item.value) return;
  await toggleListingStatus(item.value.id);
  toast(item.value.status === 'paused' ? '已下架，可在个人中心重新上架' : '已重新上架');
}

async function copyContact() {
  if (!item.value?.contact?.value) return;
  try {
    await navigator.clipboard.writeText(item.value.contact.value);
    toast('联系方式已复制');
  } catch (error) {
    toast(`联系方式：${item.value.contact.value}`);
  }
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
          <div class="spec"><dt>面交方式</dt><dd>买卖双方自行商议</dd></div>
          <div class="spec"><dt>发布时间</dt><dd>{{ timeAgo(item.createdAt) }}</dd></div>
        </dl>

        <div class="seller-card">
          <RouterLink :to="`/seller/${item.sellerId}`" class="seller-avatar">{{ item.seller.initial }}</RouterLink>
          <div class="seller-meta">
            <div class="seller-name">
              <RouterLink :to="`/seller/${item.sellerId}`">{{ item.seller.name }}</RouterLink>
              <span v-if="item.seller.verified" class="verified-badge"><Icon name="check" /> 校园实名</span>
              <span v-if="sellerProfile?.publishBanned" class="risk-badge">交易风险 · 已停止发布</span>
            </div>
            <div class="seller-sub">
              {{ market.school.name }} · {{ item.seller.dept }} · 成交 {{ sellerProfile?.deals ?? item.seller.deals }} 件
            </div>
          </div>
          <RouterLink class="seller-rating" :to="`/seller/${item.sellerId}`">
            <b><Icon name="star" />{{ Number(sellerProfile?.rating ?? item.seller.rating).toFixed(1) }}</b>
            查看主页
          </RouterLink>
        </div>

        <div v-if="item.contact?.value" class="contact-card">
          <div class="contact-main">
            <span class="contact-icon"><Icon :name="item.contact.type === 'qq' ? 'user' : 'chat'" /></span>
            <div>
              <span class="contact-label">卖家{{ item.contact.type === 'qq' ? 'QQ' : '微信' }}</span>
              <b>{{ item.contact.value }}</b>
              <p>添加时请备注「拾光集」，交易地点由双方自行商议。</p>
            </div>
          </div>
          <button class="btn btn-outline btn-sm" type="button" @click="copyContact">复制</button>
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
          <button class="cart-lg" type="button" aria-label="加入购物车" :disabled="!available" @click="handleCart">
            <Icon name="cart" />
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
