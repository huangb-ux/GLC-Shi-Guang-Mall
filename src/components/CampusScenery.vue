<script setup>
import Icon from './Icon.vue';
import { CAMPUS_SCENES, CAMPUS_SOURCE } from '../data/campus';

const loopScenes = [...CAMPUS_SCENES, ...CAMPUS_SCENES];
</script>

<template>
  <section class="campus-section wrap" aria-labelledby="campus-title">
    <div class="campus-head">
      <div>
        <p class="eyebrow">CAMPUS · 桂院风景</p>
        <h2 id="campus-title" class="campus-title">在桂院，读书也读风景。</h2>
        <p class="campus-desc">从图书馆的晨光，到育善林的树影。这里收录了桂林学院校园里的一些日常。</p>
      </div>
      <a class="campus-source" :href="CAMPUS_SOURCE" target="_blank" rel="noreferrer">
        官网校园风光 <Icon name="arrow" />
      </a>
    </div>

    <div class="campus-marquee">
      <div class="campus-track">
        <article
          v-for="(scene, index) in loopScenes"
          :key="index"
          class="campus-scene"
          :aria-hidden="index >= CAMPUS_SCENES.length"
        >
          <img
            :src="scene.src"
            :alt="`桂林学院 · ${scene.title}`"
            decoding="async"
            draggable="false"
          >
          <div class="campus-scene-shade"></div>
          <span class="campus-scene-tag">{{ scene.tag }}</span>
          <span class="campus-scene-index">
            {{ String((index % CAMPUS_SCENES.length) + 1).padStart(2, '0') }} / {{ String(CAMPUS_SCENES.length).padStart(2, '0') }}
          </span>
          <div class="campus-scene-copy">
            <h3>{{ scene.title }}</h3>
            <p>{{ scene.caption }}</p>
          </div>
        </article>
      </div>
    </div>

    <p class="campus-credit">实景图片来源：桂林学院官网 · 校园风光</p>
  </section>
</template>
