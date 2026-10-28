<script setup>
import { computed, ref } from 'vue';
import Artwork from '../components/Artwork.vue';
import EmptyState from '../components/EmptyState.vue';
import Icon from '../components/Icon.vue';
import {
  cartListings,
  checkoutCart,
  removeFromCart
} from '../stores/market';
import { openChat, toast } from '../stores/ui';
import { fmtPrice } from '../lib/format';

const items = computed(() => cartListings.value);
const total = computed(() => items.value.reduce((sum, item) => sum + Number(item.price || 0), 0));
const submitting = ref(false);
const lastOrder = ref(null);

async function remove(id) {
  await removeFromCart(id);
  toast('已从购物车移除');
}

async function checkout() {
  if (!items.value.length) return;
  submitting.value = true;
  try {
    lastOrder.value = await checkoutCart();
    toast('下单成功，商品已自动出库');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    toast(error.message || '下单失败');
  } finally {
    submitting.value = false;
  }
}

function contact(listingId) {
  openChat(listingId, '你好，我想确认一下这件闲置。');
}
</script>

<template>
  <div class="page page-fade wrap cart-page">
    <div class="page-head">
      <p class="eyebrow">CART · 购物车</p>
      <h1>喜欢的好物，先放进来。</h1>
      <p>{{ items.length }} 件商品 · 下单后商品会自动从集市出库</p>
    </div>

    <div v-if="lastOrder" class="checkout-success">
      <div class="empty-icon"><Icon name="check" /></div>
      <h2>下单成功</h2>
      <p>订单号：{{ lastOrder.id }}</p>
      <p>共 {{ lastOrder.items.length }} 件，合计 ¥{{ fmtPrice(lastOrder.total) }}。卖家联系方式已保存在订单里。</p>
      <div class="checkout-success-actions">
        <RouterLink class="btn btn-primary" to="/orders">查看我的订单</RouterLink>
        <RouterLink class="btn btn-outline" to="/">继续逛集市</RouterLink>
      </div>
    </div>

    <div v-else-if="items.length" class="cart-layout">
      <div class="cart-list">
        <article v-for="item in items" :key="item.id" class="cart-row">
          <RouterLink class="cart-thumb" :to="`/item/${item.id}`"><Artwork :item="item" /></RouterLink>
          <div class="cart-info">
            <RouterLink class="cart-title" :to="`/item/${item.id}`">{{ item.title }}</RouterLink>
            <div class="cart-meta">
              <span>{{ item.condition }}</span>
              <span>·</span>
              <span>卖家 {{ item.seller.name }}</span>
              <span class="tag">校内面交</span>
            </div>
            <button class="cart-contact" type="button" @click="contact(item.id)">
              <Icon name="chat" /> 联系卖家
            </button>
          </div>
          <div class="cart-side">
            <b>¥{{ fmtPrice(item.price) }}</b>
            <button class="cart-remove" type="button" @click="remove(item.id)">移除</button>
          </div>
        </article>
      </div>

      <aside class="cart-summary">
        <p class="eyebrow">ORDER SUMMARY</p>
        <h2>合计</h2>
        <div class="cart-summary-line"><span>商品件数</span><b>{{ items.length }} 件</b></div>
        <div class="cart-summary-line"><span>交易服务费</span><b>¥0</b></div>
        <div class="cart-total"><span>应付</span><b>¥{{ fmtPrice(total) }}</b></div>
        <button class="btn btn-primary btn-block" type="button" :disabled="submitting" @click="checkout">
          {{ submitting ? '正在下单…' : '确认下单' }} <Icon name="arrow" />
        </button>
        <p class="cart-note"><Icon name="info" /> 本演示不接入真实支付。下单后商品会从集市移除，交易地点由买卖双方自行商议。</p>
      </aside>
    </div>

    <EmptyState
      v-else
      icon="cart"
      title="购物车还是空的"
      text="看到喜欢的闲置，点一下购物车按钮，就能先放进来。"
    >
      <RouterLink class="btn btn-primary" to="/">去逛集市</RouterLink>
    </EmptyState>
  </div>
</template>
