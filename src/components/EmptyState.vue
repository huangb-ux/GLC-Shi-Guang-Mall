<script setup>
import Icon from './Icon.vue';

defineProps({
  icon: { type: String, default: 'bag' },
  title: { type: String, required: true },
  text: { type: String, default: '' }
});
</script>

<template>
  <div class="empty-state">
    <div class="empty-icon"><Icon :name="icon" /></div>
    <h3>{{ title }}</h3>
    <p>{{ text }}</p>
    <slot />
  </div>
</template>
