<script setup>
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EmptyState from '../components/EmptyState.vue';
import Icon from '../components/Icon.vue';
import ItemCard from '../components/ItemCard.vue';
import NotFoundView from './NotFoundView.vue';
import {
  getSeller,
  getSellerFeedback,
  getSellerListings,
  market,
  restoreSeller,
  submitFeedback,
  submitReport
} from '../stores/market';
import { toast } from '../stores/ui';

const route = useRoute();
const router = useRouter();
const sellerId = computed(() => String(route.params.id));
const seller = computed(() => getSeller(sellerId.value));
const listings = computed(() => getSellerListings(sellerId.value));
const reviews = computed(() => getSellerFeedback(sellerId.value));
const isOwn = computed(() => market.currentUser?.id === sellerId.value);
const isAdmin = computed(() => market.currentUser?.role === 'admin');
const hasFeedback = computed(() =>
  reviews.value.some(item => item.buyerId === market.currentUser?.id)
);
const hasReport = computed(() =>
  market.reports.some(item => item.sellerId === sellerId.value && item.buyerId === market.currentUser?.id)
);

const feedback = reactive({ rating: 5, text: '' });
const report = reactive({ reason: '虚假描述', detail: '' });
const submittingFeedback = ref(false);
const submittingReport = ref(false);

const reportReasons = ['虚假描述', '收款不发货', '商品严重不符', '骚扰或威胁', '其他'];

function requireLogin() {
  if (market.currentUser) return true;
  toast('请先登录');
  router.push({ name: 'login', query: { redirect: route.fullPath } });
  return false;
}

async function copyContact() {
  if (!seller.value?.contact?.value) return;
  try {
    await navigator.clipboard.writeText(seller.value.contact.value);
    toast('联系方式已复制');
  } catch (error) {
    toast(`联系方式：${seller.value.contact.value}`);
  }
}

async function sendFeedback() {
  if (!requireLogin()) return;
  submittingFeedback.value = true;
  try {
    await submitFeedback({
      sellerId: sellerId.value,
      rating: feedback.rating,
      text: feedback.text
    });
    feedback.text = '';
    toast('评价已提交');
  } catch (error) {
    toast(error.message || '评价失败');
  } finally {
    submittingFeedback.value = false;
  }
}

async function sendReport() {
  if (!requireLogin()) return;
  submittingReport.value = true;
  try {
    const result = await submitReport({
      sellerId: sellerId.value,
      listingId: listings.value[0]?.id,
      reason: `${report.reason}${report.detail.trim() ? '：' + report.detail.trim() : ''}`
    });
    report.detail = '';
    if (result.banned) {
      toast('已有 3 位买家举报，系统核实后已暂停该卖家发布权限');
    } else {
      toast(`举报已提交（当前 ${result.count} 位买家举报）`);
    }
  } catch (error) {
    toast(error.message || '举报失败');
  } finally {
    submittingReport.value = false;
  }
}

async function restore() {
  await restoreSeller(sellerId.value);
  toast('已恢复该卖家的发布权限');
}
</script>

