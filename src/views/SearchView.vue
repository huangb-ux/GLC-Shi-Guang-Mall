<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EmptyState from '../components/EmptyState.vue';
import Icon from '../components/Icon.vue';
import ItemCard from '../components/ItemCard.vue';
import {
  activeListings,
  getFilteredListings,
  rememberSearch
} from '../stores/market';
import { toast, ui } from '../stores/ui';
import { AREAS, CATEGORIES, CONDITIONS } from '../data/site';
import { categoryName } from '../lib/format';

const route = useRoute();
const router = useRouter();
const searchText = ref(String(route.query.q || ''));

const filters = reactive({
  q: '',
  cat: 'all',
  cond: 'all',
  area: 'all',
  min: '',
  max: '',
  sort: 'new'
});

function syncFromRoute() {
  filters.q = String(route.query.q || '');
  filters.cat = String(route.query.cat || 'all');
  filters.cond = String(route.query.cond || 'all');
  filters.area = String(route.query.area || 'all');
  filters.min = String(route.query.min || '');
  filters.max = String(route.query.max || '');
  filters.sort = String(route.query.sort || 'new');
  searchText.value = filters.q;
}

watch(() => route.query, syncFromRoute, { immediate: true, deep: true });

const result = computed(() => getFilteredListings(route.query));
const resultCount = computed(() => result.value.length);

const currentCat = computed(() => String(route.query.cat || 'all'));
const currentSort = computed(() => String(route.query.sort || 'new'));

const pageTitle = computed(() => {
  const q = String(route.query.q || '');
  if (q) return `“${q}” 的结果`;
  if (currentCat.value !== 'all') return `${categoryName(currentCat.value)}好物`;
  return '逛逛今天的集市';
});

const categoryCounts = computed(() => {
  const map = {};
  CATEGORIES.forEach(category => {
    map[category.id] = activeListings.value.filter(item => item.category === category.id).length;
  });
  return map;
});

const activeChips = computed(() => {
  const chips = [];
  const query = route.query;
  if (query.q) chips.push({ key: 'q', label: `搜索：${query.q}` });
  if (query.cat && query.cat !== 'all') chips.push({ key: 'cat', label: categoryName(String(query.cat)) });
  if (query.cond && query.cond !== 'all') chips.push({ key: 'cond', label: String(query.cond) });
  if (query.area && query.area !== 'all') chips.push({ key: 'area', label: String(query.area) });
  if (query.min || query.max) {
    chips.push({ key: 'price', label: `¥${query.min || 0} – ${query.max || '不限'}` });
  }
  return chips;
});

function cleanQuery() {
  const query = {};
  if (filters.q.trim()) query.q = filters.q.trim();
  if (filters.cat !== 'all') query.cat = filters.cat;
  if (filters.cond !== 'all') query.cond = filters.cond;
  if (filters.area !== 'all') query.area = filters.area;
  if (filters.min !== '') query.min = String(filters.min);
  if (filters.max !== '') query.max = String(filters.max);
  if (filters.sort !== 'new') query.sort = filters.sort;
  return query;
}

function applyFilters() {
  if (filters.min !== '' && filters.max !== '' && Number(filters.min) > Number(filters.max)) {
    toast('最低价不能高于最高价');
    return;
  }
  rememberSearch(filters.q);
  router.push({ name: 'search', query: cleanQuery() });
}

function applyAndClose() {
  applyFilters();
  ui.filtersOpen = false;
}

function handleFilterChange() {
  if (window.matchMedia('(max-width: 900px)').matches) return;
  applyFilters();
}

function submitSearch() {
  filters.q = searchText.value.trim();
  rememberSearch(filters.q);
  router.push({ name: 'search', query: filters.q ? { q: filters.q } : {} });
}

function updateSort() {
  applyFilters();
}

function resetFilters() {
  ui.filtersOpen = false;
  router.push({ name: 'search' });
}

function removeFilter(key) {
  const query = { ...route.query };
  if (key === 'price') {
    delete query.min;
    delete query.max;
  } else {
    delete query[key];
  }
  router.push({ name: 'search', query });
}

function openFilters() {
  ui.filtersOpen = true;
}
</script>

