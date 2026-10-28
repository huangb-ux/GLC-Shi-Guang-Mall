import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { initDatabase } from './lib/db';
import { hydrateStore } from './stores/market';
import './styles/main.css';

async function bootstrap() {
  try {
    // 先打开 IndexedDB、准备管理员和演示商品，再把数据灌入 Vue 的共享状态。
    await initDatabase();
    await hydrateStore();
    createApp(App).use(router).mount('#app');
  } catch (error) {
    console.error(error);
    const root = document.querySelector('#app');
    if (root) {
      root.innerHTML = `
        <div style="max-width:640px;margin:120px auto;padding:32px;font-family:system-ui;line-height:1.8;color:#1B1A16;">
          <h1 style="font-size:24px;">数据库初始化失败</h1>
          <p style="color:#8B8679;">请检查浏览器是否禁用了 IndexedDB，或换一个浏览器再试。</p>
          <pre style="white-space:pre-wrap;background:#F6F3EC;padding:16px;border-radius:12px;font-size:12px;">${String(error?.message || error)}</pre>
        </div>`;
    }
  }
}

bootstrap();