<template>
  <NotFoundView v-if="!seller" />
  <div v-else class="page page-fade wrap seller-page">
    <nav class="breadcrumb">
      <RouterLink to="/">集市</RouterLink><span class="sep">/</span>
      <span>卖家主页</span>
    </nav>

    <section class="seller-profile">
      <span class="seller-avatar seller-avatar-lg">{{ seller.initial }}</span>
      <div class="seller-profile-main">
        <div class="seller-profile-top">
          <h1>{{ seller.name }}</h1>
          <span class="verified-badge"><Icon name="check" /> 校园实名</span>
          <span v-if="seller.publishBanned" class="risk-badge">交易风险 · 已停止发布</span>
        </div>
        <p>{{ market.school.name }} · {{ seller.dept }}</p>
        <div class="seller-profile-stats">
          <span><b>{{ seller.rating.toFixed(1) }}</b> 评分</span>
          <span><b>{{ seller.deals }}</b> 成交</span>
          <span><b>{{ listings.length }}</b> 在售</span>
          <span :class="{ 'danger-text': seller.reportCount > 0 }"><b>{{ seller.reportCount }}</b> 举报</span>
        </div>
      </div>
      <div class="seller-profile-actions">
        <button v-if="seller.contact" class="btn btn-outline btn-sm" type="button" @click="copyContact">
          <Icon :name="seller.contact.type === 'qq' ? 'user' : 'chat'" />
          {{ seller.contact.type === 'qq' ? 'QQ' : '微信' }}：{{ seller.contact.value }}
        </button>
        <button v-if="isAdmin && seller.publishBanned" class="btn btn-primary btn-sm" type="button" @click="restore">
          恢复发布权限
        </button>
      </div>
    </section>

    <div v-if="seller.publishBanned" class="risk-banner">
      <Icon name="shield" />
      <div>
        <b>该卖家已被暂停发布权限</b>
        <p>{{ seller.banReason }}。你仍然可以查看历史评价，但请谨慎交易。</p>
      </div>
    </div>

    <section class="seller-section">
      <div class="section-head">
        <div>
          <p class="eyebrow">SELLER LISTINGS</p>
          <h2 class="section-title">在售的闲置</h2>
        </div>
      </div>
      <div v-if="listings.length" class="item-grid">
        <ItemCard v-for="item in listings" :key="item.id" :item="item" />
      </div>
      <EmptyState v-else icon="bag" title="暂时没有在售的闲置" text="这个卖家现在没有挂出来的商品。" />
    </section>

    <section class="seller-section seller-feedback">
      <div class="seller-feedback-grid">
        <div>
          <p class="eyebrow">BUYER FEEDBACK</p>
          <h2 class="section-title">买家评价</h2>
          <div v-if="reviews.length" class="review-list">
            <article v-for="review in reviews" :key="review.id" class="review-card">
              <header>
                <b>{{ review.buyerName }}</b>
                <span class="review-stars">{{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}</span>
              </header>
              <p>{{ review.text || '这位买家只留下了评分。' }}</p>
              <time>{{ new Date(review.createdAt).toLocaleDateString('zh-CN') }}</time>
            </article>
          </div>
          <p v-else class="seller-empty-text">还没有买家评价，交易完成后可以在这里留下反馈。</p>
        </div>

        <div class="seller-forms">
          <div v-if="!isOwn" class="seller-form-card">
            <h3>给卖家一个评价</h3>
            <template v-if="!market.currentUser">
              <p class="seller-empty-text">登录后才可以评价卖家。</p>
              <RouterLink class="btn btn-primary btn-sm" :to="{ name: 'login', query: { redirect: route.fullPath } }">去登录</RouterLink>
            </template>
            <template v-else-if="hasFeedback">
              <p class="seller-empty-text">你已经评价过这位卖家了。</p>
            </template>
            <form v-else @submit.prevent="sendFeedback">
              <label class="field-label" for="review-rating">评分</label>
              <select id="review-rating" v-model.number="feedback.rating" class="select">
                <option :value="5">★★★★★ 非常满意</option>
                <option :value="4">★★★★☆ 满意</option>
                <option :value="3">★★★☆☆ 一般</option>
                <option :value="2">★★☆☆☆ 不太满意</option>
                <option :value="1">★☆☆☆☆ 很差</option>
              </select>
              <label class="field-label" for="review-text">评价内容</label>
              <textarea id="review-text" v-model="feedback.text" class="textarea" maxlength="300" placeholder="说说这次交易的体验，给其他同学一个参考。"></textarea>
              <button class="btn btn-primary btn-block btn-sm" type="submit" :disabled="submittingFeedback">
                {{ submittingFeedback ? '提交中…' : '提交评价' }}
              </button>
            </form>
          </div>

          <div v-if="!isOwn" class="seller-form-card report-card">
            <h3>举报这个卖家</h3>
            <p class="seller-empty-text">如果卖家存在虚假描述、收款不发货等行为，可以提交举报。3 位买家举报并经系统核实后，卖家会被暂停发布权限。</p>
            <template v-if="!market.currentUser">
              <RouterLink class="btn btn-outline btn-sm" :to="{ name: 'login', query: { redirect: route.fullPath } }">登录后举报</RouterLink>
            </template>
            <template v-else-if="hasReport">
              <p class="seller-empty-text">你已经举报过这位卖家，管理员会进行核实。</p>
            </template>
            <form v-else @submit.prevent="sendReport">
              <label class="field-label" for="report-reason">举报原因</label>
              <select id="report-reason" v-model="report.reason" class="select">
                <option v-for="reason in reportReasons" :key="reason" :value="reason">{{ reason }}</option>
              </select>
              <label class="field-label" for="report-detail">补充说明</label>
              <textarea id="report-detail" v-model="report.detail" class="textarea" maxlength="300" placeholder="简单描述发生了什么，方便管理员核实。"></textarea>
              <button class="btn btn-outline btn-block btn-sm report-submit" type="submit" :disabled="submittingReport">
                {{ submittingReport ? '提交中…' : '提交举报' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
