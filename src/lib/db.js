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
  { username: 'admin5', password: 'public5', name: '阿桂5号', dept: '旅游与体育健康学院' },
  { username: 'admin6', password: 'public6', name: '阿桂6号', dept: '金融与法律学院' },
  { username: 'admin7', password: 'public7', name: '阿桂7号', dept: '教育与音乐学院' },
  { username: 'admin8', password: 'public8', name: '阿桂8号', dept: '城市设计学院' },
  { username: 'admin9', password: 'public9', name: '阿桂9号', dept: '文化与传媒学院' },
  { username: 'admin10', password: 'public10', name: '阿桂10号', dept: '信息工程学院' }
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

function buildTestListings() {
  const baseTime = Date.now();
  const items = [
    {
      n: 1,
      title: '宿舍静音小风扇 · 三档可调',
      category: 'dorm',
      price: 25,
      originalPrice: 59,
      condition: '9成新',
      tags: ['宿舍神器', '静音'],
      description: '去年夏天买的，三档风力，晚上开着睡觉也不吵。毕业整理宿舍，低价出给需要的同学。'
    },
    {
      n: 2,
      title: '《传播学概论》教材 + 手写笔记',
      category: 'books',
      price: 18,
      originalPrice: 45,
      condition: '8成新',
      tags: ['教材', '笔记'],
      description: '教材有少量勾画，笔记是上课整理的框架和重点，适合期末复习。'
    },
    {
      n: 3,
      title: '奶油白桌面收纳盒 · 三层',
      category: 'dorm',
      price: 12,
      originalPrice: 29,
      condition: '9成新',
      tags: ['收纳', '桌面'],
      description: '桌面放护肤品和小文具刚好，抽屉顺滑，没有破损。'
    },
    {
      n: 4,
      title: '罗技 M330 无线鼠标 · 静音款',
      category: 'digital',
      price: 45,
      originalPrice: 99,
      condition: '95新',
      tags: ['鼠标', '静音'],
      description: '图书馆用很安静，电池仓正常，送一节新电池。'
    },
    {
      n: 5,
      title: '羽毛球拍两支 · 送一筒球',
      category: 'sports',
      price: 60,
      originalPrice: 150,
      condition: '8成新',
      tags: ['羽毛球', '双拍'],
      description: '入门拍，拉线还很好，适合晚上去操场随便打打。'
    },
    {
      n: 6,
      title: '考研英语真题 2015–2025',
      category: 'books',
      price: 30,
      originalPrice: 89,
      condition: '9成新',
      tags: ['考研', '英语'],
      description: '真题册基本没写，答案册有少量铅笔标记，可以擦掉。'
    },
    {
      n: 7,
      title: '桂院文创帆布托特包',
      category: 'fashion',
      price: 35,
      originalPrice: 69,
      condition: '全新',
      tags: ['帆布包', '文创'],
      description: '校园活动发的，没用过，容量很大，装书和电脑都行。'
    },
    {
      n: 8,
      title: '宿舍小型加湿器 · 带夜灯',
      category: 'dorm',
      price: 28,
      originalPrice: 69,
      condition: '9成新',
      tags: ['加湿器', '夜灯'],
      description: '换季的时候用了几次，雾量正常，夜灯模式还可以当小灯。'
    },
    {
      n: 9,
      title: '吉他变调夹 + 备用弦',
      category: 'instrument',
      price: 15,
      originalPrice: 35,
      condition: '95新',
      tags: ['吉他', '配件'],
      description: '买重了，一直放在琴包里，变调夹和一套备用弦一起出。'
    },
    {
      n: 10,
      title: '多肉盆栽 · 带陶盆',
      category: 'plant',
      price: 10,
      originalPrice: 25,
      condition: '8成新',
      tags: ['多肉', '盆栽'],
      description: '养了一年多，状态很好，带原陶盆。宿舍窗台就能养。'
    }
  ];

  const artByItem = {
    1: 'fan',
    2: 'books',
    3: 'box',
    4: 'mouse',
    5: 'racket',
    6: 'books',
    7: 'bag',
    8: 'humidifier',
    9: 'guitar',
    10: 'plant'
  };

  return items.map((item, index) => {
    const account = TEST_ACCOUNTS[item.n - 1];
    return {
      id: `test-listing-${item.n}`,
      title: item.title,
      category: item.category,
      art: artByItem[item.n],
      price: item.price,
      originalPrice: item.originalPrice,
      condition: item.condition,
      tags: item.tags,
      description: item.description,
      sellerId: `u-${account.username}`,
      seller: {
        id: `u-${account.username}`,
        name: account.name,
        initial: '桂',
        school: '桂林学院',
        dept: account.dept,
        rating: 5,
        deals: item.n,
        verified: true
      },
      contact: { type: 'wechat', value: `guilin_test_${String(item.n).padStart(2, '0')}` },
      status: 'active',
      createdAt: baseTime - (index + 1) * 7 * 60 * 1000
    };
  });
}

