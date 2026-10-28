import { normalizeCollege, SEED_LISTINGS } from '../data/site';

const DB_NAME = 'shiguang-db';
const DB_VERSION = 2;

let databasePromise = null;

function openDatabase() {
  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains('accounts')) {
        const store = db.createObjectStore('accounts', { keyPath: 'id' });
        store.createIndex('phone', 'phone', { unique: true });
        store.createIndex('username', 'username', { unique: true });
      }

      if (!db.objectStoreNames.contains('listings')) {
        const store = db.createObjectStore('listings', { keyPath: 'id' });
        store.createIndex('sellerId', 'sellerId');
        store.createIndex('status', 'status');
      }

      if (!db.objectStoreNames.contains('carts')) {
        db.createObjectStore('carts', { keyPath: 'userId' });
      }

      if (!db.objectStoreNames.contains('orders')) {
        const store = db.createObjectStore('orders', { keyPath: 'id' });
        store.createIndex('buyerId', 'buyerId');
      }

      if (!db.objectStoreNames.contains('reports')) {
        const store = db.createObjectStore('reports', { keyPath: 'id' });
        store.createIndex('sellerId', 'sellerId');
        store.createIndex('buyerId', 'buyerId');
        store.createIndex('status', 'status');
      }

      if (!db.objectStoreNames.contains('feedback')) {
        const store = db.createObjectStore('feedback', { keyPath: 'id' });
        store.createIndex('sellerId', 'sellerId');
        store.createIndex('buyerId', 'buyerId');
      }

      if (!db.objectStoreNames.contains('sellerFlags')) {
        db.createObjectStore('sellerFlags', { keyPath: 'sellerId' });
      }

      if (!db.objectStoreNames.contains('forumPosts')) {
        const store = db.createObjectStore('forumPosts', { keyPath: 'id' });
        store.createIndex('authorId', 'authorId');
        store.createIndex('createdAt', 'createdAt');
      }

      if (!db.objectStoreNames.contains('gamePosts')) {
        const store = db.createObjectStore('gamePosts', { keyPath: 'id' });
        store.createIndex('authorId', 'authorId');
        store.createIndex('createdAt', 'createdAt');
      }

      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return databasePromise;
}

function run(storeName, mode, operation) {
  return openDatabase().then(db => new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    let request;

    try {
      request = operation(store);
    } catch (error) {
      reject(error);
      return;
    }

    transaction.oncomplete = () => resolve(request ? request.result : undefined);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  }));
}

function toPlain(value) {
  return JSON.parse(JSON.stringify(value));
}

export function getAll(storeName) {
  return run(storeName, 'readonly', store => store.getAll());
}

export function getRecord(storeName, key) {
  return run(storeName, 'readonly', store => store.get(key));
}

export function putRecord(storeName, value) {
  return run(storeName, 'readwrite', store => store.put(toPlain(value)));
}

export function deleteRecord(storeName, key) {
  return run(storeName, 'readwrite', store => store.delete(key));
}

export function getByIndex(storeName, indexName, value) {
  return run(storeName, 'readonly', store => store.index(indexName).get(value));
}

export function getAllByIndex(storeName, indexName, value) {
  return run(storeName, 'readonly', store => store.index(indexName).getAll(value));
}

