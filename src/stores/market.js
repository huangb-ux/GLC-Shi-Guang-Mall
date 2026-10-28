import { computed, reactive } from 'vue';
import { MOCK_USER, SCHOOL, SEED_LISTINGS, CATEGORIES } from '../data/site';

const STORAGE = {
  myListings: 'shg.vue.myListings.v1',
  favorites: 'shg.vue.favorites.v1',
  chats: 'shg.vue.chats.v1',
  searches: 'shg.vue.searches.v1'
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

// 种子商品是“演示数据”，不写入 localStorage；用户自己发布的才会持久化。
const SEED_BASE_TIME = Date.now();

export const seedListings = SEED_LISTINGS.map(item => ({
  ...item,
  createdAt: SEED_BASE_TIME - (item.ageMin || 60) * 60000,
  seller: { ...item.seller }
}));

export const market = reactive({
  user: MOCK_USER,
  school: SCHOOL,
  myListings: loadJSON(STORAGE.myListings, []),
  favorites: new Set(loadJSON(STORAGE.favorites, [])),
  chats: loadJSON(STORAGE.chats, {}),
  searches: loadJSON(STORAGE.searches, [])
});

export const allListings = computed(() => [...seedListings, ...market.myListings]);
export const activeListings = computed(() => allListings.value.filter(item => item.status !== 'paused'));
export const favoriteListings = computed(() =>
  Array.from(market.favorites)
    .map(id => getListing(id))
    .filter(Boolean)
);
export const favoriteCount = computed(() => market.favorites.size);
export const unreadTotal = computed(() =>
  Object.values(market.chats).reduce((total, thread) => total + (thread.unread || 0), 0)
);

export function getListing(id) {
  return allListings.value.find(item => item.id === id) || null;
}

export function isMine(item) {
  return Boolean(item && item.ownerId === market.user.id);
}

export function meSeller() {
  return {
    id: market.user.id,
    name: market.user.name,
    initial: market.user.initial,
    school: market.user.school,
    dept: market.user.dept,
    rating: market.user.rating,
    deals: market.user.deals,
    verified: market.user.verified,
    tone: 'butter'
  };
}

export function saveMyListings() {
  saveJSON(STORAGE.myListings, market.myListings);
}

export function toggleFavorite(id) {
  if (!getListing(id)) return false;
  const next = !market.favorites.has(id);
  if (next) market.favorites.add(id);
  else market.favorites.delete(id);
  saveJSON(STORAGE.favorites, Array.from(market.favorites));
  return next;
}

export function addListing(payload) {
  const listing = {
    ...payload,
    id: 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    createdAt: Date.now(),
    status: 'active',
    campus: SCHOOL.name,
    ownerId: market.user.id,
    seller: meSeller()
  };
  market.myListings.unshift(listing);
  saveMyListings();
  return listing;
}

export function updateListing(id, payload) {
  const listing = market.myListings.find(item => item.id === id);
  if (!listing) return null;
  Object.assign(listing, payload, { updatedAt: Date.now() });
  saveMyListings();
  return listing;
}

export function deleteListing(id) {
  market.myListings = market.myListings.filter(item => item.id !== id);
  market.favorites.delete(id);
  delete market.chats[id];
  saveMyListings();
  saveJSON(STORAGE.favorites, Array.from(market.favorites));
  saveJSON(STORAGE.chats, market.chats);
}

export function toggleListingStatus(id) {
  const listing = market.myListings.find(item => item.id === id);
  if (!listing) return;
  listing.status = listing.status === 'paused' ? 'active' : 'paused';
  saveMyListings();
}

export function rememberSearch(term) {
  const value = String(term || '').trim();
  if (!value) return;
  market.searches = [value, ...market.searches.filter(item => item !== value)].slice(0, 6);
  saveJSON(STORAGE.searches, market.searches);
}

export function clearSearches() {
  market.searches = [];
  saveJSON(STORAGE.searches, market.searches);
}

export function ensureThread(item) {
  if (!market.chats[item.id]) {
    const place = item.area ? `，我一般在${item.area}附近` : '';
    market.chats[item.id] = {
      messages: [{
        from: 'them',
        text: `你好呀，这件「${item.title}」还在的～${place}，你什么时候方便约看？`,
        ts: Date.now()
      }],
      updatedAt: Date.now(),
      unread: 0
    };
    saveJSON(STORAGE.chats, market.chats);
  }
  return market.chats[item.id];
}

export function markThreadRead(id) {
  const thread = market.chats[id];
  if (thread) {
    thread.unread = 0;
    saveJSON(STORAGE.chats, market.chats);
  }
}

export function pushMessage(id, message) {
  const thread = market.chats[id];
  if (!thread) return;
  thread.messages.push(message);
  thread.updatedAt = Date.now();
  saveJSON(STORAGE.chats, market.chats);
}

export function saveChats() {
  saveJSON(STORAGE.chats, market.chats);
}

export function getFilteredListings(params = {}) {
  const q = String(params.q || '').trim().toLowerCase();
  const cat = params.cat || 'all';
  const cond = params.cond || 'all';
  const area = params.area || 'all';
  const min = Number(params.min);
  const max = Number(params.max);
  const sort = params.sort || 'new';

  let result = activeListings.value.filter(item => {
    if (cat !== 'all' && item.category !== cat) return false;
    if (cond !== 'all' && item.condition !== cond) return false;
    if (area !== 'all' && item.area !== area) return false;
    if (params.min !== '' && params.min != null && Number.isFinite(min) && item.price < min) return false;
    if (params.max !== '' && params.max != null && Number.isFinite(max) && item.price > max) return false;
    if (q) {
      const category = CATEGORIES.find(entry => entry.id === item.category);
      const haystack = [
        item.title,
        item.description,
        item.area,
        item.location,
        category ? category.name : '',
        (item.tags || []).join(' ')
      ].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  if (sort === 'price_asc') result.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
  else result.sort((a, b) => b.createdAt - a.createdAt);

  return result;
}
