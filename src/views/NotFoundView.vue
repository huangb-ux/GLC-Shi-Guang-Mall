<script setup>
import Icon from '../components/Icon.vue';
</script>

<template>
  <div class="page-fade notfound wrap">
    <div class="big">404</div>
    <h1>好像走错教学楼了</h1>
    <p>这个页面不存在，或者已经被收进了毕业纸箱。</p>
    <RouterLink class="btn btn-primary" to="/">回到集市 <Icon name="arrow" /></RouterLink>
  </div>
</template>