export function makeId(prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function randomSalt() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function sha256(text) {
  if (window.crypto?.subtle) {
    const data = new TextEncoder().encode(text);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // 旧浏览器兜底：只用于课程演示，不能当作真实密码安全方案。
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
  }
  return String(hash);
}

export async function hashPassword(password, salt) {
  return sha256(`${salt}:${password}`);
}

function buildSeedListings() {
  const baseTime = Date.now();
  return SEED_LISTINGS.map(item => {
    const sellerId = item.seller?.id || `seed-seller-${item.id}`;
    return {
      ...item,
      sellerId,
      seller: { ...item.seller, id: sellerId },
      contact: item.contact || {
        type: 'wechat',
        value: `guilin_shiguang_${item.id}`
      },
      createdAt: baseTime - (item.ageMin || 60) * 60000
    };
  });
}

const TEST_ACCOUNTS = [
  { username: 'admin1', password: 'public1', name: '阿桂1号', dept: '信息工程学院' },
  { username: 'admin2', password: 'public2', name: '阿桂2号', dept: '文化与传媒学院' },
  { username: 'admin3', password: 'public3', name: '阿桂3号', dept: '工商管理学院' },
  { username: 'admin4', password: 'public4', name: '阿桂4号', dept: '信息工程学院' },
  { username: 'admin5', password: 'public5', name: '阿桂5号', dept: '旅游与体育健康学院' }
];

function buildSeedForumPosts() {
  const now = Date.now();
  return [
    {
      id: 'seed-forum-1',
      authorId: 'u-admin1',
      authorName: '阿桂1号',
      authorInitial: '桂',
      title: '图书馆三楼靠窗的位置，下午四点的光最好',
      content: '最近准备考试，天天泡图书馆。三楼靠窗那排下午四点左右会有一束光斜斜地落在桌面上，连翻书的声音都变轻了。有人也喜欢那个位置吗？',
      topic: '校园趣事',
      likes: ['u-admin2', 'u-admin3', 'u-admin5'],
      createdAt: now - 2 * 60 * 60 * 1000
    },
    {
      id: 'seed-forum-2',
      authorId: 'u-admin2',
      authorName: '阿桂2号',
      authorInitial: '桂',
      title: '有没有人一起夜跑操场？',
      content: '最近想坚持夜跑，一个人总容易放弃。一般晚上八点半从东门操场开始，配速很慢，跑三公里左右。想找几个同学互相监督，跑完可以一起去乐善食府喝点东西。',
      topic: '校园日常',
      likes: ['u-admin1', 'u-admin4'],
      createdAt: now - 6 * 60 * 60 * 1000
    },
    {
      id: 'seed-forum-3',
      authorId: 'u-admin3',
      authorName: '阿桂3号',
      authorInitial: '桂',
      title: '整理了一份桂院周边小吃清单',
      content: '后街的螺蛳粉、雁山市场的炸串、还有校门口那家糖水铺……最近整理了一份自己的桂院周边小吃清单，都是人均二十以内的小店。评论区可以补充，我下次挨个去打卡。',
      topic: '美食推荐',
      likes: ['u-admin2', 'u-admin4', 'u-admin5'],
      createdAt: now - 26 * 60 * 60 * 1000
    },
    {
      id: 'seed-forum-4',
      authorId: 'u-admin5',
      authorName: '阿桂5号',
      authorInitial: '桂',
      title: '操场捡到一把黑色雨伞，失主看到了吗？',
      content: '昨晚在操场看台最上面一排捡到一把黑色长柄雨伞，伞柄上有一个小小的白色挂件。先放在东门保安室了，失主可以带着描述去认领。',
      topic: '失物招领',
      likes: [],
      createdAt: now - 30 * 60 * 60 * 1000
    }
  ];
}

function buildSeedGamePosts() {
  const now = Date.now();
  return [
    {
      id: 'seed-game-1',
      authorId: 'u-admin4',
      authorName: '阿桂4号',
      authorInitial: '桂',
      game: '王者荣耀',
      platform: '手机',
      link: 'https://pvp.qq.com/',
      playTime: '今晚 21:00',
      description: '缺一个辅助/游走，段位星耀左右，娱乐局不压力。开麦优先，输赢都开心。',
      contact: '微信：guilin_wzry',
      players: ['u-admin5'],
      createdAt: now - 55 * 60 * 1000
    },
    {
      id: 'seed-game-2',
      authorId: 'u-admin1',
      authorName: '阿桂1号',
      authorInitial: '桂',
      game: '英雄联盟',
      platform: 'PC',
      link: 'https://lol.qq.com/',
      playTime: '周六 19:30',
      description: '电一灵活排位，缺打野/中单，翡翠左右，开麦优先。打两把就撤，不熬夜。',
      contact: 'QQ：1200000002',
      players: [],
      createdAt: now - 3 * 60 * 60 * 1000
    },
    {
      id: 'seed-game-3',
      authorId: 'u-admin2',
      authorName: '阿桂2号',
      authorInitial: '桂',
      game: '永劫无间',
      platform: 'PC',
      link: 'https://www.yjwujian.cn/',
      playTime: '周日 20:00',
      description: '三排缺一，娱乐为主，会振刀就行。想找固定搭子，以后周末都可以一起。',
      contact: '微信：guilin_yjwj',
      players: ['u-admin1'],
      createdAt: now - 8 * 60 * 60 * 1000
    }
  ];
}

export async function initDatabase() {
  const accounts = await getAll('accounts');
  if (!accounts.some(account => account.username === 'admin')) {
    const salt = 'admin-salt';
    const passwordHash = await hashPassword('public', salt);
    await putRecord('accounts', {
      id: 'admin',
      username: 'admin',
      phone: null,
      passwordHash,
      salt,
      name: '管理员',
      initial: '管',
      school: '桂林学院',
      dept: '拾光集运营',
      role: 'admin',
      verified: true,
      publishBanned: false,
      banReason: '',
      favorites: [],
      deals: 0,
      createdAt: Date.now()
    });
  }

  // 5 个演示账号：admin1-admin5 / public1-public5（普通用户权限）。
  for (const test of TEST_ACCOUNTS) {
    const existing = await getByIndex('accounts', 'username', test.username);
    if (existing) continue;
    const salt = randomSalt();
    const passwordHash = await hashPassword(test.password, salt);
    await putRecord('accounts', {
      id: `u-${test.username}`,
      username: test.username,
      phone: null,
      passwordHash,
      salt,
      name: test.name,
      initial: '桂',
      school: '桂林学院',
      dept: test.dept,
      role: 'user',
      isTest: true,
      verified: true,
      publishBanned: false,
      banReason: '',
      favorites: [],
      deals: 0,
      createdAt: Date.now()
    });
  }

  const listings = await getAll('listings');
  const seeded = await getRecord('meta', 'seed');
  if (!seeded && !listings.length) {
    const seed = buildSeedListings();
    await Promise.all(seed.map(item => putRecord('listings', item)));
    await putRecord('meta', { key: 'seed', value: true, seededAt: Date.now() });
  } else if (!seeded) {
    // 老数据已经存在时，只补一个标记，避免以后把演示商品再次灌入。
    await putRecord('meta', { key: 'seed', value: true, seededAt: Date.now() });
  }

  // 把旧版本里不准确的院系名称迁移到桂林学院官网当前名单。
  const allAccounts = await getAll('accounts');
  for (const account of allAccounts) {
    if (account.role === 'admin' || !account.dept) continue;
    const normalized = normalizeCollege(account.dept);
    if (normalized !== account.dept) {
      account.dept = normalized;
      await putRecord('accounts', account);
    }
  }

  const allListings = await getAll('listings');
  for (const listing of allListings) {
    const current = listing.seller?.dept;
    if (!current) continue;
    const normalized = normalizeCollege(current);
    if (normalized !== current) {
      listing.seller.dept = normalized;
      await putRecord('listings', listing);
    }
  }

  // 论坛和游戏天地的演示内容只灌入一次。
  const communitySeeded = await getRecord('meta', 'communitySeed');
  if (!communitySeeded) {
    await Promise.all(buildSeedForumPosts().map(post => putRecord('forumPosts', post)));
    await Promise.all(buildSeedGamePosts().map(post => putRecord('gamePosts', post)));
    await putRecord('meta', { key: 'communitySeed', value: true, seededAt: Date.now() });
  }
}

export async function createAccount({ name, phone, password, dept }) {
  const existing = await getByIndex('accounts', 'phone', phone);
  if (existing) {
    throw new Error('这个手机号已经注册过了，请直接登录');
  }

  const salt = randomSalt();
  const passwordHash = await hashPassword(password, salt);
  const account = {
    id: makeId('u'),
    phone,
    username: null,
    passwordHash,
    salt,
    name: name.trim(),
    initial: name.trim().slice(0, 1) || '同',
    school: '桂林学院',
    dept: normalizeCollege(dept || '信息工程学院'),
    role: 'user',
    verified: true,
    publishBanned: false,
    banReason: '',
    favorites: [],
    deals: 0,
    createdAt: Date.now()
  };

  await putRecord('accounts', account);
  return account;
}

export async function findAccount(identifier, password) {
  const value = identifier.trim();
  const account = /^1[3-9]\d{9}$/.test(value)
    ? await getByIndex('accounts', 'phone', value)
    : await getByIndex('accounts', 'username', value);

  if (!account) {
    throw new Error('账号不存在，请检查手机号或账号');
  }

  const passwordHash = await hashPassword(password, account.salt);
  if (passwordHash !== account.passwordHash) {
    throw new Error('密码不正确');
  }

  return account;
}

export async function updateAccount(account) {
  await putRecord('accounts', account);
  return account;
}

export async function getCart(userId) {
  const record = await getRecord('carts', userId);
  return record?.items || [];
}

export async function saveCart(userId, items) {
  await putRecord('carts', { userId, items, updatedAt: Date.now() });
}

export function checkoutTransaction(userId, items, order) {
  return openDatabase().then(db => new Promise((resolve, reject) => {
    const transaction = db.transaction(['listings', 'orders', 'carts'], 'readwrite');
    const listings = transaction.objectStore('listings');
    const orders = transaction.objectStore('orders');
    const carts = transaction.objectStore('carts');

    items.forEach(item => listings.delete(item.id));
    orders.add(toPlain(order));
    carts.delete(userId);

    transaction.oncomplete = () => resolve(order);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  }));
}

export async function addOrder(order) {
  return putRecord('orders', order);
}

export async function deleteListingRecord(id) {
  return deleteRecord('listings', id);
}
