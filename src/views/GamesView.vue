<script setup>
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import EmptyState from '../components/EmptyState.vue';
import Icon from '../components/Icon.vue';
import { createGamePost, market, toggleGameJoin } from '../stores/market';
import { toast } from '../stores/ui';
import { timeAgo } from '../lib/format';

const router = useRouter();
const platforms = ['全部', '手机', 'PC', '主机'];
const activePlatform = ref('全部');
const showComposer = ref(false);
const submitting = ref(false);
const form = reactive({
  game: '',
  platform: '手机',
  link: '',
  playTime: '',
  description: '',
  contact: ''
});

const filteredPosts = computed(() => {
  if (activePlatform.value === '全部') return market.gamePosts;
  return market.gamePosts.filter(post => post.platform === activePlatform.value);
});

const isLoggedIn = computed(() => Boolean(market.currentUser));
const openTeams = computed(() => market.gamePosts.reduce((total, post) => total + (post.players?.length || 0), 0));

function openComposer() {
  if (!isLoggedIn.value) {
    router.push({ name: 'login', query: { redirect: '/games' } });
    return;
  }
  showComposer.value = !showComposer.value;
}

async function submitGame() {
  if (submitting.value) return;
  submitting.value = true;
  try {
    await createGamePost(form);
    toast('组队邀请发布成功，等校友来开黑');
    form.game = '';
    form.link = '';
    form.playTime = '';
    form.description = '';
    form.contact = '';
    form.platform = '手机';
    showComposer.value = false;
    activePlatform.value = '全部';
  } catch (error) {
    toast(error.message || '发布失败，请稍后再试');
  } finally {
    submitting.value = false;
  }
}

async function joinGame(post) {
  const result = await toggleGameJoin(post.id);
  if (result === 'auth') {
    router.push({ name: 'login', query: { redirect: '/games' } });
  } else if (result === 'missing') {
    toast('这条组队邀请已经不在了');
  } else {
    toast(result ? '已加入队伍，去联系发起人吧' : '已退出队伍');
  }
}

async function copyLink(post) {
  try {
    await navigator.clipboard.writeText(post.link);
    toast('游戏链接已复制');
  } catch (error) {
    toast('复制失败，可以点「打开链接」');
  }
}

function joined(post) {
  return Boolean(market.currentUser && post.players?.includes(market.currentUser.id));
}

function linkHost(link) {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch (error) {
    return '游戏链接';
  }
}
</script>

