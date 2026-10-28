<script setup>
import Icon from './Icon.vue';
import { ui } from '../stores/ui';
</script>

<template>
  <TransitionGroup name="toast" tag="div" class="toast-root" aria-live="polite">
    <div v-for="item in ui.toasts" :key="item.id" class="toast is-show">
      <Icon name="check" />
      <span>{{ item.message }}</span>
    </div>
  </TransitionGroup>
</template>
