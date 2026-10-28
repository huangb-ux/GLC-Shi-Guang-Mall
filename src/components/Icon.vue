<script setup>
import { computed } from 'vue';
import { icon } from '../lib/icons';

const props = defineProps({
  name: { type: String, required: true }
});

const svg = computed(() => icon(props.name));
</script>

<template>
  <span class="icon-host" v-html="svg"></span>
</template>
