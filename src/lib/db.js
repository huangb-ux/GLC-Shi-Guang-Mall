import { SEED_LISTINGS } from '../data/site';

const DB_NAME = 'shiguang-db';
const DB_VERSION = 1;

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
    dept: dept?.trim() || '未填写学院',
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
    throw new Error('账号不存在，请检查手机号或管理员账号');
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
