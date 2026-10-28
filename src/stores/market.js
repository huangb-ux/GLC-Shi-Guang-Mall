import { computed, reactive } from 'vue';
import { CATEGORIES, SCHOOL } from '../data/site';
import {
  checkoutTransaction,
  createAccount,
  deleteRecord,
  findAccount,
  getAll,
  getCart,
  makeId,
  putRecord,
  saveCart,
  updateAccount
} from '../lib/db';

const SESSION_KEY = 'shg.vue.session.v1';
const SEARCH_KEY = 'shg.vue.searches.v1';

const GUEST = {
  id: null,
  name: '游客',
  initial: '登',
  school: SCHOOL.name,
  dept: '',
  rating: 5,
  deals: 0,
  verified: false,
  role: 'guest',
  publishBanned: false
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
  } catch (error) {
    // 忽略本地存储失败，页面仍然可以继续用。
  }
}

function chatKey(userId) {
  return `shg.vue.chats.v2.${userId}`;
}

export const market = reactive({
  ready: false,
  currentUser: null,
  user: GUEST,
  school: SCHOOL,
  accounts: [],
  listings: [],
  myListings: [],
  favorites: new Set(),
  cart: [],
  chats: {},
  searches: loadJSON(SEARCH_KEY, []),
  orders: [],
  reports: [],
  feedback: [],
  flags: {},
  forumPosts: [],
  gamePosts: []
});

export const allListings = computed(() => market.listings);
export const activeListings = computed(() => market.listings.filter(item => item.status === 'active'));
export const favoriteListings = computed(() =>
  Array.from(market.favorites)
    .map(id => getListing(id))
    .filter(Boolean)
);
export const favoriteCount = computed(() => market.favorites.size);
export const unreadTotal = computed(() =>
  Object.values(market.chats).reduce((total, thread) => total + (thread.unread || 0), 0)
);
export const cartListings = computed(() =>
  market.cart.map(id => getListing(id)).filter(Boolean)
);
export const cartCount = computed(() => cartListings.value.length);
export const myOrders = computed(() =>
  market.orders.filter(order => order.buyerId === market.currentUser?.id)
);
export const isAdmin = computed(() => market.currentUser?.role === 'admin');
export const canPublish = computed(() =>
  Boolean(market.currentUser && !market.currentUser.publishBanned)
);

export function getListing(id) {
  return market.listings.find(item => item.id === id) || null;
}

export function isMine(item) {
  return Boolean(item && market.currentUser && item.sellerId === market.currentUser.id);
}

function syncMyListings() {
  market.myListings = market.currentUser
    ? market.listings.filter(item => item.sellerId === market.currentUser.id)
    : [];
}

function loadChats(userId) {
  return loadJSON(chatKey(userId), {});
}

async function setCurrentUser(account) {
  market.currentUser = account;
  market.user = account;
  market.favorites = new Set(account.favorites || []);
  market.cart = market.currentUser ? await getCart(account.id) : [];
  market.chats = loadChats(account.id);
  localStorage.setItem(SESSION_KEY, account.id);
  syncMyListings();
}

export async function hydrateStore() {
  const [accounts, listings, orders, reports, feedback, flags, forumPosts, gamePosts] = await Promise.all([
    getAll('accounts'),
    getAll('listings'),
    getAll('orders'),
    getAll('reports'),
    getAll('feedback'),
    getAll('sellerFlags'),
    getAll('forumPosts'),
    getAll('gamePosts')
  ]);

  market.accounts = accounts;
  market.listings = listings;
  market.orders = orders;
  market.reports = reports;
  market.feedback = feedback;
  market.flags = Object.fromEntries(flags.map(flag => [flag.sellerId, flag]));
  market.forumPosts = forumPosts.sort((a, b) => b.createdAt - a.createdAt);
  market.gamePosts = gamePosts.sort((a, b) => b.createdAt - a.createdAt);

  const sessionId = localStorage.getItem(SESSION_KEY);
  const sessionUser = accounts.find(account => account.id === sessionId);
  if (sessionUser) {
    await setCurrentUser(sessionUser);
  } else {
    localStorage.removeItem(SESSION_KEY);
    market.currentUser = null;
    market.user = GUEST;
    market.favorites = new Set();
    market.cart = [];
    market.chats = {};
    syncMyListings();
  }

  market.ready = true;
}