<template>
  <div class="page page-fade search-page wrap">
    <div class="search-hero">
      <div>
        <p class="eyebrow">MARKET · 桂林学院集市</p>
        <h1>{{ pageTitle }}</h1>
        <p>共 {{ resultCount }} 件好物 · 校内实名 · 支持当面验货</p>
      </div>
      <form class="search-inline" role="search" @submit.prevent="submitSearch">
        <Icon name="search" />
        <input v-model="searchText" type="search" placeholder="搜点什么…" aria-label="站内搜索">
        <button type="submit" aria-label="搜索"><Icon name="arrow" /></button>
      </form>
    </div>

    <div class="search-layout">
      <div v-if="ui.filtersOpen" class="filters-backdrop is-open" @click="ui.filtersOpen = false"></div>

      <form class="filters" :class="{ 'is-open': ui.filtersOpen }" @submit.prevent="applyAndClose">
        <div class="filter-head">
          <h2>筛选</h2>
          <div class="filter-head-actions">
            <button class="filter-reset" type="button" @click="resetFilters">重置</button>
            <button class="filter-close" type="button" aria-label="关闭筛选" @click="ui.filtersOpen = false">
              <Icon name="close" />
            </button>
          </div>
        </div>

        <div class="filter-group">
          <p class="filter-title">分类</p>
          <div class="filter-options">
            <label class="filter-option">
              <input v-model="filters.cat" type="radio" name="cat" value="all" @change="handleFilterChange">
              <span>全部好物</span><em>{{ activeListings.length }}</em>
            </label>
            <label v-for="category in CATEGORIES" :key="category.id" class="filter-option">
              <input v-model="filters.cat" type="radio" name="cat" :value="category.id" @change="handleFilterChange">
              <span>{{ category.name }}</span><em>{{ categoryCounts[category.id] }}</em>
            </label>
          </div>
        </div>

        <div class="filter-group">
          <p class="filter-title">成色</p>
          <div class="cond-list">
            <label class="filter-option">
              <input v-model="filters.cond" type="radio" name="cond" value="all" @change="handleFilterChange">
              <span>不限</span>
            </label>
            <label v-for="condition in CONDITIONS" :key="condition" class="filter-option">
              <input v-model="filters.cond" type="radio" name="cond" :value="condition" @change="handleFilterChange">
              <span>{{ condition }}</span>
            </label>
          </div>
        </div>

        <div class="filter-group">
          <p class="filter-title">价格区间</p>
          <div class="price-range">
            <input v-model="filters.min" type="number" min="0" inputmode="numeric" placeholder="最低" @change="handleFilterChange">
            <span>—</span>
            <input v-model="filters.max" type="number" min="0" inputmode="numeric" placeholder="最高" @change="handleFilterChange">
          </div>
        </div>

        <div class="filter-group">
          <p class="filter-title">校内地点</p>
          <select v-model="filters.area" class="filter-select" @change="handleFilterChange">
            <option value="all">全部地点</option>
            <option v-for="area in AREAS" :key="area" :value="area">{{ area }}</option>
          </select>
        </div>

        <div class="filters-footer">
          <button class="btn btn-primary btn-sm btn-block filters-apply" type="submit">查看筛选结果</button>
        </div>
      </form>

      <section class="results">
        <div class="results-bar">
          <button class="btn btn-outline btn-sm filter-toggle" type="button" @click="openFilters">
            <Icon name="filter" /> 筛选
          </button>
          <p class="results-count"><b>{{ resultCount }}</b> 件好物</p>
          <div class="results-actions">
            <select v-model="filters.sort" class="sort-select" aria-label="排序方式" @change="updateSort">
              <option value="new">最新发布</option>
              <option value="price_asc">价格从低到高</option>
              <option value="price_desc">价格从高到低</option>
            </select>
          </div>
        </div>

        <div v-if="activeChips.length" class="active-filters">
          <button
            v-for="chip in activeChips"
            :key="chip.key"
            class="active-filter"
            type="button"
            @click="removeFilter(chip.key)"
          >
            {{ chip.label }} <Icon name="close" />
          </button>
        </div>

        <div class="search-note">
          <Icon name="shield" /> 桂林学院校内优先 · 建议约在图书馆、食堂等校内公共场所面交
        </div>

        <div v-if="result.length" class="item-grid">
          <ItemCard v-for="item in result" :key="item.id" :item="item" />
        </div>
        <EmptyState
          v-else
          icon="search"
          title="没有找到相符的好物"
          text="换个关键词，或者放宽一点筛选条件试试。"
        >
          <button class="btn btn-primary" type="button" @click="resetFilters">清空筛选</button>
        </EmptyState>

        <p v-if="result.length" class="results-end">— 已经到底啦 —</p>
      </section>
    </div>
  </div>
</template>
