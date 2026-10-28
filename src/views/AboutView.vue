<script setup>
import Icon from '../components/Icon.vue';
import { SCHOOL } from '../data/site';
</script>

<template>
  <div class="page page-fade wrap about-page">
    <p class="eyebrow">ABOUT · 关于拾光集</p>
    <h1>旧物不是终点，<br>是下一段故事的起点。</h1>
    <p>拾光集是{{ SCHOOL.name }}学子的校园二手集市。我们相信，宿舍里那些被搁置的教材、单车、耳机和台灯，不该在毕业季被匆忙丢掉，而应该找到下一位真正需要它的同学。</p>
    <p>所以这里没有复杂的玩法：校内实名、认真描述、当面验货、0 服务费。把交易变回一件轻松、可信、带点人情味的小事。</p>

    <h2 style="font-family: var(--font-serif); font-size: 24px; margin: 34px 0 12px;">三条小小的原则</h2>
    <ol class="safety-list" style="gap: 10px;">
      <li>只和{{ SCHOOL.name }}的同学交易，优先选择图书馆、食堂、宿舍楼下等校内公共场所面交。</li>
      <li>当面确认成色与功能后再付款，不提前转账、不缴纳保证金。</li>
      <li>如实描述瑕疵。好的交易，从一句诚实的说明开始。</li>
    </ol>

    <p class="about-note" style="margin-top: 28px;">
      本页面为「拾光集」课程设计作品，所有商品、卖家与对话均为虚构，仅用于展示交互与视觉设计，请勿进行真实支付。
    </p>

    <p style="margin-top: 30px;">
      <RouterLink class="btn btn-primary" to="/">回到集市 <Icon name="arrow" /></RouterLink>
    </p>
  </div>
</template>