export async function loginAccount(identifier, password) {
  const account = await findAccount(identifier, password);
  await setCurrentUser(account);
  return account;
}

export async function registerAccount(payload) {
  const account = await createAccount(payload);
  market.accounts.push(account);
  await setCurrentUser(account);
  return account;
}

export function logoutAccount() {
  market.currentUser = null;
  market.user = GUEST;
  market.favorites = new Set();
  market.cart = [];
  market.chats = {};
  syncMyListings();
  localStorage.removeItem(SESSION_KEY);
}

export async function saveAccount(account) {
  await updateAccount(account);
  const index = market.accounts.findIndex(item => item.id === account.id);
  if (index >= 0) market.accounts[index] = account;
  if (market.currentUser?.id === account.id) market.currentUser = account;
}

export function toggleFavorite(id) {
  if (!market.currentUser) return 'auth';
  if (!getListing(id)) return 'missing';

  const added = !market.favorites.has(id);
  if (added) market.favorites.add(id);
  else market.favorites.delete(id);

  market.currentUser.favorites = Array.from(market.favorites);
  saveAccount(market.currentUser).catch(() => {});
  return added ? 'added' : 'removed';
}

export async function addListing(payload) {
  if (!market.currentUser) throw new Error('请先登录');
  if (market.currentUser.publishBanned) throw new Error('你的发布权限已被暂停');

  const sellerId = market.currentUser.id;
  const listing = {
    ...payload,
    id: makeId('u'),
    sellerId,
    seller: {
      id: sellerId,
      name: market.currentUser.name,
      initial: market.currentUser.initial,
      school: SCHOOL.name,
      dept: market.currentUser.dept,
      rating: market.currentUser.rating || 5,
      deals: market.currentUser.deals || 0,
      verified: true
    },
    status: 'active',
    createdAt: Date.now()
  };

  await putRecord('listings', listing);
  market.listings.unshift(listing);

  if (payload.contact) {
    market.currentUser.contact = payload.contact;
    await saveAccount(market.currentUser);
  }

  syncMyListings();
  return listing;
}

export async function updateListing(id, payload) {
  const listing = market.listings.find(item => item.id === id);
  if (!listing || !isMine(listing)) throw new Error('没有权限编辑这件闲置');

  Object.assign(listing, payload, { updatedAt: Date.now() });
  await putRecord('listings', listing);
  syncMyListings();
  return listing;
}

export async function deleteListing(id) {
  const listing = market.listings.find(item => item.id === id);
  if (!listing || !isMine(listing)) return;

  await deleteRecord('listings', id);
  market.listings = market.listings.filter(item => item.id !== id);
  market.favorites.delete(id);
  if (market.currentUser) {
    market.currentUser.favorites = Array.from(market.favorites);
    await saveAccount(market.currentUser);
  }
  syncMyListings();
}

export async function toggleListingStatus(id) {
  const listing = market.listings.find(item => item.id === id);
  if (!listing || !isMine(listing)) return;
  listing.status = listing.status === 'paused' ? 'active' : 'paused';
  await putRecord('listings', listing);
  syncMyListings();
}

export async function addToCart(id) {
  if (!market.currentUser) return { status: 'auth' };
  const listing = getListing(id);
  if (!listing) return { status: 'missing' };
  if (isMine(listing)) return { status: 'own' };
  if (listing.status !== 'active') return { status: 'unavailable' };
  if (market.cart.includes(id)) return { status: 'exists' };

  market.cart.push(id);
  await saveCart(market.currentUser.id, market.cart);
  return { status: 'ok' };
}

