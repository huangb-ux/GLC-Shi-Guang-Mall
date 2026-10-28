<script setup>
import { computed } from 'vue';
import { Art } from '../lib/icons';

const props = defineProps({
  item: { type: Object, default: null },
  src: { type: String, default: '' },
  art: { type: String, default: '' },
  tone: { type: String, default: '' },
  alt: { type: String, default: '' },
  eager: { type: Boolean, default: false }
});

const imageSrc = computed(() => props.src || (props.item?.images?.[0] || ''));
const artType = computed(() => props.art || props.item?.art || 'box');
const toneName = computed(() => props.tone || props.item?.tone || 'sage');
const svg = computed(() => Art.render(artType.value, toneName.value));
const altText = computed(() => props.alt || props.item?.title || '商品图片');
</script>

<template>
  <img
    v-if="imageSrc"
    class="media-img"
    :src="imageSrc"
    :alt="altText"
    :loading="eager ? 'eager' : 'lazy'"
  >
  <span v-else class="art-wrap" v-html="svg"></span>
</template>
