<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Artwork from '../components/Artwork.vue';
import CategoryIcon from '../components/CategoryIcon.vue';
import Icon from '../components/Icon.vue';
import NotFoundView from './NotFoundView.vue';
import {
  addListing,
  market,
  updateListing
} from '../stores/market';
import { toast } from '../stores/ui';
import { compressImage } from '../lib/image';
import {
  categoryName,
  categoryOf,
  fmtPrice,
  guessArt
} from '../lib/format';
import {
  CATEGORIES,
  CONDITIONS
} from '../data/site';

const route = useRoute();
const router = useRouter();

const isEditing = computed(() => Boolean(route.query.id));
const missing = ref(false);
const imageInput = ref(null);
const images = ref([]);

const form = reactive({
  title: '',
  category: 'digital',
  price: '',
  originalPrice: '',
  condition: '9成新',
  tags: '',
  contactType: 'wechat',
  contactValue: '',
  description: ''
});

const errors = reactive({});

const previewArt = computed(() => guessArt(form.title, form.category));
const previewCategory = computed(() => categoryOf(form.category));
const previewItem = computed(() => ({
  images: images.value,
  art: previewArt.value,
  tone: previewCategory.value.tone,
  title: form.title || '给你的闲置写个标题'
}));

function clearErrors() {
  Object.keys(errors).forEach(key => delete errors[key]);
}

function loadForm() {
  clearErrors();
  const id = route.query.id ? String(route.query.id) : '';

  if (!id) {
    missing.value = false;
    Object.assign(form, {
      title: '',
      category: 'digital',
      price: '',
      originalPrice: '',
      condition: '9成新',
      tags: '',
      contactType: market.currentUser?.contact?.type || 'wechat',
      contactValue: market.currentUser?.contact?.value || '',
      description: ''
    });
    images.value = [];
    return;
  }

  const listing = market.myListings.find(item => item.id === id);
  if (!listing) {
    missing.value = true;
    return;
  }

  missing.value = false;
  Object.assign(form, {
    title: listing.title,
    category: listing.category,
    price: String(listing.price ?? ''),
    originalPrice: listing.originalPrice ? String(listing.originalPrice) : '',
    condition: listing.condition,
    tags: (listing.tags || []).join('、'),
    contactType: listing.contact?.type || 'wechat',
    contactValue: listing.contact?.value || '',
    description: listing.description
  });
  images.value = (listing.images || []).slice(0, 3);
}

watch(() => route.query.id, loadForm, { immediate: true });

async function handleFiles(event) {
  const files = Array.from(event.target.files || []);
  event.target.value = '';
  if (!files.length) return;

  const room = 3 - images.value.length;
  if (room <= 0) {
    toast('最多上传 3 张图片');
    return;
  }

  for (const file of files.slice(0, room)) {
    if (!file.type.startsWith('image/')) {
      toast('请选择图片文件');
      continue;
    }
    if (file.size > 12 * 1024 * 1024) {
      toast('单张图片请小于 12MB');
      continue;
    }
    const data = await compressImage(file);
    if (data) images.value.push(data);
  }
  toast('图片已添加，第一张会作为封面');
}

function removeImage(index) {
  images.value.splice(index, 1);
}

