<script setup>
import { computed, ref } from 'vue';
import EmptyState from '../components/EmptyState.vue';
import Icon from '../components/Icon.vue';
import {
  adminResolveReport,
  getSeller,
  market,
  restoreSeller
} from '../stores/market';
import { toast } from '../stores/ui';

const tab = ref('reports');

const stats = computed(() => [
  { label: '注册账号', value: market.accounts.length, icon: 'user' },
  { label: '在售商品', value: market.listings.length, icon: 'bag' },
  { label: '订单', value: market.orders.length, icon: 'cart' },
  { label: '待处理举报', value: market.reports.filter(item => item.status === 'pending').length, icon: 'shield' }
]);

const reports = computed(() =>
  market.reports.slice().sort((a, b) => b.createdAt - a.createdAt)
);

const accounts = computed(() =>
  market.accounts.slice().sort((a, b) => b.createdAt - a.createdAt)
);

function sellerName(sellerId) {
  return getSeller(sellerId)?.name || sellerId;
}

function maskedPhone(phone) {
  if (!phone) return '管理员账号';
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
}

async function resolve(report, verified) {
  await adminResolveReport(report.id, verified);
  toast(verified ? '已核实，卖家发布权限已暂停' : '已驳回该举报');
}

async function restore(sellerId) {
  await restoreSeller(sellerId);
  toast('已恢复该卖家的发布权限');
}

function statusLabel(status) {
  if (status === 'verified') return '已核实';
  if (status === 'rejected') return '已驳回';
  return '待处理';
}
</script>

<template>
  <div class="page page-fade wrap admin-page">
    <div class="page-head admin-head">
      <div>
        <p class="eyebrow">ADMIN · 管理后台</p>
        <h1>拾光集运营台</h1>
        <p>管理举报、卖家发布权限和数据库概览。</p>
      </div>
      <span class="admin-badge">管理员</span>
    </div>

    <div class="admin-stats">
      <div v-for="stat in stats" :key="stat.label" class="admin-stat">
        <span class="admin-stat-icon"><Icon :name="stat.icon" /></span>
        <b>{{ stat.value }}</b>
        <span>{{ stat.label }}</span>
      </div>
    </div>

    <div class="tabs">
      <button class="tab" :class="{ 'is-active': tab === 'reports' }" type="button" @click="tab = 'reports'">举报审核</button>
      <button class="tab" :class="{ 'is-active': tab === 'users' }" type="button" @click="tab = 'users'">用户与卖家</button>
      <button class="tab" :class="{ 'is-active': tab === 'database' }" type="button" @click="tab = 'database'">数据库概览</button>
    </div>

    <div v-if="tab === 'reports'">
      <div v-if="reports.length" class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>卖家</th>
              <th>举报人</th>
              <th>原因</th>
              <th>状态</th>
              <th>时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in reports" :key="report.id">
              <td>
                <RouterLink class="admin-link" :to="`/seller/${report.sellerId}`">{{ sellerName(report.sellerId) }}</RouterLink>
                <span v-if="getSeller(report.sellerId)?.publishBanned" class="risk-badge">已禁发</span>
              </td>
              <td>{{ report.buyerName }}</td>
              <td class="admin-reason">{{ report.reason }}</td>
              <td><span class="status-tag" :class="report.status">{{ statusLabel(report.status) }}</span></td>
              <td>{{ new Date(report.createdAt).toLocaleDateString('zh-CN') }}</td>
              <td class="admin-actions">
                <template v-if="report.status === 'pending'">
                  <button class="mini-btn danger" type="button" @click="resolve(report, true)">核实并禁发</button>
                  <button class="mini-btn" type="button" @click="resolve(report, false)">驳回</button>
                </template>
                <button
                  v-else-if="getSeller(report.sellerId)?.publishBanned"
                  class="mini-btn"
                  type="button"
                  @click="restore(report.sellerId)"
                >
                  恢复发布
                </button>
                <span v-else class="muted">已处理</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <EmptyState v-else icon="shield" title="还没有举报" text="当买家提交举报后，会在这里显示。" />
    </div>

    <div v-else-if="tab === 'users'">
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>昵称</th>
              <th>手机号</th>
              <th>角色</th>
              <th>发布状态</th>
              <th>在售</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="account in accounts" :key="account.id">
              <td>
                <RouterLink class="admin-link" :to="`/seller/${account.id}`">{{ account.name }}</RouterLink>
              </td>
              <td>{{ maskedPhone(account.phone) }}</td>
              <td>{{ account.role === 'admin' ? '管理员' : '普通用户' }}</td>
              <td>
                <span class="status-tag" :class="account.publishBanned ? 'verified' : 'ok'">
                  {{ account.publishBanned ? '已暂停发布' : '正常' }}
                </span>
              </td>
              <td>{{ market.listings.filter(item => item.sellerId === account.id).length }}</td>
              <td class="admin-actions">
                <button v-if="account.publishBanned" class="mini-btn" type="button" @click="restore(account.id)">恢复发布</button>
                <span v-else class="muted">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="admin-db">
      <div class="admin-db-card">
        <h2>IndexedDB · shiguang-db</h2>
        <p>这是浏览器内置数据库。发布商品会写入 listings 表；下单后商品会从 listings 表删除，并写入 orders 表，所以集市里会自动“出库”。</p>
        <div class="admin-db-grid">
          <div><b>{{ market.accounts.length }}</b><span>accounts</span></div>
          <div><b>{{ market.listings.length }}</b><span>listings</span></div>
          <div><b>{{ market.orders.length }}</b><span>orders</span></div>
          <div><b>{{ market.reports.length }}</b><span>reports</span></div>
          <div><b>{{ market.feedback.length }}</b><span>feedback</span></div>
          <div><b>{{ Object.values(market.flags).filter(flag => flag.banned).length }}</b><span>禁发卖家</span></div>
        </div>
        <p class="admin-db-note">提示：GitHub Pages 是静态托管，数据保存在当前浏览器。换成真实后端后，把 <code>src/lib/db.js</code> 替换成 API 请求即可。</p>
      </div>
    </div>
  </div>
</template>