export async function removeFromCart(id) {
  market.cart = market.cart.filter(itemId => itemId !== id);
  if (market.currentUser) await saveCart(market.currentUser.id, market.cart);
}

export async function checkoutCart() {
  if (!market.currentUser) throw new Error('请先登录');
  const items = market.cart.map(getListing).filter(item => item && item.status === 'active');
  if (!items.length) throw new Error('购物车是空的');

  const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const order = {
    id: makeId('o'),
    buyerId: market.currentUser.id,
    buyerName: market.currentUser.name,
    items: items.map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      condition: item.condition,
      sellerId: item.sellerId,
      seller: item.seller,
      contact: item.contact,
      images: item.images || [],
      art: item.art,
      tone: item.tone
    })),
    total,
    createdAt: Date.now()
  };

  await checkoutTransaction(market.currentUser.id, items, order);

  const soldIds = new Set(items.map(item => item.id));
  market.listings = market.listings.filter(item => !soldIds.has(item.id));
  market.cart = [];
  market.orders.unshift(order);

  market.favorites = new Set(Array.from(market.favorites).filter(id => !soldIds.has(id)));
  market.currentUser.favorites = Array.from(market.favorites);
  await saveAccount(market.currentUser);
  syncMyListings();

  return order;
}

export function getSeller(sellerId) {
  if (!sellerId) return null;
  const account = market.accounts.find(item => item.id === sellerId);
  const sellerListings = market.listings.filter(item => item.sellerId === sellerId);
  const base = account || sellerListings[0]?.seller;
  if (!base) return null;

  const reviews = market.feedback.filter(item => item.sellerId === sellerId);
  const reports = market.reports.filter(item => item.sellerId === sellerId && item.status !== 'rejected');
  const reportBuyers = new Set(reports.map(item => item.buyerId));
  const flag = market.flags[sellerId];
  const orders = market.orders.filter(order => order.items.some(item => item.sellerId === sellerId));
  const rating = reviews.length
    ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length
    : Number(base.rating || 5);

  return {
    id: sellerId,
    name: account?.name || base.name,
    initial: account?.initial || base.initial || '同',
    school: SCHOOL.name,
    dept: account?.dept || base.dept || '未填写学院',
    role: account?.role || 'user',
    phone: account?.phone || '',
    rating: Number(rating.toFixed(1)),
    deals: Number(base.deals || 0) + orders.length,
    verified: true,
    publishBanned: Boolean(account?.publishBanned || flag?.banned),
    banReason: account?.banReason || flag?.reason || '',
    reportCount: reportBuyers.size,
    feedbackCount: reviews.length,
    contact: sellerListings.find(item => item.contact)?.contact || account?.contact || null
  };
}