function validate() {
  clearErrors();
  const price = Number(form.price);
  const original = Number(form.originalPrice);

  if (form.title.trim().length < 4) errors.title = '标题至少写 4 个字，让买家一眼看懂。';
  if (!Number.isFinite(price) || price <= 0) errors.price = '请填写一个有效的售价。';
  else if (price > 99999) errors.price = '售价上限为 99,999 元。';
  if (form.description.trim().length < 10) errors.description = '描述至少 10 个字，写清楚成色和交易方式。';
  if (form.originalPrice !== '' && Number.isFinite(original) && original < price) {
    errors.originalPrice = '原价不应低于售价。';
  }

  const contact = form.contactValue.trim();
  if (!contact) {
    errors.contactValue = form.contactType === 'qq' ? '请填写卖家的 QQ 号' : '请填写卖家的微信号';
  } else if (form.contactType === 'qq' && !/^\d{5,12}$/.test(contact)) {
    errors.contactValue = 'QQ 号通常是 5–12 位数字';
  } else if (form.contactType === 'wechat' && !/^[A-Za-z0-9_-]{5,20}$/.test(contact)) {
    errors.contactValue = '微信号通常是 5–20 位字母、数字、下划线或横线';
  }

  if (Object.keys(errors).length) {
    requestAnimationFrame(() => {
      const first = document.querySelector('.field.has-error');
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    toast('还有几项信息需要完善');
    return false;
  }
  return true;
}

async function submit() {
  if (!validate()) return;

  const category = categoryOf(form.category);
  const tags = form.tags.split(/[,，、\s]+/).filter(Boolean).slice(0, 4);
  const contact = {
    type: form.contactType,
    value: form.contactValue.trim()
  };

  const payload = {
    title: form.title.trim(),
    category: form.category,
    price: Number(form.price),
    originalPrice: Number(form.originalPrice) || 0,
    condition: form.condition,
    tags,
    contact,
    description: form.description.trim(),
    images: images.value.slice(0, 3),
    art: previewArt.value,
    tone: category.tone
  };

  const editingId = route.query.id ? String(route.query.id) : '';

  try {
    let target;
    if (editingId) {
      target = await updateListing(editingId, payload);
      toast('修改已保存');
    } else {
      target = await addListing(payload);
      toast('上架成功，祝早日遇到新主人 🎉');
    }
    router.push(`/item/${target.id}`);
  } catch (error) {
    toast(error.message || '保存失败，请稍后再试');
  }
}
</script>

<template>
  <NotFoundView v-if="missing" />
  <div v-else-if="market.currentUser?.publishBanned" class="page page-fade publish-page wrap">
    <div class="publish-blocked">
      <div class="empty-icon"><Icon name="shield" /></div>
      <p class="eyebrow">PUBLISH PAUSED</p>
      <h1>你的发布权限已被暂停</h1>
      <p>{{ market.currentUser.banReason || '因收到多起买家举报，平台已暂停你的发布权限。' }}</p>
      <p class="publish-blocked-note">你仍然可以浏览、购买和查看历史订单。如有异议，请联系管理员复核。</p>
      <div class="publish-blocked-actions">
        <RouterLink class="btn btn-primary" :to="`/seller/${market.currentUser.id}`">查看我的卖家主页</RouterLink>
        <RouterLink class="btn btn-outline" to="/">回到集市</RouterLink>
      </div>
    </div>
  </div>
  <div v-else class="page page-fade publish-page wrap">
    <div class="publish-head">
      <p class="eyebrow">{{ isEditing ? 'EDIT LISTING' : 'SELL SOMETHING' }}</p>
      <h1>{{ isEditing ? '编辑这件闲置' : '让闲置，继续发光。' }}</h1>
      <p>{{ isEditing ? '修改后会立即更新到集市。' : '认真写清楚成色与联系方式，会更快遇到下一位主人。' }}</p>
    </div>

    <div class="publish-grid">
      <form class="form-card" novalidate @submit.prevent="submit">
        <section class="form-section">
          <h2 class="form-section-title">基本信息 <span>01</span></h2>
          <div class="field" :class="{ 'has-error': errors.title }">
            <label class="field-label" for="f-title">标题<span class="req">*</span><span class="opt">4–60 字</span></label>
            <input id="f-title" v-model="form.title" class="input" maxlength="60" placeholder="例如：捷安特 ATX 720 山地车 · 刚做完保养">
            <p class="field-error">{{ errors.title }}</p>
          </div>

          <div class="field">
            <label class="field-label">分类<span class="req">*</span></label>
            <div class="choice-row">
              <label v-for="category in CATEGORIES" :key="category.id" class="choice">
                <input v-model="form.category" type="radio" name="category" :value="category.id">
                <CategoryIcon :name="category.icon" /> {{ category.name }}
              </label>
            </div>
          </div>

          <div class="form-row">
            <div class="field" :class="{ 'has-error': errors.price }">
              <label class="field-label" for="f-price">售价<span class="req">*</span></label>
              <input id="f-price" v-model="form.price" class="input" type="number" min="0" step="1" inputmode="numeric" placeholder="0">
              <p class="field-error">{{ errors.price }}</p>
            </div>
            <div class="field" :class="{ 'has-error': errors.originalPrice }">
              <label class="field-label" for="f-original">原价<span class="opt">选填</span></label>
              <input id="f-original" v-model="form.originalPrice" class="input" type="number" min="0" step="1" inputmode="numeric" placeholder="帮助买家判断性价比">
              <p class="field-error">{{ errors.originalPrice }}</p>
            </div>
          </div>

          <div class="field">
            <label class="field-label">成色<span class="req">*</span></label>
            <div class="choice-row">
              <label v-for="condition in CONDITIONS" :key="condition" class="choice">
                <input v-model="form.condition" type="radio" name="condition" :value="condition">{{ condition }}
              </label>
            </div>
          </div>

          <div class="field">
            <label class="field-label" for="f-tags">标签<span class="opt">选填，最多 4 个</span></label>
            <input id="f-tags" v-model="form.tags" class="input" placeholder="可小刀、送配件、已保养…">
          </div>
        </section>

        <section class="form-section">
          <h2 class="form-section-title">交易信息 <span>02</span></h2>

          <div class="field" :class="{ 'has-error': errors.contactValue }">
            <label class="field-label" for="f-contact">卖家联系方式<span class="req">*</span></label>
            <div class="contact-choice">
              <label class="choice">
                <input v-model="form.contactType" type="radio" name="contactType" value="wechat"> 微信
              </label>
              <label class="choice">
                <input v-model="form.contactType" type="radio" name="contactType" value="qq"> QQ
              </label>
              <input
                id="f-contact"
                v-model="form.contactValue"
                class="input contact-input"
                :placeholder="form.contactType === 'wechat' ? '填写微信号，方便买家联系' : '填写 QQ 号，方便买家联系'"
                maxlength="30"
              >
            </div>
            <p class="field-hint"><Icon name="info" /> 联系方式会显示在商品详情和卖家主页，请填写真实可用的账号。</p>
            <p class="field-error">{{ errors.contactValue }}</p>
          </div>

          <div class="field" :class="{ 'has-error': errors.description }">
            <label class="field-label" for="f-desc">宝贝描述<span class="req">*</span><span class="opt">至少 10 字</span></label>
            <textarea
              id="f-desc"
              v-model="form.description"
              class="textarea"
              maxlength="600"
              placeholder="什么时候买的、使用情况如何、为什么出、有没有配件或瑕疵……写得越清楚，越容易被信任。"
            ></textarea>
            <p class="field-hint"><Icon name="info" /> 交易时间和地点由买卖双方在私信里自行商量，不需要在这里填写。</p>
            <p class="field-error">{{ errors.description }}</p>
          </div>
        </section>

        <section class="form-section">
          <h2 class="form-section-title">实物图片 <span>03</span></h2>
          <div class="uploader">
            <label class="upload-zone" for="img-input">
              <span class="upload-icon"><Icon name="camera" /></span>
              <span><b>添加 1–3 张实物图</b><span>建议自然光下拍摄，支持 JPG / PNG</span></span>
              <span class="btn btn-outline btn-sm">选择图片</span>
            </label>
            <input id="img-input" ref="imageInput" type="file" accept="image/*" multiple hidden @change="handleFiles">
            <div v-if="images.length" class="upload-thumbs">
              <div v-for="(src, index) in images" :key="index" class="upload-thumb">
                <img :src="src" :alt="`已上传图片 ${index + 1}`">
                <span v-if="index === 0" class="thumb-tag">封面</span>
                <button type="button" aria-label="移除图片" @click="removeImage(index)">
                  <Icon name="close" />
                </button>
              </div>
            </div>
            <p class="upload-empty-note"><Icon name="info" /> 没有照片也没关系，我们会根据标题匹配分类手绘插画。</p>
          </div>
        </section>

        <div class="form-actions">
          <RouterLink class="btn btn-ghost" :to="isEditing ? `/item/${route.query.id}` : '/'">取消</RouterLink>
          <button class="btn btn-primary" type="submit">{{ isEditing ? '保存修改' : '立即上架' }} <Icon name="arrow" /></button>
        </div>
      </form>

      <aside class="preview-col">
        <p class="preview-label">LIVE PREVIEW · 卡片预览</p>
        <div class="live-preview">
          <div class="lp-media">
            <Artwork :item="previewItem" eager />
            <span class="condition-badge">{{ form.condition }}</span>
          </div>
          <div class="lp-body">
            <p class="lp-cat">{{ categoryName(form.category) }} · 校内面交</p>
            <p class="lp-title">{{ form.title || '给你的闲置写个标题' }}</p>
            <div class="lp-price">
              <em>¥</em>{{ Number(form.price) ? fmtPrice(form.price) : '—' }}
              <s v-if="Number(form.originalPrice)">¥{{ fmtPrice(form.originalPrice) }}</s>
            </div>
            <div class="lp-meta"><span class="avatar-mini">{{ market.user.initial }}</span>{{ market.user.name }} · 刚刚</div>
          </div>
        </div>
        <div class="preview-tip">
          <Icon name="shield" /> 上架后请优先选择校内公共场所面交；拾光集不收取任何服务费，也不会要求你提前支付保证金。
        </div>
      </aside>
    </div>
  </div>
</template>
