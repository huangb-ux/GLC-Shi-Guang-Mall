<script setup>
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import EmptyState from '../components/EmptyState.vue';
import Icon from '../components/Icon.vue';
import { createForumPost, market, toggleForumLike } from '../stores/market';
import { toast } from '../stores/ui';
import { timeAgo } from '../lib/format';

const router = useRouter();
const topics = ['全部', '校园趣事', '校园日常', '美食推荐', '学习交流', '失物招领'];
const activeTopic = ref('全部');
const showComposer = ref(false);
const submitting = ref(false);
const form = reactive({ title: '', topic: '校园趣事', content: '' });

const filteredPosts = computed(() => {
  if (activeTopic.value === '全部') return market.forumPosts;
  return market.forumPosts.filter(post => post.topic === activeTopic.value);
});

const isLoggedIn = computed(() => Boolean(market.currentUser));

function openComposer() {
  if (!isLoggedIn.value) {
    router.push({ name: 'login', query: { redirect: '/forum' } });
    return;
  }
  showComposer.value = !showComposer.value;
}

async function submitPost() {
  if (submitting.value) return;
  submitting.value = true;
  try {
    await createForumPost(form);
    toast('趣事发布成功，等同学们来聊');
    form.title = '';
    form.content = '';
    form.topic = '校园趣事';
    showComposer.value = false;
    activeTopic.value = '全部';
  } catch (error) {
    toast(error.message || '发布失败，请稍后再试');
  } finally {
    submitting.value = false;
  }
}

async function likePost(post) {
  const result = await toggleForumLike(post.id);
  if (result === 'auth') {
    router.push({ name: 'login', query: { redirect: '/forum' } });
  } else if (result === 'missing') {
    toast('这条帖子已经不在了');
  }
}

function liked(post) {
  return Boolean(market.currentUser && post.likes?.includes(market.currentUser.id));
}
</script>

<template>
  <main class="forum-page wrap">
    <section class="channel-hero">
      <div>
        <p class="eyebrow">ALUMNI FORUM · 校友论坛</p>
        <h1>把桂院的日子，写下来。</h1>
        <p class="channel-lead">图书馆的光、操场的风、食堂的新窗口……那些没来得及发朋友圈的校园趣事，都可以放在这里。</p>
      </div>
      <button class="btn btn-primary channel-cta" type="button" @click="openComposer">
        <Icon :name="showComposer ? 'close' : 'plus'" />
        {{ showComposer ? '收起' : '发布趣事' }}
      </button>
    </section>

    <div class="forum-layout">
      <section class="forum-main" aria-label="论坛帖子">
        <div class="forum-toolbar">
          <div class="forum-topics" role="tablist" aria-label="帖子分类">
            <button
              v-for="topic in topics"
              :key="topic"
              class="topic-pill"
              :class="{ active: activeTopic === topic }"
              type="button"
              role="tab"
              :aria-selected="activeTopic === topic"
              @click="activeTopic = topic"
            >
              {{ topic }}
            </button>
          </div>
          <span class="forum-count">{{ filteredPosts.length }} 条分享</span>
        </div>

        <Transition name="panel">
          <form v-if="showComposer" class="forum-composer" @submit.prevent="submitPost">
            <div class="composer-head">
              <div>
                <p class="eyebrow">NEW POST · 新帖子</p>
                <h2>今天想分享点什么？</h2>
              </div>
              <button class="icon-btn" type="button" aria-label="关闭发布框" @click="showComposer = false">
                <Icon name="close" />
              </button>
            </div>
            <div class="form-row">
              <div class="field">
                <label class="field-label" for="forum-title">标题<span class="req">*</span></label>
                <input id="forum-title" v-model="form.title" class="input" maxlength="40" placeholder="一句话说清楚你想分享的事">
              </div>
              <div class="field">
                <label class="field-label" for="forum-topic">分类</label>
                <select id="forum-topic" v-model="form.topic" class="select">
                  <option v-for="topic in topics.slice(1)" :key="topic" :value="topic">{{ topic }}</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label class="field-label" for="forum-content">正文<span class="req">*</span></label>
              <textarea id="forum-content" v-model="form.content" class="textarea" rows="5" maxlength="800" placeholder="把时间、地点和有趣的部分写下来，会更像一篇桂院小记。"></textarea>
            </div>
            <div class="composer-actions">
              <span class="field-hint">发布后会展示在论坛里，请友善交流。</span>
              <button class="btn btn-primary" type="submit" :disabled="submitting">
                <Icon name="send" /> {{ submitting ? '发布中…' : '发布到论坛' }}
              </button>
            </div>
          </form>
        </Transition>

        <div v-if="filteredPosts.length" class="forum-feed">
          <article v-for="post in filteredPosts" :key="post.id" class="forum-card">
            <header class="forum-card-head">
              <span class="forum-avatar">{{ post.authorInitial }}</span>
              <div class="forum-author">
                <b>{{ post.authorName }}</b>
                <span>{{ timeAgo(post.createdAt) }}</span>
              </div>
              <span class="forum-topic">{{ post.topic }}</span>
            </header>
            <h2>{{ post.title }}</h2>
            <p class="forum-content">{{ post.content }}</p>
            <footer class="forum-card-foot">
              <button
                class="forum-like"
                :class="{ liked: liked(post) }"
                type="button"
                :aria-pressed="liked(post)"
                @click="likePost(post)"
              >
                <Icon name="heart" /> {{ post.likes?.length || 0 }} 人觉得有趣
              </button>
              <span class="forum-tip">桂院 · 校园分享</span>
            </footer>
          </article>
        </div>
        <EmptyState v-else icon="chat" title="这个分类还没有帖子" text="来写下第一条桂院趣事吧。">
          <button class="btn btn-primary btn-sm" type="button" @click="openComposer">
            <Icon name="plus" /> 发布趣事
          </button>
        </EmptyState>
      </section>

      <aside class="forum-side">
        <div class="forum-side-card">
          <p class="eyebrow">FORUM NOTES</p>
          <h3>论坛小公约</h3>
          <ul>
            <li>分享真实、友善的校园日常。</li>
            <li>不公开他人的手机号、宿舍号。</li>
            <li>失物招领请写明物品特征。</li>
            <li>不同意见可以讨论，不人身攻击。</li>
          </ul>
        </div>
        <div class="forum-side-note">
          <Icon name="spark" />
          <p>这里不是表白墙，也不是二手市场。只收桂院日子里，那些想被记住的小事。</p>
        </div>
      </aside>
    </div>
  </main>
</template>
