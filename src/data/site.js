// 桂林学院单校区数据。
// 这份文件只放“静态数据”，不负责页面渲染，方便以后接后端接口时替换。

export const SCHOOL = {
  "name": "桂林学院",
  "shortName": "桂林学院",
  "en": "GUILIN UNIVERSITY",
  "areas": [
    "图书馆",
    "东区宿舍",
    "西区宿舍",
    "食堂",
    "体育馆",
    "教学楼",
    "艺术楼",
    "操场",
    "校门口"
  ]
};

export const AREAS = SCHOOL.areas;

export const COLLEGES = [
  "马克思主义学院",
  "外国语学院（国际教育学院）",
  "文化与传媒学院",
  "工商管理学院",
  "信息工程学院",
  "金融与法律学院",
  "教育与音乐学院",
  "城市设计学院",
  "旅游与体育健康学院"
];

// 旧版本里出现过的不准确院系名称，统一映射到官网名称。
export const COLLEGE_ALIASES = {
  "机械工程学院": "信息工程学院",
  "外国语学院": "外国语学院（国际教育学院）",
  "新闻传播学院": "文化与传媒学院",
  "美术学院": "城市设计学院",
  "建筑学院": "城市设计学院",
  "数学学院": "信息工程学院",
  "经济学院": "工商管理学院",
  "设计学院": "城市设计学院",
  "软件学院": "信息工程学院",
  "文学院": "文化与传媒学院",
  "物理学院": "信息工程学院",
  "土木工程学院": "城市设计学院",
  "天文学院": "城市设计学院",
  "教育学院": "教育与音乐学院",
  "材料学院": "信息工程学院",
  "体育学院": "旅游与体育健康学院",
  "生命科学学院": "城市设计学院",
  "视觉传达": "城市设计学院"
};

export function normalizeCollege(dept) {
  const value = String(dept || '').trim();
  if (!value) return '信息工程学院';
  if (COLLEGES.includes(value)) return value;

  const base = value.split('·')[0].trim();
  if (COLLEGES.includes(base)) return base;
  return COLLEGE_ALIASES[value] || COLLEGE_ALIASES[base] || base;
}

export const CATEGORIES = [
  {
    "id": "digital",
    "name": "数码",
    "icon": "device",
    "art": "headphones",
    "tone": "sky"
  },
  {
    "id": "books",
    "name": "书籍",
    "icon": "book",
    "art": "books",
    "tone": "butter"
  },
  {
    "id": "transport",
    "name": "出行",
    "icon": "bike",
    "art": "bike",
    "tone": "sage"
  },
  {
    "id": "dorm",
    "name": "宿舍",
    "icon": "lamp",
    "art": "lamp",
    "tone": "clay"
  },
  {
    "id": "sports",
    "name": "运动",
    "icon": "racket",
    "art": "racket",
    "tone": "mint"
  },
  {
    "id": "fashion",
    "name": "穿搭",
    "icon": "shirt",
    "art": "sneaker",
    "tone": "rose"
  },
  {
    "id": "music",
    "name": "乐器",
    "icon": "guitar",
    "art": "guitar",
    "tone": "lilac"
  },
  {
    "id": "plants",
    "name": "绿植",
    "icon": "plant",
    "art": "plant",
    "tone": "mint"
  },
  {
    "id": "other",
    "name": "其他",
    "icon": "box",
    "art": "box",
    "tone": "peach"
  }
];

export const CONDITIONS = [
  "全新",
  "99新",
  "95新",
  "9成新",
  "8成新",
  "7成新及以下"
];

export const POPULAR_SEARCHES = [
  "山地车",
  "降噪耳机",
  "考研英语",
  "宿舍台灯",
  "iPad",
  "吉他",
  "羽毛球拍",
  "小冰箱"
];

export const MOCK_USER = {
  "id": "me",
  "name": "林小满",
  "initial": "满",
  "school": "桂林学院",
  "dept": "信息工程学院",
  "rating": 4.9,
  "deals": 12,
  "joined": "2022 年 9 月",
  "verified": true,
  "bio": "断舍离选手，出闲置都很爱惜。"
};