function buildExtraForumPosts() {
  const now = Date.now();
  return [
    {
      id: 'seed-forum-5',
      authorId: 'u-admin4',
      authorName: '阿桂4号',
      authorInitial: '桂',
      title: '东门新开了一家糖水铺，芋圆给得好多',
      content: '今天路过东门，发现新开了一家糖水铺。点了一碗芋圆烧仙草，芋圆给得很实在，甜度也可以选。晚上九点后学生还有优惠，适合下晚课顺路去。',
      topic: '美食推荐',
      likes: ['u-admin1', 'u-admin3'],
      createdAt: now - 3 * 60 * 60 * 1000
    },
    {
      id: 'seed-forum-6',
      authorId: 'u-admin6',
      authorName: '阿桂6号',
      authorInitial: '桂',
      title: '求推荐安静一点的自习教室',
      content: '最近图书馆人有点多，想问问大家有没有哪间没课的空教室适合自习？最好插座多一点，晚上开放到十点以后。',
      topic: '学习交流',
      likes: ['u-admin7', 'u-admin9'],
      createdAt: now - 5 * 60 * 60 * 1000
    },
    {
      id: 'seed-forum-7',
      authorId: 'u-admin7',
      authorName: '阿桂7号',
      authorInitial: '桂',
      title: '傍晚的操场真的很好拍',
      content: '今天跑步的时候看到晚霞，整个看台都被染成橘色。顺手拍了几张，感觉不用滤镜就很好看。桂院的傍晚真的很值得停下来看一看。',
      topic: '校园趣事',
      likes: ['u-admin2', 'u-admin6', 'u-admin8'],
      createdAt: now - 9 * 60 * 60 * 1000
    },
    {
      id: 'seed-forum-8',
      authorId: 'u-admin8',
      authorName: '阿桂8号',
      authorInitial: '桂',
      title: '周三晚上有人一起打羽毛球吗？',
      content: '想固定约几个人周三晚上去操场旁边的羽毛球场，水平一般，主要想动一动。拍子我带了两支，球也可以一起买。',
      topic: '校园日常',
      likes: ['u-admin5'],
      createdAt: now - 14 * 60 * 60 * 1000
    },
    {
      id: 'seed-forum-9',
      authorId: 'u-admin9',
      authorName: '阿桂9号',
      authorInitial: '桂',
      title: '图书馆借的书快到期了，可以线上续借吗？',
      content: '有两本书下周到期，但最近实在看不完。记得好像可以在公众号上续借，有同学操作过吗？求一个具体步骤。',
      topic: '学习交流',
      likes: ['u-admin6'],
      createdAt: now - 20 * 60 * 60 * 1000
    },
    {
      id: 'seed-forum-10',
      authorId: 'u-admin10',
      authorName: '阿桂10号',
      authorInitial: '桂',
      title: '宿舍楼下那只橘猫今天也在晒太阳',
      content: '中午回宿舍的时候看到它趴在花坛边上，太阳正好，叫它也不动。旁边还有人放了一个小水碗，感觉大家都偷偷在照顾它。',
      topic: '校园趣事',
      likes: ['u-admin2', 'u-admin7', 'u-admin8'],
      createdAt: now - 34 * 60 * 60 * 1000
    }
  ];
}