export function getSellerListings(sellerId) {
  return market.listings
    .filter(item => item.sellerId === sellerId && item.status === 'active')
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getSellerFeedback(sellerId) {
  return market.feedback
    .filter(item => item.sellerId === sellerId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getSellerReports(sellerId) {
  return market.reports
    .filter(item => item.sellerId === sellerId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function submitFeedback({ sellerId, rating, text }) {
  if (!market.currentUser) throw new Error('请先登录后再评价');
  if (sellerId === market.currentUser.id) throw new Error('不能评价自己');
  if (market.feedback.some(item => item.sellerId === sellerId && item.buyerId === market.currentUser.id)) {
    throw new Error('你已经评价过这位卖家了');
  }

  const entry = {
    id: makeId('fb'),
    sellerId,
    buyerId: market.currentUser.id,
    buyerName: market.currentUser.name,
    rating: Number(rating),
    text: String(text || '').trim(),
    createdAt: Date.now()
  };

  await putRecord('feedback', entry);
  market.feedback.push(entry);
  return entry;
}

async function banSeller(sellerId, reason, reportCount) {
  const flag = {
    sellerId,
    banned: true,
    reason,
    reportCount,
    updatedAt: Date.now()
  };
  await putRecord('sellerFlags', flag);
  market.flags[sellerId] = flag;

  const account = market.accounts.find(item => item.id === sellerId);
  if (account) {
    account.publishBanned = true;
    account.banReason = reason;
    await saveAccount(account);
    if (market.currentUser?.id === sellerId) market.user = account;
  }
}

export async function submitReport({ sellerId, listingId, reason }) {
  if (!market.currentUser) throw new Error('请先登录后再举报');
  if (sellerId === market.currentUser.id) throw new Error('不能举报自己');
  if (!reason?.trim()) throw new Error('请填写举报原因');
  if (market.reports.some(item => item.sellerId === sellerId && item.buyerId === market.currentUser.id)) {
    throw new Error('你已经举报过这位卖家了');
  }

  const report = {
    id: makeId('r'),
    sellerId,
    listingId: listingId || null,
    buyerId: market.currentUser.id,
    buyerName: market.currentUser.name,
    reason: reason.trim(),
    status: 'pending',
    createdAt: Date.now()
  };

  await putRecord('reports', report);
  market.reports.push(report);

  const distinctBuyers = new Set(
    market.reports
      .filter(item => item.sellerId === sellerId && item.status !== 'rejected')
      .map(item => item.buyerId)
  ).size;

  if (distinctBuyers >= 3) {
    const updated = market.reports.filter(item => item.sellerId === sellerId && item.status === 'pending');
    for (const item of updated) {
      item.status = 'verified';
      await putRecord('reports', item);
    }
    await banSeller(sellerId, '3 位买家举报，系统核实属实', distinctBuyers);
    return { count: distinctBuyers, banned: true };
  }

  return { count: distinctBuyers, banned: false };
}

export async function adminResolveReport(reportId, verified) {
  const report = market.reports.find(item => item.id === reportId);
  if (!report) return;
  report.status = verified ? 'verified' : 'rejected';
  report.reviewedAt = Date.now();
  await putRecord('reports', report);

  if (verified) {
    const count = new Set(
      market.reports
        .filter(item => item.sellerId === report.sellerId && item.status !== 'rejected')
        .map(item => item.buyerId)
    ).size;
    await banSeller(report.sellerId, '管理员核实举报属实', count);
  }
}

export async function restoreSeller(sellerId) {
  const flag = { ...(market.flags[sellerId] || {}), sellerId, banned: false, updatedAt: Date.now() };
  await putRecord('sellerFlags', flag);
  market.flags[sellerId] = flag;

  const account = market.accounts.find(item => item.id === sellerId);
  if (account) {
    account.publishBanned = false;
    account.banReason = '';
    await saveAccount(account);
    if (market.currentUser?.id === sellerId) market.user = account;
  }
}

export function getSellerFlag(sellerId) {
  return market.flags[sellerId] || null;
}

export function rememberSearch(term) {
  const value = String(term || '').trim();
  if (!value) return;
  market.searches = [value, ...market.searches.filter(item => item !== value)].slice(0, 6);
  saveJSON(SEARCH_KEY, market.searches);
}

export function clearSearches() {
  market.searches = [];
  saveJSON(SEARCH_KEY, market.searches);
}

export function ensureThread(item) {
  if (!market.currentUser) return null;
  if (!market.chats[item.id]) {
    market.chats[item.id] = {
      messages: [{
        from: 'them',
        text: `你好呀，这件「${item.title}」还在的～ 我们可以约在校内方便的地方面交，具体时间和地点可以商量。`,
        ts: Date.now()
      }],
      updatedAt: Date.now(),
      unread: 0
    };
    saveChats();
  }
  return market.chats[item.id];
}

export function markThreadRead(id) {
  const thread = market.chats[id];
  if (thread) {
    thread.unread = 0;
    saveChats();
  }
}

export function pushMessage(id, message) {
  const thread = market.chats[id];
  if (!thread) return;
  thread.messages.push(message);
  thread.updatedAt = Date.now();
  saveChats();
}

export function saveChats() {
  if (!market.currentUser) return;
  saveJSON(chatKey(market.currentUser.id), market.chats);
}

export function getFilteredListings(params = {}) {
  const q = String(params.q || '').trim().toLowerCase();
  const cat = params.cat || 'all';
  const cond = params.cond || 'all';
  const min = Number(params.min);
  const max = Number(params.max);
  const sort = params.sort || 'new';

  let result = activeListings.value.filter(item => {
    if (cat !== 'all' && item.category !== cat) return false;
    if (cond !== 'all' && item.condition !== cond) return false;
    if (params.min !== '' && params.min != null && Number.isFinite(min) && item.price < min) return false;
    if (params.max !== '' && params.max != null && Number.isFinite(max) && item.price > max) return false;
    if (q) {
      const category = CATEGORIES.find(entry => entry.id === item.category);
      const haystack = [
        item.title,
        item.description,
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

export async function createForumPost({ title, topic, content }) {
  if (!market.currentUser) throw new Error('请先登录');
  const cleanTitle = String(title || '').trim();
  const cleanContent = String(content || '').trim();
  if (cleanTitle.length < 2) throw new Error('标题至少写 2 个字');
  if (cleanContent.length < 5) throw new Error('正文至少写 5 个字');

  const post = {
    id: makeId('f'),
    authorId: market.currentUser.id,
    authorName: market.currentUser.name,
    authorInitial: market.currentUser.initial,
    title: cleanTitle,
    content: cleanContent,
    topic: topic || '校园趣事',
    likes: [],
    createdAt: Date.now()
  };
  await putRecord('forumPosts', post);
  market.forumPosts.unshift(post);
  return post;
}

export async function toggleForumLike(postId) {
  if (!market.currentUser) return 'auth';
  const post = market.forumPosts.find(item => item.id === postId);
  if (!post) return 'missing';

  const likes = Array.isArray(post.likes) ? post.likes : [];
  const index = likes.indexOf(market.currentUser.id);
  const liked = index < 0;
  if (liked) likes.push(market.currentUser.id);
  else likes.splice(index, 1);
  post.likes = likes;
  await putRecord('forumPosts', post);
  return liked;
}

export async function createGamePost(payload) {
  if (!market.currentUser) throw new Error('请先登录');
  const game = String(payload.game || '').trim();
  const description = String(payload.description || '').trim();
  if (!game) throw new Error('请填写游戏名称');
  if (description.length < 4) throw new Error('组队说明至少写 4 个字');

  let link = String(payload.link || '').trim();
  if (!/^https?:\/\//i.test(link)) link = `https://${link}`;
  try {
    new URL(link);
  } catch (error) {
    throw new Error('游戏链接格式不正确');
  }

  const post = {
    id: makeId('g'),
    authorId: market.currentUser.id,
    authorName: market.currentUser.name,
    authorInitial: market.currentUser.initial,
    game,
    platform: payload.platform || '手机',
    link,
    playTime: String(payload.playTime || '').trim() || '时间待定',
    description,
    contact: String(payload.contact || '').trim(),
    players: [],
    createdAt: Date.now()
  };
  await putRecord('gamePosts', post);
  market.gamePosts.unshift(post);
  return post;
}

export async function toggleGameJoin(postId) {
  if (!market.currentUser) return 'auth';
  const post = market.gamePosts.find(item => item.id === postId);
  if (!post) return 'missing';

  const players = Array.isArray(post.players) ? post.players : [];
  const index = players.indexOf(market.currentUser.id);
  const joined = index < 0;
  if (joined) players.push(market.currentUser.id);
  else players.splice(index, 1);
  post.players = players;
  await putRecord('gamePosts', post);
  return joined;
}
