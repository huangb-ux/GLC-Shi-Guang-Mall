<script setup>
import { computed } from 'vue';
import EmptyState from '../components/EmptyState.vue';
import Icon from '../components/Icon.vue';
import { myOrders } from '../stores/market';
import { toast } from '../stores/ui';
import { fmtPrice } from '../lib/format';

const orders = computed(() => myOrders.value);

async function copyContact(contact) {
  if (!contact?.value) return;
  try {
    await navigator.clipboard.writeText(contact.value);
    toast('联系方式已复制');
  } catch (error) {
    toast(`联系方式：${contact.value}`);
  }
}
</script>

<template>
  <div class="page page-fade wrap orders-page">
    <div class="page-head">
      <p class="eyebrow">ORDERS · 我的订单</p>
      <h1>买到的好物，都在这里。</h1>
      <p>{{ orders.length }} 笔订单 · 下单后卖家商品已自动出库</p>
    </div>

    <div v-if="orders.length" class="order-list">
      <article v-for="order in orders" :key="order.id" class="order-card">
        <header class="order-head">
          <div>
            <span class="order-id">订单 {{ order.id }}</span>
            <span class="order-date">{{ new Date(order.createdAt).toLocaleString('zh-CN') }}</span>
          </div>
          <span class="status-pill">已出库 · 待面交</span>
        </header>

        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <div class="order-title">
              <b>{{ item.title }}</b>
              <span>¥{{ fmtPrice(item.price) }} · {{ item.condition }}</span>
            </div>
            <div class="order-contact">
              <span>卖家：{{ item.seller.name }}</span>
              <button
                v-if="item.contact"
                class="mini-copy"
                type="button"
                @click="copyContact(item.contact)"
              >
                {{ item.contact.type === 'qq' ? 'QQ' : '微信' }}：{{ item.contact.value }} · 复制
              </button>
              <span v-else class="muted">卖家未留联系方式，可在交易后通过站内消息沟通</span>
            </div>
          </div>
        </div>

        <footer class="order-foot">
          <span>共 {{ order.items.length }} 件</span>
          <b>合计 ¥{{ fmtPrice(order.total) }}</b>
        </footer>
      </article>
    </div>

    <EmptyState
      v-else
      icon="bag"
      title="还没有订单"
      text="把喜欢的闲置加入购物车，下单后就能在这里查看卖家的联系方式。"
    >
      <RouterLink class="btn btn-primary" to="/">去逛集市</RouterLink>
    </EmptyState>
  </div>
</template>