function buildExtraGamePosts() {
  const now = Date.now();
  return [
    {
      id: 'seed-game-4',
      authorId: 'u-admin3',
      authorName: '阿桂3号',
      authorInitial: '桂',
      game: '和平精英',
      platform: '手机',
      link: 'https://gp.qq.com/',
      playTime: '今晚 20:30',
      description: '四排缺一，娱乐局，不刚枪也可以。想找人一起做任务，顺便聊聊天。',
      contact: '微信：guilin_hpjy',
      players: [],
      createdAt: now - 2 * 60 * 60 * 1000
    },
    {
      id: 'seed-game-5',
      authorId: 'u-admin5',
      authorName: '阿桂5号',
      authorInitial: '桂',
      game: '原神',
      platform: 'PC',
      link: 'https://ys.mihoyo.com/',
      playTime: '周五 21:00',
      description: '想找人一起刷周本，练度一般，慢慢打就好。也可以互相帮忙采材料。',
      contact: 'QQ：1200000005',
      players: ['u-admin9'],
      createdAt: now - 4 * 60 * 60 * 1000
    },
    {
      id: 'seed-game-6',
      authorId: 'u-admin6',
      authorName: '阿桂6号',
      authorInitial: '桂',
      game: '王者荣耀',
      platform: '手机',
      link: 'https://pvp.qq.com/',
      playTime: '周六 15:00',
      description: '五排缺中单，钻石左右，打一下午娱乐局。输了不红温，开心最重要。',
      contact: '微信：guilin_wzry_6',
      players: ['u-admin1', 'u-admin3'],
      createdAt: now - 6 * 60 * 60 * 1000
    },
    {
      id: 'seed-game-7',
      authorId: 'u-admin7',
      authorName: '阿桂7号',
      authorInitial: '桂',
      game: '英雄联盟',
      platform: 'PC',
      link: 'https://lol.qq.com/',
      playTime: '周六 21:00',
      description: '大乱斗选手，缺人凑五排。不用很会玩，能开麦聊天就行。',
      contact: 'QQ：1200000007',
      players: [],
      createdAt: now - 11 * 60 * 60 * 1000
    },
    {
      id: 'seed-game-8',
      authorId: 'u-admin8',
      authorName: '阿桂8号',
      authorInitial: '桂',
      game: '永劫无间',
      platform: 'PC',
      link: 'https://www.yjwujian.cn/',
      playTime: '周日 19:00',
      description: '三排缺一，娱乐为主，会基本操作就行。想找个固定队友，以后周末一起。',
      contact: '微信：guilin_yjwj_8',
      players: ['u-admin2'],
      createdAt: now - 16 * 60 * 60 * 1000
    },
    {
      id: 'seed-game-9',
      authorId: 'u-admin9',
      authorName: '阿桂9号',
      authorInitial: '桂',
      game: '和平精英',
      platform: '手机',
      link: 'https://gp.qq.com/',
      playTime: '周三 22:00',
      description: '双排上分，水平一般，主要想找个人一起玩。可以开麦，也可以安静打。',
      contact: '微信：guilin_hpjy_9',
      players: [],
      createdAt: now - 24 * 60 * 60 * 1000
    },
    {
      id: 'seed-game-10',
      authorId: 'u-admin10',
      authorName: '阿桂10号',
      authorInitial: '桂',
      game: '原神',
      platform: 'PC',
      link: 'https://ys.mihoyo.com/',
      playTime: '周日 15:00',
      description: '想找人一起做尘歌壶和刷材料，练度不高，互相帮忙就好。',
      contact: 'QQ：1200000010',
      players: ['u-admin5'],
      createdAt: now - 30 * 60 * 60 * 1000
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

  // 10 个演示账号：admin1-admin10 / public1-public10（普通用户权限）。
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

  // 给 10 个测试账号各准备一份商品、一条论坛帖子和一条组队邀请。
  const testDataSeeded = await getRecord('meta', 'testSeedV2');
  if (!testDataSeeded) {
    await Promise.all(buildTestListings().map(item => putRecord('listings', item)));
    await Promise.all(buildExtraForumPosts().map(post => putRecord('forumPosts', post)));
    await Promise.all(buildExtraGamePosts().map(post => putRecord('gamePosts', post)));
    await putRecord('meta', { key: 'testSeedV2', value: true, seededAt: Date.now() });
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
