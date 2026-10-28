<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import Artwork from '../components/Artwork.vue';
import CategoryIcon from '../components/CategoryIcon.vue';
import CampusScenery from '../components/CampusScenery.vue';
import CampusChannels from '../components/CampusChannels.vue';
import Icon from '../components/Icon.vue';
import ItemCard from '../components/ItemCard.vue';
import {
  activeListings,
  getListing,
  rememberSearch
} from '../stores/market';
import {
  CATEGORIES,
  POPULAR_SEARCHES,
  SCHOOL
} from '../data/site';
import { categoryName, fmtPrice } from '../lib/format';

const router = useRouter();
const heroQuery = ref('');

const newest = computed(() =>
  activeListings.value.slice().sort((a, b) => b.createdAt - a.createdAt)
);
const featured = computed(() =>
  ['s2', 's3', 's1'].map(id => getListing(id)).filter(item => item && item.status !== 'paused')
);
const cheap = computed(() => newest.value.filter(item => item.price <= 120).slice(0, 4));
const todayCount = computed(() =>
  activeListings.value.filter(item => Date.now() - item.createdAt < 86400000).length
);
const stats = computed(() => [
  { value: activeListings.value.length, label: '件好物在售' },
  { value: 1, label: '所高校参与' },
  { value: 0, label: '交易服务费' }
]);
const categoryCounts = computed(() => {
  const map = {};
  CATEGORIES.forEach(category => {
    map[category.id] = activeListings.value.filter(item => item.category === category.id).length;
  });
  return map;
});

function shortTitle(item) {
  return item.title.split('·')[0].trim();
}

function goSearch() {
  const value = heroQuery.value.trim();
  rememberSearch(value);
  router.push({ name: 'search', query: value ? { q: value } : {} });
}
</script>

