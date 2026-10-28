<script setup>
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import SiteHeader from './components/SiteHeader.vue';
import SiteFooter from './components/SiteFooter.vue';
import MobileNav from './components/MobileNav.vue';
import ChatDrawer from './components/ChatDrawer.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';
import ToastHost from './components/ToastHost.vue';
import { closeChat, resolveConfirm, ui } from './stores/ui';

const route = useRoute();

watch(
  () => [ui.chatItemId, ui.confirm, ui.filtersOpen],
  ([chat, confirm, filters]) => {
    document.body.classList.toggle('no-scroll', Boolean(chat || confirm || filters));
  },
  { immediate: true }
);

watch(
  () => route.fullPath,
  () => {
    ui.filtersOpen = false;
    if (ui.chatItemId) closeChat();
    if (ui.confirm) resolveConfirm(false);
    document.body.classList.toggle('detail-view', route.name === 'item');
  },
  { immediate: true }
);
</script>

<template>
  <SiteHeader />
  <main id="app" tabindex="-1">
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
  <SiteFooter />
  <MobileNav />
  <ChatDrawer />
  <ConfirmDialog />
  <ToastHost />
</template>