export const SEED_LISTINGS = [
  {
    "id": "s1",
    "title": "捷安特 ATX 720 山地车 · 刚做完保养",
    "price": 680,
    "originalPrice": 1580,
    "category": "transport",
    "condition": "9成新",
    "campus": "桂林学院",
    "location": "桂林学院 · 东区宿舍",
    "ageMin": 18,
    "art": "bike",
    "tone": "sage",
    "status": "active",
    "tags": [
      "可小刀",
      "送车锁",
      "已保养"
    ],
    "description": "大二买的捷安特 ATX 720，M 码，165–180 都能骑。毕业要搬走所以出掉，上周刚在西门车行换了刹车皮和链条，车况很好。送车锁和打气筒，桂林学院东区可以约看车，试骑满意再拿走。",
    "seller": {
      "name": "陈屿",
      "initial": "屿",
      "school": "桂林学院",
      "dept": "信息工程学院",
      "rating": 4.9,
      "deals": 8,
      "verified": true,
      "tone": "sage"
    },
    "area": "东区宿舍"
  },
  {
    "id": "s2",
    "title": "索尼 WH-1000XM4 头戴降噪耳机",
    "price": 950,
    "originalPrice": 2299,
    "category": "digital",
    "condition": "95新",
    "campus": "桂林学院",
    "location": "桂林学院 · 图书馆",
    "ageMin": 64,
    "art": "headphones",
    "tone": "sky",
    "status": "active",
    "tags": [
      "有发票",
      "送收纳包",
      "可试听"
    ],
    "description": "去年双十一购入，主要在图书馆和通勤用，降噪和续航都很能打。耳罩没有脱皮，功能一切正常。原包装、发票、收纳包都在，可以带设备来试听。因为换了 AirPods Max 所以出掉。",
    "seller": {
      "name": "阿黛",
      "initial": "黛",
      "school": "桂林学院",
      "dept": "外国语学院（国际教育学院）",
      "rating": 5,
      "deals": 23,
      "verified": true,
      "tone": "sky"
    },
    "area": "图书馆"
  },
  {
    "id": "s3",
    "title": "考研英语一 黄皮书 + 真题（2020–2025）",
    "price": 35,
    "originalPrice": 128,
    "category": "books",
    "condition": "8成新",
    "campus": "桂林学院",
    "location": "桂林学院 · 图书馆",
    "ageMin": 130,
    "art": "books",
    "tone": "butter",
    "status": "active",
    "tags": [
      "无笔记",
      "套装",
      "可拆卖"
    ],
    "description": "上岸啦，把陪伴我一年的资料传给下一位同学。黄皮书全套 + 近六年真题，只有少量荧光笔标记，答案册完整。图书馆一楼自取，顺便可以请你喝杯咖啡聊聊备考。",
    "seller": {
      "name": "苏禾",
      "initial": "禾",
      "school": "桂林学院",
      "dept": "文化与传媒学院",
      "rating": 4.8,
      "deals": 15,
      "verified": true,
      "tone": "butter"
    },
    "area": "图书馆"
  },
  {
    "id": "s4",
    "title": "复古黄铜台灯 · 宿舍氛围感担当",
    "price": 45,
    "originalPrice": 89,
    "category": "dorm",
    "condition": "9成新",
    "campus": "桂林学院",
    "location": "桂林学院 · 西区宿舍",
    "ageMin": 186,
    "art": "lamp",
    "tone": "clay",
    "status": "active",
    "tags": [
      "暖光",
      "可调角度"
    ],
    "description": "搬家带不走的小台灯，黄铜色很耐看，放在书桌上氛围感拉满。三档暖光，灯臂角度可调，灯泡是刚换的。西区宿舍楼下自取，可以亮给你看。",
    "seller": {
      "name": "晚晚",
      "initial": "晚",
      "school": "桂林学院",
      "dept": "城市设计学院",
      "rating": 4.9,
      "deals": 6,
      "verified": true,
      "tone": "clay"
    },
    "area": "西区宿舍"
  },
  {
    "id": "s5",
    "title": "富士 X-T30 微单 + 15-45 套机",
    "price": 3600,
    "originalPrice": 5999,
    "category": "digital",
    "condition": "9成新",
    "campus": "桂林学院",
    "location": "桂林学院 · 校门口",
    "ageMin": 300,
    "art": "camera",
    "tone": "peach",
    "status": "active",
    "tags": [
      "快门 8k",
      "两块电池",
      "可验机"
    ],
    "description": "陪伴我拍完毕业季的相机，快门数约 8000，机身有轻微使用痕迹，屏幕贴膜无划痕。含原厂 15-45 镜头、两块电池、双充、肩带和 64G 卡。桂林学院南门面交，欢迎带电脑来验机。",
    "seller": {
      "name": "周野",
      "initial": "野",
      "school": "桂林学院",
      "dept": "城市设计学院",
      "rating": 4.7,
      "deals": 4,
      "verified": true,
      "tone": "peach"
    },
    "area": "校门口"
  },
  {
    "id": "s6",
    "title": "雅马哈 F310 民谣吉他 · 送琴包",
    "price": 320,
    "originalPrice": 799,
    "category": "music",
    "condition": "85新",
    "campus": "桂林学院",
    "location": "桂林学院 · 艺术楼",
    "ageMin": 420,
    "art": "guitar",
    "tone": "lilac",
    "status": "active",
    "tags": [
      "送琴包",
      "送变调夹",
      "可试弹"
    ],
    "description": "大一加入吉他社时买的，后来换了电箱琴就一直闲置。琴颈没有变形，品丝磨损很小，刚换了一套新弦。送加厚琴包、变调夹和背带，西区琴房可以试弹。",
    "seller": {
      "name": "老白",
      "initial": "白",
      "school": "桂林学院",
      "dept": "信息工程学院",
      "rating": 4.8,
      "deals": 11,
      "verified": true,
      "tone": "lilac"
    },
    "area": "艺术楼"
  },
  {
    "id": "s7",
    "title": "宿舍可折叠小桌板 · 原木色",
    "price": 25,
    "originalPrice": 69,
    "category": "dorm",
    "condition": "95新",
    "campus": "桂林学院",
    "location": "桂林学院 · 东区宿舍",
    "ageMin": 600,
    "art": "desk",
    "tone": "sage",
    "status": "active",
    "tags": [
      "可折叠",
      "不占地"
    ],
    "description": "买来在床上赶过一次论文，之后基本没用过。原木色，桌面很干净，桌腿可折叠，收起来塞床底就行。梅园 6 栋自提，可以帮你搬到楼下。",
    "seller": {
      "name": "一颗桃",
      "initial": "桃",
      "school": "桂林学院",
      "dept": "工商管理学院",
      "rating": 4.9,
      "deals": 9,
      "verified": true,
      "tone": "rose"
    },
    "area": "东区宿舍"
  },
  {
    "id": "s8",
    "title": "Nike Air Force 1 白色 · 42 码",
    "price": 260,
    "originalPrice": 799,
    "category": "fashion",
    "condition": "8成新",
    "campus": "桂林学院",
    "location": "桂林学院 · 体育馆",
    "ageMin": 800,
    "art": "sneaker",
    "tone": "rose",
    "status": "active",
    "tags": [
      "已清洗",
      "42码"
    ],
    "description": "鞋柜里闲置的一双 AF1，42 码，偏大半码。鞋面已经专业清洗过，鞋底有正常磨损，没有开胶。理工体育馆附近面交，可以试穿。",
    "seller": {
      "name": "Kiki",
      "initial": "K",
      "school": "桂林学院",
      "dept": "城市设计学院",
      "rating": 4.6,
      "deals": 3,
      "verified": false,
      "tone": "rose"
    },
    "area": "体育馆"
  },
  {
    "id": "s9",
    "title": "iPad Air 4 64G + 妙控键盘",
    "price": 2200,
    "originalPrice": 4399,
    "category": "digital",
    "condition": "9成新",
    "campus": "桂林学院",
    "location": "桂林学院 · 食堂",
    "ageMin": 1000,
    "art": "tablet",
    "tone": "mint",
    "status": "active",
    "tags": [
      "电池 91%",
      "含键盘",
      "可验机"
    ],
    "description": "深空灰 iPad Air 4，64G，电池健康 91%，屏幕无划痕，一直贴膜带壳使用。含原装妙控键盘（边角有轻微磨损）和 Apple Pencil 二代，打包一起出。东区食堂面交，可当场验机。",
    "seller": {
      "name": "林一",
      "initial": "一",
      "school": "桂林学院",
      "dept": "信息工程学院",
      "rating": 4.9,
      "deals": 17,
      "verified": true,
      "tone": "mint"
    },
    "area": "食堂"
  },
  {
    "id": "s10",
    "title": "罗技 MX Master 3S 静音鼠标",
    "price": 380,
    "originalPrice": 699,
    "category": "digital",
    "condition": "95新",
    "campus": "桂林学院",
    "location": "桂林学院 · 图书馆",
    "ageMin": 1400,
    "art": "mouse",
    "tone": "clay",
    "status": "active",
    "tags": [
      "静音",
      "含接收器"
    ],
    "description": "写毕业论文时入的，手感真的很好，静音按键在图书馆用不心虚。用了不到半年，成色很新，接收器和 Type-C 线都在。学校图书馆门口面交。",
    "seller": {
      "name": "迟雨",
      "initial": "雨",
      "school": "桂林学院",
      "dept": "文化与传媒学院",
      "rating": 4.8,
      "deals": 7,
      "verified": true,
      "tone": "clay"
    },
    "area": "图书馆"
  },
  {
    "id": "s11",
    "title": "大学物理教材 + 习题册（套装）",
    "price": 20,
    "originalPrice": 86,
    "category": "books",
    "condition": "7成新及以下",
    "campus": "桂林学院",
    "location": "桂林学院 · 教学楼",
    "ageMin": 1800,
    "art": "books",
    "tone": "sky",
    "status": "active",
    "tags": [
      "有笔记",
      "套装"
    ],
    "description": "上下册 + 习题册，书上有听课笔记，重点都画好了，适合期末突击。有几页折角，不影响阅读。桂林学院教学楼 B 自取。",
    "seller": {
      "name": "阿哲",
      "initial": "哲",
      "school": "桂林学院",
      "dept": "信息工程学院",
      "rating": 4.5,
      "deals": 2,
      "verified": true,
      "tone": "sky"
    },
    "area": "教学楼"
  },
  {
    "id": "s12",
    "title": "迪卡侬羽毛球拍 双拍套装",
    "price": 55,
    "originalPrice": 129,
    "category": "sports",
    "condition": "9成新",
    "campus": "桂林学院",
    "location": "桂林学院 · 体育馆",
    "ageMin": 2100,
    "art": "racket",
    "tone": "mint",
    "status": "active",
    "tags": [
      "双拍",
      "送球"
    ],
    "description": "体育课买的迪卡侬双拍套装，打过五六次，拍框没有磕碰。含拍套和三个训练球，学校体育馆约球顺便拿走。",
    "seller": {
      "name": "大川",
      "initial": "川",
      "school": "桂林学院",
      "dept": "城市设计学院",
      "rating": 4.7,
      "deals": 5,
      "verified": true,
      "tone": "mint"
    },
    "area": "体育馆"
  },
  {
    "id": "s13",
    "title": "星野摄影三脚架 · 铝合金",
    "price": 120,
    "originalPrice": 259,
    "category": "digital",
    "condition": "9成新",
    "campus": "桂林学院",
    "location": "桂林学院 · 操场",
    "ageMin": 2500,
    "art": "tripod",
    "tone": "lilac",
    "status": "active",
    "tags": [
      "承重 5kg",
      "含云台"
    ],
    "description": "之前拍星空买的铝合金三脚架，承重 5kg，最高 1.6 米，带三维云台和快装板。收起来只有 55cm，宿舍角落就能放。桂林学院操场附近自取。",
    "seller": {
      "name": "星野",
      "initial": "星",
      "school": "桂林学院",
      "dept": "城市设计学院",
      "rating": 4.9,
      "deals": 13,
      "verified": true,
      "tone": "lilac"
    },
    "area": "操场"
  },
  {
    "id": "s14",
    "title": "冬季羊毛围巾 · 燕麦色",
    "price": 30,
    "originalPrice": 99,
    "category": "fashion",
    "condition": "全新",
    "campus": "桂林学院",
    "location": "桂林学院 · 校门口",
    "ageMin": 3000,
    "art": "scarf",
    "tone": "peach",
    "status": "active",
    "tags": [
      "全新",
      "未拆吊牌"
    ],
    "description": "双十一凑单买的，颜色是温柔的燕麦色，100% 羊毛，吊牌还没拆。我围巾太多了，转给喜欢的同学。桂林学院东门面交。",
    "seller": {
      "name": "小满",
      "initial": "满",
      "school": "桂林学院",
      "dept": "教育与音乐学院",
      "rating": 5,
      "deals": 21,
      "verified": true,
      "tone": "peach"
    },
    "area": "校门口"
  },
  {
    "id": "s15",
    "title": "宿舍小冰箱 42L · 静音省电",
    "price": 180,
    "originalPrice": 399,
    "category": "dorm",
    "condition": "8成新",
    "campus": "桂林学院",
    "location": "桂林学院 · 西区宿舍",
    "ageMin": 3600,
    "art": "fridge",
    "tone": "sky",
    "status": "active",
    "tags": [
      "42L",
      "静音",
      "自提"
    ],
    "description": "用了一年半的小冰箱，制冷正常，声音很小，放宿舍里几乎听不见。内胆干净，已经除霜擦过。有点重，需要自己找同学帮忙搬，银杏 4 栋 3 楼。",
    "seller": {
      "name": "老K",
      "initial": "K",
      "school": "桂林学院",
      "dept": "信息工程学院",
      "rating": 4.6,
      "deals": 6,
      "verified": true,
      "tone": "sky"
    },
    "area": "西区宿舍"
  },
  {
    "id": "s16",
    "title": "双翘滑板 初学者整板",
    "price": 90,
    "originalPrice": 220,
    "category": "sports",
    "condition": "8成新",
    "campus": "桂林学院",
    "location": "桂林学院 · 操场",
    "ageMin": 4300,
    "art": "skateboard",
    "tone": "butter",
    "status": "active",
    "tags": [
      "整板",
      "送护具"
    ],
    "description": "大一入坑滑板买的整板，板面有正常踩踏痕迹，轴承刚上过油。后来膝盖受伤就没再玩了，送一套护膝护肘。学校操场晚上经常有人在练，可以一起玩。",
    "seller": {
      "name": "阿飞",
      "initial": "飞",
      "school": "桂林学院",
      "dept": "旅游与体育健康学院",
      "rating": 4.8,
      "deals": 10,
      "verified": true,
      "tone": "butter"
    },
    "area": "操场"
  },
  {
    "id": "s17",
    "title": "龟背竹盆栽 · 带白色陶盆",
    "price": 35,
    "originalPrice": 80,
    "category": "plants",
    "condition": "9成新",
    "campus": "桂林学院",
    "location": "桂林学院 · 西区宿舍",
    "ageMin": 5000,
    "art": "plant",
    "tone": "sage",
    "status": "active",
    "tags": [
      "带盆",
      "好养活"
    ],
    "description": "养了半年的龟背竹，长了六片新叶，状态很好。带白色陶盆一起出，宿舍阳台就能养。放假要回家，实在带不走，希望找个会照顾它的同学。",
    "seller": {
      "name": "青禾",
      "initial": "青",
      "school": "桂林学院",
      "dept": "城市设计学院",
      "rating": 4.9,
      "deals": 8,
      "verified": true,
      "tone": "sage"
    },
    "area": "西区宿舍"
  },
  {
    "id": "s18",
    "title": "胶片相机造型收纳盒 · 桌面摆件",
    "price": 18,
    "originalPrice": 45,
    "category": "other",
    "condition": "95新",
    "campus": "桂林学院",
    "location": "桂林学院 · 食堂",
    "ageMin": 6000,
    "art": "box",
    "tone": "peach",
    "status": "active",
    "tags": [
      "摆件",
      "可收纳"
    ],
    "description": "在创意市集淘的胶片相机造型收纳盒，盖子可以打开，放耳机、胶卷、发圈都很合适。一直摆在桌上当装饰，现在桌面腾地方出掉。",
    "seller": {
      "name": "木木",
      "initial": "木",
      "school": "桂林学院",
      "dept": "城市设计学院",
      "rating": 4.8,
      "deals": 12,
      "verified": true,
      "tone": "peach"
    },
    "area": "食堂"
  }
];
