import { CATEGORIES } from '../data/site';

const TONES = ['sage', 'peach', 'butter', 'sky', 'lilac', 'clay', 'mint', 'rose'];

export function fmtPrice(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '—';
  return num.toLocaleString('en-US');
}

export function timeAgo(timestamp) {
  const diff = Math.max(0, Date.now() - Number(timestamp || Date.now()));
  const minute = Math.floor(diff / 60000);
  if (minute < 1) return '刚刚';
  if (minute < 60) return `${minute} 分钟前`;
  const hour = Math.floor(minute / 60);
  if (hour < 24) return `${hour} 小时前`;
  const day = Math.floor(hour / 24);
  if (day < 7) return `${day} 天前`;
  const date = new Date(Number(timestamp));
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

export function clockTime(timestamp) {
  const date = new Date(Number(timestamp) || Date.now());
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function categoryName(id) {
  const category = CATEGORIES.find(item => item.id === id);
  return category ? category.name : '其他';
}

export function categoryOf(id) {
  return CATEGORIES.find(item => item.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

export function variantTones(tone) {
  const index = Math.max(0, TONES.indexOf(tone));
  return [tone, TONES[(index + 2) % TONES.length], TONES[(index + 5) % TONES.length]];
}

// 没上传照片时，根据标题猜一个更贴近物品的手绘封面。
export function guessArt(title, categoryId) {
  const text = String(title || '');
  const rules = [
    [/三脚架/, 'tripod'],
    [/相机|微单|单反|镜头/, 'camera'],
    [/耳机|降噪|耳麦/, 'headphones'],
    [/鼠标/, 'mouse'],
    [/键盘|平板|ipad|电脑/i, 'tablet'],
    [/台灯|落地灯/, 'lamp'],
    [/吉他|尤克里里|琴/, 'guitar'],
    [/书|教材|真题|习题/, 'books'],
    [/自行车|单车|山地车|公路车/, 'bike'],
    [/滑板/, 'skateboard'],
    [/球拍|羽毛球|网球/, 'racket'],
    [/鞋|球鞋|跑鞋/, 'sneaker'],
    [/围巾/, 'scarf'],
    [/冰箱/, 'fridge'],
    [/桌|桌板/, 'desk'],
    [/盆栽|绿植|龟背竹|植物/, 'plant'],
    [/盒|收纳/, 'box']
  ];
  for (const [pattern, art] of rules) {
    if (pattern.test(text)) return art;
  }
  return categoryOf(categoryId).art;
}