<template>
  <main class="games-page wrap">
    <section class="channel-hero games-hero">
      <div>
        <p class="eyebrow">GAME CORNER · 游戏天地</p>
        <h1>今晚，和校友开一局。</h1>
        <p class="channel-lead">发一条游戏链接，约一个时间。王者、联盟、永劫、和平精英……在桂院找到你的固定搭子。</p>
      </div>
      <button class="btn games-cta" type="button" @click="openComposer">
        <Icon :name="showComposer ? 'close' : 'plus'" />
        {{ showComposer ? '收起' : '发布组队' }}
      </button>
    </section>

    <div class="games-stats">
      <div><b>{{ market.gamePosts.length }}</b><span>条组队邀请</span></div>
      <div><b>{{ openTeams }}</b><span>人已经上车</span></div>
      <div><b>5</b><span>个测试账号可登录</span></div>
      <p><Icon name="info" /> 游戏链接会跳转到官方站点或你分享的页面，请注意财产安全。</p>
    </div>

    <div class="forum-toolbar games-toolbar">
      <div class="forum-topics" role="tablist" aria-label="游戏平台">
        <button
          v-for="platform in platforms"
          :key="platform"
          class="topic-pill"
          :class="{ active: activePlatform === platform }"
          type="button"
          role="tab"
          :aria-selected="activePlatform === platform"
          @click="activePlatform = platform"
        >
          {{ platform }}
        </button>
      </div>
      <span class="forum-count">{{ filteredPosts.length }} 条邀请</span>
    </div>

    <Transition name="panel">
      <form v-if="showComposer" class="forum-composer game-composer" @submit.prevent="submitGame">
        <div class="composer-head">
          <div>
            <p class="eyebrow">NEW SQUAD · 新建队伍</p>
            <h2>今天想玩什么？</h2>
          </div>
          <button class="icon-btn" type="button" aria-label="关闭发布框" @click="showComposer = false">
            <Icon name="close" />
          </button>
        </div>
        <div class="form-row">
          <div class="field">
            <label class="field-label" for="game-name">游戏名称<span class="req">*</span></label>
            <input id="game-name" v-model="form.game" class="input" maxlength="30" placeholder="例如：王者荣耀">
          </div>
          <div class="field">
            <label class="field-label" for="game-platform">平台</label>
            <select id="game-platform" v-model="form.platform" class="select">
              <option v-for="platform in platforms.slice(1)" :key="platform" :value="platform">{{ platform }}</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="field">
            <label class="field-label" for="game-link">游戏链接<span class="req">*</span></label>
            <input id="game-link" v-model="form.link" class="input" placeholder="官方下载页、攻略或房间链接">
          </div>
          <div class="field">
            <label class="field-label" for="game-time">约定时间</label>
            <input id="game-time" v-model="form.playTime" class="input" maxlength="30" placeholder="例如：今晚 21:00">
          </div>
        </div>
        <div class="field">
          <label class="field-label" for="game-desc">组队说明<span class="req">*</span></label>
          <textarea id="game-desc" v-model="form.description" class="textarea" rows="3" maxlength="300" placeholder="段位、缺什么位置、是否开麦、玩几局……写清楚更容易找到搭子。"></textarea>
        </div>
        <div class="field">
          <label class="field-label" for="game-contact">联系方式 <span class="opt">选填</span></label>
          <input id="game-contact" v-model="form.contact" class="input" maxlength="50" placeholder="例如：微信 guilin_game">
        </div>
        <div class="composer-actions">
          <span class="field-hint">建议使用游戏官方链接，不要填写陌生充值页面。</span>
          <button class="btn games-cta" type="submit" :disabled="submitting">
            <Icon name="send" /> {{ submitting ? '发布中…' : '发布组队' }}
          </button>
        </div>
      </form>
    </Transition>

    <div v-if="filteredPosts.length" class="game-grid">
      <article v-for="post in filteredPosts" :key="post.id" class="game-card">
        <header class="game-card-head">
          <span class="game-badge"><Icon name="play" /> {{ post.platform }}</span>
          <span class="game-time">{{ post.playTime }}</span>
        </header>
        <h2>{{ post.game }}</h2>
        <p class="game-desc">{{ post.description }}</p>
        <div class="game-meta">
          <span><Icon name="user" /> {{ post.authorName }}</span>
          <span><Icon name="clock" /> {{ timeAgo(post.createdAt) }}</span>
          <span><Icon name="user" /> {{ post.players?.length || 0 }} 人已加入</span>
        </div>
        <p v-if="post.contact" class="game-contact"><Icon name="chat" /> {{ post.contact }}</p>
        <footer class="game-card-foot">
          <a class="game-link" :href="post.link" target="_blank" rel="noreferrer">
            <Icon name="external" /> 打开链接
          </a>
          <button class="game-copy" type="button" @click="copyLink(post)">
            {{ linkHost(post.link) }}
          </button>
          <button
            class="btn game-join"
            :class="{ joined: joined(post) }"
            type="button"
            @click="joinGame(post)"
          >
            <Icon :name="joined(post) ? 'check' : 'plus'" />
            {{ joined(post) ? '已加入' : '加入队伍' }}
          </button>
        </footer>
      </article>
    </div>
    <EmptyState v-else icon="play" title="这个平台还没有组队邀请" text="发一条链接，约校友一起开黑。">
      <button class="btn games-cta btn-sm" type="button" @click="openComposer">
        <Icon name="plus" /> 发布组队
      </button>
    </EmptyState>

    <p class="games-note">游戏只是课余的放松方式，记得按时吃饭、早点休息。</p>
  </main>
</template>
