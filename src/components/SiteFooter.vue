<script setup>
import { SCHOOL } from '../data/site';
const year = new Date().getFullYear();
</script>

<template>
  <footer class="site-footer">
    <div class="wrap footer-inner">
      <div class="footer-brand">
        <RouterLink class="brand brand-light" to="/">
          <span class="brand-mark">拾</span>
          <span class="brand-text"><b>拾光集</b><em>SHIGUANG MARKET</em></span>
        </RouterLink>
        <p class="footer-tagline">让每件旧物，<br>都有下一段故事。</p>
        <div class="footer-badges">
          <span class="footer-badge">校内实名</span>
          <span class="footer-badge">当面验货</span>
          <span class="footer-badge">0 服务费</span>
        </div>
      </div>

      <div class="footer-cols">
        <div class="footer-col">
          <h4>逛集市</h4>
          <RouterLink :to="{ name: 'search', query: { cat: 'digital' } }">数码好物</RouterLink>
          <RouterLink :to="{ name: 'search', query: { cat: 'books' } }">教材书籍</RouterLink>
          <RouterLink :to="{ name: 'search', query: { cat: 'dorm' } }">宿舍神器</RouterLink>
          <RouterLink :to="{ name: 'search', query: { sort: 'new' } }">今日上新</RouterLink>
        </div>
        <div class="footer-col">
          <h4>校园频道</h4>
          <RouterLink to="/forum">校友论坛</RouterLink>
          <RouterLink to="/games">游戏天地</RouterLink>
          <RouterLink to="/about">我们的故事</RouterLink>
          <RouterLink to="/about">交易安全</RouterLink>
        </div>
        <div class="footer-col">
          <h4>联系我们</h4>
          <span>{{ SCHOOL.name }} · 校园集市</span>
          <span>拾光集学生团队</span>
          <span>周一至周五 10:00–18:00</span>
        </div>
      </div>
    </div>

    <div class="wrap footer-bottom">
      <span>© {{ year }} 拾光集 SHIGUANG MARKET</span>
      <span>{{ SCHOOL.name }}校园二手 · 本页面为课程设计作品，请勿进行真实支付</span>
    </div>
  </footer>
</template>
