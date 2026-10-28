<script setup>
import { computed } from 'vue';
import Icon from './Icon.vue';
import { market } from '../stores/market';

const latestForum = computed(() => market.forumPosts.slice(0, 2));
const latestGames = computed(() => market.gamePosts.slice(0, 2));
</script>

<template>
  <section class="channels-section wrap" aria-labelledby="channels-title">
    <div class="section-head channels-head">
      <div>
        <p class="eyebrow">CAMPUS CHANNELS · 校园频道</p>
        <h2 id="channels-title" class="section-title">除了闲置，桂院还有这些。</h2>
      </div>
      <p class="channels-sub">分享趣事，或者约一局游戏。</p>
    </div>

    <div class="channel-grid">
      <RouterLink class="channel-card channel-forum" to="/forum">
        <span class="channel-watermark" aria-hidden="true">论</span>
        <div class="channel-top">
          <span class="channel-icon"><Icon name="chat" /></span>
          <span class="channel-count">{{ market.forumPosts.length }} 条分享</span>
        </div>
        <p class="eyebrow">ALUMNI FORUM</p>
        <h3>校友论坛</h3>
        <p class="channel-desc">图书馆的光、操场的风，还有那些想被记住的校园小事。</p>
        <ul class="channel-preview">
          <li v-for="post in latestForum" :key="post.id">
            <span>{{ post.topic }}</span>
            {{ post.title }}
          </li>
        </ul>
        <span class="channel-more">去论坛看看 <Icon name="arrow" /></span>
      </RouterLink>

      <RouterLink class="channel-card channel-games" to="/games">
        <span class="channel-watermark" aria-hidden="true">游</span>
        <div class="channel-top">
          <span class="channel-icon"><Icon name="play" /></span>
          <span class="channel-count">{{ market.gamePosts.length }} 条组队</span>
        </div>
        <p class="eyebrow">GAME CORNER</p>
        <h3>游戏天地</h3>
        <p class="channel-desc">发一条游戏链接，约校友今晚开黑。缺辅助、缺打野，都来这里喊一声。</p>
        <ul class="channel-preview">
          <li v-for="post in latestGames" :key="post.id">
            <span>{{ post.platform }}</span>
            {{ post.game }} · {{ post.playTime }}
          </li>
        </ul>
        <span class="channel-more">去游戏天地 <Icon name="arrow" /></span>
      </RouterLink>
    </div>
  </section>
</template>
