<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import Artwork from './Artwork.vue';
import Icon from './Icon.vue';
import {
  ensureThread,
  getListing,
  markThreadRead,
  market,
  pushMessage,
  saveChats
} from '../stores/market';
import { closeChat, toast, ui } from '../stores/ui';
import { clockTime, fmtPrice } from '../lib/format';

const input = ref('');
const typing = ref(false);
const bodyRef = ref(null);
let pendingReplies = 0;

const item = computed(() => (ui.chatItemId ? getListing(ui.chatItemId) : null));
const thread = computed(() => (ui.chatItemId ? market.chats[ui.chatItemId] : null));

watch(
  () => [ui.chatItemId, ui.chatPrefill],
  ([id, prefill]) => {
    if (!id) return;
    const found = getListing(id);
    if (!found) return;
    ensureThread(found);
    markThreadRead(id);
    input.value = prefill || '';
    typing.value = false;
    pendingReplies = 0;
    nextTick(() => {
      scrollToBottom();
      document.querySelector('.chat-input')?.focus({ preventScroll: true });
    });
  },
  { immediate: true }
);

watch(() => thread.value?.messages.length, () => nextTick(scrollToBottom));
watch(() => ui.chatItemId, () => nextTick(scrollToBottom));

function scrollToBottom() {
  if (bodyRef.value) bodyRef.value.scrollTop = bodyRef.value.scrollHeight;
}

function replyFor(listing, text) {
  if (/便宜|少点|刀|优惠|价格/.test(text)) {
    return '价格已经是最低啦，不过你要是今天能来拿，可以再少 10 块～ 主要是不想它继续在宿舍吃灰。';
  }
  if (/在吗|你好|hi|hello|在不在/i.test(text)) {
    return '在的在的！这件我一直放在宿舍，随时可以约看，你方便的话今天下午也可以。';
  }
  if (/面交|哪|地点|时候|时间|几时/.test(text)) {
    return `我一般在${listing.area || '学校'}附近，图书馆门口或者宿舍楼下都可以，你定个方便的地方也行。`;
  }
  if (/尺寸|多大|型号|参数|几成新|成色/.test(text)) {
    return '成色和描述里写的一致，我可以多拍几张细节图给你；介意的话也可以当面看完再决定。';
  }
  return '好的！可以当面验货，满意再拿走～ 你大概什么时候方便？';
}

function send(rawText) {
  const text = String(rawText || '').trim();
  if (!text || !item.value || !thread.value) return;
  const listing = item.value;
  const id = listing.id;

  pushMessage(id, { from: 'me', text, ts: Date.now() });
  markThreadRead(id);
  input.value = '';
  typing.value = true;
  pendingReplies += 1;
  nextTick(scrollToBottom);

  window.setTimeout(() => {
    pendingReplies = Math.max(0, pendingReplies - 1);
    typing.value = pendingReplies > 0;
    pushMessage(id, { from: 'them', text: replyFor(listing, text), ts: Date.now() });

    if (ui.chatItemId === id) {
      markThreadRead(id);
      nextTick(scrollToBottom);
    } else {
      const current = market.chats[id];
      if (current) {
        current.unread = (current.unread || 0) + 1;
        saveChats();
      }
      toast(`${listing.seller.name} 回复了你的消息`);
    }
  }, 1200);
}
</script>

<template>
  <Transition name="chat">
    <div v-if="item && thread" class="chat-layer">
      <div class="chat-backdrop is-open" @click="closeChat"></div>
      <aside class="chat-drawer is-open" :aria-label="`与 ${item.seller.name} 的对话`">
        <header class="chat-head">
          <span class="seller-avatar">{{ item.seller.initial }}</span>
          <div class="chat-seller">
            <b>
              {{ item.seller.name }}
              <span v-if="item.seller.verified" class="verified-badge"><Icon name="check" /> 校园实名</span>
            </b>
            <span>{{ market.school.name }} · 通常 1 小时内回复</span>
          </div>
          <button class="chat-close" type="button" aria-label="关闭对话" @click="closeChat">
            <Icon name="close" />
          </button>
        </header>

        <div class="chat-item">
          <span class="thumb"><Artwork :item="item" /></span>
          <span>
            <b>{{ item.title }}</b>
            <span>{{ item.condition }} · 校内面交</span>
          </span>
          <span class="price">¥{{ fmtPrice(item.price) }}</span>
        </div>

        <div ref="bodyRef" class="chat-body">
          <div class="chat-day">今天</div>
          <div
            v-for="(message, index) in thread.messages"
            :key="index"
            class="chat-msg"
            :class="message.from === 'me' ? 'me' : 'them'"
          >
            <span class="msg-avatar">{{ message.from === 'me' ? (market.currentUser?.initial || '我') : item.seller.initial }}</span>
            <div class="bubble-wrap">
              <div class="msg-bubble">{{ message.text }}</div>
              <span class="msg-time">{{ clockTime(message.ts) }}</span>
            </div>
          </div>

          <div v-if="typing" class="chat-msg them">
            <span class="msg-avatar">{{ item.seller.initial }}</span>
            <div class="msg-bubble chat-typing"><i></i><i></i><i></i></div>
          </div>
        </div>

        <div class="chat-quick">
          <button class="quick-chip" type="button" @click="send('这件还在吗？')">这件还在吗？</button>
          <button class="quick-chip" type="button" @click="send('可以小刀吗？')">可以小刀吗？</button>
          <button class="quick-chip" type="button" @click="send('什么时候方便面交？')">什么时候面交？</button>
        </div>

        <form class="chat-form" @submit.prevent="send(input)">
          <input
            v-model="input"
            class="chat-input"
            placeholder="和卖家说点什么…"
            autocomplete="off"
            maxlength="300"
            aria-label="消息内容"
          >
          <button class="chat-send" type="submit" aria-label="发送"><Icon name="send" /></button>
        </form>
      </aside>
    </div>
  </Transition>
</template>