<template>
  <div class="page-fade">
    <section class="hero">
      <div class="wrap hero-inner">
        <div class="hero-copy">
          <div class="hero-eyebrow">
            <span class="stamp-mini">校内</span>
            <span>{{ SCHOOL.name }} · 只属于本校学生的二手集市</span>
            <span class="line"></span>
          </div>
          <h1>让好东西，<br><span class="nowrap">在校园里<span class="hl">再遇见</span>一次。</span></h1>
          <p class="hero-sub">教材、单车、耳机、台灯……把它们交给下一位同学。<br>校内实名、当面验货，不花一分服务费。</p>

          <form class="hero-search" role="search" @submit.prevent="goSearch">
            <Icon name="search" />
            <input v-model="heroQuery" type="search" placeholder="今天想淘点什么？" aria-label="搜索闲置" autocomplete="off">
            <button class="btn btn-primary" type="submit">去逛逛 <Icon name="arrow" /></button>
          </form>

          <div class="hero-tags">
            <span>热门：</span>
            <RouterLink
              v-for="term in POPULAR_SEARCHES.slice(0, 4)"
              :key="term"
              :to="{ name: 'search', query: { q: term } }"
            >
              {{ term }}
            </RouterLink>
          </div>

          <div class="hero-stats">
            <div v-for="stat in stats" :key="stat.label" class="hero-stat">
              <b>{{ stat.value }}</b><span>{{ stat.label }}</span>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="sticker-new">今日上新 <b>{{ todayCount }}</b> 件</div>
          <RouterLink
            v-for="(item, index) in featured"
            :key="item.id"
            class="hero-card"
            :class="['hc-main', 'hc-left', 'hc-bottom'][index]"
            :to="`/item/${item.id}`"
          >
            <div class="hc-art"><Artwork :item="item" /></div>
            <div class="hc-info">
              <span class="hc-cat">{{ categoryName(item.category) }}</span>
              <b>{{ shortTitle(item) }}</b>
              <span class="hc-price">¥{{ fmtPrice(item.price) }}</span>
            </div>
          </RouterLink>

          <div class="round-stamp" aria-hidden="true">
            <svg viewBox="0 0 120 120">
              <defs>
                <path id="stampCircle" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"></path>
              </defs>
              <circle cx="60" cy="60" r="57" fill="none" stroke="rgba(20,80,60,.22)" stroke-dasharray="2 5"></circle>
              <text><textPath href="#stampCircle" startOffset="2%">CAMPUS SECONDHAND MARKET · 校园二手集市 ·</textPath></text>
            </svg>
            <span class="core">拾</span>
          </div>
        </div>
      </div>

      <div class="wrap hero-strip-head">
        <span>今日好物 · 左右滑动</span>
        <RouterLink :to="{ name: 'search', query: { sort: 'new' } }">查看全部 <Icon name="arrow" /></RouterLink>
      </div>
      <div class="wrap hero-strip">
        <RouterLink v-for="item in newest.slice(0, 4)" :key="item.id" :to="`/item/${item.id}`">
          <div class="hs-art"><Artwork :item="item" /></div>
          <div class="hs-info"><b>{{ shortTitle(item) }}</b><span>¥{{ fmtPrice(item.price) }}</span></div>
        </RouterLink>
      </div>
    </section>

    <section class="cat-section wrap" aria-label="商品分类">
      <div class="cat-strip">
        <RouterLink
          v-for="category in CATEGORIES"
          :key="category.id"
          class="cat-tile"
          :to="{ name: 'search', query: { cat: category.id } }"
        >
          <span class="cat-icon"><CategoryIcon :name="category.icon" /></span>
          <span class="cat-name">{{ category.name }}</span>
          <span class="cat-count">{{ categoryCounts[category.id] }} 件</span>
        </RouterLink>
      </div>
    </section>

    <CampusScenery />

    <CampusChannels />

    <section class="section wrap">
      <div class="section-head">
        <div>
          <p class="eyebrow">FRESH FINDS · 今日上新</p>
          <h2 class="section-title">刚刚上架 <span class="count">{{ activeListings.length }} 件在售</span></h2>
        </div>
        <RouterLink class="section-link" :to="{ name: 'search', query: { sort: 'new' } }">
          查看全部 <Icon name="arrow" />
        </RouterLink>
      </div>
      <div class="item-grid">
        <ItemCard v-for="item in newest.slice(0, 8)" :key="item.id" :item="item" />
      </div>
    </section>

    <section class="section wrap">
      <div class="section-head">
        <div>
          <p class="eyebrow">UNDER ¥100 · 百元快乐</p>
          <h2 class="section-title">百元以内，快乐加倍</h2>
          <p class="section-desc">一杯奶茶的钱，换一件能陪你很久的东西。</p>
        </div>
        <RouterLink class="section-link" :to="{ name: 'search', query: { max: '100', sort: 'new' } }">
          去捡漏 <Icon name="arrow" />
        </RouterLink>
      </div>
      <div class="item-grid">
        <ItemCard v-for="item in cheap" :key="item.id" :item="item" />
      </div>
    </section>

    <section class="trust-section wrap">
      <div class="trust-panel">
        <div class="trust-copy">
          <p class="eyebrow light">WHY SHIGUANG</p>
          <h2>校园里的交易，<br>可以更简单一点。</h2>
          <p>我们不做复杂的担保交易，只把「同校的人」和「爱惜的旧物」认真连在一起。少一点套路，多一点面对面的安心。</p>
          <RouterLink class="btn btn-cream trust-cta" to="/publish">
            发布我的第一件闲置 <Icon name="arrow" />
          </RouterLink>
        </div>
        <ol class="trust-steps">
          <li class="trust-step">
            <span class="num">01</span>
            <div><h3>校园实名认证</h3><p>学生身份认证后才能上架与私信，同校交易更有据可循。</p></div>
          </li>
          <li class="trust-step">
            <span class="num">02</span>
            <div><h3>当面验货，满意再拿</h3><p>约在图书馆、食堂或宿舍楼下，看成色、试功能，确认无误再付款。</p></div>
          </li>
          <li class="trust-step">
            <span class="num">03</span>
            <div><h3>全场 0 服务费</h3><p>闲置的价格就是成交的价格，平台不抽成，也不收任何发布费用。</p></div>
          </li>
        </ol>
      </div>
    </section>

    <section class="cta-band wrap">
      <div class="cta-inner">
        <div>
          <h2>你的闲置，<br>可能是别人的刚刚好。</h2>
          <p>三分钟上架，让它在桂林学院继续发光。</p>
        </div>
        <RouterLink class="btn btn-primary" to="/publish">发布闲置 <Icon name="arrow" /></RouterLink>
      </div>
    </section>
  </div>
</template>
